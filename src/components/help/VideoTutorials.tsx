import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play } from 'lucide-react'

const tutorials = [
  {
    id: '1',
    title: 'Platform Overview (5 min)',
    description: 'Quick tour of the platform and key features',
    thumbnail: '/images/tutorials/platform-overview.jpg',
    duration: '5:23',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '2',
    title: 'Your First AI Application (15 min)',
    description: 'Build a simple chatbot from scratch',
    thumbnail: '/images/tutorials/first-app.jpg',
    duration: '15:42',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '3',
    title: 'Understanding RAG Systems (20 min)',
    description: 'Deep dive into Retrieval Augmented Generation',
    thumbnail: '/images/tutorials/rag-deep-dive.jpg',
    duration: '20:15',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '4',
    title: 'Building AI Agents (25 min)',
    description: 'Create autonomous agents with tool use',
    thumbnail: '/images/tutorials/ai-agents.jpg',
    duration: '25:30',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '5',
    title: 'Memory Systems Explained (18 min)',
    description: 'Implement episodic and semantic memory',
    thumbnail: '/images/tutorials/memory-systems.jpg',
    duration: '18:45',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '6',
    title: 'Production Deployment (30 min)',
    description: 'Deploy your AI app to production',
    thumbnail: '/images/tutorials/deployment.jpg',
    duration: '30:12',
    videoUrl: 'https://youtube.com/...',
  },
]

export function VideoTutorials() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials.map((tutorial) => (
        <Card key={tutorial.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden rounded-t-lg bg-slate-200 h-48">
              {/* Placeholder for thumbnail - replace with actual images */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-slate-400 text-sm">Tutorial Video</div>
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-8 w-8 text-purple-600 ml-1" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {tutorial.duration}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <CardTitle className="text-lg mb-2 group-hover:text-purple-600 transition-colors">
              {tutorial.title}
            </CardTitle>
            <CardDescription>{tutorial.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
