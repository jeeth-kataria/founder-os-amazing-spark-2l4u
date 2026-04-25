'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiBarChart2 } from 'react-icons/fi'

interface ScorecardDimension {
  score: number
  reasoning: string
}

interface Scorecard {
  market_opportunity?: ScorecardDimension
  technical_defensibility?: ScorecardDimension
  unit_economics_health?: ScorecardDimension
  execution_risk?: ScorecardDimension
  team_market_fit?: ScorecardDimension
  overall_score?: number
}

interface ScorecardSectionProps {
  scorecard: Scorecard
}

const DIMENSIONS: { key: keyof Omit<Scorecard, 'overall_score'>; label: string }[] = [
  { key: 'market_opportunity', label: 'Market Opportunity' },
  { key: 'technical_defensibility', label: 'Technical Defensibility' },
  { key: 'unit_economics_health', label: 'Unit Economics Health' },
  { key: 'execution_risk', label: 'Execution Risk' },
  { key: 'team_market_fit', label: 'Team-Market Fit' },
]

function scoreColor(score: number): string {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 5) return 'text-amber-400'
  return 'text-red-400'
}

function barColor(score: number): string {
  if (score >= 7) return 'bg-emerald-500'
  if (score >= 5) return 'bg-amber-500'
  return 'bg-red-500'
}

function barGlow(score: number): string {
  if (score >= 7) return 'shadow-[0_0_8px_rgba(16,185,129,0.4)]'
  if (score >= 5) return 'shadow-[0_0_8px_rgba(245,158,11,0.4)]'
  return 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'
}

export default function ScorecardSection({ scorecard }: ScorecardSectionProps) {
  if (!scorecard) return null

  const overall = scorecard.overall_score ?? 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up-delay-2">
      <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5 tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
        <FiBarChart2 className="w-5 h-5 text-amber-400" />
        Investment Scorecard
      </h2>

      <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              Overall Score
            </CardTitle>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl font-bold tracking-tight ${scoreColor(overall)}`} style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {overall.toFixed(1)}
              </span>
              <span className="text-sm text-zinc-600 font-medium">/10</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-5">
          {DIMENSIONS.map(({ key, label }) => {
            const dim = scorecard[key]
            if (!dim) return null
            const score = dim.score ?? 0
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300 font-medium">{label}</span>
                  <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}/10</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(score)} ${barGlow(score)} transition-all duration-700`}
                    style={{ width: `${Math.min(score * 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{dim.reasoning ?? ''}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
