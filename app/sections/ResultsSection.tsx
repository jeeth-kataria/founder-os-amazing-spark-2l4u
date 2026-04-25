'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiGlobe, FiCpu, FiDollarSign, FiCheckCircle, FiArrowRight, FiUsers, FiExternalLink } from 'react-icons/fi'

interface DealMemoResult {
  verdict?: string
  one_line_thesis?: string
  market_opportunity?: string
  technical_assessment?: string
  financial_viability?: string
  consensus_risk_analysis?: {
    high_confidence_risks?: string[]
    investigate_risks?: string[]
    alpha_kill_shot?: string
    beta_kill_shot?: string
    alpha_kill_shots_ranked?: { rank: number; cause: string; estimated_timeline: string }[]
    beta_kill_shots_ranked?: { rank: number; cause: string; estimated_timeline: string }[]
    consensus_reached?: string
  }
  conditions_for_success?: string[]
  recommended_next_step?: string
  recommended_investors?: { name: string; fund: string; thesis_match: string; contact_url: string }[]
  tweet_draft?: string
  tweet_pending_approval?: boolean
  scorecard?: {
    market_opportunity?: { score: number; reasoning: string }
    technical_defensibility?: { score: number; reasoning: string }
    unit_economics_health?: { score: number; reasoning: string }
    execution_risk?: { score: number; reasoning: string }
    team_market_fit?: { score: number; reasoning: string }
    overall_score?: number
  }
  comparable_exits?: { company: string; outcome: string; year: number; similarity: string }[]
}

interface ResultsSectionProps {
  results: DealMemoResult | null
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-zinc-200">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-zinc-200">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-zinc-100">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm text-zinc-300 leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm text-zinc-300 leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-zinc-300 leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-zinc-100">{part}</strong> : part)
}

function verdictColor(verdict: string) {
  const v = verdict?.toUpperCase() ?? ''
  if (v.includes('KILL') || v.includes('NO GO') || v.includes('REJECT') || v.includes('PASS'))
    return { bg: 'from-red-500/10 to-red-900/5', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]' }
  if (v.includes('CONDITIONAL') || v.includes('CAUTION'))
    return { bg: 'from-amber-500/10 to-amber-900/5', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]' }
  return { bg: 'from-emerald-500/10 to-emerald-900/5', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]' }
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  if (!results) return null

  const vc = verdictColor(results?.verdict ?? '')

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
      {/* Verdict Banner - Premium Executive Style */}
      <div className={`relative rounded-2xl border-2 ${vc.border} ${vc.glow} bg-gradient-to-br ${vc.bg} backdrop-blur-md overflow-hidden animate-fade-in-up`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="relative p-10 text-center space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Investment Verdict</p>
          <h2
            className={`text-5xl md:text-6xl font-bold tracking-tight ${vc.text}`}
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            {results?.verdict ?? 'PENDING'}
          </h2>
          {results?.one_line_thesis && (
            <p className={`text-lg ${vc.text} opacity-80 max-w-2xl mx-auto leading-relaxed`}>{results.one_line_thesis}</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Assessment Cards - Glassmorphic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up-delay-1">
        <AssessmentCard
          title="Market Opportunity"
          icon={<FiGlobe className="w-4 h-4 text-blue-400" />}
          content={results?.market_opportunity}
          accentColor="blue"
        />
        <AssessmentCard
          title="Technical Assessment"
          icon={<FiCpu className="w-4 h-4 text-purple-400" />}
          content={results?.technical_assessment}
          accentColor="purple"
        />
        <AssessmentCard
          title="Financial Viability"
          icon={<FiDollarSign className="w-4 h-4 text-emerald-400" />}
          content={results?.financial_viability}
          accentColor="emerald"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Conditions for Success */}
      {Array.isArray(results?.conditions_for_success) && results.conditions_for_success.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in-up-delay-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2 tracking-wide">
              <FiCheckCircle className="w-4 h-4 text-amber-400" />
              Conditions for Success
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {results.conditions_for_success.map((condition, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 border border-amber-500/20">{i + 1}</span>
                  {condition}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Investors */}
      {Array.isArray(results?.recommended_investors) && results.recommended_investors.length > 0 && (
        <>
          <div className="border-t border-white/10" />
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in-up-delay-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2 tracking-wide">
                <FiUsers className="w-4 h-4 text-amber-400" />
                Recommended Investors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.recommended_investors.map((investor, i) => (
                  <div key={i} className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 space-y-2 transition-all duration-300 hover:bg-white/[0.07]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{investor?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-amber-400 font-medium">{investor?.fund ?? ''}</p>
                      </div>
                      {investor?.contact_url && (
                        <a
                          href={investor.contact_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{investor?.thesis_match ?? ''}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Recommended Next Step */}
      {results?.recommended_next_step && (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in-up-delay-3">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <FiArrowRight className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.15em] mb-2">Recommended Next Step</p>
                <div className="text-sm text-zinc-200 leading-relaxed">{renderMarkdown(results.recommended_next_step)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AssessmentCard({ title, icon, content, accentColor }: { title: string; icon: React.ReactNode; content?: string; accentColor: string }) {
  const borderMap: Record<string, string> = {
    blue: 'border-t-blue-500/40',
    purple: 'border-t-purple-500/40',
    emerald: 'border-t-emerald-500/40',
  }

  return (
    <Card className={`bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl ${borderMap[accentColor] ?? ''} border-t-2`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-[0.12em] leading-relaxed">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {content ? renderMarkdown(content) : <p className="text-sm text-zinc-500">No data available</p>}
      </CardContent>
    </Card>
  )
}
