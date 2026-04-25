'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiShield, FiAlertTriangle, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface RankedKillShot {
  rank: number
  cause: string
  estimated_timeline: string
}

interface ConsensusRiskAnalysis {
  high_confidence_risks?: string[]
  investigate_risks?: string[]
  alpha_kill_shot?: string
  beta_kill_shot?: string
  alpha_kill_shots_ranked?: RankedKillShot[]
  beta_kill_shots_ranked?: RankedKillShot[]
  consensus_reached?: string
}

interface RiskAnalysisSectionProps {
  riskAnalysis: ConsensusRiskAnalysis | null | undefined
}

export default function RiskAnalysisSection({ riskAnalysis }: RiskAnalysisSectionProps) {
  if (!riskAnalysis) return null

  const consensusText = riskAnalysis?.consensus_reached ?? ''
  const isConsensus = consensusText.toLowerCase().includes('yes') || consensusText.toLowerCase().includes('reached') || consensusText.toLowerCase().includes('agree')

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up-delay-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5 tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          <FiShield className="w-5 h-5 text-red-400" />
          Consensus Risk Analysis
        </h2>
        <Badge className={`${isConsensus ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'} backdrop-blur-sm`}>
          <span className="flex items-center gap-1.5 tracking-wide">
            {isConsensus ? <><FiCheckCircle className="w-3 h-3" /> Consensus Reached</> : <><FiAlertTriangle className="w-3 h-3" /> Divergent Views</>}
          </span>
        </Badge>
      </div>

      {consensusText && (
        <p className="text-sm text-zinc-400 bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10 leading-relaxed">{consensusText}</p>
      )}

      {/* Kill Shots - Ranked Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-red-500 shadow-[0_0_20px_rgba(220,38,38,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-red-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <FiXCircle className="w-3.5 h-3.5" /> Alpha Kill Shots
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {Array.isArray(riskAnalysis?.alpha_kill_shots_ranked) && riskAnalysis.alpha_kill_shots_ranked.length > 0 ? (
              riskAnalysis.alpha_kill_shots_ranked.map((shot, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-red-500/20">{shot?.rank ?? i + 1}</span>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm text-zinc-300 leading-relaxed">{shot?.cause ?? ''}</p>
                    <span className="inline-block text-[10px] font-medium text-red-400/80 bg-red-500/10 border border-red-500/15 rounded-full px-2 py-0.5 tracking-wide">{shot?.estimated_timeline ?? ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-300 leading-relaxed">{riskAnalysis?.alpha_kill_shot ?? 'No kill shots identified'}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-red-500 shadow-[0_0_20px_rgba(220,38,38,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-red-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <FiXCircle className="w-3.5 h-3.5" /> Beta Kill Shots
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {Array.isArray(riskAnalysis?.beta_kill_shots_ranked) && riskAnalysis.beta_kill_shots_ranked.length > 0 ? (
              riskAnalysis.beta_kill_shots_ranked.map((shot, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-red-500/20">{shot?.rank ?? i + 1}</span>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm text-zinc-300 leading-relaxed">{shot?.cause ?? ''}</p>
                    <span className="inline-block text-[10px] font-medium text-red-400/80 bg-red-500/10 border border-red-500/15 rounded-full px-2 py-0.5 tracking-wide">{shot?.estimated_timeline ?? ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-300 leading-relaxed">{riskAnalysis?.beta_kill_shot ?? 'No kill shots identified'}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* High Confidence Risks */}
      {Array.isArray(riskAnalysis?.high_confidence_risks) && riskAnalysis.high_confidence_risks.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-red-500 shadow-[0_0_20px_rgba(220,38,38,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-red-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <FiAlertTriangle className="w-3.5 h-3.5" /> High Confidence Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {riskAnalysis.high_confidence_risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                <span className="text-zinc-300 leading-relaxed">{risk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Investigate Risks */}
      {Array.isArray(riskAnalysis?.investigate_risks) && riskAnalysis.investigate_risks.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-amber-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <FiSearch className="w-3.5 h-3.5" /> Investigate Further
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {riskAnalysis.investigate_risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span className="text-zinc-300 leading-relaxed">{risk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
