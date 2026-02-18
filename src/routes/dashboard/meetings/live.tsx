import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Square, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../../../lib/api'
import { useContacts } from '../../../hooks/useContacts'
import { useDeals } from '../../../hooks/useDeals'
import { useCreateMeeting } from '../../../hooks/useMeetings'

export const Route = createFileRoute('/dashboard/meetings/live')({
  component: LiveMeeting,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      meetingId: typeof search.meetingId === 'string' ? search.meetingId : '',
      title: typeof search.title === 'string' ? search.title : '',
    }
  },
})

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'ending' | 'done' | 'error'

interface TranscriptSegment {
  text: string
  timestamp: Date
  isFinal: boolean
}

function LiveMeeting() {
  const navigate = useNavigate()
  const { meetingId: paramMeetingId, title: paramTitle } = useSearch({ from: '/dashboard/meetings/live' })

  // Setup state
  const [meetingId, setMeetingId] = useState(paramMeetingId || '')
  const [meetingTitle, setMeetingTitle] = useState(paramTitle || '')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedDealId, setSelectedDealId] = useState('')
  const [isSetupDone, setIsSetupDone] = useState(!!paramMeetingId)

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [interimText, setInterimText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [browserSupported, setBrowserSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const recordingStateRef = useRef<RecordingState>('idle')

  const { data: contactsData } = useContacts('', 1)
  const contacts = contactsData?.data || []
  const { data: dealsData } = useDeals('', 1)
  const deals = dealsData?.data || []
  const createMeeting = useCreateMeeting()

  // Keep ref in sync with state for use inside closures
  useEffect(() => {
    recordingStateRef.current = recordingState
  }, [recordingState])

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setBrowserSupported(false)
    }
  }, [])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [segments, interimText])

  // Timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [recordingState])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getFullTranscript = useCallback(() => {
    return segments.filter(s => s.isFinal).map(s => s.text).join(' ')
  }, [segments])

  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text) {
            setSegments(prev => [...prev, { text, timestamp: new Date(), isFinal: true }])
            setInterimText('')
          }
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setRecordingState('error')
        setStatusMessage('Microphone access denied. Please allow mic access and try again.')
      }
    }

    recognition.onend = () => {
      // Auto-restart if still in recording state
      if (recordingStateRef.current === 'recording') {
        try { recognition.start() } catch (_) { }
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const handleStart = async () => {
    if (!isSetupDone) return

    // If no meetingId yet, create the meeting first
    if (!meetingId) {
      try {
        const now = new Date()
        const created = await createMeeting.mutateAsync({
          title: meetingTitle || `Live Meeting — ${now.toLocaleDateString()}`,
          clientId: selectedClientId,
          dealId: selectedDealId || undefined,
          dateTime: now.toISOString(),
          transcript: '',
          participants: [],
        } as any)
        setMeetingId(created._id)
      } catch (err) {
        setStatusMessage('Failed to create meeting record.')
        return
      }
    }

    setRecordingState('recording')
    startRecognition()
  }

  const handlePause = () => {
    recognitionRef.current?.stop()
    setRecordingState('paused')
    setInterimText('')
  }

  const handleResume = () => {
    setRecordingState('recording')
    startRecognition()
  }

  const handleEnd = async () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setInterimText('')
    setRecordingState('ending')
    setStatusMessage('Saving transcript...')

    const fullTranscript = getFullTranscript()
    const targetId = meetingId

    try {
      await api(`/meeting/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({ transcript: fullTranscript }),
      })

      setStatusMessage('Running AI analysis...')

      await api('/meeting/analyze', {
        method: 'POST',
        body: JSON.stringify({ meetingId: targetId, transcript: fullTranscript }),
      })

      setRecordingState('done')
      setStatusMessage('Done! Redirecting to meeting insights...')

      setTimeout(() => {
        navigate({ to: '/dashboard/meetings/$id', params: { id: targetId } })
      }, 1500)
    } catch (err) {
      console.error('Failed to save meeting:', err)
      setRecordingState('error')
      setStatusMessage('Failed to save. Please copy your transcript manually.')
    }
  }

  // ─── Setup Screen ────────────────────────────────────────────────────────────
  if (!isSetupDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Mic className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Start Live Meeting</h1>
              <p className="text-sm text-gray-500">Set up your meeting before going live</p>
            </div>
          </div>

          {!browserSupported && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              Real-time transcription requires Chrome or Edge.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
              <input
                type="text"
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                placeholder={`Live Meeting — ${new Date().toLocaleDateString()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select a client...</option>
                {contacts.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal (optional)</label>
              <select
                value={selectedDealId}
                onChange={e => setSelectedDealId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">No deal</option>
                {deals.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedClientId}
              onClick={() => setIsSetupDone(true)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Live Recording Screen ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold text-white">
              {meetingTitle || `Live Meeting — ${new Date().toLocaleDateString()}`}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {recordingState === 'recording' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">LIVE</span>
                  <span className="text-xs text-gray-500">{formatTime(elapsed)}</span>
                </>
              )}
              {recordingState === 'paused' && (
                <span className="text-xs text-amber-400 font-medium">⏸ PAUSED — {formatTime(elapsed)}</span>
              )}
              {recordingState === 'idle' && (
                <span className="text-xs text-gray-500">Ready to record</span>
              )}
              {(recordingState === 'ending' || recordingState === 'done') && (
                <span className="text-xs text-cyan-400">{statusMessage}</span>
              )}
            </div>
          </div>
        </div>

        {(recordingState === 'recording' || recordingState === 'paused') && (
          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Square className="h-4 w-4" />
            End Meeting
          </button>
        )}
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 max-w-3xl mx-auto w-full">
        {segments.length === 0 && recordingState === 'idle' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-600">
            <Mic className="h-12 w-12 text-gray-700" />
            <p className="text-sm">Press Start Recording to begin transcription</p>
          </div>
        )}

        {segments.length === 0 && recordingState === 'recording' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-600">
            <div className="flex gap-1 items-end h-10">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-1.5 bg-red-500 rounded-full animate-bounce"
                  style={{ height: `${20 + i * 8}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm">Listening... start speaking</p>
          </div>
        )}

        {segments.map((seg, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-xs text-gray-600 mt-1 shrink-0 w-12">
              {seg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex-1">
              <span className="text-xs font-semibold text-cyan-500 mr-2">You</span>
              <span className="text-gray-200 text-sm leading-relaxed">{seg.text}</span>
            </div>
          </div>
        ))}

        {interimText && (
          <div className="flex gap-3 opacity-50">
            <span className="text-xs text-gray-600 mt-1 shrink-0 w-12">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex-1">
              <span className="text-xs font-semibold text-cyan-500 mr-2">You</span>
              <span className="text-gray-400 text-sm leading-relaxed italic">{interimText}▌</span>
            </div>
          </div>
        )}

        {recordingState === 'ending' && (
          <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-700">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            <span className="text-sm text-gray-300">{statusMessage}</span>
          </div>
        )}

        {recordingState === 'done' && (
          <div className="flex items-center gap-3 p-4 bg-emerald-950 rounded-xl border border-emerald-800">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-emerald-300">{statusMessage}</span>
          </div>
        )}

        {recordingState === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-950 rounded-xl border border-red-800">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm text-red-300">{statusMessage}</span>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-gray-800 px-6 py-5 flex items-center justify-center gap-4 relative">
        {recordingState === 'idle' && (
          <button
            onClick={handleStart}
            disabled={createMeeting.isPending}
            className="flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-red-900/40 disabled:opacity-50"
          >
            {createMeeting.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            Start Recording
          </button>
        )}

        {recordingState === 'recording' && (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            <MicOff className="h-4 w-4" />
            Pause
          </button>
        )}

        {recordingState === 'paused' && (
          <button
            onClick={handleResume}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Mic className="h-4 w-4" />
            Resume
          </button>
        )}

        {segments.length > 0 && (recordingState === 'recording' || recordingState === 'paused') && (
          <p className="text-xs text-gray-600 absolute bottom-2">
            {segments.filter(s => s.isFinal).length} segments captured
          </p>
        )}
      </div>
    </div>
  )
}
