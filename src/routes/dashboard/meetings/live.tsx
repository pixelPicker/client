import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, Square, ArrowLeft, Loader2, CheckCircle, AlertCircle, Video, Phone, ExternalLink, Calendar, Plus } from 'lucide-react'
import { api } from '../../../lib/api'
import { useContacts } from '../../../hooks/useContacts'
import { useDeals } from '../../../hooks/useDeals'
import { useCreateMeeting, useCalendar } from '../../../hooks/useMeetings'

export const Route = createFileRoute('/dashboard/meetings/live')({
  component: LiveMeeting,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      meetingId: typeof search.meetingId === 'string' ? search.meetingId : '',
      title: typeof search.title === 'string' ? search.title : '',
    }
  },
})

type RecordingState = 'idle' | 'capturing' | 'paused' | 'ending' | 'done' | 'error'

interface TranscriptSegment {
  text: string
  timestamp: Date
  chunkIndex: number
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
  const [setupMode, setSetupMode] = useState<'scheduled' | 'new'>('scheduled')
  const [meetingCode, setMeetingCode] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState<'gmeet' | 'zoom'>('gmeet')

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [chunkCount, setChunkCount] = useState(0)
  const [isTranscribingChunk, setIsTranscribingChunk] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const hasSpeechRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const chunkIndexRef = useRef(0)
  const meetingIdRef = useRef(meetingId)

  const { data: contactsData } = useContacts('', 1)
  const contacts = contactsData?.data || []
  const { data: dealsData } = useDeals('', 1)
  const deals = dealsData?.data || []
  const createMeeting = useCreateMeeting()
  const { data: calendarData } = useCalendar('', 1, 20, 'upcoming')
  const upcomingMeetings = calendarData?.data || []

  // Keep meetingId ref in sync
  useEffect(() => { meetingIdRef.current = meetingId }, [meetingId])

  // Auto-scroll
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [segments])

  // Timer
  useEffect(() => {
    if (recordingState === 'capturing') {
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
    return segments.map(s => s.text).join(' ')
  }, [segments])

  const transcribeChunk = useCallback(async (blob: Blob, index: number) => {
    setIsTranscribingChunk(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('audio', blob, 'chunk.webm')

      const response = await fetch('http://localhost:5000/api/meeting/transcribe-chunk', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()
      if (data.success && data.text) {
        setSegments(prev => [...prev, {
          text: data.text,
          timestamp: new Date(),
          chunkIndex: index,
        }])
      }
    } catch (err) {
      console.error('Chunk transcription failed:', err)
    } finally {
      setIsTranscribingChunk(false)
    }
  }, [])

  const startCapture = useCallback(async () => {
    try {
      // Request tab audio via screen share picker
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,  // required by browser spec even if we only want audio
        systemAudio: 'include', // Hint to browser to include audio
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        },
      })

      // Stop video tracks immediately — we only need audio
      stream.getVideoTracks().forEach((t: MediaStreamTrack) => t.stop())

      // Check if audio track exists (user must check "Share tab audio")
      if (stream.getAudioTracks().length === 0) {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
        throw new Error('You forgot to check the "Share tab audio" box. Please try again and make sure it is checked in the bottom-left corner.')
      }

      // Setup AudioContext for silence detection
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      hasSpeechRef.current = false // Reset for first chunk

      // Detect speech volume
      const checkVolume = () => {
        if (!analyserRef.current || mediaRecorderRef.current?.state !== 'recording') return
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)

        // Calculate average volume
        const sum = dataArray.reduce((a, b) => a + b, 0)
        const average = sum / dataArray.length

        // Threshold matches silence (typically < 10 for system audio silence)
        if (average > 10) {
          hasSpeechRef.current = true
        }
        requestAnimationFrame(checkVolume)
      }
      checkVolume()

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 1000) {
          // Only transcribe if speech was detected in this chunk
          if (hasSpeechRef.current) {
            const idx = chunkIndexRef.current++
            setChunkCount(idx + 1)
            await transcribeChunk(e.data, idx)
          } else {
            console.log('Skipping silent chunk')
          }
          // Reset for next chunk
          hasSpeechRef.current = false
        }
      }

      // When user stops sharing the tab (clicks "Stop sharing" in browser)
      stream.getAudioTracks()[0].onended = () => {
        setRecordingState('idle')
        setStatusMessage('Tab sharing stopped.')
      }

      recorder.start(15000) // 15-second chunks
      setRecordingState('capturing')
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setStatusMessage('Screen share was cancelled. Please try again.')
      } else {
        setStatusMessage(`Failed to capture audio: ${err.message}`)
        setRecordingState('error')
      }
    }
  }, [transcribeChunk])

  const handleCaptureAudio = async () => {
    let targetId = meetingId

    // Create meeting record if needed
    if (!targetId) {
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
        targetId = created._id
        setMeetingId(targetId)
      } catch (err) {
        setStatusMessage('Failed to create meeting record.')
        return
      }
    }

    await startCapture()
  }

  const handleStop = () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    mediaRecorderRef.current = null
    streamRef.current = null
    audioContextRef.current = null
    analyserRef.current = null
    setRecordingState('idle')
  }

  const handleEnd = async () => {
    // Stop recording first
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    mediaRecorderRef.current = null
    streamRef.current = null
    audioContextRef.current = null
    analyserRef.current = null

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
      setStatusMessage('Failed to save. Your transcript is shown below — copy it manually.')
    }
  }

  // ─── Setup Screen ────────────────────────────────────────────────────────────
  if (!isSetupDone) {
    // Build join URL from code
    const getJoinUrl = () => {
      if (!meetingCode.trim()) return null
      const code = meetingCode.trim()
      if (code.startsWith('http')) return code // already a full URL
      if (meetingPlatform === 'gmeet') return `https://meet.google.com/${code}`
      if (meetingPlatform === 'zoom') return `https://zoom.us/j/${code}`
      return null
    }
    const joinUrl = getJoinUrl()

    const handlePickScheduled = (m: any) => {
      setMeetingId(m._id)
      setMeetingTitle(m.title)
      const clientId = typeof m.clientId === 'object' ? m.clientId._id : m.clientId
      setSelectedClientId(clientId || '')
      const dealId = typeof m.dealId === 'object' ? m.dealId?._id : m.dealId
      setSelectedDealId(dealId || '')
      setIsSetupDone(true)
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Mic className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Start Live Meeting</h1>
              <p className="text-sm text-gray-500">Pick a scheduled meeting or start a new one</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSetupMode('scheduled')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${setupMode === 'scheduled' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              <Calendar className="h-4 w-4" />
              Scheduled Meeting
            </button>
            <button
              onClick={() => setSetupMode('new')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${setupMode === 'new' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              <Plus className="h-4 w-4" />
              New / Ad-hoc
            </button>
          </div>

          {/* ── Scheduled mode ── */}
          {setupMode === 'scheduled' && (
            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming meetings scheduled.</p>
              ) : (
                upcomingMeetings.map((m: any) => (
                  <button
                    key={m._id}
                    onClick={() => handlePickScheduled(m)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-700">{m.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(m.dateTime).toLocaleDateString()} at{' '}
                          {new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {m.clientId?.name && ` · ${m.clientId.name}`}
                        </p>
                      </div>
                      <span className="text-xs text-cyan-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Go Live →</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── New / ad-hoc mode ── */}
          {setupMode === 'new' && (
            <div className="space-y-4">
              {/* Platform + code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join via</label>
                <div className="flex gap-2">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
                    <button
                      onClick={() => setMeetingPlatform('gmeet')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${meetingPlatform === 'gmeet' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <Video className="h-3.5 w-3.5" /> GMeet
                    </button>
                    <button
                      onClick={() => setMeetingPlatform('zoom')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${meetingPlatform === 'zoom' ? 'bg-sky-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <Phone className="h-3.5 w-3.5" /> Zoom
                    </button>
                  </div>
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={e => setMeetingCode(e.target.value)}
                    placeholder={meetingPlatform === 'gmeet' ? 'abc-defg-hij or full URL' : 'Meeting ID or full URL'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                {joinUrl && (
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 flex items-center gap-1 text-xs text-cyan-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open: {joinUrl}
                  </a>
                )}
              </div>

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
          )}

          {setupMode === 'scheduled' && (
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
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
              {recordingState === 'capturing' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">CAPTURING</span>
                  <span className="text-xs text-gray-500">{formatTime(elapsed)}</span>
                  {isTranscribingChunk && (
                    <span className="text-xs text-cyan-400 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Transcribing...
                    </span>
                  )}
                </>
              )}
              {recordingState === 'idle' && segments.length === 0 && (
                <span className="text-xs text-gray-500">Ready — share your meeting tab to begin</span>
              )}
              {recordingState === 'idle' && segments.length > 0 && (
                <span className="text-xs text-amber-400">Capture stopped — {chunkCount} chunks transcribed</span>
              )}
              {(recordingState === 'ending' || recordingState === 'done') && (
                <span className="text-xs text-cyan-400">{statusMessage}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Launch buttons in header too */}
          <a
            href="https://meet.google.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-colors"
          >
            <Video className="h-3.5 w-3.5" />
            GMeet
          </a>
          <a
            href="https://zoom.us/start/videomeeting"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Zoom
          </a>

          {recordingState === 'capturing' && (
            <button
              onClick={handleEnd}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Square className="h-4 w-4" />
              End Meeting
            </button>
          )}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 max-w-3xl mx-auto w-full">

        {/* How-to hint */}
        {recordingState === 'idle' && segments.length === 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-300">How to capture your meeting audio</p>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">1.</span> Open Google Meet or Zoom in another browser tab</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">2.</span> Click <strong className="text-white">"Capture Tab Audio"</strong> below</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">3.</span> In the browser picker, select your <strong className="text-white">GMeet/Zoom tab</strong> and click Share</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">4.</span> Audio is transcribed every 15 seconds — text appears here</li>
              <li className="flex gap-2"><span className="text-cyan-500 font-bold">5.</span> Click <strong className="text-white">"End Meeting"</strong> when done → AI analysis runs automatically</li>
            </ol>
            <p className="text-xs text-gray-600">⚠ Works in Chrome and Edge only. Make sure to share the tab (not the screen) for audio capture to work.</p>
          </div>
        )}

        {/* Transcript segments */}
        {segments.map((seg, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-xs text-gray-600 mt-1 shrink-0 w-14">
              {seg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex-1 bg-gray-900 rounded-lg px-4 py-2.5">
              <span className="text-xs font-semibold text-cyan-500 mr-2">Chunk {seg.chunkIndex + 1}</span>
              <span className="text-gray-200 text-sm leading-relaxed">{seg.text}</span>
            </div>
          </div>
        ))}

        {/* Live transcribing indicator */}
        {recordingState === 'capturing' && isTranscribingChunk && (
          <div className="flex gap-3 opacity-60">
            <span className="text-xs text-gray-600 mt-1 shrink-0 w-14">now</span>
            <div className="flex-1 bg-gray-900 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-500" />
              <span className="text-gray-400 text-sm italic">Transcribing audio chunk...</span>
            </div>
          </div>
        )}

        {/* Status messages */}
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
            onClick={handleCaptureAudio}
            disabled={createMeeting.isPending}
            className="flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-red-900/40 disabled:opacity-50"
          >
            {createMeeting.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            Capture Tab Audio
          </button>
        )}

        {recordingState === 'capturing' && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            Stop Capture (keep transcript)
          </button>
        )}

        {recordingState === 'idle' && segments.length > 0 && (
          <>
            <button
              onClick={handleCaptureAudio}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
            >
              <Mic className="h-4 w-4" />
              Resume Capture
            </button>
            <button
              onClick={handleEnd}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors"
            >
              <Square className="h-4 w-4" />
              End & Analyze
            </button>
          </>
        )}

        {segments.length > 0 && recordingState === 'capturing' && (
          <p className="text-xs text-gray-600 absolute bottom-2">
            {chunkCount} chunk{chunkCount !== 1 ? 's' : ''} transcribed · {formatTime(elapsed)} elapsed
          </p>
        )}
      </div>
    </div>
  )
}
