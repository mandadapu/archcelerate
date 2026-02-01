'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    question: 'How long does it take to complete the full curriculum?',
    answer: 'The full 8-module curriculum is designed to be completed in 12 weeks with 10-15 hours per week of study time. However, you can progress at your own pace - the platform saves your progress automatically.',
  },
  {
    question: 'Do I need prior AI experience?',
    answer: 'No! The curriculum starts from fundamentals. You should have basic programming knowledge (any language), but we teach AI concepts from the ground up. Module 1 covers all the foundational concepts you need.',
  },
  {
    question: 'What AI models do you teach?',
    answer: 'We focus on Claude (Anthropic) as the primary model, but also cover OpenAI GPT models, embeddings, and other popular AI APIs. The concepts you learn apply across all Large Language Models (LLMs).',
  },
  {
    question: 'Can I get help if I am stuck?',
    answer: 'Yes! We offer multiple support channels: in-app help widget (click the ? button), community forum, email support (support@aicelerate.com), and live office hours twice a week.',
  },
  {
    question: 'Do you offer certificates?',
    answer: 'Yes, you receive a verified certificate of completion after finishing each module and a final certificate for completing the full curriculum. Certificates can be shared on LinkedIn and include a unique verification URL.',
  },
  {
    question: 'What if I need to pause my learning?',
    answer: 'No problem! Your progress is automatically saved after each lesson. You can pause and resume anytime without losing any progress. Your account remains active during the pause.',
  },
  {
    question: 'What technologies and tools are used?',
    answer: 'We use Next.js, TypeScript, Claude API, OpenAI API, PostgreSQL with pgvector, Redis, and modern web technologies. All tools are industry-standard and used in production AI applications.',
  },
  {
    question: 'Is there a community or forum?',
    answer: 'Yes! We have an active Discord community where you can ask questions, share projects, and connect with other AI engineers. You also get access to weekly office hours and code review sessions.',
  },
  {
    question: 'Can I access course materials after completing?',
    answer: 'Absolutely! You have lifetime access to all course materials, including updates and new content we add. Once you complete the curriculum, you can revisit any lesson anytime.',
  },
  {
    question: 'What kind of projects will I build?',
    answer: 'You\'ll build real-world projects including: Document Q&A systems with RAG, autonomous AI agents, code review tools, customer support chatbots, data pipeline agents, and a capstone project of your choice.',
  },
]

export function FAQSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4">
            <AccordionTrigger className="text-left font-medium hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Still have questions?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Can't find the answer you're looking for? We're here to help!
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <a href="mailto:support@aicelerate.com">Email Support</a>
          </Button>
          <Button asChild size="sm">
            <a href="/help/tutorials">Watch Tutorials</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
