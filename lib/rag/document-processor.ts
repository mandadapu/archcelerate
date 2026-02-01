// lib/rag/document-processor.ts
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { createClient } from '@/lib/supabase/server'
import { FixedSizeChunking, SentenceChunking, SemanticChunking } from './chunking'
import { generateEmbeddings } from './embeddings'

export async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  const supabase = createClient()

  try {
    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // Extract text based on file type
    const text = await extractText(filePath, fileType)

    // Chunk the text (using semantic chunking by default)
    const chunker = new SemanticChunking(1000)
    const chunks = chunker.chunk(text)

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks.map(c => c.content))

    // Insert chunks into database
    const chunkRecords = chunks.map((chunk, i) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[i]), // pgvector accepts array
      token_count: chunk.tokens,
      metadata: chunk.metadata || {}
    }))

    await supabase
      .from('document_chunks')
      .insert(chunkRecords)

    // Update document status
    await supabase
      .from('documents')
      .update({
        status: 'completed',
        total_chunks: chunks.length,
        content_preview: text.substring(0, 500)
      })
      .eq('id', documentId)

  } catch (error: any) {
    console.error('Document processing error:', error)

    await supabase
      .from('documents')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', documentId)

    throw error
  }
}

async function extractText(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const buffer = await fetch(filePath).then(r => r.arrayBuffer())
    const data = await pdf(Buffer.from(buffer))
    return data.text
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const buffer = await fetch(filePath).then(r => r.arrayBuffer())
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value
  }

  if (fileType === 'text/plain' || fileType === 'text/markdown') {
    const response = await fetch(filePath)
    return await response.text()
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}
