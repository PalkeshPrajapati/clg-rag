import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/rag/gemini';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Citation } from '@/lib/types';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { messages, category, department } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1];
    const userQuery = latestMessage.content;

    // 1. Generate embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery);

    // 2. Query Supabase pgvector using match_documents RPC function
    const supabase = getSupabaseAdmin();
    const { data: matchedChunks, error: rpcError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.15, // lower threshold to ensure relevant chunks are retrieved
      match_count: 5,
      filter_category: category || 'All',
      filter_department: department || 'All',
    });

    let contextText = '';
    const citations: Citation[] = [];

    if (rpcError) {
      console.warn('Supabase match_documents RPC error or unconfigured:', rpcError.message);
    } else if (matchedChunks && matchedChunks.length > 0) {
      contextText = matchedChunks
        .map((chunk: { content: string; document_title: string; category: string; department: string }, index: number) => {
          return `[Source ${index + 1}: "${chunk.document_title}" (${chunk.category} - ${chunk.department})]\n${chunk.content}`;
        })
        .join('\n\n---\n\n');

      matchedChunks.forEach((chunk: { id: string; document_id: string; document_title: string; category: any; department: any; content: string; similarity: number }) => {
        citations.push({
          documentId: chunk.document_id,
          documentTitle: chunk.document_title || 'College Document',
          category: chunk.category || 'General',
          department: chunk.department || 'All',
          contentSnippet: chunk.content.slice(0, 180) + '...',
          similarityScore: Math.round((chunk.similarity || 0.8) * 100),
        });
      });
    }

    // Direct table fallback if vector similarity matching returned 0 results
    if (!contextText) {
      const { data: directChunks, error: directErr } = await supabase
        .from('document_chunks')
        .select('id, document_id, content, metadata, documents(title, category, department)')
        .limit(5);

      if (!directErr && directChunks && directChunks.length > 0) {
        contextText = directChunks
          .map((chunk: any, index: number) => {
            const docInfo = Array.isArray(chunk.documents) ? chunk.documents[0] : chunk.documents;
            const docTitle = docInfo?.title || chunk.metadata?.title || 'College Notice';
            const docCat = docInfo?.category || chunk.metadata?.category || 'General';
            const docDept = docInfo?.department || chunk.metadata?.department || 'All';
            return `[Source ${index + 1}: "${docTitle}" (${docCat} - ${docDept})]\n${chunk.content}`;
          })
          .join('\n\n---\n\n');

        directChunks.forEach((chunk: any) => {
          const docInfo = Array.isArray(chunk.documents) ? chunk.documents[0] : chunk.documents;
          citations.push({
            documentId: chunk.document_id,
            documentTitle: docInfo?.title || chunk.metadata?.title || 'College Document',
            category: docInfo?.category || chunk.metadata?.category || 'General',
            department: docInfo?.department || chunk.metadata?.department || 'All',
            contentSnippet: chunk.content.slice(0, 180) + '...',
            similarityScore: 85,
          });
        });
      }
    }

    // 3. Fallback context if vector store is empty / initial setup
    if (!contextText) {
      contextText = 'No specific documents matched in the knowledge base. Answer based on general academic standards and instruct the student to verify with the administration or upload official documents if needed.';
    }

    // 4. Construct Gemini Prompt
    const systemPrompt = `You are "CampusBrain AI", the official intelligent assistant for college students and staff.
Your job is to answer the student's question accurately using ONLY the provided official college context documents below.

STRICT GUIDELINES:
1. Ground your answer in the provided context documents whenever possible.
2. If context documents are available, cite the source title in your response using bold brackets like **[Syllabus 2026]** or **[Exam Guidelines]**.
3. If the context does not contain enough information to give a 100% verified answer, state clearly what is missing and advise them to consult their department head.
4. Format your response cleanly using markdown (bullet points, clear headings, bold text for key dates/requirements).

OFFICIAL COLLEGE CONTEXT DOCUMENTS:
${contextText}

STUDENT QUESTION:
${userQuery}
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'placeholder-gemini-key') {
      // Mock streaming response for development when API key is missing
      const mockStream = new ReadableStream({
        async start(controller) {
          const textEncoder = new TextEncoder();
          const sampleReply = `Hello! I am CampusBrain AI. Based on the college knowledge base:\n\n` +
            (citations.length > 0
              ? `I found **${citations.length} relevant document(s)** for your query!\n\n${citations.map(c => `- **${c.documentTitle}** (${c.category}): ${c.contentSnippet}`).join('\n')}`
              : `Currently, no official documents matching "${userQuery}" have been uploaded yet. Please ask an Admin to upload the official circular or syllabus in the Admin Ingestion tab.`);

          controller.enqueue(textEncoder.encode(JSON.stringify({ text: sampleReply, citations })));
          controller.close();
        },
      });

      return new NextResponse(mockStream, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: systemPrompt,
    });

    const aiText = response.text || 'Unable to generate response from Gemini API.';

    return NextResponse.json({
      text: aiText,
      citations,
    });
  } catch (error: any) {
    console.error('Error in RAG chat route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing chat request' },
      { status: 500 }
    );
  }
}
