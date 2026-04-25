'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiTrendingUp } from 'react-icons/fi'

interface ComparableExit {
  company: string
  outcome: string
  year: number
  similarity: string
}

interface ComparableExitsSectionProps {
  exits: ComparableExit[]
}

export default function ComparableExitsSection({ exits }: ComparableExitsSectionProps) {
  if (!Array.isArray(exits) || exits.length === 0) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up-delay-3">
      <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5 tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
        <FiTrendingUp className="w-5 h-5 text-amber-400" />
        Comparable Exits
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exits.map((exit, i) => (
          <Card key={i} className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl border-t-2 border-t-amber-500/40 transition-all duration-300 hover:bg-white/[0.07]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">{exit?.company ?? 'Unknown'}</h3>
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 backdrop-blur-sm text-xs">
                  {exit?.year ?? ''}
                </Badge>
              </div>
              <p className="text-sm text-zinc-200 font-medium leading-relaxed">{exit?.outcome ?? ''}</p>
              <div className="pt-1 border-t border-white/5">
                <p className="text-xs text-zinc-500 leading-relaxed">{exit?.similarity ?? ''}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
