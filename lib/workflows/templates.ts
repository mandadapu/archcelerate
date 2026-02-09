// lib/workflows/templates.ts
import {
  WorkflowDefinition,
  DEFAULT_LLM_CALL,
  DEFAULT_WEB_SEARCH,
  DEFAULT_RAG_QUERY,
  DEFAULT_CONDITIONAL,
  DEFAULT_OUTPUT,
  DEFAULT_INPUT,
} from './types'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  definition: WorkflowDefinition
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // Template 1: Research Summarizer
  {
    id: 'tpl-research-summarizer',
    name: 'Research Summarizer',
    description:
      'Search the web for a topic and get an AI-generated summary. A simple linear pipeline.',
    definition: {
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 250, y: 0 },
          data: { ...DEFAULT_INPUT, description: 'Enter a research topic' },
        },
        {
          id: 'web-search-1',
          type: 'web_search',
          position: { x: 250, y: 150 },
          data: {
            ...DEFAULT_WEB_SEARCH,
            label: 'Search Web',
            queryTemplate: '{{input}}',
            maxResults: 5,
          },
        },
        {
          id: 'llm-1',
          type: 'llm_call',
          position: { x: 250, y: 300 },
          data: {
            ...DEFAULT_LLM_CALL,
            label: 'Summarize Results',
            systemPrompt:
              'You are a research assistant. Summarize the search results into a clear, well-organized brief.',
            userPromptTemplate:
              'Summarize the following search results into a concise research brief:\n\n{{input}}',
          },
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 250, y: 450 },
          data: { ...DEFAULT_OUTPUT, label: 'Summary' },
        },
      ],
      edges: [
        { id: 'e1', source: 'input-1', target: 'web-search-1' },
        { id: 'e2', source: 'web-search-1', target: 'llm-1' },
        { id: 'e3', source: 'llm-1', target: 'output-1' },
      ],
    },
  },

  // Template 2: Document Q&A with Fallback
  {
    id: 'tpl-doc-qa-fallback',
    name: 'Document Q&A with Fallback',
    description:
      'Search your documents first. If no results are found, fall back to web search. Demonstrates conditional branching.',
    definition: {
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 300, y: 0 },
          data: { ...DEFAULT_INPUT, description: 'Ask a question about your documents' },
        },
        {
          id: 'rag-1',
          type: 'rag_query',
          position: { x: 300, y: 150 },
          data: {
            ...DEFAULT_RAG_QUERY,
            label: 'Search Documents',
            queryTemplate: '{{input}}',
            topK: 5,
            minRelevance: 0.6,
          },
        },
        {
          id: 'cond-1',
          type: 'conditional',
          position: { x: 300, y: 300 },
          data: {
            ...DEFAULT_CONDITIONAL,
            label: 'Has Results?',
            conditionType: 'not_contains',
            conditionValue: 'No relevant documents found',
          },
        },
        {
          id: 'llm-doc',
          type: 'llm_call',
          position: { x: 100, y: 450 },
          data: {
            ...DEFAULT_LLM_CALL,
            label: 'Answer from Docs',
            systemPrompt: 'Answer the question using only the provided document context.',
            userPromptTemplate:
              'Context:\n{{input}}\n\nAnswer the original question based on this context.',
          },
        },
        {
          id: 'web-fallback',
          type: 'web_search',
          position: { x: 500, y: 450 },
          data: {
            ...DEFAULT_WEB_SEARCH,
            label: 'Web Fallback',
            queryTemplate: '{{input}}',
            maxResults: 3,
          },
        },
        {
          id: 'llm-web',
          type: 'llm_call',
          position: { x: 500, y: 600 },
          data: {
            ...DEFAULT_LLM_CALL,
            label: 'Answer from Web',
            systemPrompt: 'Answer the question using the web search results provided.',
            userPromptTemplate:
              'Web results:\n{{input}}\n\nAnswer the question based on these results.',
          },
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 100, y: 600 },
          data: { ...DEFAULT_OUTPUT, label: 'Answer' },
        },
        {
          id: 'output-2',
          type: 'output',
          position: { x: 500, y: 750 },
          data: { ...DEFAULT_OUTPUT, label: 'Web Answer' },
        },
      ],
      edges: [
        { id: 'e1', source: 'input-1', target: 'rag-1' },
        { id: 'e2', source: 'rag-1', target: 'cond-1' },
        { id: 'e3', source: 'cond-1', target: 'llm-doc', sourceHandle: 'true' },
        { id: 'e4', source: 'cond-1', target: 'web-fallback', sourceHandle: 'false' },
        { id: 'e5', source: 'llm-doc', target: 'output-1' },
        { id: 'e6', source: 'web-fallback', target: 'llm-web' },
        { id: 'e7', source: 'llm-web', target: 'output-2' },
      ],
    },
  },

  // Template 3: Content Review Pipeline
  {
    id: 'tpl-content-review',
    name: 'Content Review Pipeline',
    description:
      'Analyze content sentiment, then route positive and negative content to different handlers.',
    definition: {
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 300, y: 0 },
          data: { ...DEFAULT_INPUT, description: 'Paste content to review' },
        },
        {
          id: 'llm-sentiment',
          type: 'llm_call',
          position: { x: 300, y: 150 },
          data: {
            ...DEFAULT_LLM_CALL,
            label: 'Analyze Sentiment',
            systemPrompt:
              'Analyze the sentiment of the following text. Respond with ONLY one word: "positive", "negative", or "neutral".',
            userPromptTemplate: '{{input}}',
            maxTokens: 10,
          },
        },
        {
          id: 'cond-1',
          type: 'conditional',
          position: { x: 300, y: 300 },
          data: {
            ...DEFAULT_CONDITIONAL,
            label: 'Is Negative?',
            conditionType: 'contains',
            conditionValue: 'negative',
          },
        },
        {
          id: 'llm-response',
          type: 'llm_call',
          position: { x: 100, y: 450 },
          data: {
            ...DEFAULT_LLM_CALL,
            label: 'Draft Response',
            systemPrompt:
              'Draft a professional, empathetic response to address the negative feedback.',
            userPromptTemplate:
              'The following content received negative sentiment. Draft a response:\n\n{{input}}',
          },
        },
        {
          id: 'transform-log',
          type: 'data_transform',
          position: { x: 500, y: 450 },
          data: {
            label: 'Log Positive',
            transformType: 'template',
            config: 'Content reviewed: Sentiment is positive/neutral. No action needed.\n\nOriginal: {{input}}',
          },
        },
        {
          id: 'output-neg',
          type: 'output',
          position: { x: 100, y: 600 },
          data: { ...DEFAULT_OUTPUT, label: 'Response Draft' },
        },
        {
          id: 'output-pos',
          type: 'output',
          position: { x: 500, y: 600 },
          data: { ...DEFAULT_OUTPUT, label: 'Review Log' },
        },
      ],
      edges: [
        { id: 'e1', source: 'input-1', target: 'llm-sentiment' },
        { id: 'e2', source: 'llm-sentiment', target: 'cond-1' },
        { id: 'e3', source: 'cond-1', target: 'llm-response', sourceHandle: 'true' },
        { id: 'e4', source: 'cond-1', target: 'transform-log', sourceHandle: 'false' },
        { id: 'e5', source: 'llm-response', target: 'output-neg' },
        { id: 'e6', source: 'transform-log', target: 'output-pos' },
      ],
    },
  },
]
