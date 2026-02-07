import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Archcelerate',
  description: 'How Archcelerate collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mt-6 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: February 7, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p>
            Archcelerate (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the archcelerate.com
            website and AI Architect Accelerator platform. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Account Information</h3>
          <p>
            When you sign in using GitHub or Google OAuth, we receive your name, email address,
            and profile picture from the authentication provider. We do not receive or store
            your password.
          </p>

          <h3>Learning Data</h3>
          <p>
            We collect data about your progress through the curriculum, including completed
            concepts, lab submissions, quiz responses, and skill assessment results. This data
            is used to personalize your learning experience.
          </p>

          <h3>Chat and AI Interactions</h3>
          <p>
            Messages you send to the AI Mentor, code review tool, and agent playground are
            processed by third-party AI providers (see Section 4) and stored to maintain
            conversation history within your account.
          </p>

          <h3>Usage Data</h3>
          <p>
            We automatically collect standard usage information such as browser type, pages
            visited, and timestamps to improve the platform.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide, maintain, and improve the learning platform</li>
            <li>Track your curriculum progress and generate skill assessments</li>
            <li>Power AI features (mentor chat, code review, RAG search)</li>
            <li>Send important account and service notifications</li>
            <li>Analyze aggregate usage to improve content and features</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on Google Cloud Platform
            (us-central1 region). We use encrypted connections (TLS) for all data in transit
            and follow industry-standard practices for data at rest. Access to production
            systems is restricted to authorized personnel.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services to operate the platform:</p>
          <ul>
            <li>
              <strong>Google Cloud Platform</strong> — Infrastructure hosting and database
              services
            </li>
            <li>
              <strong>GitHub &amp; Google OAuth</strong> — Authentication (we only receive
              profile information you authorize)
            </li>
            <li>
              <strong>Anthropic (Claude API)</strong> — Powers the AI Mentor, code review,
              and agent features
            </li>
            <li>
              <strong>OpenAI</strong> — Text embeddings for the RAG search system
            </li>
            <li>
              <strong>Vercel</strong> — Application hosting and analytics
            </li>
          </ul>
          <p>
            Each provider processes data in accordance with their own privacy policies. We
            do not sell your personal information to any third party.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use essential cookies for authentication session management. We do not use
            third-party advertising or tracking cookies.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your account and learning data for as long as your account is active.
            If you request account deletion, we will remove your personal data within 30 days,
            except where retention is required by law.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Export your learning progress data</li>
          </ul>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Archcelerate is not intended for children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            material changes by posting the updated policy on this page with a revised
            &quot;Last updated&quot; date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data
            rights, please contact us at{' '}
            <a href="mailto:privacy@archcelerate.com">privacy@archcelerate.com</a>.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <span className="mx-3">&middot;</span>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
