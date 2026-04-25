'use client'

import React, { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiTarget, FiCpu, FiGlobe, FiDollarSign, FiShield } from 'react-icons/fi'
import HeroSection from './sections/HeroSection'
import ResultsSection from './sections/ResultsSection'
import RiskAnalysisSection from './sections/RiskAnalysisSection'
import ScorecardSection from './sections/ScorecardSection'
import ComparableExitsSection from './sections/ComparableExitsSection'
import ActionsPanel from './sections/ActionsPanel'
import KnowledgeBaseSection from './sections/KnowledgeBaseSection'

const MANAGER_AGENT_ID = '69ec5aef603f5bad913c0db7'

const AGENTS_INFO = [
  { id: '69ec5aef603f5bad913c0db7', name: 'Deal Memo Writer', role: 'Manager', icon: <FiTarget className="w-3 h-3" /> },
  { id: '69ec5ad130bbb2ccb9d9492f', name: 'Product Analyst', role: 'Sub-agent', icon: <FiCpu className="w-3 h-3" /> },
  { id: '69ec5ad2d03f1b66a206d273', name: 'Market Intelligence', role: 'Sub-agent', icon: <FiGlobe className="w-3 h-3" /> },
  { id: '69ec5ab8faf2562dd1132c02', name: 'Unit Economics', role: 'Sub-agent', icon: <FiDollarSign className="w-3 h-3" /> },
  { id: '69ec5ab863c949174ac79996', name: 'Red Team Alpha', role: 'Sub-agent', icon: <FiShield className="w-3 h-3" /> },
  { id: '69ec5ab8d03f1b66a206d26a', name: 'Red Team Beta', role: 'Sub-agent', icon: <FiShield className="w-3 h-3" /> },
]

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

const SAMPLE_RESULTS: DealMemoResult = {
  verdict: 'CONDITIONAL GO',
  one_line_thesis: 'AI-powered compliance automation for mid-market fintechs has strong unit economics but faces regulatory uncertainty and incumbent resistance.',
  market_opportunity: '**TAM:** $12B global RegTech market growing at 23% CAGR.\n\n**Market Gap:** Current solutions are enterprise-only ($200K+/yr), leaving 40,000+ mid-market fintechs underserved.\n\n**ICP:** Series A-C fintechs with 50-500 employees facing SOC2/PCI compliance deadlines.\n\n**Distribution:** Product-led growth via compliance audit tool, converting to platform.',
  technical_assessment: '**Moat Assessment:** Moderate - proprietary compliance knowledge graph is defensible, but core LLM layer is commoditizing.\n\n**MVP:** 8-week build with Next.js + Python backend. Core features: automated compliance mapping, gap analysis, remediation tracking.\n\n**Risk:** 3 open-source alternatives found on GitHub with 2K+ stars each, though none have enterprise-grade accuracy.',
  financial_viability: '**Revenue Model:** SaaS - $499/mo (Starter), $1,499/mo (Growth), $4,999/mo (Enterprise)\n\n**CAC:** $2,800 blended (content marketing + outbound)\n**LTV:** $28,000 (avg contract 18mo)\n**LTV/CAC:** 10:1\n\n**Burn:** $85K/mo at current team size\n**Customers for $10K MRR:** 20 on Growth plan\n\n**Fatal Assumption:** Assumes 40% of trial users convert to paid within 30 days.',
  consensus_risk_analysis: {
    high_confidence_risks: [
      'Regulatory landscape changes could invalidate core compliance mappings overnight',
      'Enterprise incumbents (OneTrust, Vanta) could launch mid-market tiers within 12 months',
      'LLM hallucination risk in compliance recommendations creates legal liability',
    ],
    investigate_risks: [
      'Customer willingness to trust AI for compliance decisions without human review',
      'Potential for compliance framework fragmentation across jurisdictions',
      'Team lacks deep regulatory domain expertise',
    ],
    alpha_kill_shot: 'If Vanta launches a $299/mo mid-market tier (rumored for Q3), the entire pricing strategy collapses and CAC doubles due to brand competition.',
    beta_kill_shot: 'Founders are building a compliance tool but have zero compliance professionals on the team -- this is a domain expertise gap that no amount of AI can bridge for enterprise buyers.',
    alpha_kill_shots_ranked: [
      { rank: 1, cause: 'If Vanta launches a $299/mo mid-market tier, the entire pricing strategy collapses and CAC doubles due to brand competition.', estimated_timeline: 'Month 6' },
      { rank: 2, cause: 'Regulatory changes invalidate core compliance mappings overnight', estimated_timeline: 'Month 12' },
      { rank: 3, cause: 'LLM provider pricing increases make unit economics unsustainable', estimated_timeline: 'Month 18' },
    ],
    beta_kill_shots_ranked: [
      { rank: 1, cause: 'Founders are building a compliance tool but have zero compliance professionals on the team — domain expertise gap no AI can bridge', estimated_timeline: 'Month 8' },
      { rank: 2, cause: 'Premature scaling before establishing true product-market fit in this regulated space', estimated_timeline: 'Month 12' },
      { rank: 3, cause: 'Customer trust gap — enterprises won\'t rely on AI-only compliance without human review layer', estimated_timeline: 'Month 15' },
    ],
    consensus_reached: 'Yes - both teams agree the idea has merit but the competitive timing risk and domain expertise gap are critical blockers that must be addressed pre-funding.',
  },
  conditions_for_success: [
    'Hire a Chief Compliance Officer with Big 4 audit background within 60 days',
    'Secure 3 design partners with signed LOIs before raising Series A',
    'Build human-in-the-loop review layer to mitigate LLM hallucination liability',
    'Establish regulatory advisory board with former SEC/FINRA officials',
    'Ship MVP to 10 beta customers and achieve 70%+ NPS within 90 days',
  ],
  recommended_next_step: 'Schedule a 60-minute deep dive with the founding team to assess their compliance domain expertise gap. Request introductions to their 3 strongest customer prospects for reference calls. Conditional on CCO hire timeline and LOI pipeline.',
  recommended_investors: [
    { name: 'Sarah Chen', fund: 'Andreessen Horowitz (a16z)', thesis_match: 'Active in AI/ML infrastructure and enterprise SaaS -- recently led rounds in compliance-adjacent startups', contact_url: 'https://twitter.com/sarahchen' },
    { name: 'David Park', fund: 'Ribbit Capital', thesis_match: 'Focused exclusively on fintech -- invested in 3 RegTech companies in the last 18 months', contact_url: 'https://linkedin.com/in/davidpark' },
    { name: 'Maria Rodriguez', fund: 'QED Investors', thesis_match: 'Thesis centers on financial services automation -- portfolio includes compliance workflow tools', contact_url: 'https://twitter.com/mariarodriguez' },
    { name: 'James Liu', fund: 'Bessemer Venture Partners', thesis_match: 'Cloud and DevOps investor expanding into GRC/compliance -- sees it as next enterprise platform category', contact_url: 'https://linkedin.com/in/jamesliu' },
    { name: 'Priya Sharma', fund: 'Index Ventures', thesis_match: 'B2B SaaS specialist with recent investments in AI-first horizontal platforms for regulated industries', contact_url: 'https://twitter.com/priyasharma' },
  ],
  tweet_draft: 'Just ran AI-powered due diligence on an exciting RegTech startup concept.\n\nVerdict: CONDITIONAL GO\n\n$12B TAM, 10:1 LTV/CAC ratio, but critical domain expertise gap needs addressing.\n\nThe future of compliance is AI-first. Thread below.\n\n#RegTech #StartupDueDiligence #FounderOS',
  tweet_pending_approval: true,
  scorecard: {
    market_opportunity: { score: 8, reasoning: 'Large $12B TAM with 23% CAGR and clear underserved mid-market segment' },
    technical_defensibility: { score: 6, reasoning: 'Proprietary compliance knowledge graph is defensible but core LLM layer is commoditizing' },
    unit_economics_health: { score: 7, reasoning: 'Strong 10:1 LTV/CAC but assumes 40% trial conversion which needs validation' },
    execution_risk: { score: 5, reasoning: 'First-time founders lack compliance domain expertise — critical hire needed' },
    team_market_fit: { score: 6, reasoning: 'Strong technical DNA but missing regulated industry experience on founding team' },
    overall_score: 6.4,
  },
  comparable_exits: [
    { company: 'Vanta', outcome: 'Raised $110M Series B at $1.6B valuation', year: 2022, similarity: 'Automated compliance platform targeting SMB/mid-market with PLG motion' },
    { company: 'Drata', outcome: 'Raised $200M Series C at $2B valuation', year: 2022, similarity: 'Security compliance automation with similar ICP and pricing strategy' },
    { company: 'Laika', outcome: 'Acquired by Drata for undisclosed amount', year: 2023, similarity: 'Compliance management platform that validated the mid-market segment' },
  ],
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-100">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-zinc-400 mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [startupIdea, setStartupIdea] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [dealName, setDealName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeLayer, setActiveLayer] = useState(0)
  const [results, setResults] = useState<DealMemoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setActiveLayer(0)
      return
    }
    const t1 = setTimeout(() => setActiveLayer(1), 3000)
    const t2 = setTimeout(() => setActiveLayer(2), 15000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isLoading])

  async function handleSubmit() {
    if (!startupIdea.trim()) return
    setIsLoading(true)
    setError(null)
    setResults(null)
    setActiveAgentId(MANAGER_AGENT_ID)

    let message = `Startup Idea: ${startupIdea}`
    if (recipientEmail.trim()) message += `\n\nRecipient Email: ${recipientEmail}`
    if (dealName.trim()) message += `\nDeal Name: ${dealName}`

    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      if (result.success) {
        const parsed = result?.response?.result ?? result?.response ?? null
        if (parsed && typeof parsed === 'object') {
          setResults(parsed as DealMemoResult)
        } else if (typeof parsed === 'string') {
          setError('Received text response instead of structured data. Please try again.')
        } else {
          setError('Unexpected response format. Please try again.')
        }
      } else {
        setError(result.error ?? 'Agent call failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
      setActiveAgentId(null)
    }
  }

  const displayResults = showSample ? SAMPLE_RESULTS : results

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
        <ScrollArea className="h-screen">
          <div className="max-w-5xl mx-auto px-4 pb-20">
            {/* Sample Toggle */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Label className="text-xs text-zinc-500 tracking-wide">Sample Data</Label>
              <Switch checked={showSample} onCheckedChange={setShowSample} />
            </div>

            {/* Hero + Input */}
            <HeroSection
              startupIdea={showSample ? 'AI-powered compliance automation platform for mid-market fintechs. Automates SOC2, PCI-DSS, and ISO 27001 compliance using LLMs to map controls, identify gaps, and generate remediation plans. Target: Series A-C fintechs with 50-500 employees.' : startupIdea}
              setStartupIdea={setStartupIdea}
              recipientEmail={recipientEmail}
              setRecipientEmail={setRecipientEmail}
              dealName={dealName}
              setDealName={setDealName}
              isLoading={isLoading}
              activeLayer={activeLayer}
              onSubmit={handleSubmit}
              hasResults={!!displayResults}
            />

            {/* Error */}
            {error && (
              <div className="max-w-3xl mx-auto mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Results - with generous spacing */}
            {displayResults && (
              <div className="mt-16 space-y-10">
                <ResultsSection results={displayResults} />

                <div className="py-4">
                  <div className="border-t border-white/10" />
                </div>

                {displayResults?.scorecard && <ScorecardSection scorecard={displayResults.scorecard} />}

                <div className="py-4">
                  <div className="border-t border-white/10" />
                </div>

                {Array.isArray(displayResults?.comparable_exits) && displayResults.comparable_exits.length > 0 && (
                  <>
                    <ComparableExitsSection exits={displayResults.comparable_exits} />
                    <div className="py-4"><div className="border-t border-white/10" /></div>
                  </>
                )}

                <RiskAnalysisSection riskAnalysis={displayResults?.consensus_risk_analysis} />

                <div className="py-4">
                  <div className="border-t border-white/10" />
                </div>

                <ActionsPanel startupIdea={showSample ? 'AI-powered compliance automation platform for mid-market fintechs' : startupIdea} results={displayResults} />
              </div>
            )}

            {/* Knowledge Base - generous top spacing */}
            <div className="mt-16 pt-16">
              <div className="border-t border-white/10 mb-10" />
              <KnowledgeBaseSection />
            </div>

            {/* Agent Info Footer */}
            <div className="mt-16 mb-8">
              <div className="border-t border-white/10 mb-8" />
              <div className="max-w-4xl mx-auto">
                <p className="text-xs text-zinc-600 uppercase tracking-[0.2em] font-medium mb-4">Powered by 6 AI Agents</p>
                <div className="flex flex-wrap gap-2.5">
                  {AGENTS_INFO.map(agent => (
                    <div key={agent.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border backdrop-blur-sm transition-all duration-300 ${activeAgentId === agent.id ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/[0.02] border-white/5 text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${activeAgentId === agent.id ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`} />
                      {agent.icon}
                      <span className="tracking-wide">{agent.name}</span>
                      <span className="text-zinc-700">({agent.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </ErrorBoundary>
  )
}
