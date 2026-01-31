import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: {
    file: string
    line?: number
    severity: 'error' | 'warning' | 'suggestion' | 'praise'
    category: string
    issue: string
    recommendation: string
    why: string
  }
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const severityConfig = {
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    suggestion: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
    },
    praise: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-800',
    },
  }

  const config = severityConfig[suggestion.severity]
  const Icon = config.icon

  return (
    <Card className={`${config.bg} ${config.border}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${config.text} mt-0.5`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded ${config.badge}`}>
                {suggestion.category}
              </span>
              <span className="text-xs text-slate-600">
                {suggestion.file}
                {suggestion.line && `:${suggestion.line}`}
              </span>
            </div>

            <p className={`font-medium ${config.text}`}>
              {suggestion.issue}
            </p>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Recommendation: </span>
                <span className="text-slate-700">{suggestion.recommendation}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Why: </span>
                <span className="text-slate-600">{suggestion.why}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
