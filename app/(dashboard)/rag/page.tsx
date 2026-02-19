import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DocumentUpload } from '@/components/rag/document-upload'
import { QAInterface } from '@/components/rag/qa-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Document Q&A | AI Architect Accelerator',
  description: 'Ask questions about your documents with AI-powered search',
}

export default async function RAGPage() {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Document Q&A</h1>
          <p className="text-muted-foreground mt-2">
            Upload documents and ask questions with AI-powered semantic search
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Add PDFs, Word documents, or text files to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ask Questions</CardTitle>
            <CardDescription>
              Search across all your documents with natural language. Memory context is automatically
              included.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QAInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
