'use client'

import { useState } from 'react'

const projects = [
  {
    id: 'rag-qa-system',
    title: 'RAG Q&A System',
    week: 3,
    description: 'Build document search with Claude and vector databases',
    tags: ['Anthropic', 'Pinecone', 'LangChain'],
    outcome: 'Target 90%+ accuracy with production RAG',
    milestone: 'Master basic retrieval using Pinecone and LangChain',
    architecture: `User UI (Next.js)
       ↓
  API Route ──→ Claude AI
       ↓
  Embeddings ──→ Vector DB
    Service      (Pinecone)`,
    techStack: {
      frontend: 'Next.js 14, React, Tailwind CSS, Radix UI',
      backend: 'Next.js API Routes, TypeScript',
      ai: 'Anthropic Claude 3.5, LangChain, tiktoken',
      storage: 'Pinecone (or Supabase pgvector)',
      deployment: 'Vercel, environment variables'
    },
    implementation: [
      'Document Processing - Parse PDFs/docs, chunk into 500-token segments',
      'Generate Embeddings - Use Voyage AI to create vector embeddings',
      'Store Vectors - Index in Pinecone with metadata',
      'Query Pipeline - User question → embed → similarity search → context',
      'Generate Answer - Send context + question to Claude',
      'Stream Response - Real-time streaming UI with citations'
    ],
    codeSnippet: `// RAG retrieval pipeline
const context = await vectorStore.similaritySearch(question, 5);
const prompt = \`Context: \${context}\\n\\nQuestion: \${question}\`;

const stream = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: prompt }],
  stream: true,
});`
  },
  {
    id: 'chatbot-platform',
    title: 'AI Chatbot with Tools',
    week: 4,
    description: 'Function calling, API integrations, and real-time responses',
    tags: ['Claude', 'Function Calling', 'Next.js'],
    outcome: 'Interactive live data with function calling',
    milestone: 'Transition from chat to Function Calling with Next.js integration',
    architecture: `User ↔ Chat UI ↔ Claude (Function Calling)
                       ↕
                  Tool Registry ↔ External APIs`,
    techStack: {
      frontend: 'Next.js, WebSockets for real-time',
      backend: 'Next.js API Routes, TypeScript',
      ai: 'Claude 3.5 with tool use (function calling)',
      storage: 'Vercel KV (Redis) for conversation history',
      apis: 'Weather API, Calculator, Database queries'
    },
    implementation: [
      'Define tool schemas (weather, calculator, search)',
      'Implement tool execution handlers',
      'Set up streaming chat with tool calls',
      'Handle multi-turn tool use conversations',
      'Add conversation memory and context',
      'Build real-time UI with loading states'
    ],
    codeSnippet: `const tools = [{
  name: "get_weather",
  description: "Get weather for location",
  input_schema: { type: "object", properties: {...} }
}];

const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  tools,
  messages: conversationHistory
});`
  },
  {
    id: 'agent-workflow',
    title: 'Agent Workflow System',
    week: 5,
    description: 'Multi-step autonomous agents that reason and act',
    tags: ['Agents', 'LangGraph', 'TypeScript'],
    outcome: 'Autonomous task completion',
    milestone: 'Build multi-step autonomous agents with LangGraph',
    architecture: `Task Input → Planner Agent → [Worker Agents]
                         ↓
                  LangGraph State Machine
                         ↓
                  Executor → Result`,
    techStack: {
      framework: 'LangGraph for agent orchestration',
      ai: 'Claude 3.5 for reasoning and planning',
      storage: 'PostgreSQL for workflow persistence',
      monitoring: 'LangSmith for observability',
      deployment: 'Docker containers, Railway'
    },
    implementation: [
      'Design agent graph (nodes = agents, edges = transitions)',
      'Implement planner agent (breaks down tasks)',
      'Create specialized worker agents (research, code, write)',
      'Add state checkpointing for reliability',
      'Build human-in-the-loop approval gates',
      'Monitor agent decisions and costs'
    ],
    codeSnippet: `const graph = new StateGraph({
  channels: { messages: [], plan: null }
});

graph.addNode("planner", plannerAgent);
graph.addNode("executor", executorAgent);
graph.addConditionalEdges("planner", shouldContinue);

const workflow = graph.compile();`
  },
  {
    id: 'ai-code-reviewer',
    title: 'Fine-tuned Model',
    week: 10,
    description: 'Custom AI trained for your specific domain and use case',
    tags: ['Fine-tuning', 'Anthropic', 'Datasets'],
    outcome: 'Domain-specific AI performance',
    milestone: 'Domain-specific training for high-performance use cases',
    architecture: `Training Data → Preprocessing → Fine-tuning API
                                          ↓
                                    Custom Model
                                          ↓
                                     Deployment`,
    techStack: {
      platform: 'Anthropic fine-tuning API',
      data: 'JSONL format training examples',
      eval: 'Custom evaluation metrics',
      deployment: 'Model ID in production API calls',
      monitoring: 'Track performance vs base model'
    },
    implementation: [
      'Collect domain-specific training data (1000+ examples)',
      'Format as prompt-completion pairs in JSONL',
      'Upload dataset to Anthropic platform',
      'Monitor fine-tuning job progress',
      'Evaluate model performance vs base model',
      'Deploy with model version pinning'
    ],
    codeSnippet: `// Fine-tuning job creation
const job = await anthropic.fineTuning.create({
  training_file: "file-abc123",
  model: "claude-3-5-sonnet-20241022",
  hyperparameters: { n_epochs: 3 }
});

// Use fine-tuned model
const response = await anthropic.messages.create({
  model: job.fine_tuned_model,
  ...
});`
  },
  {
    id: 'content-generator',
    title: 'AI API Product',
    week: 7,
    description: 'Ship production API with auth, rate limiting, and monitoring',
    tags: ['API', 'Auth', 'Monitoring'],
    outcome: 'HIPAA/SOC2 compliance with 99.97% uptime',
    milestone: 'Master Auth, Rate Limiting, and Monitoring as a service',
    architecture: `Client → API Gateway → Rate Limiter
                         ↓
                    Auth → Claude API
                         ↓
              Analytics + Redis Cache`,
    techStack: {
      framework: 'Next.js API Routes, tRPC',
      auth: 'NextAuth.js with JWT tokens',
      rateLimit: 'Upstash Redis',
      monitoring: 'Vercel Analytics, Sentry',
      docs: 'OpenAPI/Swagger auto-generated'
    },
    implementation: [
      'Set up API authentication (API keys + OAuth)',
      'Implement rate limiting (tier-based quotas)',
      'Add request caching for repeated queries',
      'Build usage tracking and analytics dashboard',
      'Create developer documentation portal',
      'Deploy with CI/CD and monitoring'
    ],
    codeSnippet: `// Rate-limited API endpoint
export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');

  // Check rate limit
  const limit = await redis.get(\`rate:\${apiKey}\`);
  if (limit > 100) throw new Error('Rate limit exceeded');

  // Track usage
  await db.usage.create({ apiKey, tokens: response.usage });
}`
  },
  {
    id: 'data-analyst',
    title: 'Multi-Agent Collaboration',
    week: 11,
    description: 'Coordinated AI workflows with specialized agents',
    tags: ['Multi-Agent', 'Orchestration', 'Python'],
    outcome: 'Complex task automation',
    milestone: 'Coordinated workflows with specialized agents (Researcher + Writer)',
    architecture: `Coordinator Agent
         ↓
[Researcher] → [Analyst] → [Writer] → [Reviewer]
         ↓
Shared Memory Store`,
    techStack: {
      orchestration: 'LangGraph with custom nodes',
      memory: 'Pinecone (long-term) + Redis (short-term)',
      ai: 'Multiple Claude instances with different prompts',
      communication: 'Message passing via queues',
      monitoring: 'Agent decision tracking'
    },
    implementation: [
      'Define agent roles and capabilities',
      'Build coordinator for task delegation',
      'Implement shared memory system',
      'Create inter-agent communication protocol',
      'Add conflict resolution mechanisms',
      'Build consensus and voting systems'
    ],
    codeSnippet: `// Multi-agent coordination
const agents = {
  researcher: new Agent({ role: "research" }),
  analyst: new Agent({ role: "analyze" }),
  writer: new Agent({ role: "write" })
};

const result = await coordinator.run({
  task: "Create market analysis report",
  agents,
  sharedMemory
});`
  },
]

function getEmojiForProject(projectId: string): string {
  const emojiMap: Record<string, string> = {
    'rag-qa-system': '🚀',
    'chatbot-platform': '💬',
    'agent-workflow': '🤖',
    'ai-code-reviewer': '🔍',
    'content-generator': '✨',
    'data-analyst': '📊',
  }
  return emojiMap[projectId] || '🎯'
}

function getWeekColor(weekNumber: number): { bg: string; gradient: string } {
  const colorMap: Record<number, { bg: string; gradient: string }> = {
    1: { bg: 'bg-purple-600', gradient: 'from-purple-600 to-pink-600' },
    2: { bg: 'bg-green-600', gradient: 'from-green-600 to-emerald-600' },
    3: { bg: 'bg-blue-600', gradient: 'from-blue-600 to-sky-600' },
    4: { bg: 'bg-orange-600', gradient: 'from-orange-600 to-amber-600' },
    5: { bg: 'bg-indigo-600', gradient: 'from-indigo-600 to-blue-600' },
    6: { bg: 'bg-teal-600', gradient: 'from-teal-600 to-cyan-600' },
    7: { bg: 'bg-amber-600', gradient: 'from-amber-600 to-yellow-600' },
    8: { bg: 'bg-pink-600', gradient: 'from-pink-600 to-rose-600' },
    9: { bg: 'bg-red-600', gradient: 'from-red-600 to-orange-600' },
    10: { bg: 'bg-sky-600', gradient: 'from-sky-600 to-blue-600' },
    11: { bg: 'bg-emerald-600', gradient: 'from-emerald-600 to-green-600' },
    12: { bg: 'bg-slate-600', gradient: 'from-slate-600 to-gray-600' },
  }
  return colorMap[weekNumber] || { bg: 'bg-purple-600', gradient: 'from-purple-600 to-cyan-500' }
}

export function ProjectShowcase() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="py-12 bg-white" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Milestone Projects:{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Your Proof of Mastery
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These aren't tutorial projects. They're production-grade systems that validate your skills and get you hired at the architect level.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: typeof projects[0]
  isExpanded: boolean
  onToggle: () => void
}

function ProjectCard({ project, isExpanded, onToggle }: ProjectCardProps) {
  const weekColors = getWeekColor(project.week)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Content */}
      <div className="p-8">
        {/* Icon and Week Badge - aligned at top */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${weekColors.gradient} flex items-center justify-center`}>
            <span className="text-3xl">{getEmojiForProject(project.id)}</span>
          </div>
          <span className={`px-3 py-1 bg-gradient-to-r ${weekColors.gradient} text-white text-xs font-bold rounded-full whitespace-nowrap`}>
            Week {project.week}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 mb-3">
          {project.description}
        </p>

        {/* Milestone */}
        <p className="text-sm text-gray-500 italic mb-6">
          {project.milestone}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Outcome with checkmark */}
        <div className="flex items-center text-base font-medium text-purple-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {project.outcome}
        </div>

        {/* Learn more link - similar to Command Center style */}
        <button
          onClick={onToggle}
          className="text-base font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2 transition-colors group"
        >
          {isExpanded ? 'Show less' : 'Learn more'}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Architecture */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Architecture
              </h4>
              <pre className="text-xs bg-gray-50 p-3 rounded-lg font-mono text-gray-700 overflow-x-auto whitespace-pre">
                {project.architecture}
              </pre>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Tech Stack
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                {Object.entries(project.techStack).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold capitalize">{key}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Implementation Steps
              </h4>
              <ol className="space-y-2 text-xs text-gray-700 list-decimal list-inside">
                {project.implementation.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Code Snippet */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code Example
              </h4>
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{project.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
