/**
 * Server-side RAG Knowledge Base API Route
 *
 * This route proxies requests to the Lyzr RAG API v3 (https://rag-prod.studio.lyzr.ai)
 * Full API spec: https://rag-prod.studio.lyzr.ai/docs
 *
 * CRITICAL API SPECIFICATIONS:
 *
 * 1. POST /api/rag (JSON body { ragId })  →  GET /v3/rag/documents/{rag_id}/
 *    - Content-Type: application/json
 *    - Lists documents in a knowledge base
 *    - Headers: x-api-key
 *
 * 2. POST /api/rag (formData with file)  →  POST /v3/train/{fileType}/?rag_id={id}
 *    - Content-Type: multipart/form-data
 *    - rag_id in QUERY parameter
 *    - fileType (pdf|docx|txt) in URL PATH
 *    - Body: multipart/form-data (file + parser params)
 *    - Headers: x-api-key
 *
 * 3. DELETE /api/rag (with JSON)  →  DELETE /v3/rag/{rag_id}/docs/
 *    - rag_id in URL PATH
 *    - Body: JSON array of filenames
 *    - Headers: x-api-key, Content-Type: application/json
 *
 * NEVER expose LYZR_API_KEY to client — always proxy through this route.
 */

import { NextRequest, NextResponse } from "next/server";

const LYZR_RAG_BASE_URL = `${process.env.LYZR_RAG_BASE_URL || "https://rag-prod.studio.lyzr.ai"}/v3`;
const LYZR_API_KEY = process.env.LYZR_API_KEY || "";

const FILE_TYPE_MAP: Record<string, "pdf" | "docx" | "txt"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

// POST - List documents (JSON body) or Upload and train (formData)
export async function POST(request: NextRequest) {
  try {
    if (!LYZR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "LYZR_API_KEY not configured on server",
        },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // List documents flow (was GET)
      let body;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body" },
          { status: 400 }
        );
      }
      const { ragId } = body;

      if (!ragId) {
        return NextResponse.json(
          {
            success: false,
            error: "ragId is required",
          },
          { status: 400 }
        );
      }

      let response;
      try {
        response = await fetch(
          `${LYZR_RAG_BASE_URL}/rag/documents/${encodeURIComponent(ragId)}/`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              "x-api-key": LYZR_API_KEY,
            },
          }
        );
      } catch (fetchError) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to connect to RAG service",
            documents: [],
          },
          { status: 200 }
        );
      }

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch {
          // RAG API returned non-JSON (empty or HTML) — treat as empty
          return NextResponse.json({
            success: true,
            documents: [],
            ragId,
            timestamp: new Date().toISOString(),
          });
        }
        // Response may be:
        // - Array of strings: ["storage/voicestream-dev-guide.pdf"]
        // - Array of objects: [{ file_name: "doc.pdf", ... }]
        // - Object with documents/data key
        const rawItems = Array.isArray(data)
          ? data
          : data.documents || data.data || [];

        const documents = rawItems.map((item: unknown) => {
          let fileName: string;

          if (typeof item === "string") {
            fileName = item.split("/").pop() || item;
          } else if (item && typeof item === "object") {
            const obj = item as Record<string, unknown>;
            fileName = String(
              obj.file_name || obj.fileName || obj.name || obj.filename || obj.path || "unknown"
            );
            if (fileName.includes("/")) {
              fileName = fileName.split("/").pop() || fileName;
            }
          } else {
            fileName = String(item);
          }

          const ext = fileName.split(".").pop()?.toLowerCase() || "";
          const fileType =
            ext === "pdf"
              ? "pdf"
              : ext === "docx"
                ? "docx"
                : ext === "txt"
                  ? "txt"
                  : "unknown";

          return {
            fileName,
            fileType,
            status: "active",
          };
        });

        return NextResponse.json({
          success: true,
          documents,
          ragId,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Non-OK response — return gracefully with empty docs instead of 500
        let errorText = "";
        try {
          errorText = await response.text();
        } catch {
          errorText = "Unable to read error response";
        }
        // For 404 (no documents yet), return empty list instead of error
        if (response.status === 404) {
          return NextResponse.json({
            success: true,
            documents: [],
            ragId,
            timestamp: new Date().toISOString(),
          });
        }
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get documents: ${response.status}`,
            details: errorText,
          },
          { status: response.status }
        );
      }
    } else {
      // Upload flow (formData)
      const formData = await request.formData();
      const ragId = formData.get("ragId") as string;
      const file = formData.get("file") as File;

      if (!ragId || !file) {
        return NextResponse.json(
          {
            success: false,
            error: "ragId and file are required",
          },
          { status: 400 }
        );
      }

      const fileType = FILE_TYPE_MAP[file.type];
      if (!fileType) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type: ${file.type}. Supported: PDF, DOCX, TXT`,
          },
          { status: 400 }
        );
      }

      // Direct upload and train in one step
      const trainFormData = new FormData();
      trainFormData.append("file", file, file.name);
      trainFormData.append("data_parser", "llmsherpa");
      trainFormData.append("chunk_size", "1000");
      trainFormData.append("chunk_overlap", "100");
      trainFormData.append("extra_info", "{}");

      let trainResponse;
      try {
        trainResponse = await fetch(
          `${LYZR_RAG_BASE_URL}/train/${fileType}/?rag_id=${encodeURIComponent(
            ragId
          )}`,
          {
            method: "POST",
            headers: {
              "x-api-key": LYZR_API_KEY,
              accept: "application/json",
            },
            body: trainFormData,
          }
        );
      } catch {
        return NextResponse.json(
          { success: false, error: "Failed to connect to RAG training service" },
          { status: 502 }
        );
      }

      if (!trainResponse.ok) {
        let errorText = "";
        try { errorText = await trainResponse.text(); } catch { /* ignore */ }
        return NextResponse.json(
          {
            success: false,
            error: `Failed to train document: ${trainResponse.status}`,
            details: errorText,
          },
          { status: trainResponse.status }
        );
      }

      let trainData;
      try {
        trainData = await trainResponse.json();
      } catch {
        trainData = {};
      }

      return NextResponse.json({
        success: true,
        message: "Document uploaded and trained successfully",
        fileName: file.name,
        fileType,
        documentCount: trainData.document_count || trainData.chunks || 1,
        ragId,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Crawl a website and add content to knowledge base
export async function PATCH(request: NextRequest) {
  try {
    if (!LYZR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "LYZR_API_KEY not configured on server",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ragId, url } = body;

    if (!ragId || !url) {
      return NextResponse.json(
        {
          success: false,
          error: "ragId and url are required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.beta.architect.new/api/v1/rag/crawl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY,
      },
      body: JSON.stringify({ url, rag_id: ragId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Failed to crawl website: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Website crawl started successfully. Content will be available shortly.",
      url,
      ragId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove documents from knowledge base
export async function DELETE(request: NextRequest) {
  try {
    if (!LYZR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "LYZR_API_KEY not configured on server",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ragId, documentNames } = body;

    if (!ragId || !documentNames || !Array.isArray(documentNames)) {
      return NextResponse.json(
        {
          success: false,
          error: "ragId and documentNames array are required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${LYZR_RAG_BASE_URL}/rag/${encodeURIComponent(ragId)}/docs/`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": LYZR_API_KEY,
        },
        body: JSON.stringify(documentNames),
      }
    );

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Documents deleted successfully",
        deletedCount: documentNames.length,
        ragId,
        timestamp: new Date().toISOString(),
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete documents: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
