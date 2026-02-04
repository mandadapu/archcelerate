import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, FileText, Code } from 'lucide-react'

export interface Citation {
  id: number
  title: string
  type: string
  weekNumber: number | null
  heading: string | null
  isUserContent: boolean
  author?: {
    name: string | null
    email: string | null
  }
  similarity: number
}

interface CitationsProps {
  citations: Citation[]
}

export function Citations({ citations }: CitationsProps) {
  if (!citations || citations.length === 0) {
    return null
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <BookOpen className="h-4 w-4" />
        <span>Sources</span>
      </div>
      <div className="space-y-2">
        {citations.map((citation) => (
          <Card
            key={citation.id}
            className="border-slate-200 hover:border-blue-300 transition-colors"
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {/* Citation Number */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                  {citation.id}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title and Type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {citation.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      {citation.isUserContent ? (
                        <>
                          <User className="h-3 w-3" />
                          User Note
                        </>
                      ) : citation.type === 'code-example' ? (
                        <>
                          <Code className="h-3 w-3" />
                          Code
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3" />
                          {citation.type}
                        </>
                      )}
                    </Badge>
                    {citation.weekNumber && (
                      <Badge variant="secondary" className="text-xs">
                        Week {citation.weekNumber}
                      </Badge>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                    {citation.heading && (
                      <span className="truncate">{citation.heading}</span>
                    )}
                    {citation.isUserContent && citation.author?.name && (
                      <>
                        {citation.heading && <span>•</span>}
                        <span className="truncate">by {citation.author.name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-blue-600">
                      {Math.round(citation.similarity * 100)}% relevant
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
