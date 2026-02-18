import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, Users, Calendar, Loader2, CheckCircle, AlertTriangle, Clock, ArrowRight, X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'
import { useMeeting, useActions, useUpdateMeeting } from '../../../hooks/useMeetings'
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Edit2, Save, FileText } from 'lucide-react'

export const Route = createFileRoute('/dashboard/meetings/$id')({
  component: MeetingDetails,
})

import { AIChatWidget } from '../../../components/AIChatWidget'
import { AddMeetingModal } from '../../../components/AddMeetingModal'
import { EmailComposerModal } from '../../../components/EmailComposerModal'
import { Sparkles, RefreshCcw } from 'lucide-react'

// ... existing code ...

function MeetingDetails() {
  const { id } = useParams({ from: '/dashboard/meetings/$id' })
  const navigate = useNavigate()
  const { data: meeting, isLoading, error } = useMeeting(id)
  // meeting.clientId is populated, so we need to access ._id
  const { data: actions } = useActions(
    (meeting?.clientId as any)?._id || meeting?.clientId,
    (meeting?.dealId as any)?._id || meeting?.dealId,
  )
  const [meetingActions, setMeetingActions] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [meetingModalData, setMeetingModalData] = useState<any>(null)
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailModalData, setEmailModalData] = useState<any>(null)

  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const [editedTranscript, setEditedTranscript] = useState('')
  const updateMeeting = useUpdateMeeting()

  useEffect(() => {
    if (actions && meeting) {
      const getId = (id: any) => (typeof id === 'object' && id !== null ? id._id : id);
      const currentMeetingActions = actions.filter(
        (a) =>
          a.source === 'ai' &&
          getId(a.meetingId) === meeting._id,
      )
      setMeetingActions(currentMeetingActions)
    }
  }, [actions, meeting])

  useEffect(() => {
    if (meeting?.transcript) {
      setEditedTranscript(meeting.transcript)
    }
  }, [meeting])

  const handleAnalyzeClick = async (isReanalysis = false) => {
    if (!meeting) return;

    const message = isReanalysis
      ? "Re-analyzing will overwrite current insights and generate new actions. Continue?"
      : "Start AI analysis for this meeting?";

    if (!window.confirm(message)) return;

    try {
      setIsAnalyzing(true);
      await api('/meeting/analyze', {
        method: 'POST',
        body: JSON.stringify({ meetingId: meeting._id, transcript: meeting.transcript })
      });
      window.location.reload();
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Failed to analyze meeting.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleAction = async (actionId: string, type: 'approve' | 'reject') => {
    if (!meeting) return;
    try {
      const getObjId = (obj: any) => (typeof obj === 'object' && obj !== null ? obj._id : obj);

      if (type === 'approve') {
        const action = meetingActions.find(a => a._id === actionId);
        if (!action) return;

        if (action.type === 'schedule') {
          setMeetingModalData({
            title: action.suggestedData.title,
            dateTime: action.suggestedData.dateTime,
            clientId: getObjId(meeting.clientId),
            dealId: getObjId(meeting.dealId),
            notes: `Follow-up from meeting: ${meeting.title}`
          });
          setSelectedActionId(actionId);
          setIsMeetingModalOpen(true);
          return;
        }

        if (action.type === 'email') {
          setEmailModalData({
            to: (meeting.clientId as any).email || '',
            subject: action.suggestedData.subject,
            body: action.suggestedData.body,
            actionId: actionId
          });
          setSelectedActionId(actionId);
          setIsEmailModalOpen(true);
          return;
        }

        await api('/action/confirm', {
          method: 'POST',
          body: JSON.stringify({ actionId }),
        })
      } else {
        await api(`/action/${actionId}`, { method: 'DELETE' })
      }
      setMeetingActions((prev) => prev.filter((a) => a._id !== actionId))
    } catch (err) {
      console.error("Failed to process action", err)
      alert("Failed to process action. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>
          Error loading meeting:{' '}
          {(error as any)?.message || 'Meeting not found'}
        </p>
      </div>
    )
  }

  const insights = meeting.aiInsights || {}

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/dashboard/calendar' })}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{meeting.title}</h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(meeting.dateTime).toLocaleDateString()} • {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {meeting.participants && meeting.participants.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{meeting.participants.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Go Live button */}
          <Link
            to="/dashboard/meetings/live"
            search={{ meetingId: meeting._id, title: meeting.title }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Go Live
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    disabled={!meeting.transcript}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    {isChatOpen ? 'Close Chat' : 'Ask AI'}
                  </Button>
                </span>
              </TooltipTrigger>
              {!meeting.transcript && (
                <TooltipContent>
                  <p>No transcript available for analysis</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {Object.keys(insights).length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-full font-medium border border-cyan-100 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> AI Analyzed
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                onClick={() => handleAnalyzeClick(true)}
                disabled={isAnalyzing}
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={isAnalyzing}
              className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
              onClick={() => handleAnalyzeClick(false)}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  ✨ Analyze with AI
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable Split View */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Transcript */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcript
            </h2>
            <div className="flex gap-2">
              {isEditingTranscript ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      setIsEditingTranscript(false)
                      setEditedTranscript(meeting.transcript || '')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700"
                    disabled={updateMeeting.isPending}
                    onClick={async () => {
                      try {
                        await updateMeeting.mutateAsync({
                          id: meeting._id,
                          data: { transcript: editedTranscript },
                        })
                        setIsEditingTranscript(false)
                      } catch (err) {
                        console.error('Failed to update transcript', err)
                      }
                    }}
                  >
                    {updateMeeting.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-gray-500 hover:text-cyan-600"
                  onClick={() => setIsEditingTranscript(true)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  {meeting.transcript ? 'Edit' : 'Add Transcript'}
                </Button>
              )}
            </div>
          </div>

          <div className="prose max-w-none text-gray-800 leading-relaxed font-sans text-base">
            {isEditingTranscript ? (
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full h-[calc(100vh-15rem)] p-4 border border-cyan-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans text-base leading-relaxed bg-cyan-50/10"
                placeholder="Paste or type the meeting transcript here..."
              />
            ) : meeting.transcript ? (
              meeting.transcript.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-4">
                  {line}
                </p>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="italic mb-4">No transcript available for this meeting.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-cyan-600 border-cyan-100 bg-cyan-50/50"
                  onClick={() => setIsEditingTranscript(true)}
                >
                  <Edit2 className="h-3 w-3 mr-1.5" />
                  Add Transcript Now
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Insights & Actions */}
        <div className="w-[450px] shrink-0 overflow-y-auto bg-gray-50 p-6 space-y-6">

          {/* AI Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Executive Summary
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {typeof insights.summary === 'string' ? insights.summary : insights.summary?.text || "No summary generated yet."}
            </p>
            {insights.summary?.confidence && (
              <p className="text-[10px] text-gray-400 mt-2 italic">
                Confidence Score: {(insights.summary.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>

          {/* Key Topics */}
          {insights.keyTopics && insights.keyTopics.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {insights.keyTopics.map((topic: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps & Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900">Outcome & Next Steps</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <ArrowRight className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-3">NEXT STEPS</p>
                  {(() => {
                    const aiActions = (insights.actions && Array.isArray(insights.actions)) ? insights.actions : [];
                    const allActions = [
                      ...aiActions.map((act: any) => {
                        const existingAction = meetingActions.find(pa => {
                          const actionTitleMatch = pa.suggestedData?.title?.toLowerCase() === act.title?.toLowerCase() ||
                            pa.suggestedData?.task?.toLowerCase() === act.title?.toLowerCase();
                          const actionTypeMatch = pa.type === act.type;
                          return (actionTitleMatch || (actionTypeMatch && pa.suggestedData?.title === act.title)) && actionTypeMatch;
                        });
                        return { ...act, existing: existingAction };
                      }),
                      ...meetingActions.filter(pa => pa.type === 'stage_update').map(pa => ({
                        title: '🚀 Update Deal Stage',
                        description: `Move deal to "${pa.suggestedData.proposedStage}" phase based on meeting signals.`,
                        type: 'stage_update',
                        existing: pa
                      }))
                    ];

                    const pending = allActions.filter(a => !a.existing || a.existing.status === 'pending');
                    const completed = allActions.filter(a => a.existing && a.existing.status === 'approved');

                    const renderCard = (act: any, i: number) => {
                      const isPending = !act.existing || act.existing.status === 'pending';
                      const isApproved = act.existing?.status === 'approved';
                      const isStageUpdate = act.type === 'stage_update';

                      return (
                        <div
                          key={`${act.type}-${i}`}
                          className={`flex flex-col gap-0.5 p-3 rounded-lg border shadow-sm transition-all ${isPending
                            ? (isStageUpdate ? 'bg-purple-50/50 border-purple-100 hover:border-purple-200' : 'bg-cyan-50/30 border-cyan-100 hover:border-cyan-200')
                            : 'bg-white border-gray-100 opacity-80'
                            } ${isPending ? 'cursor-pointer hover:shadow-md' : ''}`}
                          onClick={() => isPending && act.existing && handleAction(act.existing._id, 'approve')}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`font-medium ${isStageUpdate ? 'text-purple-900' : 'text-gray-900'}`}>{act.title}</span>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${act.type === 'schedule' ? 'bg-blue-100 text-blue-700' : isStageUpdate ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                {act.type}
                              </span>
                              {act.existing && (
                                <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold ${isApproved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                  {act.existing.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs mt-1 mb-2 ${isStageUpdate ? 'text-purple-700' : 'text-gray-600'}`}>
                            {act.description || (act.type === 'schedule' ? `Proposed for ${new Date(act.suggestedData?.dateTime).toLocaleDateString()}` : act.evidence ? `"${act.evidence}"` : '')}
                          </p>

                          {isPending && act.existing && (
                            <div className={`flex gap-2 mt-2 pt-2 border-t ${isStageUpdate ? 'border-purple-100' : 'border-cyan-100/50'}`}>
                              <Button
                                size="sm"
                                className={`h-7 text-[10px] flex-1 font-bold shadow-none ${isStageUpdate ? 'bg-purple-600 hover:bg-purple-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(act.existing._id, 'approve');
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> {isStageUpdate ? 'Update Stage' : 'Execute'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] text-gray-400 hover:text-red-600 flex-1 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(act.existing._id, 'reject');
                                }}
                              >
                                <X className="h-3 w-3 mr-1" /> Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    };

                    if (allActions.length === 0) {
                      return <p className="italic text-gray-400">No specific next steps identified.</p>;
                    }

                    return (
                      <div className="space-y-6">
                        {pending.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider pl-1 font-mono">Pending Actions</p>
                            {pending.map((act, i) => renderCard(act, i))}
                          </div>
                        )}
                        {completed.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider pl-1 font-mono">Completed</p>
                            <div className="grid grid-cols-1 gap-3">
                              {completed.map((act, i) => renderCard(act, i))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">TIMELINE</p>
                  <p className="text-sm text-gray-700">
                    {typeof insights.timeline === 'string' ? insights.timeline : insights.timeline?.text || 'No timeline identified.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risks & Objections */}
          {(insights.riskSignals?.length > 0 || insights.objections?.length > 0 || insights.objection) && (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-red-100 bg-red-50/30">
                <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risks & Objections
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {insights.objections && Array.isArray(insights.objections) && insights.objections.length > 0 ? (
                  insights.objections.map((obj: any, i: number) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs text-red-500 font-medium mb-0.5 uppercase">{obj.type || 'OBJECTION'}</p>
                      <p className="text-sm text-gray-700 font-medium">{obj.detail}</p>
                      {obj.evidence && <p className="text-[10px] text-gray-400 italic mt-0.5">"{obj.evidence}"</p>}
                    </div>
                  ))
                ) : insights.objection && (
                  <div>
                    <p className="text-xs text-red-500 font-medium mb-1">MAIN OBJECTION</p>
                    <p className="text-sm text-gray-700">{insights.objection}</p>
                  </div>
                )}

                {insights.riskSignals && insights.riskSignals.length > 0 && (
                  <div>
                    <p className="text-xs text-red-500 font-medium mb-1">RISK SIGNALS</p>
                    <ul className="list-none text-sm text-gray-700 space-y-2">
                      {insights.riskSignals.map((risk: any, i: number) => (
                        <li key={i} className="flex flex-col border-l-2 border-red-100 pl-3">
                          <span className="font-medium text-gray-800">{typeof risk === 'string' ? risk : risk.signal}</span>
                          {risk.evidence && <span className="text-[10px] text-gray-400 italic">"{risk.evidence}"</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deal Intel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">INTENT SCORE</p>
              <div className="flex items-end gap-2">
                <p className="text-lg font-bold text-gray-900 leading-none">
                  {insights.intentScore !== undefined ? (insights.intentScore * 100).toFixed(0) :
                    (insights.intent ? (insights.intent === 'High' ? '90' : '45') : '0')}%
                </p>
                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${insights.intentScore > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${(insights.intentScore ?? (insights.intent ? (insights.intent === 'High' ? 0.9 : 0.45) : 0)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium">DEAL SIGNAL</p>
              <p className={`text-sm font-semibold ${insights.dealSignal === 'Positive' ? 'text-green-600' :
                insights.dealSignal === 'Negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {insights.dealSignal || 'Neutral'}
              </p>
            </div>
          </div>

        </div>
      </div>

      <AIChatWidget
        meetingId={meeting._id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <AddMeetingModal
        open={isMeetingModalOpen}
        onOpenChange={setIsMeetingModalOpen}
        initialData={meetingModalData}
        onMeetingCreated={() => {
          // If created manually via modal, we remove the pending action
          if (selectedActionId) {
            api(`/action/${selectedActionId}`, { method: 'DELETE' })
              .then(() => setMeetingActions((prev) => prev.filter((a) => a._id !== selectedActionId)))
              .catch(e => console.error("Failed to delete action", e));
          }
        }}
      />
      <EmailComposerModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        initialData={emailModalData}
        onEmailSent={() => {
          if (selectedActionId) {
            setMeetingActions((prev) => prev.filter((a) => a._id !== selectedActionId))
            setSelectedActionId(null)
          }
        }}
      />
    </div>
  )
}
