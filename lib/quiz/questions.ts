import { QuizQuestion, DifficultyLevel, SkillArea } from '@/types/diagnosis'

export const quizQuestions: QuizQuestion[] = [
  // LLM Fundamentals (5 questions)
  {
    id: 'llm-1',
    type: 'single-choice',
    question: 'What is a token in the context of Large Language Models?',
    options: [
      { id: 'a', text: 'A security credential for API access' },
      { id: 'b', text: 'A unit of text that the model processes (word, subword, or character)' },
      { id: 'c', text: 'A special character that marks the end of a sentence' },
      { id: 'd', text: 'A programming variable in the model code' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-2',
    type: 'single-choice',
    question: 'Which statement best describes how LLMs generate text?',
    options: [
      { id: 'a', text: 'They search a database for pre-written responses' },
      { id: 'b', text: 'They predict the next most likely token based on the input' },
      { id: 'c', text: 'They translate human language into a programming language' },
      { id: 'd', text: 'They randomly select words from a vocabulary' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-3',
    type: 'single-choice',
    question: 'What is "temperature" in LLM API settings?',
    options: [
      { id: 'a', text: 'The processing speed of the model' },
      { id: 'b', text: 'A parameter that controls randomness/creativity in outputs (0=deterministic, 1=random)' },
      { id: 'c', text: 'The cost per API request' },
      { id: 'd', text: 'The physical temperature of the server' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'intermediate',
  },
  {
    id: 'llm-4',
    type: 'single-choice',
    question: 'What is the primary purpose of the "system prompt" in a chat completion API?',
    options: [
      { id: 'a', text: 'To authenticate the user' },
      { id: 'b', text: 'To set the behavior, personality, and constraints for the AI assistant' },
      { id: 'c', text: 'To specify the programming language for code generation' },
      { id: 'd', text: 'To limit the response length' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-5',
    type: 'single-choice',
    question: 'What happens when you exceed the context window of an LLM?',
    options: [
      { id: 'a', text: 'The model processes it slower' },
      { id: 'b', text: 'You get charged extra fees' },
      { id: 'c', text: 'The API returns an error or truncates the input' },
      { id: 'd', text: 'The model automatically summarizes the content' },
    ],
    correctAnswers: ['c'],
    skillArea: 'llm_fundamentals',
    difficulty: 'intermediate',
  },

  // Prompt Engineering (4 questions)
  {
    id: 'prompt-1',
    type: 'single-choice',
    question: 'What is "few-shot prompting"?',
    options: [
      { id: 'a', text: 'Sending multiple API requests quickly' },
      { id: 'b', text: 'Providing a few examples in the prompt to guide the model behavior' },
      { id: 'c', text: 'Limiting the response to a few sentences' },
      { id: 'd', text: 'Using a small, specialized model' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-2',
    type: 'multiple-choice',
    question: 'Which techniques can improve LLM output quality? (Select all that apply)',
    options: [
      { id: 'a', text: 'Being specific and clear in your instructions' },
      { id: 'b', text: 'Using vague language to let the AI be creative' },
      { id: 'c', text: 'Providing examples of desired output format' },
      { id: 'd', text: 'Breaking complex tasks into smaller steps (chain-of-thought)' },
    ],
    correctAnswers: ['a', 'c', 'd'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-3',
    type: 'single-choice',
    question: 'What is "chain-of-thought" prompting?',
    options: [
      { id: 'a', text: 'Linking multiple AI models together' },
      { id: 'b', text: 'Asking the model to explain its reasoning step-by-step before giving an answer' },
      { id: 'c', text: 'Creating a conversation history' },
      { id: 'd', text: 'Chaining API requests sequentially' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-4',
    type: 'code-evaluation',
    question: 'Which prompt is likely to produce better structured output?',
    code: `// Option A:
"Write about dogs"

// Option B:
"Write a 3-paragraph article about dogs. Format:
Paragraph 1: History of domestication
Paragraph 2: Popular breeds
Paragraph 3: Care tips
Use markdown formatting."`,
    options: [
      { id: 'a', text: 'Option A - gives the AI more creative freedom' },
      { id: 'b', text: 'Option B - provides clear structure and expectations' },
      { id: 'c', text: 'Both are equally effective' },
      { id: 'd', text: 'Neither will work well' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'beginner',
  },

  // RAG (3 questions)
  {
    id: 'rag-1',
    type: 'single-choice',
    question: 'What does RAG stand for in AI systems?',
    options: [
      { id: 'a', text: 'Random Access Generation' },
      { id: 'b', text: 'Retrieval-Augmented Generation' },
      { id: 'c', text: 'Rapid AI Gateway' },
      { id: 'd', text: 'Recursive Agent Graph' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'beginner',
  },
  {
    id: 'rag-2',
    type: 'single-choice',
    question: 'What is the primary purpose of vector embeddings in RAG systems?',
    options: [
      { id: 'a', text: 'To compress text for storage' },
      { id: 'b', text: 'To convert text into numerical representations for semantic similarity search' },
      { id: 'c', text: 'To encrypt sensitive data' },
      { id: 'd', text: 'To translate between languages' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'intermediate',
  },
  {
    id: 'rag-3',
    type: 'single-choice',
    question: 'In a RAG pipeline, what happens first?',
    options: [
      { id: 'a', text: 'Generate a response with the LLM' },
      { id: 'b', text: 'Retrieve relevant documents based on the query' },
      { id: 'c', text: 'Summarize the entire knowledge base' },
      { id: 'd', text: 'Train a new model' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'beginner',
  },

  // Agents (3 questions)
  {
    id: 'agent-1',
    type: 'single-choice',
    question: 'What is an AI agent in the context of LLM applications?',
    options: [
      { id: 'a', text: 'A person who sells AI software' },
      { id: 'b', text: 'An LLM that can use tools and take actions to accomplish tasks autonomously' },
      { id: 'c', text: 'A type of neural network architecture' },
      { id: 'd', text: 'A cloud service provider' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'beginner',
  },
  {
    id: 'agent-2',
    type: 'single-choice',
    question: 'What is "tool calling" (also called function calling) in AI agents?',
    options: [
      { id: 'a', text: 'Calling the API support team' },
      { id: 'b', text: 'The ability for an LLM to invoke external functions or APIs based on the conversation' },
      { id: 'c', text: 'Using multiple LLMs simultaneously' },
      { id: 'd', text: 'A debugging technique' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'intermediate',
  },
  {
    id: 'agent-3',
    type: 'single-choice',
    question: 'Why do AI agents need "guardrails"?',
    options: [
      { id: 'a', text: 'To improve response speed' },
      { id: 'b', text: 'To prevent infinite loops, unsafe actions, and excessive costs' },
      { id: 'c', text: 'To train the model faster' },
      { id: 'd', text: 'To encrypt communications' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'intermediate',
  },

  // Multimodal (2 questions)
  {
    id: 'multi-1',
    type: 'single-choice',
    question: 'What does "multimodal" mean in AI?',
    options: [
      { id: 'a', text: 'Using multiple programming languages' },
      { id: 'b', text: 'Processing different types of data (text, images, audio) together' },
      { id: 'c', text: 'Running multiple models in parallel' },
      { id: 'd', text: 'Supporting multiple languages (English, Spanish, etc.)' },
    ],
    correctAnswers: ['b'],
    skillArea: 'multimodal',
    difficulty: 'beginner',
  },
  {
    id: 'multi-2',
    type: 'single-choice',
    question: 'Which is a common use case for vision-language models?',
    options: [
      { id: 'a', text: 'Generating images from text prompts' },
      { id: 'b', text: 'Extracting text and data from documents/images (OCR + understanding)' },
      { id: 'c', text: 'Compressing video files' },
      { id: 'd', text: 'Training new language models' },
    ],
    correctAnswers: ['b'],
    skillArea: 'multimodal',
    difficulty: 'intermediate',
  },

  // Production AI (3 questions)
  {
    id: 'prod-1',
    type: 'multiple-choice',
    question: 'What are important considerations for production AI systems? (Select all that apply)',
    options: [
      { id: 'a', text: 'Cost monitoring and budget controls' },
      { id: 'b', text: 'Error handling and fallback strategies' },
      { id: 'c', text: 'Response latency and caching' },
      { id: 'd', text: 'Using the most expensive model for all tasks' },
    ],
    correctAnswers: ['a', 'b', 'c'],
    skillArea: 'production_ai',
    difficulty: 'intermediate',
  },
  {
    id: 'prod-2',
    type: 'single-choice',
    question: 'Why is caching important in production AI applications?',
    options: [
      { id: 'a', text: 'It makes the code more complex' },
      { id: 'b', text: 'It reduces costs and latency for repeated/similar queries' },
      { id: 'c', text: 'It is required by AI providers' },
      { id: 'd', text: 'It increases accuracy' },
    ],
    correctAnswers: ['b'],
    skillArea: 'production_ai',
    difficulty: 'intermediate',
  },
  {
    id: 'prod-3',
    type: 'single-choice',
    question: 'What is a key benefit of streaming responses in AI applications?',
    options: [
      { id: 'a', text: 'It reduces the total cost' },
      { id: 'b', text: 'It improves perceived performance by showing results progressively' },
      { id: 'c', text: 'It makes the model more accurate' },
      { id: 'd', text: 'It eliminates the need for error handling' },
    ],
    correctAnswers: ['b'],
    skillArea: 'production_ai',
    difficulty: 'beginner',
  },
]

// Utility to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced') {
  return quizQuestions.filter(q => q.difficulty === difficulty)
}

// Utility to get questions by skill area
export function getQuestionsBySkill(skill: string) {
  return quizQuestions.filter(q => q.skillArea === skill)
}

// Shuffle array using Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Group questions by skill area
function groupBySkill(questions: QuizQuestion[]): Record<SkillArea, QuizQuestion[]> {
  return questions.reduce((acc, question) => {
    if (!acc[question.skillArea]) {
      acc[question.skillArea] = []
    }
    acc[question.skillArea].push(question)
    return acc
  }, {} as Record<SkillArea, QuizQuestion[]>)
}

/**
 * Select random questions from a pool, optionally ensuring even distribution across skill areas
 * @param pool - Array of questions to select from
 * @param count - Number of questions to select (default: 25)
 * @param ensureDistribution - Whether to ensure even distribution across skill areas (default: true)
 * @returns Array of randomly selected questions
 */
export function selectRandomQuestions(
  pool: QuizQuestion[],
  count: number = 25,
  ensureDistribution: boolean = true
): QuizQuestion[] {
  if (pool.length === 0) {
    return []
  }

  if (pool.length <= count) {
    return shuffle(pool)
  }

  if (ensureDistribution) {
    // Get all unique skill areas in the pool
    const skillAreas = Array.from(new Set(pool.map(q => q.skillArea)))
    const perArea = Math.ceil(count / skillAreas.length)

    const bySkill = groupBySkill(pool)
    const selected: QuizQuestion[] = []

    // Select roughly equal number of questions from each skill area
    for (const skill of skillAreas) {
      const skillQuestions = bySkill[skill] || []
      const shuffled = shuffle(skillQuestions)
      selected.push(...shuffled.slice(0, Math.min(perArea, skillQuestions.length)))
    }

    // Shuffle and trim to exact count
    return shuffle(selected).slice(0, count)
  } else {
    // Simple random selection without distribution constraints
    return shuffle(pool).slice(0, count)
  }
}
