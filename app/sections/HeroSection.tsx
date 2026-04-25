'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FiSearch, FiZap, FiShield, FiTrendingUp, FiTarget, FiCpu, FiGlobe, FiDollarSign, FiChevronDown, FiChevronUp, FiLoader } from 'react-icons/fi'

interface AgentNode {
  id: string
  name: string
  role: string
  icon: React.ReactNode
  layer: number
}

interface HeroSectionProps {
  startupIdea: string
  setStartupIdea: (v: string) => void
  recipientEmail: string
  setRecipientEmail: (v: string) => void
  dealName: string
  setDealName: (v: string) => void
  isLoading: boolean
  activeLayer: number
  onSubmit: () => void
  hasResults: boolean
}

const AGENTS: AgentNode[] = [
  { id: 'manager', name: 'Deal Memo Writer', role: 'Manager / Orchestrator', icon: <FiTarget className="w-5 h-5" />, layer: 0 },
  { id: 'product', name: 'Product Analyst', role: 'Technical Moat Assessor', icon: <FiCpu className="w-4 h-4" />, layer: 1 },
  { id: 'market', name: 'Market Intelligence', role: 'GTM Strategist', icon: <FiGlobe className="w-4 h-4" />, layer: 1 },
  { id: 'economics', name: 'Unit Economics', role: 'Financial Stress Tester', icon: <FiDollarSign className="w-4 h-4" />, layer: 1 },
  { id: 'alpha', name: 'Red Team Alpha', role: 'Structural Adversary', icon: <FiShield className="w-4 h-4" />, layer: 2 },
  { id: 'beta', name: 'Red Team Beta', role: 'Operational Adversary', icon: <FiShield className="w-4 h-4" />, layer: 2 },
]

export default function HeroSection({
  startupIdea, setStartupIdea,
  recipientEmail, setRecipientEmail,
  dealName, setDealName,
  isLoading, activeLayer, onSubmit, hasResults
}: HeroSectionProps) {
  const [showOptional, setShowOptional] = useState(false)

  function getAgentStatus(agent: AgentNode) {
    if (!isLoading) return hasResults ? 'complete' : 'idle'
    if (agent.layer === 0) return 'running'
    if (agent.layer <= activeLayer) return 'running'
    return 'idle'
  }

  function statusColor(status: string) {
    if (status === 'running') return 'bg-amber-500 animate-pulse'
    if (status === 'complete') return 'bg-emerald-500'
    return 'bg-zinc-600'
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 pt-10">
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
            <FiTarget className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            FounderOS
          </h1>
        </div>
        <p className="text-zinc-400 text-xl tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          AI-Powered Due Diligence Engine
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 tracking-wide leading-relaxed">
          <span className="flex items-center gap-1.5"><FiSearch className="w-3 h-3" /> Deep Research</span>
          <span className="flex items-center gap-1.5"><FiZap className="w-3 h-3" /> 6 Agents</span>
          <span className="flex items-center gap-1.5"><FiShield className="w-3 h-3" /> Red Team Analysis</span>
          <span className="flex items-center gap-1.5"><FiTrendingUp className="w-3 h-3" /> Unit Economics</span>
        </div>
      </div>

      {/* Input Form - Glassmorphic */}
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-3xl mx-auto">
        <CardContent className="p-7 space-y-5">
          <div>
            <Label className="text-zinc-300 text-sm font-medium tracking-wide leading-relaxed">Startup Idea</Label>
            <Textarea
              placeholder="Describe your startup idea in detail... Include the problem, solution, target market, and business model."
              className="mt-2 bg-zinc-950/60 border-white/10 text-white placeholder:text-gray-400 min-h-[130px] resize-none focus:border-amber-500/40 focus:ring-amber-500/20 transition-all"
              value={startupIdea}
              onChange={(e) => setStartupIdea(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors tracking-wide leading-relaxed"
          >
            {showOptional ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            Optional: Email recipient, Deal name
          </button>

          {showOptional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400 text-xs tracking-wide leading-relaxed">Recipient Email (for deal memo)</Label>
                <Input
                  type="email"
                  placeholder="investor@example.com"
                  className="mt-1.5 bg-zinc-950/60 border-white/10 text-white placeholder:text-gray-400 text-sm focus:border-amber-500/40 focus:ring-amber-500/20"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs tracking-wide leading-relaxed">Deal Name (for HubSpot)</Label>
                <Input
                  placeholder="Acme AI Series A"
                  className="mt-1.5 bg-zinc-950/60 border-white/10 text-white placeholder:text-gray-400 text-sm focus:border-amber-500/40 focus:ring-amber-500/20"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Button
            onClick={onSubmit}
            disabled={isLoading || !startupIdea.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-6 text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] rounded-xl tracking-wide"
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><FiLoader className="w-5 h-5 animate-spin" /> Running Due Diligence...</span>
            ) : (
              <span className="flex items-center gap-2"><FiZap className="w-5 h-5" /> Run Due Diligence</span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Agent Workflow Graph */}
      {isLoading && (
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-center text-sm text-zinc-500 font-medium uppercase tracking-widest">Agent Pipeline</p>
          <div className="space-y-3">
            <div className="flex justify-center">
              <AgentCard agent={AGENTS[0]} status={getAgentStatus(AGENTS[0])} statusColor={statusColor} />
            </div>
            <div className="flex justify-center">
              <div className="w-px h-4 bg-zinc-700" />
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {AGENTS.filter(a => a.layer === 1).map(agent => (
                <AgentCard key={agent.id} agent={agent} status={getAgentStatus(agent)} statusColor={statusColor} />
              ))}
            </div>
            <div className="flex justify-center">
              <div className="w-px h-4 bg-zinc-700" />
            </div>
            <div className="flex justify-center gap-3">
              {AGENTS.filter(a => a.layer === 2).map(agent => (
                <AgentCard key={agent.id} agent={agent} status={getAgentStatus(agent)} statusColor={statusColor} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AgentCard({ agent, status, statusColor }: { agent: AgentNode; status: string; statusColor: (s: string) => string }) {
  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border backdrop-blur-sm transition-all duration-300 ${status === 'running' ? 'bg-white/5 border-amber-500/30 shadow-lg shadow-amber-500/10' : status === 'complete' ? 'bg-white/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
      <div className={`w-2 h-2 rounded-full ${statusColor(status)}`} />
      <div className="text-zinc-400">{agent.icon}</div>
      <div>
        <p className="text-xs font-medium text-zinc-200">{agent.name}</p>
        <p className="text-[10px] text-zinc-500">{agent.role}</p>
      </div>
    </div>
  )
}
