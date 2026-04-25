'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiLoader, FiUpload, FiFileText, FiTrash2, FiBookOpen } from 'react-icons/fi'
import { uploadAndTrainDocument, getDocuments, deleteDocuments } from '@/lib/ragKnowledgeBase'
import type { RAGDocument } from '@/lib/ragKnowledgeBase'

const RAG_ID = '69ec5a83e01f11b1c838377d'

export default function KnowledgeBaseSection() {
  const [documents, setDocuments] = useState<RAGDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    setLoading(true)
    setError(null)
    try {
      const result = await getDocuments(RAG_ID)
      if (result.success && Array.isArray(result.documents)) {
        setDocuments(result.documents)
      } else if (!result.success) {
        setError(result.error ?? 'Failed to load documents')
      }
    } catch {
      setError('Unable to connect to knowledge base service')
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setUploadStatus(`Uploading ${file.name}...`)

    const result = await uploadAndTrainDocument(RAG_ID, file)
    if (result.success) {
      setUploadStatus(`${file.name} uploaded and trained successfully`)
      await loadDocuments()
    } else {
      setError(result.error ?? 'Upload failed')
      setUploadStatus(null)
    }
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(fileName: string) {
    setLoading(true)
    setError(null)
    const result = await deleteDocuments(RAG_ID, [fileName])
    if (result.success) {
      setDocuments(prev => prev.filter(d => d.fileName !== fileName))
    } else {
      setError(result.error ?? 'Delete failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2 tracking-wide">
            <FiBookOpen className="w-4 h-4 text-indigo-400" />
            VC Frameworks Knowledge Base
          </CardTitle>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed tracking-wide">Upload documents (PDF, DOCX, TXT) to enhance due diligence analysis with your own VC frameworks.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-white/10 rounded-xl p-7 text-center hover:border-amber-500/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 tracking-wide">Click to upload a document</p>
            <p className="text-xs text-zinc-600 mt-1">Supports PDF, DOCX, TXT</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* Status Messages */}
          {uploadStatus && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              {loading && <FiLoader className="w-3 h-3 animate-spin" />}
              {uploadStatus}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* Documents List */}
          {loading && documents.length === 0 ? (
            <div className="flex items-center justify-center py-4 gap-2 text-zinc-500 text-sm">
              <FiLoader className="w-4 h-4 animate-spin" /> Loading documents...
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-[0.15em]">Uploaded Documents ({documents.length})</p>
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FiFileText className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-300 truncate">{doc.fileName}</span>
                    <Badge variant="outline" className="text-[10px] text-zinc-500 border-white/10 shrink-0">{doc.fileType}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.fileName)}
                    disabled={loading}
                    className="text-zinc-500 hover:text-red-400 shrink-0 h-7 w-7 p-0"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 text-center py-2">No documents uploaded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
