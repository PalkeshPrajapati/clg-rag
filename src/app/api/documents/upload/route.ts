import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { chunkText } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/gemini';
import { Category } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawText = formData.get('text') as string | null;
    const title = (formData.get('title') as string) || 'Untitled Document';
    const category = (formData.get('category') as Category) || 'General';
    const department = (formData.get('department') as string) || 'All';

    let contentToProcess = '';
    let fileType = 'text/plain';

    if (file) {
      fileType = file.type || file.name.split('.').pop() || 'unknown';
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith('.pdf')) {
        try {
          // Dynamic import of pdf-parse to handle serverless node environment
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(fileBuffer);
          contentToProcess = pdfData.text;
        } catch (pdfErr) {
          console.warn('PDF parsing fallback to raw text string:', pdfErr);
          contentToProcess = fileBuffer.toString('utf-8');
        }
      } else if (file.name.endsWith('.docx')) {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          contentToProcess = result.value;
        } catch (docxErr) {
          console.warn('DOCX parsing fallback:', docxErr);
          contentToProcess = fileBuffer.toString('utf-8');
        }
      } else {
        contentToProcess = fileBuffer.toString('utf-8');
      }
    } else if (rawText) {
      contentToProcess = rawText;
    } else {
      return NextResponse.json({ error: 'Either a file or text content is required' }, { status: 400 });
    }

    if (!contentToProcess.trim()) {
      return NextResponse.json({ error: 'Extracted content is empty' }, { status: 400 });
    }

    // 1. Chunk document text
    const chunks = chunkText(contentToProcess, { chunkSize: 600, chunkOverlap: 120 });

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Could not create valid chunks from document text' }, { status: 400 });
    }

    // 2. Generate vector embeddings for chunks via Gemini API
    const embeddings = await generateEmbeddingsBatch(chunks);

    // 3. Store document metadata and chunks into Supabase
    const supabase = getSupabaseAdmin();

    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        category,
        department,
        file_type: fileType,
        chunk_count: chunks.length,
      })
      .select('id')
      .single();

    if (docError) {
      console.error('Error inserting document record into Supabase:', docError);
      return NextResponse.json({ error: `Supabase DB Error: ${docError.message}` }, { status: 500 });
    }

    const documentId = docRecord.id;

    // 4. Batch insert chunks with vector embeddings
    const chunkRows = chunks.map((chunkContent, index) => ({
      document_id: documentId,
      content: chunkContent,
      chunk_index: index,
      metadata: {
        title,
        category,
        department,
        chunk_index: index,
      },
      embedding: embeddings[index],
    }));

    const { error: chunksError } = await supabase.from('document_chunks').insert(chunkRows);

    if (chunksError) {
      console.error('Error inserting document chunks:', chunksError);
      return NextResponse.json({ error: `Supabase Chunks Insert Error: ${chunksError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      documentId,
      title,
      chunkCount: chunks.length,
      message: `Successfully indexed "${title}" with ${chunks.length} vector chunks.`,
    });
  } catch (error: any) {
    console.error('Error in document upload route:', error);
    return NextResponse.json({ error: error.message || 'Server error during document upload' }, { status: 500 });
  }
}
