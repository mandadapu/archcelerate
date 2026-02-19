// app/api/documents/upload/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { processDocument } from '@/lib/rag/document-processor'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = await createClient()

  try {

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Unsupported file type', allowedTypes },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const filePath = `${session.user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: session.user.id,
        filename: file.name,
        file_path: publicUrl,
        file_size: file.size,
        file_type: file.type,
        status: 'pending'
      })
      .select()
      .single()

    if (docError) throw docError

    // Process document asynchronously (in production, use a queue)
    processDocument(document.id, publicUrl, file.type)
      .catch(error => console.error('Background processing error:', error))

    return Response.json({
      documentId: document.id,
      filename: file.name,
      status: 'processing',
      message: 'Document uploaded successfully and is being processed'
    })

  } catch (error: any) {
    console.error('Document upload error:', error)
    return Response.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    )
  }
}
