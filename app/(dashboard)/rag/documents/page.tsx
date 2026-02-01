import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentList } from '@/components/rag/document-list'
import { DocumentUpload } from '@/components/rag/document-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Documents | AI Architect Accelerator',
  description: 'Manage your uploaded documents',
}

export default async function DocumentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Document Management</h1>
          <p className="text-muted-foreground mt-2">Upload and manage your knowledge base documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>PDF, DOCX, TXT, or MD files (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload onUploadComplete={() => window.location.reload()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>View and manage all uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
