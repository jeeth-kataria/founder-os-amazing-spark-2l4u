'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiMail,
  FiDatabase,
  FiCalendar,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiUser,
  FiExternalLink,
} from 'react-icons/fi'
import { FaXTwitter } from 'react-icons/fa6'

const MANAGER_AGENT_ID = '69ec5aef603f5bad913c0db7'

interface RecommendedInvestor {
  name: string
  fund: string
  thesis_match: string
  contact_url: string
}

interface ActionsPanelProps {
  startupIdea: string
  results: {
    verdict?: string
    one_line_thesis?: string
    recommended_next_step?: string
    tweet_draft?: string
    tweet_pending_approval?: boolean
    recommended_investors?: RecommendedInvestor[]
  } | null
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

interface ActionState {
  status: ActionStatus
  message: string
}

export default function ActionsPanel({ startupIdea, results }: ActionsPanelProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  // Gmail state
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailState, setEmailState] = useState<ActionState>({ status: 'idle', message: '' })

  // HubSpot state
  const [hubDealName, setHubDealName] = useState('')
  const [hubDealStage, setHubDealStage] = useState('')
  const [hubState, setHubState] = useState<ActionState>({ status: 'idle', message: '' })

  // Twitter state
  const [tweetPosted, setTweetPosted] = useState(false)
  const [twitterState, setTwitterState] = useState<ActionState>({ status: 'idle', message: '' })

  // Calendar state
  const [calTitle, setCalTitle] = useState('')
  const [calDate, setCalDate] = useState('')
  const [calTime, setCalTime] = useState('')
  const [calAttendees, setCalAttendees] = useState('')
  const [calState, setCalState] = useState<ActionState>({ status: 'idle', message: '' })

  function toggleAction(action: string) {
    setExpandedAction(expandedAction === action ? null : action)
  }

  async function handleSendEmail() {
    if (!emailTo.trim()) return
    setEmailState({ status: 'loading', message: '' })
    try {
      const subject = emailSubject.trim() || `FounderOS Deal Memo: ${startupIdea.slice(0, 50)}`
      const message = `Send an email using GMAIL_SEND_EMAIL tool.
Recipient: ${emailTo}
Subject: ${subject}
Body: Here is the due diligence deal memo for the startup idea: "${startupIdea}"

Verdict: ${results?.verdict ?? 'N/A'}
Thesis: ${results?.one_line_thesis ?? 'N/A'}
Recommended Next Step: ${results?.recommended_next_step ?? 'N/A'}

Please format the email professionally with all the analysis details.`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        setEmailState({ status: 'success', message: `Email sent to ${emailTo}` })
      } else {
        setEmailState({ status: 'error', message: result.error ?? 'Failed to send email' })
      }
    } catch (err) {
      setEmailState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  async function handleCreateDeal() {
    if (!hubDealName.trim()) return
    setHubState({ status: 'loading', message: '' })
    try {
      const message = `Create a HubSpot deal using HUBSPOT_CREATE_DEAL tool.
Deal Name: ${hubDealName}
Deal Stage: ${hubDealStage.trim() || 'qualifiedtobuy'}
Startup Idea: ${startupIdea}
Verdict: ${results?.verdict ?? 'N/A'}
Thesis: ${results?.one_line_thesis ?? 'N/A'}`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        setHubState({ status: 'success', message: `Deal "${hubDealName}" created in HubSpot` })
      } else {
        setHubState({ status: 'error', message: result.error ?? 'Failed to create deal' })
      }
    } catch (err) {
      setHubState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  async function handlePostTweet() {
    const draft = results?.tweet_draft
    if (!draft) return
    setTwitterState({ status: 'loading', message: '' })
    try {
      const message = `Post a tweet using TWITTER_CREATION_OF_A_POST tool.
Tweet content: ${draft}

Post this exact content as a tweet. Do not modify the text.`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        setTweetPosted(true)
        setTwitterState({ status: 'success', message: 'Tweet posted successfully' })
      } else {
        setTwitterState({ status: 'error', message: result.error ?? 'Failed to post tweet' })
      }
    } catch (err) {
      setTwitterState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  async function handleCreateEvent() {
    if (!calTitle.trim() || !calDate.trim()) return
    setCalState({ status: 'loading', message: '' })
    try {
      const message = `Create a Google Calendar event using GOOGLECALENDAR_CREATE_EVENT tool.
Event Title: ${calTitle}
Date: ${calDate}
Time: ${calTime.trim() || '10:00 AM'}
${calAttendees.trim() ? `Attendees: ${calAttendees}` : ''}
Description: Follow-up meeting for startup due diligence - ${startupIdea.slice(0, 100)}`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        setCalState({ status: 'success', message: `Event "${calTitle}" created` })
      } else {
        setCalState({ status: 'error', message: result.error ?? 'Failed to create event' })
      }
    } catch (err) {
      setCalState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  function StatusBadge({ state }: { state: ActionState }) {
    if (state.status === 'idle') return null
    return (
      <div className={`flex items-center gap-1.5 mt-3 text-xs px-3 py-2 rounded-lg ${
        state.status === 'loading' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
        state.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
        'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}>
        {state.status === 'loading' && <FiLoader className="w-3 h-3 animate-spin" />}
        {state.status === 'success' && <FiCheck className="w-3 h-3" />}
        {state.status === 'error' && <FiAlertCircle className="w-3 h-3" />}
        <span>{state.status === 'loading' ? 'Processing...' : state.message}</span>
      </div>
    )
  }

  const actions = [
    {
      id: 'email',
      title: 'Send Deal Memo via Email',
      icon: <FiMail className="w-4 h-4 text-blue-400" />,
      accent: 'blue',
      description: 'Select a recommended investor or enter an email to send the deal memo',
    },
    {
      id: 'hubspot',
      title: 'Create HubSpot Deal',
      icon: <FiDatabase className="w-4 h-4 text-orange-400" />,
      accent: 'orange',
      description: 'Log this startup as a deal in HubSpot CRM',
    },
    {
      id: 'twitter',
      title: 'Launch Tweet',
      icon: <FaXTwitter className="w-4 h-4 text-zinc-300" />,
      accent: 'zinc',
      description: 'Review and post the AI-generated tweet thread',
    },
    {
      id: 'calendar',
      title: 'Schedule Follow-up Meeting',
      icon: <FiCalendar className="w-4 h-4 text-purple-400" />,
      accent: 'purple',
      description: 'Create a Google Calendar event for next steps',
    },
  ]

  const accentBorder: Record<string, string> = {
    blue: 'border-l-blue-500/50',
    orange: 'border-l-orange-500/50',
    zinc: 'border-l-zinc-400/50',
    purple: 'border-l-purple-500/50',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <FiSend className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-zinc-200 tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Actions
        </h3>
        <span className="text-xs text-zinc-600 tracking-wide">Take action on your analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Card
            key={action.id}
            className={`bg-white/5 backdrop-blur-md border border-white/10 shadow-xl border-l-2 ${accentBorder[action.accent] ?? ''} transition-all duration-300 hover:bg-white/[0.07]`}
          >
            <CardHeader className="pb-0 pt-4 px-5">
              <button
                onClick={() => toggleAction(action.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2 tracking-wide">
                  {action.icon}
                  {action.title}
                </CardTitle>
                {expandedAction === action.id ? (
                  <FiChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <p className="text-xs text-zinc-500 mt-1 tracking-wide">{action.description}</p>
            </CardHeader>

            {expandedAction === action.id && (
              <CardContent className="pt-4 px-5 pb-5 space-y-3">
                {/* Gmail Form with Investor List */}
                {action.id === 'email' && (
                  <>
                    {/* Recommended Investors List */}
                    {Array.isArray(results?.recommended_investors) && results.recommended_investors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.1em] font-medium">Recommended Investors</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {results.recommended_investors.map((investor, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setEmailTo(investor.contact_url || '')
                                setEmailSubject(`FounderOS Deal Memo: Investment Opportunity`)
                              }}
                              className={`w-full text-left rounded-lg border p-3 transition-all duration-200 ${
                                emailTo === investor.contact_url
                                  ? 'bg-blue-500/10 border-blue-500/30'
                                  : 'bg-zinc-950/40 border-white/5 hover:border-white/15 hover:bg-zinc-950/60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                    <FiUser className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">{investor.name}</p>
                                    <p className="text-xs text-blue-400 truncate">{investor.fund}</p>
                                  </div>
                                </div>
                                {investor.contact_url && (
                                  <a
                                    href={investor.contact_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-zinc-500 hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                                  >
                                    <FiExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{investor.thesis_match}</p>
                              {emailTo === investor.contact_url && (
                                <div className="flex items-center gap-1 mt-2">
                                  <FiCheck className="w-3 h-3 text-blue-400" />
                                  <span className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">Selected</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-white/5 my-2" />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Recipient Email</Label>
                      <Input
                        type="email"
                        placeholder="investor@example.com"
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-blue-500/40 focus:ring-blue-500/20"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        disabled={emailState.status === 'loading'}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Subject (optional)</Label>
                      <Input
                        placeholder={`FounderOS Deal Memo: ${startupIdea.slice(0, 30)}...`}
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-blue-500/40 focus:ring-blue-500/20"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        disabled={emailState.status === 'loading'}
                      />
                    </div>
                    <Button
                      onClick={handleSendEmail}
                      disabled={!emailTo.trim() || emailState.status === 'loading'}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 transition-all"
                    >
                      {emailState.status === 'loading' ? (
                        <span className="flex items-center gap-2"><FiLoader className="w-4 h-4 animate-spin" /> Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2"><FiMail className="w-4 h-4" /> Send Email</span>
                      )}
                    </Button>
                    <StatusBadge state={emailState} />
                  </>
                )}

                {/* HubSpot Form */}
                {action.id === 'hubspot' && (
                  <>
                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Deal Name</Label>
                      <Input
                        placeholder="Acme AI Series A"
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-orange-500/40 focus:ring-orange-500/20"
                        value={hubDealName}
                        onChange={(e) => setHubDealName(e.target.value)}
                        disabled={hubState.status === 'loading'}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Deal Stage (optional)</Label>
                      <Input
                        placeholder="qualifiedtobuy"
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-orange-500/40 focus:ring-orange-500/20"
                        value={hubDealStage}
                        onChange={(e) => setHubDealStage(e.target.value)}
                        disabled={hubState.status === 'loading'}
                      />
                    </div>
                    <Button
                      onClick={handleCreateDeal}
                      disabled={!hubDealName.trim() || hubState.status === 'loading'}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold py-2.5 transition-all"
                    >
                      {hubState.status === 'loading' ? (
                        <span className="flex items-center gap-2"><FiLoader className="w-4 h-4 animate-spin" /> Creating...</span>
                      ) : (
                        <span className="flex items-center gap-2"><FiDatabase className="w-4 h-4" /> Create Deal</span>
                      )}
                    </Button>
                    <StatusBadge state={hubState} />
                  </>
                )}

                {/* Twitter - Tweet Confirmation Flow */}
                {action.id === 'twitter' && (
                  <>
                    {results?.tweet_draft ? (
                      <>
                        <div className="rounded-xl bg-zinc-950/60 border border-white/10 p-4">
                          <p className="text-xs text-zinc-500 uppercase tracking-[0.1em] mb-2 font-medium">Tweet Preview</p>
                          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{results.tweet_draft}</div>
                        </div>
                        <Button
                          onClick={handlePostTweet}
                          disabled={tweetPosted || twitterState.status === 'loading'}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-sm font-bold py-3 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        >
                          {twitterState.status === 'loading' ? (
                            <span className="flex items-center gap-2"><FiLoader className="w-4 h-4 animate-spin" /> Posting...</span>
                          ) : tweetPosted ? (
                            <span className="flex items-center gap-2"><FiCheck className="w-4 h-4" /> Tweet Posted</span>
                          ) : (
                            <span className="flex items-center gap-2"><FaXTwitter className="w-4 h-4" /> Post to X</span>
                          )}
                        </Button>
                        <StatusBadge state={twitterState} />
                      </>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-4">No tweet draft available -- run analysis first</p>
                    )}
                  </>
                )}

                {/* Calendar Form */}
                {action.id === 'calendar' && (
                  <>
                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Event Title</Label>
                      <Input
                        placeholder="Due Diligence Follow-up"
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-purple-500/40 focus:ring-purple-500/20"
                        value={calTitle}
                        onChange={(e) => setCalTitle(e.target.value)}
                        disabled={calState.status === 'loading'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-zinc-400 tracking-wide">Date</Label>
                        <Input
                          type="date"
                          className="mt-1 bg-zinc-950/60 border-white/10 text-white text-sm focus:border-purple-500/40 focus:ring-purple-500/20 [color-scheme:dark]"
                          value={calDate}
                          onChange={(e) => setCalDate(e.target.value)}
                          disabled={calState.status === 'loading'}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400 tracking-wide">Time</Label>
                        <Input
                          type="time"
                          className="mt-1 bg-zinc-950/60 border-white/10 text-white text-sm focus:border-purple-500/40 focus:ring-purple-500/20 [color-scheme:dark]"
                          value={calTime}
                          onChange={(e) => setCalTime(e.target.value)}
                          disabled={calState.status === 'loading'}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400 tracking-wide">Attendees (comma-separated emails)</Label>
                      <Input
                        placeholder="team@company.com, investor@vc.com"
                        className="mt-1 bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-600 text-sm focus:border-purple-500/40 focus:ring-purple-500/20"
                        value={calAttendees}
                        onChange={(e) => setCalAttendees(e.target.value)}
                        disabled={calState.status === 'loading'}
                      />
                    </div>
                    <Button
                      onClick={handleCreateEvent}
                      disabled={!calTitle.trim() || !calDate.trim() || calState.status === 'loading'}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2.5 transition-all"
                    >
                      {calState.status === 'loading' ? (
                        <span className="flex items-center gap-2"><FiLoader className="w-4 h-4 animate-spin" /> Creating...</span>
                      ) : (
                        <span className="flex items-center gap-2"><FiCalendar className="w-4 h-4" /> Create Event</span>
                      )}
                    </Button>
                    <StatusBadge state={calState} />
                  </>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
