--
-- PostgreSQL database dump
--

\restrict aU83S3ghlCg1zp3MWnZ6xl9QAPoAPtx0jGUP49dwBvwxtgUdfNaink3DRgYppzI

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg12+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: archcelerate
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO archcelerate;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: archcelerate
--

COMMENT ON SCHEMA public IS '';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO archcelerate;

--
-- Name: CodeReviewFeedback; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."CodeReviewFeedback" (
    id text NOT NULL,
    "submissionId" text NOT NULL,
    "overallScore" double precision,
    "functionalityScore" double precision,
    "codeQualityScore" double precision,
    "aiBestPracticesScore" double precision,
    "architectureScore" double precision,
    suggestions jsonb,
    "goodPractices" jsonb,
    "criticalIssues" jsonb,
    "improvementsNeeded" jsonb,
    "reviewIteration" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CodeReviewFeedback" OWNER TO archcelerate;

--
-- Name: Concept; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."Concept" (
    id text NOT NULL,
    "weekId" text NOT NULL,
    "orderIndex" integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    "contentPath" text NOT NULL,
    "estimatedMinutes" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Concept" OWNER TO archcelerate;

--
-- Name: ConceptCompletion; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."ConceptCompletion" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sprintId" text NOT NULL,
    "conceptId" text NOT NULL,
    "timeSpentSeconds" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ConceptCompletion" OWNER TO archcelerate;

--
-- Name: CurriculumChunk; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."CurriculumChunk" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    content text NOT NULL,
    embedding public.vector(1536),
    "chunkIndex" integer NOT NULL,
    heading text,
    "codeBlock" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CurriculumChunk" OWNER TO archcelerate;

--
-- Name: CurriculumContent; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."CurriculumContent" (
    id text NOT NULL,
    "userId" text,
    "filePath" text,
    "weekNumber" integer,
    title text NOT NULL,
    content text,
    type text NOT NULL,
    slug text NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "lastIndexed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CurriculumContent" OWNER TO archcelerate;

--
-- Name: CurriculumWeek; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."CurriculumWeek" (
    id text NOT NULL,
    "weekNumber" integer NOT NULL,
    title text NOT NULL,
    description text,
    objectives jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CurriculumWeek" OWNER TO archcelerate;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "contentType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Document" OWNER TO archcelerate;

--
-- Name: DocumentChunk; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."DocumentChunk" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    content text NOT NULL,
    embedding public.vector(1536),
    "chunkIndex" integer NOT NULL,
    "pageNumber" integer,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DocumentChunk" OWNER TO archcelerate;

--
-- Name: Lab; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."Lab" (
    id text NOT NULL,
    "weekId" text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    exercises jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Lab" OWNER TO archcelerate;

--
-- Name: LabAttempt; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."LabAttempt" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "labId" text NOT NULL,
    "sprintId" text NOT NULL,
    "conceptId" text NOT NULL,
    score integer,
    passed boolean DEFAULT false NOT NULL,
    feedback jsonb,
    "attemptedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LabAttempt" OWNER TO archcelerate;

--
-- Name: LabSubmission; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."LabSubmission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "labId" text NOT NULL,
    "exerciseNumber" integer NOT NULL,
    "submissionData" jsonb NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LabSubmission" OWNER TO archcelerate;

--
-- Name: LearningEvent; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."LearningEvent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "eventType" text NOT NULL,
    "eventData" jsonb,
    "occurredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LearningEvent" OWNER TO archcelerate;

--
-- Name: MentorConversation; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."MentorConversation" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text,
    messages jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contextConcept" text,
    "contextSprint" text
);


ALTER TABLE public."MentorConversation" OWNER TO archcelerate;

--
-- Name: ProjectSubmission; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."ProjectSubmission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectNumber" integer NOT NULL,
    "githubRepoUrl" text NOT NULL,
    "deployedUrl" text,
    "submissionData" jsonb,
    "reviewStatus" text DEFAULT 'pending'::text NOT NULL,
    "overallScore" double precision,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectSubmission" OWNER TO archcelerate;

--
-- Name: ReviewComment; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."ReviewComment" (
    id text NOT NULL,
    "feedbackId" text NOT NULL,
    "filePath" text,
    "lineNumber" integer,
    severity text NOT NULL,
    category text,
    message text NOT NULL,
    suggestion text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReviewComment" OWNER TO archcelerate;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO archcelerate;

--
-- Name: SkillDiagnosis; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."SkillDiagnosis" (
    "userId" text NOT NULL,
    "quizAnswers" jsonb NOT NULL,
    "skillScores" jsonb NOT NULL,
    "recommendedPath" text NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "quizQuestions" jsonb,
    "difficultyLevel" text DEFAULT 'intermediate'::text
);


ALTER TABLE public."SkillDiagnosis" OWNER TO archcelerate;

--
-- Name: User; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "experienceYears" integer,
    "targetRole" text,
    "onboardedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "diagnosisCompleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO archcelerate;

--
-- Name: UserProgress; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."UserProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sprintId" text NOT NULL,
    "conceptId" text NOT NULL,
    status text NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "lastAccessed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserProgress" OWNER TO archcelerate;

--
-- Name: UserWeekProgress; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."UserWeekProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "weekId" text NOT NULL,
    "conceptsCompleted" integer DEFAULT 0 NOT NULL,
    "conceptsTotal" integer NOT NULL,
    "labCompleted" boolean DEFAULT false NOT NULL,
    "projectCompleted" boolean DEFAULT false NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."UserWeekProgress" OWNER TO archcelerate;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO archcelerate;

--
-- Name: WeekProject; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."WeekProject" (
    id text NOT NULL,
    "weekId" text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    requirements jsonb NOT NULL,
    "successCriteria" jsonb NOT NULL,
    "estimatedHours" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WeekProject" OWNER TO archcelerate;

--
-- Name: WeekProjectSubmission; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public."WeekProjectSubmission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL,
    "githubUrl" text,
    "deployedUrl" text,
    "writeupContent" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WeekProjectSubmission" OWNER TO archcelerate;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: archcelerate
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO archcelerate;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cml7rsolp0002v36yss5qoeao	cml7rsoli0000v36yy328zrhi	oauth	google	106153142101183210218	\N	ya29.A0AUMWg_KSwrXm-juGz05tCMpXdSmp6FLNTatLW62dkiLo_Y3faTN54NtjrJLVHXHWLJCzPlAAb33icJyLRYSd8iStJjuHz8PIKwadSsM3HZmt75NRIsUty6QJ9enL-gNyvZcETpfqKc4Czk_DDYmc-AVUmy9MhRHRCUg235gQ-bO2RTl2fEgEjtU9N_qE1MDrz9qHIDwBAuI8cDSvu_kj1zzf9n-1U5DCLmszlKEiSuwPbvBvq4I8tRZnNNGZDCU7fvnX6to56mKwJR2NY3nb841jLR5bxwUaCgYKAQgSARcSFQHGX2Mi7XeEMT23Wt3EKDfrSo-dUQ0294	1770197588	Bearer	openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile	eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg2MzBhNzFiZDZlYzFjNjEyNTdhMjdmZjJlZmQ5MTg3MmVjYWIxZjYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0NjI2NzE0OTE0MDUtMjA4YWQwYTBmcTQyaGpqOTk2bmdsNzFsbDhhNmw0dWUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0NjI2NzE0OTE0MDUtMjA4YWQwYTBmcTQyaGpqOTk2bmdsNzFsbDhhNmw0dWUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYxNTMxNDIxMDExODMyMTAyMTgiLCJlbWFpbCI6Im1hbmRhZGFwdTk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiY25pT1dRVEdKS19VdUtsb3pNeHhPUSIsIm5hbWUiOiJTdXJ5YSBNYW5kYWRhcHUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU1HeElha2FnVC1mbnRRZXNrWTQyVHJyUndKWHVJdW9vdjVmb0pUUWs1VmxpZEh3PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlN1cnlhIiwiZmFtaWx5X25hbWUiOiJNYW5kYWRhcHUiLCJpYXQiOjE3NzAxOTM5OTAsImV4cCI6MTc3MDE5NzU5MH0.b8q-eaZk3QpHilbLOiNtB155i0zFBuXovnET1fzyYVtHWQtkZc73gkK7SNrHs9VbQ22mtxrhTXGboAP34YNzomFeEEO03zIQNsbrzxvrs4fRi0UxB-T66gOCUIQbPbfM7T4-RUyk3DRX-jP__Av-4ZpmoC6gv8wPfczC99ZRPrSiIT6iSeawuclGDE2AXoUUCOSzIBqTaI1q30QZFFRK5KkXmR4_BThUhuniRkqyBf3lfnfsnzRCw9p3zOPTDB1QVY0er8DYme3MF8y0BjNDabKe_n3hWwGeKlaqyJYZ7ZgJW8PV4Kvm72xOdgJEcH43IdKfrW5ub7qI5av2JyVZiA	\N
\.


--
-- Data for Name: CodeReviewFeedback; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."CodeReviewFeedback" (id, "submissionId", "overallScore", "functionalityScore", "codeQualityScore", "aiBestPracticesScore", "architectureScore", suggestions, "goodPractices", "criticalIssues", "improvementsNeeded", "reviewIteration", "createdAt") FROM stdin;
\.


--
-- Data for Name: Concept; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."Concept" (id, "weekId", "orderIndex", slug, title, "contentPath", "estimatedMinutes", "createdAt") FROM stdin;
cml7s1jqd0002nhdxyv1n85jc	cml7s1jp70000nhdx6odntl5f	2	prompt-engineering	Prompt Engineering Mastery	content/week1/prompt-engineering.mdx	60	2026-02-04 08:40:03.878
cml7s1jr10006nhdxzhgwi2sr	cml7s1jp70000nhdx6odntl5f	3	api-integration	API Integration Patterns	content/week1/api-integration.mdx	45	2026-02-04 08:40:03.878
cml7s1jr10008nhdx8tqnuug5	cml7s1jp70000nhdx6odntl5f	5	architecture-decisions	AI Architecture & Design Patterns	content/week1/architecture-decisions.mdx	40	2026-02-04 08:40:03.878
cml7s1jr10007nhdx87cadkr0	cml7s1jp70000nhdx6odntl5f	1	llm-fundamentals	LLM Fundamentals	content/week1/llm-fundamentals.mdx	45	2026-02-04 08:40:03.878
cml7s1jr5000anhdxabj4c2oi	cml7s1jp70000nhdx6odntl5f	4	visual-builders	Visual Agent Builders	content/week1/visual-builders.mdx	30	2026-02-04 08:40:03.878
cml7s1jr7000cnhdx4se999w4	cml7s1jp70000nhdx6odntl5f	6	production-readiness	Production Readiness	content/week1/production-readiness.mdx	45	2026-02-04 08:40:03.878
cml7s2jb1000238p0hu4ylpe2	cml7s2jag000038p0v6g8u4pp	1	advanced-chat-architecture	Advanced Chat Architecture	content/week2/advanced-chat-architecture.mdx	35	2026-02-04 08:40:49.981
cml7s2jbr000438p0t8dgeqxa	cml7s2jag000038p0v6g8u4pp	3	production-chat-features	Production Chat Features	content/week2/production-chat-features.mdx	35	2026-02-04 08:40:49.982
\.


--
-- Data for Name: ConceptCompletion; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."ConceptCompletion" (id, "userId", "sprintId", "conceptId", "timeSpentSeconds", "completedAt") FROM stdin;
\.


--
-- Data for Name: CurriculumChunk; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."CurriculumChunk" (id, "contentId", content, embedding, "chunkIndex", heading, "codeBlock", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: CurriculumContent; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."CurriculumContent" (id, "userId", "filePath", "weekNumber", title, content, type, slug, "isPublic", metadata, "lastIndexed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CurriculumWeek; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."CurriculumWeek" (id, "weekNumber", title, description, objectives, active, "createdAt") FROM stdin;
cml7s1jp70000nhdx6odntl5f	1	Foundations + Visual Builder Introduction	Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant	["Understand LLM fundamentals: tokenization, context windows, and model capabilities", "Master prompt engineering patterns: zero-shot, few-shot, chain-of-thought reasoning", "Learn API integration patterns: streaming responses, error handling, retry logic", "Experience visual agent building before coding to understand abstraction layers", "Evaluate architecture choices: serverless vs long-running, synchronous vs streaming", "Design conversation state management: in-memory, database, or distributed cache", "Choose appropriate model tiers based on latency, cost, and quality trade-offs", "Implement rate limiting strategies to prevent abuse and control costs", "Implement input validation and sanitization to prevent prompt injection attacks", "Secure API keys using environment variables and secret management", "Handle token limits and implement context window management strategies", "Implement comprehensive error handling for API failures, rate limits, and timeouts", "Add logging and monitoring for debugging production issues", "Design graceful degradation when AI services are unavailable", "Understand pricing models: per-token costs, input vs output token pricing", "Optimize prompt design to reduce token usage without sacrificing quality", "Implement response caching for frequently asked questions", "Monitor token usage and set budget alerts to prevent unexpected costs", "Integrate security, architecture, and cost optimization into a single system", "Build production-ready chat assistant demonstrating all Week 1 concepts"]	t	2026-02-04 08:40:03.834
cml7s2jag000038p0v6g8u4pp	2	Chat + Governance	Build production chat applications with proper governance and safety controls	["Build scalable chat architecture", "Implement governance and safety", "Add production features"]	t	2026-02-04 08:40:49.961
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."Document" (id, "userId", title, "fileName", "fileSize", "contentType", "createdAt") FROM stdin;
\.


--
-- Data for Name: DocumentChunk; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."DocumentChunk" (id, "documentId", content, embedding, "chunkIndex", "pageNumber", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Lab; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."Lab" (id, "weekId", slug, title, description, exercises, "createdAt") FROM stdin;
cml7s1jrh000enhdxejx53ewp	cml7s1jp70000nhdx6odntl5f	visual-to-code	Visual Builder → Code Translation	Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers	[{"type": "visual", "title": "Build Q&A chatbot in Flowise", "number": 1}, {"type": "analysis", "title": "Understand the flow", "number": 2}, {"type": "export", "title": "Export to code", "number": 3}, {"type": "coding", "title": "Rebuild from scratch in code", "number": 4}, {"type": "reflection", "title": "Compare approaches", "number": 5}]	2026-02-04 08:40:03.917
cml7s1jrm000gnhdx4wh6yacr	cml7s1jp70000nhdx6odntl5f	cost-performance-lab	Cost & Performance Analysis	Master token counting, cost estimation, and model comparison through hands-on exercises	[{"type": "coding", "steps": ["Install the Anthropic SDK: npm install @anthropic-ai/sdk", "Use the count_tokens API to analyze sample texts", "Create a comparison table: text type, character count, token count, ratio", "Test edge cases: code snippets, markdown, special characters", "Document patterns: which content is most token-efficient?"], "title": "Token Counting Exercise", "number": 1, "guidance": "Use the Anthropic API tokenizer to count tokens in different text types. Compare: short chat messages (10-50 tokens), technical documentation (500-1000 tokens), and long-form content (2000+ tokens). Learn how different content types affect token counts."}, {"type": "analysis", "steps": ["Define conversation profile: average 5 turns, 100 tokens input/turn, 150 tokens output/turn", "Calculate monthly tokens: 10k conversations × 5 turns × 250 tokens = 12.5M tokens", "Split input/output: 5M input ($15), 7.5M output ($112.50) = $127.50/month", "Add 20% buffer for system prompts and context = ~$150/month", "Create cost breakdown spreadsheet with different volume scenarios", "Identify cost optimization opportunities (caching, prompt compression)"], "title": "Cost Calculation Exercise", "number": 2, "guidance": "Estimate real-world costs for a customer support chatbot handling 10,000 conversations/month. Use Claude Sonnet pricing: $3/million input tokens, $15/million output tokens."}, {"type": "coding", "steps": ["Create test prompt: \\"Explain quantum computing to a 10-year-old in 3 paragraphs\\"", "Build comparison script that calls all 3 models with same prompt", "Measure: response time (latency), token count, cost per request", "Evaluate quality: accuracy, clarity, completeness (subjective 1-10 rating)", "Create comparison matrix: Model | Speed | Cost | Quality | Use Case", "Document decision framework: when to use each model tier"], "title": "Model Comparison Exercise", "number": 3, "guidance": "Send the same prompt to Claude Haiku, Sonnet, and Opus. Measure quality, speed, and cost trade-offs to make informed model selection decisions."}, {"type": "coding", "steps": ["Start with verbose prompt (200+ tokens)", "Apply optimization techniques: remove redundancy, use abbreviations, compress instructions", "Test both versions with same inputs, compare outputs", "Measure token savings and quality delta", "Calculate monthly cost savings at scale (10k requests/month)", "Document optimization patterns that maintain quality"], "title": "Prompt Optimization for Cost", "number": 4, "guidance": "Take a verbose prompt and optimize it to reduce tokens by 30% without sacrificing output quality."}]	2026-02-04 08:40:03.923
\.


--
-- Data for Name: LabAttempt; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."LabAttempt" (id, "userId", "labId", "sprintId", "conceptId", score, passed, feedback, "attemptedAt") FROM stdin;
\.


--
-- Data for Name: LabSubmission; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."LabSubmission" (id, "userId", "labId", "exerciseNumber", "submissionData", completed, "submittedAt") FROM stdin;
\.


--
-- Data for Name: LearningEvent; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."LearningEvent" (id, "userId", "eventType", "eventData", "occurredAt") FROM stdin;
\.


--
-- Data for Name: MentorConversation; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."MentorConversation" (id, "userId", title, messages, "createdAt", "updatedAt", "contextConcept", "contextSprint") FROM stdin;
\.


--
-- Data for Name: ProjectSubmission; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."ProjectSubmission" (id, "userId", "projectNumber", "githubRepoUrl", "deployedUrl", "submissionData", "reviewStatus", "overallScore", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReviewComment; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."ReviewComment" (id, "feedbackId", "filePath", "lineNumber", severity, category, message, suggestion, "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
cml7rsolx0004v36yztp5qw0s	648b21e2-a367-4754-9adc-fd31f224fdab	cml7rsoli0000v36yy328zrhi	2026-03-06 08:33:10.292
\.


--
-- Data for Name: SkillDiagnosis; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."SkillDiagnosis" ("userId", "quizAnswers", "skillScores", "recommendedPath", "completedAt", "quizQuestions", "difficultyLevel") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."User" (id, name, email, "emailVerified", image, "experienceYears", "targetRole", "onboardedAt", "createdAt", "diagnosisCompleted") FROM stdin;
cml7rsoli0000v36yy328zrhi	Surya Mandadapu	mandadapu99@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIMGxIakagT-fntQeskY42TrrRwJXuIuoov5foJTQk5VlidHw=s96-c	\N	\N	\N	2026-02-04 08:33:10.278	f
\.


--
-- Data for Name: UserProgress; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."UserProgress" (id, "userId", "sprintId", "conceptId", status, "startedAt", "completedAt", "lastAccessed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserWeekProgress; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."UserWeekProgress" (id, "userId", "weekId", "conceptsCompleted", "conceptsTotal", "labCompleted", "projectCompleted", "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WeekProject; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."WeekProject" (id, "weekId", slug, title, description, requirements, "successCriteria", "estimatedHours", "createdAt") FROM stdin;
cml7s1jrr000inhdxfs8bihcp	cml7s1jp70000nhdx6odntl5f	chat-assistant-dual	Chat Assistant (Dual Implementation)	Build a conversational chat assistant with both visual and code implementations	["Build visual prototype in Flowise/LangFlow", "Build production code version in TypeScript/Python", "Implement conversation history management", "Add basic guardrails (input validation, content filtering)", "Basic logging of all LLM calls", "Write comparison writeup", "Deploy application with UI"]	["Multi-turn conversations work", "Context window managed properly", "Basic guardrails prevent misuse", "Both versions functionally equivalent", "Deployed and accessible"]	5	2026-02-04 08:40:03.928
\.


--
-- Data for Name: WeekProjectSubmission; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public."WeekProjectSubmission" (id, "userId", "projectId", "githubUrl", "deployedUrl", "writeupContent", status, "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: archcelerate
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3a19d490-22c9-4499-95c0-d7523087e2be	31ddc679fdb46685a735b97a5911dd5c5974cee56264dab4826ffeb5250b1338	2026-02-04 07:04:04.775023+00	20260131043017_init	\N	\N	2026-02-04 07:04:04.738167+00	1
cace66d7-5d27-4828-af6e-70c8877b1cc1	87a5327465a400147c1060376c8266a36be8e7a5108df558fe5512f27450c812	2026-02-04 07:04:04.792814+00	20260131060047_add_skill_diagnosis	\N	\N	2026-02-04 07:04:04.777842+00	1
e8c6b9e9-c6be-459a-ad28-bbca842892cf	05145628cdc7af1a2175c0b77f722da7093f15886901f3746136c29b880a2586	2026-02-04 07:04:04.813548+00	20260131071729_add_mentor_conversations	\N	\N	2026-02-04 07:04:04.801013+00	1
2ae28811-33aa-40dc-bf2d-f574ce6eeb89	1bf736692448cf55ed12628eee4e4c1decb0288cc9d16852197617ef24509384	2026-02-04 07:04:04.844267+00	20260131074743_add_learning_content_models	\N	\N	2026-02-04 07:04:04.816238+00	1
0e33d92d-03ab-4635-8c9e-0ea83ef4e39f	1d5cab8ca5fdd2c8dcef72bf965cea379af0610ef2e8ff1cee95458777afa881	2026-02-04 07:04:04.856256+00	20260131082234_add_mentor_context_fields	\N	\N	2026-02-04 07:04:04.847427+00	1
b3866ff8-9897-4dbf-a182-e470ff98ccaf	11e33c4663f2b0ddc218bb2130f8d81d73296c19aeae45ea3cbbeafdc7afd17a	2026-02-04 07:04:04.88193+00	20260131085637_add_code_review_models	\N	\N	2026-02-04 07:04:04.858278+00	1
519d6e8e-3419-4d73-8ad3-1ab39874476c	927b7f0814347cd47a21c4128661747a3a6677ce7b22ba9eada8fc1171886614	2026-02-04 07:04:04.941893+00	20260201000000_week1_curriculum	\N	\N	2026-02-04 07:04:04.884351+00	1
9311c3ce-a0ec-472e-bf70-936975f2c703	d082f8c219d574f0934149e08564dd15527a281c846ca24b7b28b4ab5bd84c6f	2026-02-04 07:04:04.954883+00	20260201100000_add_unique_project_submission	\N	\N	2026-02-04 07:04:04.944686+00	1
c2b2d41c-c18e-4169-8c91-59a1c53ef762	a20866422aad5bc116e5e282cc2aa4acf9a0486b6fdfedc89d1f242c29bf6acd	2026-02-04 07:04:04.995664+00	20260203060000_enable_pgvector	\N	\N	2026-02-04 07:04:04.957572+00	1
2f070654-bd40-404f-bd8d-3800a81d724d	5c8fd70e4133bed0507a06b91fefc4b55b16c1cf1e1874fc89ac7403cff2716e	2026-02-04 07:04:05.019668+00	20260203061035_add_quiz_questions	\N	\N	2026-02-04 07:04:04.998526+00	1
3fe33ec3-10c9-4093-a42b-e1a98e32c10c	6bb37a56c34f32dd2b86bf0027170edef36e580f918d005e26adcb92970ae9eb	2026-02-04 07:04:05.047702+00	20260203230130_add_curriculum_search	\N	\N	2026-02-04 07:04:05.022112+00	1
ee0b94c7-97ea-4d6c-b18f-72d10c659051	891d5f29e36ea2e0bddf52845b9005629c1b4c631011984de8f6f7ea43093232	2026-02-04 07:04:05.058776+00	20260204063249_add_difficulty_level_to_diagnosis	\N	\N	2026-02-04 07:04:05.050519+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: CodeReviewFeedback CodeReviewFeedback_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CodeReviewFeedback"
    ADD CONSTRAINT "CodeReviewFeedback_pkey" PRIMARY KEY (id);


--
-- Name: ConceptCompletion ConceptCompletion_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ConceptCompletion"
    ADD CONSTRAINT "ConceptCompletion_pkey" PRIMARY KEY (id);


--
-- Name: Concept Concept_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Concept"
    ADD CONSTRAINT "Concept_pkey" PRIMARY KEY (id);


--
-- Name: CurriculumChunk CurriculumChunk_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CurriculumChunk"
    ADD CONSTRAINT "CurriculumChunk_pkey" PRIMARY KEY (id);


--
-- Name: CurriculumContent CurriculumContent_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CurriculumContent"
    ADD CONSTRAINT "CurriculumContent_pkey" PRIMARY KEY (id);


--
-- Name: CurriculumWeek CurriculumWeek_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CurriculumWeek"
    ADD CONSTRAINT "CurriculumWeek_pkey" PRIMARY KEY (id);


--
-- Name: DocumentChunk DocumentChunk_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."DocumentChunk"
    ADD CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: LabAttempt LabAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LabAttempt"
    ADD CONSTRAINT "LabAttempt_pkey" PRIMARY KEY (id);


--
-- Name: LabSubmission LabSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Lab Lab_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Lab"
    ADD CONSTRAINT "Lab_pkey" PRIMARY KEY (id);


--
-- Name: LearningEvent LearningEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LearningEvent"
    ADD CONSTRAINT "LearningEvent_pkey" PRIMARY KEY (id);


--
-- Name: MentorConversation MentorConversation_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."MentorConversation"
    ADD CONSTRAINT "MentorConversation_pkey" PRIMARY KEY (id);


--
-- Name: ProjectSubmission ProjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: ReviewComment ReviewComment_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ReviewComment"
    ADD CONSTRAINT "ReviewComment_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SkillDiagnosis SkillDiagnosis_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."SkillDiagnosis"
    ADD CONSTRAINT "SkillDiagnosis_pkey" PRIMARY KEY ("userId");


--
-- Name: UserProgress UserProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserWeekProgress UserWeekProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeekProjectSubmission WeekProjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: WeekProject WeekProject_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."WeekProject"
    ADD CONSTRAINT "WeekProject_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: CodeReviewFeedback_submissionId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CodeReviewFeedback_submissionId_idx" ON public."CodeReviewFeedback" USING btree ("submissionId");


--
-- Name: ConceptCompletion_conceptId_completedAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "ConceptCompletion_conceptId_completedAt_idx" ON public."ConceptCompletion" USING btree ("conceptId", "completedAt");


--
-- Name: ConceptCompletion_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "ConceptCompletion_userId_sprintId_idx" ON public."ConceptCompletion" USING btree ("userId", "sprintId");


--
-- Name: Concept_slug_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "Concept_slug_key" ON public."Concept" USING btree (slug);


--
-- Name: Concept_weekId_orderIndex_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "Concept_weekId_orderIndex_idx" ON public."Concept" USING btree ("weekId", "orderIndex");


--
-- Name: Concept_weekId_orderIndex_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "Concept_weekId_orderIndex_key" ON public."Concept" USING btree ("weekId", "orderIndex");


--
-- Name: CurriculumChunk_contentId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumChunk_contentId_idx" ON public."CurriculumChunk" USING btree ("contentId");


--
-- Name: CurriculumContent_isPublic_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumContent_isPublic_idx" ON public."CurriculumContent" USING btree ("isPublic");


--
-- Name: CurriculumContent_lastIndexed_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumContent_lastIndexed_idx" ON public."CurriculumContent" USING btree ("lastIndexed");


--
-- Name: CurriculumContent_type_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumContent_type_idx" ON public."CurriculumContent" USING btree (type);


--
-- Name: CurriculumContent_userId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumContent_userId_idx" ON public."CurriculumContent" USING btree ("userId");


--
-- Name: CurriculumContent_userId_slug_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "CurriculumContent_userId_slug_key" ON public."CurriculumContent" USING btree ("userId", slug);


--
-- Name: CurriculumContent_weekNumber_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "CurriculumContent_weekNumber_idx" ON public."CurriculumContent" USING btree ("weekNumber");


--
-- Name: CurriculumWeek_weekNumber_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "CurriculumWeek_weekNumber_key" ON public."CurriculumWeek" USING btree ("weekNumber");


--
-- Name: DocumentChunk_documentId_chunkIndex_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "DocumentChunk_documentId_chunkIndex_idx" ON public."DocumentChunk" USING btree ("documentId", "chunkIndex");


--
-- Name: Document_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "Document_userId_createdAt_idx" ON public."Document" USING btree ("userId", "createdAt");


--
-- Name: LabAttempt_userId_labId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "LabAttempt_userId_labId_idx" ON public."LabAttempt" USING btree ("userId", "labId");


--
-- Name: LabAttempt_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "LabAttempt_userId_sprintId_idx" ON public."LabAttempt" USING btree ("userId", "sprintId");


--
-- Name: LabSubmission_userId_labId_exerciseNumber_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "LabSubmission_userId_labId_exerciseNumber_key" ON public."LabSubmission" USING btree ("userId", "labId", "exerciseNumber");


--
-- Name: LabSubmission_userId_labId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "LabSubmission_userId_labId_idx" ON public."LabSubmission" USING btree ("userId", "labId");


--
-- Name: Lab_slug_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "Lab_slug_key" ON public."Lab" USING btree (slug);


--
-- Name: Lab_weekId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "Lab_weekId_idx" ON public."Lab" USING btree ("weekId");


--
-- Name: LearningEvent_eventType_occurredAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "LearningEvent_eventType_occurredAt_idx" ON public."LearningEvent" USING btree ("eventType", "occurredAt");


--
-- Name: LearningEvent_userId_occurredAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "LearningEvent_userId_occurredAt_idx" ON public."LearningEvent" USING btree ("userId", "occurredAt");


--
-- Name: MentorConversation_userId_updatedAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "MentorConversation_userId_updatedAt_idx" ON public."MentorConversation" USING btree ("userId", "updatedAt" DESC);


--
-- Name: ProjectSubmission_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "ProjectSubmission_userId_createdAt_idx" ON public."ProjectSubmission" USING btree ("userId", "createdAt");


--
-- Name: ProjectSubmission_userId_projectNumber_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "ProjectSubmission_userId_projectNumber_idx" ON public."ProjectSubmission" USING btree ("userId", "projectNumber");


--
-- Name: ReviewComment_feedbackId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "ReviewComment_feedbackId_idx" ON public."ReviewComment" USING btree ("feedbackId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: UserProgress_userId_sprintId_conceptId_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "UserProgress_userId_sprintId_conceptId_key" ON public."UserProgress" USING btree ("userId", "sprintId", "conceptId");


--
-- Name: UserProgress_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "UserProgress_userId_sprintId_idx" ON public."UserProgress" USING btree ("userId", "sprintId");


--
-- Name: UserProgress_userId_status_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "UserProgress_userId_status_idx" ON public."UserProgress" USING btree ("userId", status);


--
-- Name: UserWeekProgress_userId_weekId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "UserWeekProgress_userId_weekId_idx" ON public."UserWeekProgress" USING btree ("userId", "weekId");


--
-- Name: UserWeekProgress_userId_weekId_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "UserWeekProgress_userId_weekId_key" ON public."UserWeekProgress" USING btree ("userId", "weekId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WeekProjectSubmission_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "WeekProjectSubmission_userId_createdAt_idx" ON public."WeekProjectSubmission" USING btree ("userId", "createdAt");


--
-- Name: WeekProjectSubmission_userId_projectId_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "WeekProjectSubmission_userId_projectId_key" ON public."WeekProjectSubmission" USING btree ("userId", "projectId");


--
-- Name: WeekProject_slug_key; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE UNIQUE INDEX "WeekProject_slug_key" ON public."WeekProject" USING btree (slug);


--
-- Name: WeekProject_weekId_idx; Type: INDEX; Schema: public; Owner: archcelerate
--

CREATE INDEX "WeekProject_weekId_idx" ON public."WeekProject" USING btree ("weekId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CodeReviewFeedback CodeReviewFeedback_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CodeReviewFeedback"
    ADD CONSTRAINT "CodeReviewFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."ProjectSubmission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConceptCompletion ConceptCompletion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ConceptCompletion"
    ADD CONSTRAINT "ConceptCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Concept Concept_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Concept"
    ADD CONSTRAINT "Concept_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CurriculumChunk CurriculumChunk_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CurriculumChunk"
    ADD CONSTRAINT "CurriculumChunk_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."CurriculumContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CurriculumContent CurriculumContent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."CurriculumContent"
    ADD CONSTRAINT "CurriculumContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentChunk DocumentChunk_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."DocumentChunk"
    ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabAttempt LabAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LabAttempt"
    ADD CONSTRAINT "LabAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabSubmission LabSubmission_labId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_labId_fkey" FOREIGN KEY ("labId") REFERENCES public."Lab"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabSubmission LabSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lab Lab_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Lab"
    ADD CONSTRAINT "Lab_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningEvent LearningEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."LearningEvent"
    ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MentorConversation MentorConversation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."MentorConversation"
    ADD CONSTRAINT "MentorConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectSubmission ProjectSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewComment ReviewComment_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."ReviewComment"
    ADD CONSTRAINT "ReviewComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public."CodeReviewFeedback"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillDiagnosis SkillDiagnosis_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."SkillDiagnosis"
    ADD CONSTRAINT "SkillDiagnosis_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProgress UserProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWeekProgress UserWeekProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWeekProgress UserWeekProgress_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProjectSubmission WeekProjectSubmission_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."WeekProject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProjectSubmission WeekProjectSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProject WeekProject_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archcelerate
--

ALTER TABLE ONLY public."WeekProject"
    ADD CONSTRAINT "WeekProject_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: archcelerate
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict aU83S3ghlCg1zp3MWnZ6xl9QAPoAPtx0jGUP49dwBvwxtgUdfNaink3DRgYppzI

