--
-- PostgreSQL database dump
--

\restrict 3iIkGguZd6f39AF0OWUpcDAHJv0WDgC6nrxKSalNOO74YbbZf2ciIkD39zED2kX

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."Account" OWNER TO aicelerate;

--
-- Name: CodeReviewFeedback; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."CodeReviewFeedback" OWNER TO aicelerate;

--
-- Name: Concept; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."Concept" OWNER TO aicelerate;

--
-- Name: ConceptCompletion; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."ConceptCompletion" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sprintId" text NOT NULL,
    "conceptId" text NOT NULL,
    "timeSpentSeconds" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ConceptCompletion" OWNER TO aicelerate;

--
-- Name: ConceptQuizAttempt; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."ConceptQuizAttempt" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "conceptSlug" text NOT NULL,
    "questionsData" jsonb NOT NULL,
    "answersData" jsonb NOT NULL,
    score integer NOT NULL,
    "totalQuestions" integer NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    "attemptedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ConceptQuizAttempt" OWNER TO aicelerate;

--
-- Name: CurriculumWeek; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."CurriculumWeek" OWNER TO aicelerate;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."Document" OWNER TO aicelerate;

--
-- Name: Lab; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."Lab" OWNER TO aicelerate;

--
-- Name: LabAttempt; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."LabAttempt" OWNER TO aicelerate;

--
-- Name: LabSubmission; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."LabSubmission" OWNER TO aicelerate;

--
-- Name: LearningEvent; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."LearningEvent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "eventType" text NOT NULL,
    "eventData" jsonb,
    "occurredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LearningEvent" OWNER TO aicelerate;

--
-- Name: MentorConversation; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."MentorConversation" OWNER TO aicelerate;

--
-- Name: ProjectSubmission; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."ProjectSubmission" OWNER TO aicelerate;

--
-- Name: ReviewComment; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."ReviewComment" OWNER TO aicelerate;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO aicelerate;

--
-- Name: SkillDiagnosis; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."SkillDiagnosis" (
    "userId" text NOT NULL,
    "quizAnswers" jsonb NOT NULL,
    "skillScores" jsonb NOT NULL,
    "recommendedPath" text NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "quizQuestions" jsonb
);


ALTER TABLE public."SkillDiagnosis" OWNER TO aicelerate;

--
-- Name: User; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."User" OWNER TO aicelerate;

--
-- Name: UserProgress; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."UserProgress" OWNER TO aicelerate;

--
-- Name: UserWeekProgress; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."UserWeekProgress" OWNER TO aicelerate;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: aicelerate
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO aicelerate;

--
-- Name: WeekProject; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."WeekProject" OWNER TO aicelerate;

--
-- Name: WeekProjectSubmission; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public."WeekProjectSubmission" OWNER TO aicelerate;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: aicelerate
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


ALTER TABLE public._prisma_migrations OWNER TO aicelerate;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cml60cri10002mf3igyfbhof5	cml60crhx0000mf3igo9eqc8h	oauth	google	106153142101183210218	\N	ya29.A0AUMWg_ICbHB1sCRGtE68z3kRDhmUWSmD-VHyObEX0m9uoMW5KSP9jnfFlyaw30SNO0pgSTKRbTsPP2-Wme7j3gxFbt2kgLQMRiy54sKF2nKQODgBC4cSl36InqdULfqSp_csbuNf-jwrfS813DCgIpnci49fJKl_baIeMg2du6-gT0yvTkjaFmNmNCvxcCyCum8u8D-1274mz2AAEkRRgSP3shpXAnMHvHZ93p-0otld9rK-Tgg2y-IM4feO3PEtaN-443aZpXil2qn9ZB2xXYeririckAaCgYKAW8SARcSFQHGX2MitujLYx4fWUuuIy_f6R9fmA0293	1770091030	Bearer	https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile	eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg2MzBhNzFiZDZlYzFjNjEyNTdhMjdmZjJlZmQ5MTg3MmVjYWIxZjYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0NjI2NzE0OTE0MDUtMjA4YWQwYTBmcTQyaGpqOTk2bmdsNzFsbDhhNmw0dWUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0NjI2NzE0OTE0MDUtMjA4YWQwYTBmcTQyaGpqOTk2bmdsNzFsbDhhNmw0dWUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYxNTMxNDIxMDExODMyMTAyMTgiLCJlbWFpbCI6Im1hbmRhZGFwdTk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoibzh0eHFoa25IVzRMc09hSTd4VmNwQSIsIm5hbWUiOiJTdXJ5YSBNYW5kYWRhcHUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU1HeElha2FnVC1mbnRRZXNrWTQyVHJyUndKWHVJdW9vdjVmb0pUUWs1VmxpZEh3PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlN1cnlhIiwiZmFtaWx5X25hbWUiOiJNYW5kYWRhcHUiLCJpYXQiOjE3NzAwODc0MzEsImV4cCI6MTc3MDA5MTAzMX0.lDaC9yHZXvpWJyDmr41VXtM0i6i2pAJs4seEhbJfmjKm5YJRL18PLC0GHprVNcGi9shrTAGSngy0q5oXmKnFRRtx4yGHckQi8_wM_AAaZb8T-Wjyc5uIhw8GIL8cm_xSxnTh_JI_mD_PVee9_JI5bUPCoBCmosPjzQmX7kgQsxC3X3GOFckJIcMZPkRu7xEmZA-lE71J7iZED-ZCG3K5elCXsY3VyoZsijpDLKnmVv15wKXO3ljal510ANzxOY9_BiCrdXATMM-Id4x5eRpCyNxfGvpy4uTOBNHSehZ7E2GxE-Qz0xCfYo_am-LtXrNxpF3ZEDN7eBiPAgWAHToR-g	\N
\.


--
-- Data for Name: CodeReviewFeedback; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."CodeReviewFeedback" (id, "submissionId", "overallScore", "functionalityScore", "codeQualityScore", "aiBestPracticesScore", "architectureScore", suggestions, "goodPractices", "criticalIssues", "improvementsNeeded", "reviewIteration", "createdAt") FROM stdin;
\.


--
-- Data for Name: Concept; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."Concept" (id, "weekId", "orderIndex", slug, title, "contentPath", "estimatedMinutes", "createdAt") FROM stdin;
cml60ee1j0002ue570fufbint	cml60ee0t0000ue57dphw1k9p	1	vector-embeddings	Vector Embeddings & Similarity Search	content/week3/vector-embeddings.mdx	35	2026-02-03 02:58:27.608
cml60ee1o0004ue57fj9quhal	cml60ee0t0000ue57dphw1k9p	2	rag-pipelines	Building RAG Pipelines	content/week3/rag-pipelines.mdx	40	2026-02-03 02:58:27.612
cml60ee1p0006ue57josj526p	cml60ee0t0000ue57dphw1k9p	3	memory-systems	Conversation Memory Systems	content/week3/memory-systems.mdx	35	2026-02-03 02:58:27.614
cml60ee25000due572prk2xf1	cml60ee1z000bue57hnxgm2gt	1	code-analysis	AI-Powered Code Analysis	content/week4/code-analysis.mdx	35	2026-02-03 02:58:27.63
cml60ee27000fue57owvk8eox	cml60ee1z000bue57hnxgm2gt	2	review-automation	Automated Code Review Patterns	content/week4/review-automation.mdx	40	2026-02-03 02:58:27.631
cml60ee28000hue57ker1b045	cml60ee1z000bue57hnxgm2gt	3	dev-integration	Development Workflow Integration	content/week4/dev-integration.mdx	30	2026-02-03 02:58:27.633
cml60ee2j000oue576f7phfsg	cml60ee2e000mue57rxwa1b97	1	project-planning	AI Product Planning & Design	content/week7/project-planning.mdx	40	2026-02-03 02:58:27.643
cml60ee2k000que57wyy7z09w	cml60ee2e000mue57rxwa1b97	2	architecture-design	System Architecture for AI Apps	content/week7/architecture-design.mdx	45	2026-02-03 02:58:27.645
cml60ee2m000sue5739131h5o	cml60ee2e000mue57rxwa1b97	3	implementation-strategy	Implementation & Deployment Strategy	content/week7/implementation-strategy.mdx	35	2026-02-03 02:58:27.646
cml60ee2x000zue5707k7knok	cml60ee2s000xue57wbth13rr	1	portfolio-building	Building Your AI Engineer Portfolio	content/week8/portfolio-building.mdx	35	2026-02-03 02:58:27.657
cml60ee2y0011ue5761s2owrg	cml60ee2s000xue57wbth13rr	2	product-launch	Product Launch Strategy	content/week8/product-launch.mdx	40	2026-02-03 02:58:27.659
cml60ee300013ue57npkewfzv	cml60ee2s000xue57wbth13rr	3	marketing-fundamentals	Marketing for Developers	content/week8/marketing-fundamentals.mdx	30	2026-02-03 02:58:27.66
cml60ee3b001aue57bnmqac4l	cml60ee360018ue57vqtkw4im	1	hybrid-search	Hybrid Search: Dense + Sparse Retrieval	content/week9/hybrid-search.mdx	40	2026-02-03 02:58:27.671
cml60ee3c001cue57h3oxyn4g	cml60ee360018ue57vqtkw4im	2	query-optimization	Query Rewriting & Expansion	content/week9/query-optimization.mdx	35	2026-02-03 02:58:27.673
cml60ee3e001eue57gnsda0yl	cml60ee360018ue57vqtkw4im	3	reranking-strategies	Re-ranking and Filtering Strategies	content/week9/reranking-strategies.mdx	40	2026-02-03 02:58:27.675
cml60ee3o001lue57mbre4qxo	cml60ee3j001jue57b5lcdfpe	1	finetuning-basics	Fine-tuning Fundamentals	content/week10/finetuning-basics.mdx	40	2026-02-03 02:58:27.684
cml60ee3p001nue57y44ye0wm	cml60ee3j001jue57b5lcdfpe	2	dataset-prep	Dataset Preparation & Curation	content/week10/dataset-prep.mdx	45	2026-02-03 02:58:27.686
cml60ee3r001pue57c2dm6t6a	cml60ee3j001jue57b5lcdfpe	3	model-evaluation	Model Evaluation & Iteration	content/week10/model-evaluation.mdx	40	2026-02-03 02:58:27.687
cml60ee40001wue57arco3tmw	cml60ee3v001uue573ni8fkx3	1	agent-coordination	Multi-Agent Coordination Patterns	content/week11/agent-coordination.mdx	45	2026-02-03 02:58:27.697
cml60ee42001yue57l12or05l	cml60ee3v001uue573ni8fkx3	2	task-delegation	Task Delegation & Orchestration	content/week11/task-delegation.mdx	40	2026-02-03 02:58:27.698
cml60ee440020ue57fc1j7p7c	cml60ee3v001uue573ni8fkx3	3	conflict-resolution	Conflict Resolution in Agent Systems	content/week11/conflict-resolution.mdx	35	2026-02-03 02:58:27.7
cml60ee4d0027ue57x52bunqp	cml60ee480025ue57sloqq4tl	1	enterprise-architecture	Enterprise AI Architecture Patterns	content/week12/enterprise-architecture.mdx	45	2026-02-03 02:58:27.709
cml60ee4e0029ue572s6eusu0	cml60ee480025ue57sloqq4tl	2	compliance-security	AI Compliance, Security & Governance	content/week12/compliance-security.mdx	50	2026-02-03 02:58:27.711
cml60ee4g002bue57cb5sdnqf	cml60ee480025ue57sloqq4tl	3	scaling-strategies	Scaling AI Systems to Production	content/week12/scaling-strategies.mdx	40	2026-02-03 02:58:27.712
cml60eoir0002oowe2ttvpgn0	cml60eoif0000ooweo6lh89cc	3	api-integration	API Integration Patterns	content/week1/api-integration.mdx	45	2026-02-03 02:58:41.187
cml60eojj0008oowe9z1yj4ss	cml60eoif0000ooweo6lh89cc	8	cost-performance	Cost Optimization & Performance	content/week1/cost-performance.mdx	45	2026-02-03 02:58:41.187
cml60eojc0004oowezvkclqog	cml60eoif0000ooweo6lh89cc	1	llm-fundamentals	LLM Fundamentals	content/week1/llm-fundamentals.mdx	45	2026-02-03 02:58:41.187
cml60eojj0006oowe67cqeze7	cml60eoif0000ooweo6lh89cc	4	visual-builders	Visual Agent Builders	content/week1/visual-builders.mdx	30	2026-02-03 02:58:41.187
cml60eojj000aoowekak1w79n	cml60eoif0000ooweo6lh89cc	2	prompt-engineering	Prompt Engineering Mastery	content/week1/prompt-engineering.mdx	60	2026-02-03 02:58:41.187
cml60eojo000eoowetgsd8gp5	cml60eoif0000ooweo6lh89cc	7	production-deployment	Production Deployment & Operations	content/week1/production-deployment.mdx	55	2026-02-03 02:58:41.187
cml60eojn000coowec0expqq5	cml60eoif0000ooweo6lh89cc	6	security-safety	Security & Safety in AI Systems	content/week1/security-safety.mdx	40	2026-02-03 02:58:41.187
cml60eojq000goowevehdy8zw	cml60eoif0000ooweo6lh89cc	5	architecture-decisions	AI Architecture & Design Patterns	content/week1/architecture-decisions.mdx	50	2026-02-03 02:58:41.187
cml60g9wi0002brzvl21hp8zi	cml60g9w00000brzv4pmkywyx	2	governance-foundations	Governance Foundations	content/week2/governance-foundations.mdx	40	2026-02-03 02:59:55.555
cml60g9wz0006brzvq21w8p8k	cml60g9w00000brzv4pmkywyx	1	advanced-chat-architecture	Advanced Chat Architecture	content/week2/advanced-chat-architecture.mdx	35	2026-02-03 02:59:55.555
cml60g9wz0004brzv35r3y2jz	cml60g9w00000brzv4pmkywyx	3	production-chat-features	Production Chat Features	content/week2/production-chat-features.mdx	35	2026-02-03 02:59:55.555
cml60gjq20002tqk06zgq4qw1	cml60gjpn0000tqk02c5cbky6	2	building-tools	Building Tools for Agents	content/week5/building-tools.mdx	40	2026-02-03 03:00:08.282
cml60gjqm0004tqk0f2m3h6ss	cml60gjpn0000tqk02c5cbky6	1	agent-fundamentals	Agent Fundamentals	content/week5/agent-fundamentals.mdx	35	2026-02-03 03:00:08.282
cml60gjqp0006tqk0sj71zf9q	cml60gjpn0000tqk02c5cbky6	3	agent-debugging	Agent Debugging & Optimization	content/week5/agent-debugging.mdx	45	2026-02-03 03:00:08.282
cml60hdca0002rl9u1909fq0v	cml60hdbt0000rl9umwn8w9nm	1	observability-basics	Observability Basics for AI Systems	content/week6/observability-basics.mdx	30	2026-02-03 03:00:46.667
cml60hdcv0004rl9uhnc0u36h	cml60hdbt0000rl9umwn8w9nm	3	performance-optimization	Performance Optimization & Caching	content/week6/performance-optimization.mdx	40	2026-02-03 03:00:46.667
cml60hdcy0006rl9uh8z0335a	cml60hdbt0000rl9umwn8w9nm	2	monitoring-ai-systems	Monitoring LLM Applications	content/week6/monitoring-ai-systems.mdx	35	2026-02-03 03:00:46.667
\.


--
-- Data for Name: ConceptCompletion; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."ConceptCompletion" (id, "userId", "sprintId", "conceptId", "timeSpentSeconds", "completedAt") FROM stdin;
\.


--
-- Data for Name: ConceptQuizAttempt; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."ConceptQuizAttempt" (id, "userId", "conceptSlug", "questionsData", "answersData", score, "totalQuestions", passed, "attemptedAt") FROM stdin;
\.


--
-- Data for Name: CurriculumWeek; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."CurriculumWeek" (id, "weekNumber", title, description, objectives, active, "createdAt") FROM stdin;
cml60ee0t0000ue57dphw1k9p	3	RAG + Memory	Build retrieval-augmented generation systems with vector databases	["Implement vector search", "Build RAG pipelines", "Manage conversation memory"]	t	2026-02-03 02:58:27.58
cml60ee1z000bue57hnxgm2gt	4	Code Review Assistant	Build an AI-powered code review and analysis system	["Analyze code with AI", "Automate code reviews", "Integrate with development workflow"]	t	2026-02-03 02:58:27.624
cml60ee2e000mue57rxwa1b97	7	Capstone Project	Plan and build your capstone AI application from scratch	["Design AI product", "Implement end-to-end system", "Deploy to production"]	t	2026-02-03 02:58:27.639
cml60ee2s000xue57wbth13rr	8	Portfolio + Launch	Build your portfolio and launch your AI products to the world	["Create portfolio site", "Launch products", "Market your work"]	t	2026-02-03 02:58:27.652
cml60ee360018ue57vqtkw4im	9	Advanced RAG Techniques	Master advanced RAG patterns including hybrid search and query optimization	["Implement hybrid search", "Optimize retrieval quality", "Build advanced RAG systems"]	t	2026-02-03 02:58:27.667
cml60ee3j001jue57b5lcdfpe	10	Fine-tuning + Custom Models	Fine-tune language models and build custom AI solutions	["Fine-tune models", "Prepare training data", "Evaluate model performance"]	t	2026-02-03 02:58:27.68
cml60ee3v001uue573ni8fkx3	11	Multi-Agent Systems	Build systems with multiple AI agents working together	["Design agent teams", "Implement agent coordination", "Handle complex workflows"]	t	2026-02-03 02:58:27.692
cml60ee480025ue57sloqq4tl	12	Enterprise AI Systems	Deploy and scale AI systems in enterprise environments	["Build enterprise architecture", "Ensure compliance and security", "Scale AI systems"]	t	2026-02-03 02:58:27.705
cml60eoif0000ooweo6lh89cc	1	Foundations + Visual Builder Introduction	Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant	["Understand LLM fundamentals: tokenization, context windows, and model capabilities", "Master prompt engineering patterns: zero-shot, few-shot, chain-of-thought reasoning", "Learn API integration patterns: streaming responses, error handling, retry logic", "Experience visual agent building before coding to understand abstraction layers", "Evaluate architecture choices: serverless vs long-running, synchronous vs streaming", "Design conversation state management: in-memory, database, or distributed cache", "Choose appropriate model tiers based on latency, cost, and quality trade-offs", "Implement rate limiting strategies to prevent abuse and control costs", "Implement input validation and sanitization to prevent prompt injection attacks", "Add content filtering and guardrails to detect harmful or inappropriate outputs", "Secure API keys using environment variables and secret management", "Implement proper authentication and authorization for production deployments", "Handle token limits and implement context window management strategies", "Implement error handling for API failures, rate limits, and timeouts", "Add comprehensive logging and monitoring for debugging and analytics", "Design graceful degradation when AI services are unavailable", "Understand pricing models: per-token costs, caching strategies, batch processing", "Optimize prompt design to reduce token usage without sacrificing quality", "Implement response caching for frequently asked questions", "Monitor and set budget alerts to prevent unexpected costs", "Customer Support: Context-aware responses with conversation history", "Technical Documentation: Code generation and explanation capabilities", "Content Creation: SEO-friendly copy with brand voice consistency", "Data Analysis: Natural language queries to structured data insights", "Understand latency implications: real-time chat vs batch processing", "Consider compliance requirements: data retention, GDPR, user privacy", "Plan for scaling: connection pooling, load balancing, distributed systems", "Build production-ready chat assistant with all best practices integrated"]	t	2026-02-03 02:58:41.174
cml60g9w00000brzv4pmkywyx	2	Chat + Governance	Build production chat applications with proper governance and safety controls	["Build scalable chat architecture", "Implement governance and safety", "Add production features"]	t	2026-02-03 02:59:55.537
cml60gjpn0000tqk02c5cbky6	5	AI Agents	Build autonomous AI agents that can use tools and complete complex tasks	["Understand agent architectures", "Build tool-using agents", "Debug and optimize agents"]	t	2026-02-03 03:00:08.268
cml60hdbt0000rl9umwn8w9nm	6	Observability + Production	Deploy AI systems with monitoring, caching, and reliability	["Deploy production systems", "Implement monitoring", "Optimize performance"]	t	2026-02-03 03:00:46.65
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."Document" (id, "userId", title, "fileName", "fileSize", "contentType", "createdAt") FROM stdin;
\.


--
-- Data for Name: Lab; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."Lab" (id, "weekId", slug, title, description, exercises, "createdAt") FROM stdin;
cml60ee1r0008ue57wni7tc8t	cml60ee0t0000ue57dphw1k9p	build-rag-system	Build a RAG-Powered Q&A System	Create a question-answering system using vector search and document retrieval	[{"type": "setup", "title": "Set up vector database (Pinecone/Chroma)", "number": 1}, {"type": "coding", "title": "Implement document chunking and embedding", "number": 2}, {"type": "implementation", "title": "Build retrieval pipeline", "number": 3}, {"type": "coding", "title": "Add re-ranking and filtering", "number": 4}]	2026-02-03 02:58:27.616
cml60ee2b000jue57ze3qbwjp	cml60ee1z000bue57hnxgm2gt	code-reviewer	Build a Code Review Agent	Create an agent that can analyze code and provide constructive feedback	[{"type": "coding", "title": "Parse and analyze code structure", "number": 1}, {"type": "implementation", "title": "Implement review prompt engineering", "number": 2}, {"type": "coding", "title": "Add multi-file analysis", "number": 3}, {"type": "coding", "title": "Generate actionable feedback", "number": 4}]	2026-02-03 02:58:27.635
cml60ee2o000uue57193tploa	cml60ee2e000mue57rxwa1b97	capstone-planning	Capstone Project Planning	Create a comprehensive plan for your capstone AI application	[{"type": "planning", "title": "Define problem and solution", "number": 1}, {"type": "design", "title": "Design system architecture", "number": 2}, {"type": "planning", "title": "Create implementation roadmap", "number": 3}, {"type": "planning", "title": "Set success metrics", "number": 4}]	2026-02-03 02:58:27.648
cml60ee320015ue57qhp2z93o	cml60ee2s000xue57wbth13rr	portfolio-site	Build Your Portfolio Site	Create a professional portfolio showcasing your AI projects	[{"type": "design", "title": "Design portfolio structure", "number": 1}, {"type": "coding", "title": "Build project showcase pages", "number": 2}, {"type": "writing", "title": "Add case studies and write-ups", "number": 3}, {"type": "deployment", "title": "Deploy and optimize for SEO", "number": 4}]	2026-02-03 02:58:27.663
cml60ee3g001gue57mzd82m45	cml60ee360018ue57vqtkw4im	advanced-rag	Advanced RAG Implementation	Implement hybrid search with re-ranking for superior retrieval quality	[{"type": "coding", "title": "Implement BM25 sparse retrieval", "number": 1}, {"type": "implementation", "title": "Combine dense and sparse search", "number": 2}, {"type": "coding", "title": "Add cross-encoder re-ranking", "number": 3}, {"type": "coding", "title": "Implement query expansion", "number": 4}]	2026-02-03 02:58:27.676
cml60ee3s001rue575ji55zoa	cml60ee3j001jue57b5lcdfpe	finetune-model	Fine-tune a Custom Model	Fine-tune a model for a specific task and evaluate performance	[{"type": "data-prep", "title": "Prepare training dataset", "number": 1}, {"type": "training", "title": "Fine-tune model (OpenAI or Anthropic)", "number": 2}, {"type": "analysis", "title": "Evaluate model performance", "number": 3}, {"type": "optimization", "title": "Iterate and improve", "number": 4}]	2026-02-03 02:58:27.689
cml60ee450022ue57l02cam2l	cml60ee3v001uue573ni8fkx3	multi-agent-system	Build a Multi-Agent System	Create a system where multiple agents collaborate to complete complex tasks	[{"type": "design", "title": "Design agent architecture", "number": 1}, {"type": "coding", "title": "Implement agent communication", "number": 2}, {"type": "implementation", "title": "Add task orchestration", "number": 3}, {"type": "coding", "title": "Handle agent conflicts", "number": 4}]	2026-02-03 02:58:27.702
cml60ee4h002due57oeuminsb	cml60ee480025ue57sloqq4tl	enterprise-deployment	Enterprise AI Deployment	Deploy an AI system with enterprise-grade security and compliance	[{"type": "security", "title": "Implement SSO and RBAC", "number": 1}, {"type": "implementation", "title": "Add audit logging and compliance", "number": 2}, {"type": "infrastructure", "title": "Set up multi-region deployment", "number": 3}, {"type": "configuration", "title": "Implement disaster recovery", "number": 4}]	2026-02-03 02:58:27.713
cml60eojy000ioowefafs6xry	cml60eoif0000ooweo6lh89cc	visual-to-code	Visual Builder → Code Translation	Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers	[{"type": "visual", "title": "Build Q&A chatbot in Flowise", "number": 1}, {"type": "analysis", "title": "Understand the flow", "number": 2}, {"type": "export", "title": "Export to code", "number": 3}, {"type": "coding", "title": "Rebuild from scratch in code", "number": 4}, {"type": "reflection", "title": "Compare approaches", "number": 5}]	2026-02-03 02:58:41.23
cml60eok2000koowe80l7gdzs	cml60eoif0000ooweo6lh89cc	cost-performance-lab	Cost & Performance Analysis	Master token counting, cost estimation, and model comparison through hands-on exercises	[{"type": "coding", "steps": ["Install the Anthropic SDK: npm install @anthropic-ai/sdk", "Use the count_tokens API to analyze sample texts", "Create a comparison table: text type, character count, token count, ratio", "Test edge cases: code snippets, markdown, special characters", "Document patterns: which content is most token-efficient?"], "title": "Token Counting Exercise", "number": 1, "guidance": "Use the Anthropic API tokenizer to count tokens in different text types. Compare: short chat messages (10-50 tokens), technical documentation (500-1000 tokens), and long-form content (2000+ tokens). Learn how different content types affect token counts."}, {"type": "analysis", "steps": ["Define conversation profile: average 5 turns, 100 tokens input/turn, 150 tokens output/turn", "Calculate monthly tokens: 10k conversations × 5 turns × 250 tokens = 12.5M tokens", "Split input/output: 5M input ($15), 7.5M output ($112.50) = $127.50/month", "Add 20% buffer for system prompts and context = ~$150/month", "Create cost breakdown spreadsheet with different volume scenarios", "Identify cost optimization opportunities (caching, prompt compression)"], "title": "Cost Calculation Exercise", "number": 2, "guidance": "Estimate real-world costs for a customer support chatbot handling 10,000 conversations/month. Use Claude Sonnet pricing: $3/million input tokens, $15/million output tokens."}, {"type": "coding", "steps": ["Create test prompt: \\"Explain quantum computing to a 10-year-old in 3 paragraphs\\"", "Build comparison script that calls all 3 models with same prompt", "Measure: response time (latency), token count, cost per request", "Evaluate quality: accuracy, clarity, completeness (subjective 1-10 rating)", "Create comparison matrix: Model | Speed | Cost | Quality | Use Case", "Document decision framework: when to use each model tier"], "title": "Model Comparison Exercise", "number": 3, "guidance": "Send the same prompt to Claude Haiku, Sonnet, and Opus. Measure quality, speed, and cost trade-offs to make informed model selection decisions."}, {"type": "coding", "steps": ["Start with verbose prompt (200+ tokens)", "Apply optimization techniques: remove redundancy, use abbreviations, compress instructions", "Test both versions with same inputs, compare outputs", "Measure token savings and quality delta", "Calculate monthly cost savings at scale (10k requests/month)", "Document optimization patterns that maintain quality"], "title": "Prompt Optimization for Cost", "number": 4, "guidance": "Take a verbose prompt and optimize it to reduce tokens by 30% without sacrificing output quality."}]	2026-02-03 02:58:41.235
cml60g9x60008brzviupwi369	cml60g9w00000brzv4pmkywyx	chat-governance	Chat Application with Governance	Build a production chat application with proper governance controls	[{"type": "coding", "title": "Implement conversation persistence", "number": 1}, {"type": "integration", "title": "Add content moderation", "number": 2}, {"type": "coding", "title": "Implement rate limiting", "number": 3}, {"type": "implementation", "title": "Add cost tracking", "number": 4}, {"type": "coding", "title": "Create audit logging", "number": 5}]	2026-02-03 02:59:55.578
cml60gjqv0008tqk0litadctk	cml60gjpn0000tqk02c5cbky6	build-research-agent	Build a Research Agent	Create an autonomous agent that can research topics using web search and document analysis	[{"type": "coding", "title": "Implement web search tool", "number": 1}, {"type": "coding", "title": "Build document summarization tool", "number": 2}, {"type": "implementation", "title": "Create ReAct agent loop", "number": 3}, {"type": "coding", "title": "Add error handling and retries", "number": 4}, {"type": "optimization", "title": "Optimize token usage", "number": 5}]	2026-02-03 03:00:08.312
\.


--
-- Data for Name: LabAttempt; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."LabAttempt" (id, "userId", "labId", "sprintId", "conceptId", score, passed, feedback, "attemptedAt") FROM stdin;
\.


--
-- Data for Name: LabSubmission; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."LabSubmission" (id, "userId", "labId", "exerciseNumber", "submissionData", completed, "submittedAt") FROM stdin;
\.


--
-- Data for Name: LearningEvent; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."LearningEvent" (id, "userId", "eventType", "eventData", "occurredAt") FROM stdin;
cml675x410003orhnywbqe2dn	cml60crhx0000mf3igo9eqc8h	diagnosis.completed	{"score": 11, "total": 15, "recommended_path": "standard"}	2026-02-03 06:07:49.73
cml67o86o0001qcken19dnv0b	cml60crhx0000mf3igo9eqc8h	diagnosis.completed	{"score": 12, "total": 15, "recommended_path": "standard"}	2026-02-03 06:22:03.888
\.


--
-- Data for Name: MentorConversation; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."MentorConversation" (id, "userId", title, messages, "createdAt", "updatedAt", "contextConcept", "contextSprint") FROM stdin;
\.


--
-- Data for Name: ProjectSubmission; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."ProjectSubmission" (id, "userId", "projectNumber", "githubRepoUrl", "deployedUrl", "submissionData", "reviewStatus", "overallScore", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReviewComment; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."ReviewComment" (id, "feedbackId", "filePath", "lineNumber", severity, category, message, suggestion, "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
cml69fz8j0003qckewrlaj8wv	f92a4cf3-5835-44b1-ab5e-cb2f72c3d3c8	cml60crhx0000mf3igo9eqc8h	2026-03-05 07:11:38.274
\.


--
-- Data for Name: SkillDiagnosis; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."SkillDiagnosis" ("userId", "quizAnswers", "skillScores", "recommendedPath", "completedAt", "quizQuestions") FROM stdin;
cml60crhx0000mf3igo9eqc8h	[{"isCorrect": true, "questionId": "llm-1", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "llm-2", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "llm-3", "selectedOptions": ["b"]}, {"isCorrect": true, "questionId": "llm-4", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "llm-5", "selectedOptions": ["d"]}, {"isCorrect": false, "questionId": "prompt-1", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "prompt-2", "selectedOptions": ["a"]}, {"isCorrect": false, "questionId": "prompt-3", "selectedOptions": ["b"]}, {"isCorrect": false, "questionId": "rag-1", "selectedOptions": ["c"]}, {"isCorrect": true, "questionId": "rag-2", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "rag-3", "selectedOptions": ["d"]}, {"isCorrect": true, "questionId": "agent-1", "selectedOptions": ["a"]}, {"isCorrect": true, "questionId": "agent-2", "selectedOptions": ["d"]}, {"isCorrect": true, "questionId": "deploy-1", "selectedOptions": ["d"]}, {"isCorrect": true, "questionId": "deploy-2", "selectedOptions": ["c"]}]	{"rag": 0.7, "agents": 0.8, "multimodal": 0, "production_ai": 0.8, "llm_fundamentals": 0.8, "prompt_engineering": 0.5}	standard	2026-02-03 06:22:03.865	[{"id": "llm-1", "type": "single-choice", "options": [{"id": "a", "text": "A unit of text representing a word or symbol"}, {"id": "b", "text": "A unique identifier for a piece of hardware"}, {"id": "c", "text": "A security credential used for authentication"}, {"id": "d", "text": "A type of neural network layer"}], "question": "What is a token in the context of Large Language Models (LLMs)?", "skillArea": "llm_fundamentals", "difficulty": "beginner", "correctAnswers": ["a"]}, {"id": "llm-2", "type": "single-choice", "options": [{"id": "a", "text": "To convert text into a format that can be processed by the model"}, {"id": "b", "text": "To optimize model performance for specific hardware"}, {"id": "c", "text": "To manage user authentication and authorization"}, {"id": "d", "text": "To enable transfer learning between different LLMs"}], "question": "What is the purpose of tokenization in LLMs?", "skillArea": "llm_fundamentals", "difficulty": "beginner", "correctAnswers": ["a"]}, {"id": "llm-3", "type": "single-choice", "options": [{"id": "a", "text": "To improve the model's ability to remember previous inputs"}, {"id": "b", "text": "To enable the model to focus on the most relevant parts of the input"}, {"id": "c", "text": "To speed up the model's training process"}, {"id": "d", "text": "To increase the model's capacity for long-term reasoning"}], "question": "What is the primary function of the attention mechanism in transformer-based LLMs?", "skillArea": "llm_fundamentals", "difficulty": "intermediate", "correctAnswers": ["b"]}, {"id": "llm-4", "type": "single-choice", "options": [{"id": "a", "text": "To improve the model's accuracy on a specific task or dataset"}, {"id": "b", "text": "To increase the model's training speed"}, {"id": "c", "text": "To reduce the model's memory footprint"}, {"id": "d", "text": "To enable the model to generate more diverse outputs"}], "question": "What is the purpose of fine-tuning in the context of LLMs?", "skillArea": "llm_fundamentals", "difficulty": "intermediate", "correctAnswers": ["a"]}, {"id": "llm-5", "type": "single-choice", "options": [{"id": "a", "text": "Ensuring the model's outputs are consistent and predictable"}, {"id": "b", "text": "Maintaining the model's performance under high-volume traffic"}, {"id": "c", "text": "Preventing the model from generating inappropriate or biased content"}, {"id": "d", "text": "All of the above"}], "question": "What is the main challenge in deploying LLMs in production environments?", "skillArea": "llm_fundamentals", "difficulty": "advanced", "correctAnswers": ["d"]}, {"id": "prompt-1", "type": "single-choice", "options": [{"id": "a", "text": "Providing the model with detailed, structured prompts"}, {"id": "b", "text": "Allowing the model to generate the prompt based on the task description"}, {"id": "c", "text": "Using a large number of diverse prompts to train the model"}, {"id": "d", "text": "Iterating on the prompt based on the model's output and fine-tuning the model"}], "question": "Which of the following is the most effective approach for prompt engineering?", "skillArea": "prompt_engineering", "difficulty": "intermediate", "correctAnswers": ["d"]}, {"id": "prompt-2", "type": "single-choice", "options": [{"id": "a", "text": "To reduce the amount of training data required for the model"}, {"id": "b", "text": "To enable the model to generate more diverse outputs"}, {"id": "c", "text": "To improve the model's performance on a specific task or dataset"}, {"id": "d", "text": "To make the model more robust to adversarial attacks"}], "question": "What is the purpose of using a few-shot or zero-shot prompt approach?", "skillArea": "prompt_engineering", "difficulty": "intermediate", "correctAnswers": ["a"]}, {"id": "prompt-3", "type": "single-choice", "options": [{"id": "a", "text": "To provide a starting point for generating prompts"}, {"id": "b", "text": "To enable the model to generate more coherent outputs"}, {"id": "c", "text": "To improve the model's performance on a specific task"}, {"id": "d", "text": "To make the model more resistant to input perturbations"}], "question": "What is the role of prompt templates in prompt engineering?", "skillArea": "prompt_engineering", "difficulty": "beginner", "correctAnswers": ["a"]}, {"id": "rag-1", "type": "single-choice", "options": [{"id": "a", "text": "To improve the model's ability to generate coherent and factual responses"}, {"id": "b", "text": "To reduce the model's training time and computational requirements"}, {"id": "c", "text": "To enable the model to generate more diverse and creative outputs"}, {"id": "d", "text": "To make the model more robust to adversarial attacks"}], "question": "What is the purpose of a Retrieval-Augmented Generation (RAG) system?", "skillArea": "rag_systems", "difficulty": "intermediate", "correctAnswers": ["a"]}, {"id": "rag-2", "type": "single-choice", "options": [{"id": "a", "text": "RAG systems use a separate retrieval model to access external knowledge"}, {"id": "b", "text": "RAG systems are more efficient and faster than traditional LLMs"}, {"id": "c", "text": "RAG systems are designed to generate more diverse and creative outputs"}, {"id": "d", "text": "RAG systems are more robust to adversarial attacks"}], "question": "How does a RAG system differ from a traditional LLM?", "skillArea": "rag_systems", "difficulty": "intermediate", "correctAnswers": ["a"]}, {"id": "rag-3", "type": "single-choice", "options": [{"id": "a", "text": "Ensuring the accuracy and reliability of the retrieval model"}, {"id": "b", "text": "Maintaining the model's performance under high-volume traffic"}, {"id": "c", "text": "Preventing the model from generating inappropriate or biased content"}, {"id": "d", "text": "All of the above"}], "question": "What are the key challenges in deploying a RAG system in production?", "skillArea": "rag_systems", "difficulty": "advanced", "correctAnswers": ["d"]}, {"id": "agent-1", "type": "single-choice", "options": [{"id": "a", "text": "To automate repetitive tasks and workflows"}, {"id": "b", "text": "To enable the model to generate more diverse outputs"}, {"id": "c", "text": "To improve the model's performance on a specific task or dataset"}, {"id": "d", "text": "To make the model more robust to adversarial attacks"}], "question": "What is the main purpose of an AI agent in the context of building AI products?", "skillArea": "ai_agents", "difficulty": "beginner", "correctAnswers": ["a"]}, {"id": "agent-2", "type": "single-choice", "options": [{"id": "a", "text": "Ensuring the agent's outputs are consistent and predictable"}, {"id": "b", "text": "Maintaining the agent's performance under high-volume traffic"}, {"id": "c", "text": "Preventing the agent from generating inappropriate or biased content"}, {"id": "d", "text": "All of the above"}], "question": "What are some key considerations when designing an AI agent for a production environment?", "skillArea": "ai_agents", "difficulty": "intermediate", "correctAnswers": ["d"]}, {"id": "deploy-1", "type": "single-choice", "options": [{"id": "a", "text": "Ensuring the model's outputs are consistent and predictable"}, {"id": "b", "text": "Maintaining the model's performance under high-volume traffic"}, {"id": "c", "text": "Preventing the model from generating inappropriate or biased content"}, {"id": "d", "text": "All of the above"}], "question": "What are the key considerations for deploying an AI model in a production environment?", "skillArea": "production_deployment", "difficulty": "advanced", "correctAnswers": ["d"]}, {"id": "deploy-2", "type": "single-choice", "options": [{"id": "a", "text": "To improve the model's accuracy and performance over time"}, {"id": "b", "text": "To enable the model to generate more diverse outputs"}, {"id": "c", "text": "To ensure the system's reliability and resilience"}, {"id": "d", "text": "To reduce the model's training time and computational requirements"}], "question": "What is the purpose of monitoring and logging in the production deployment of an AI system?", "skillArea": "production_deployment", "difficulty": "intermediate", "correctAnswers": ["c"]}]
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."User" (id, name, email, "emailVerified", image, "experienceYears", "targetRole", "onboardedAt", "createdAt", "diagnosisCompleted") FROM stdin;
cml60crhx0000mf3igo9eqc8h	Surya Mandadapu	mandadapu99@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIMGxIakagT-fntQeskY42TrrRwJXuIuoov5foJTQk5VlidHw=s96-c	\N	\N	\N	2026-02-03 02:57:11.733	t
\.


--
-- Data for Name: UserProgress; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."UserProgress" (id, "userId", "sprintId", "conceptId", status, "startedAt", "completedAt", "lastAccessed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserWeekProgress; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."UserWeekProgress" (id, "userId", "weekId", "conceptsCompleted", "conceptsTotal", "labCompleted", "projectCompleted", "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WeekProject; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."WeekProject" (id, "weekId", slug, title, description, requirements, "successCriteria", "estimatedHours", "createdAt") FROM stdin;
cml60ee1w000aue57dp5dhni5	cml60ee0t0000ue57dphw1k9p	document-qa-system	Document Q&A System	Build a production RAG system that can answer questions from uploaded documents	["Document upload and processing", "Vector embedding and storage", "Semantic search implementation", "Context-aware answer generation", "Citation and source tracking"]	["Documents are chunked and embedded correctly", "Retrieval returns relevant passages", "Answers include source citations", "System handles multi-document queries"]	8	2026-02-03 02:58:27.62
cml60ee2d000lue57p6t7yr6j	cml60ee1z000bue57hnxgm2gt	ai-code-reviewer	AI Code Review System	Build a complete code review system with GitHub integration	["GitHub webhook integration", "Pull request analysis", "Automated review comments", "Code quality scoring", "Learning from feedback"]	["System integrates with GitHub PRs", "Reviews are contextual and helpful", "False positive rate below 20%", "Review turnaround under 2 minutes"]	10	2026-02-03 02:58:27.637
cml60ee2q000wue57gc5o4elx	cml60ee2e000mue57rxwa1b97	capstone-mvp	Capstone MVP	Build and deploy a minimum viable product of your capstone project	["Novel AI application solving real problem", "Production-ready deployment", "Monitoring and observability", "User authentication and data persistence", "Comprehensive documentation"]	["Application deployed and accessible", "Core features working end-to-end", "At least 5 test users successfully use the app", "Documentation covers setup and usage"]	20	2026-02-03 02:58:27.65
cml60ee350017ue57xsu7t2an	cml60ee2s000xue57wbth13rr	launch-campaign	Product Launch Campaign	Launch your capstone project with a comprehensive marketing campaign	["Landing page for your product", "Demo video or interactive demo", "Blog post or case study", "Social media presence", "Product Hunt or similar launch"]	["Landing page gets 100+ visitors", "At least 10 signups or users", "Positive feedback from early users", "Content shared on social media"]	12	2026-02-03 02:58:27.665
cml60ee3i001iue57r4dfp4g4	cml60ee360018ue57vqtkw4im	enterprise-rag	Enterprise-Grade RAG System	Build a production RAG system with advanced retrieval techniques	["Hybrid search implementation", "Multi-stage retrieval pipeline", "Query optimization", "Performance benchmarking", "Scalable architecture"]	["Retrieval precision above 0.8", "Query latency under 500ms", "System scales to 10K+ documents", "Handles complex multi-hop queries"]	12	2026-02-03 02:58:27.678
cml60ee3u001tue57cgztegjg	cml60ee3j001jue57b5lcdfpe	custom-ai-model	Custom AI Model for Domain Task	Build and deploy a fine-tuned model for a specific domain task	["Curated training dataset (500+ examples)", "Fine-tuned model", "Comprehensive evaluation metrics", "A/B testing vs. base model", "Production API deployment"]	["Model outperforms base model by 20%+", "Evaluation dataset shows consistent quality", "Model deployed and serving requests", "Clear cost/performance tradeoffs documented"]	15	2026-02-03 02:58:27.69
cml60ee470024ue57nnr3g9q4	cml60ee3v001uue573ni8fkx3	agent-team-system	Collaborative Agent Team	Build a multi-agent system where specialized agents work together	["At least 3 specialized agents", "Agent communication protocol", "Task routing and delegation", "Shared memory/context", "Observable agent interactions"]	["Agents successfully coordinate on tasks", "No deadlocks or infinite loops", "Clear division of responsibilities", "System completes complex multi-step workflows"]	14	2026-02-03 02:58:27.703
cml60ee4i002fue57uk9py9ll	cml60ee480025ue57sloqq4tl	enterprise-ai-platform	Enterprise AI Platform	Build a complete enterprise-ready AI platform with all production concerns addressed	["Multi-tenant architecture", "SSO integration (SAML/OIDC)", "Role-based access control", "Comprehensive audit logging", "SOC 2 compliance considerations", "Multi-region deployment", "Automated testing and CI/CD"]	["Platform supports multiple tenants securely", "Authentication and authorization working", "Full audit trail of all actions", "Handles 1000+ concurrent users", "Meets enterprise security standards"]	18	2026-02-03 02:58:27.715
cml60eok5000moowe5gvg0d82	cml60eoif0000ooweo6lh89cc	chat-assistant-dual	Chat Assistant (Dual Implementation)	Build a conversational chat assistant with both visual and code implementations	["Build visual prototype in Flowise/LangFlow", "Build production code version in TypeScript/Python", "Implement conversation history management", "Add basic guardrails (input validation, content filtering)", "Basic logging of all LLM calls", "Write comparison writeup", "Deploy application with UI"]	["Multi-turn conversations work", "Context window managed properly", "Basic guardrails prevent misuse", "Both versions functionally equivalent", "Deployed and accessible"]	5	2026-02-03 02:58:41.238
cml60g9xa000abrzv0vdvq8tn	cml60g9w00000brzv4pmkywyx	production-chat-app	Production-Ready Chat Application	Build a fully-featured chat application with authentication, persistence, and governance	["User authentication with next-auth", "Conversation persistence in database", "Real-time streaming responses", "Content moderation (OpenAI Moderations API)", "Rate limiting per user", "Cost tracking and budget alerts", "Conversation history UI", "Message export functionality"]	["Users can create accounts and log in", "Conversations persist across sessions", "Streaming responses work smoothly", "Inappropriate content is blocked", "Users cannot exceed rate limits", "Cost per conversation is tracked", "Users can view and search conversation history", "Full test coverage for critical paths"]	8	2026-02-03 02:59:55.582
cml60gjqz000atqk09o8u90dm	cml60gjpn0000tqk02c5cbky6	autonomous-task-agent	Autonomous Task Completion Agent	Build an agent that can autonomously complete multi-step tasks using custom tools	["Implement ReAct agent architecture", "Build at least 3 custom tools (web search, calculator, file operations)", "Add tool error handling and validation", "Implement agent memory and context management", "Create observable agent traces", "Add safety controls (max iterations, cost limits)", "Build a simple UI to interact with the agent", "Write comprehensive tests for agent loops"]	["Agent can successfully complete multi-step tasks", "Tools are called correctly with proper parameters", "Agent handles tool errors gracefully", "Agent stays within iteration and cost limits", "Full trace of agent reasoning is available", "UI clearly shows agent's thinking process", "Agent does not loop infinitely", "Test coverage above 80% for agent logic"]	10	2026-02-03 03:00:08.316
\.


--
-- Data for Name: WeekProjectSubmission; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public."WeekProjectSubmission" (id, "userId", "projectId", "githubUrl", "deployedUrl", "writeupContent", status, "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: aicelerate
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
422155b6-087c-4dc0-8797-eecdfeef9932	31ddc679fdb46685a735b97a5911dd5c5974cee56264dab4826ffeb5250b1338	2026-02-03 02:54:09.831634+00	20260131043017_init	\N	\N	2026-02-03 02:54:09.789907+00	1
d667d3f4-f521-42d0-ba4c-c422f789b1c4	87a5327465a400147c1060376c8266a36be8e7a5108df558fe5512f27450c812	2026-02-03 02:54:09.845215+00	20260131060047_add_skill_diagnosis	\N	\N	2026-02-03 02:54:09.834201+00	1
0f049319-e071-4e93-8e82-c1e2a90bbeae	05145628cdc7af1a2175c0b77f722da7093f15886901f3746136c29b880a2586	2026-02-03 02:54:09.859345+00	20260131071729_add_mentor_conversations	\N	\N	2026-02-03 02:54:09.84766+00	1
612a5d8a-31ca-47d8-a8e3-7d1a1c8d0257	1bf736692448cf55ed12628eee4e4c1decb0288cc9d16852197617ef24509384	2026-02-03 02:54:09.889966+00	20260131074743_add_learning_content_models	\N	\N	2026-02-03 02:54:09.861965+00	1
3761a3e5-eed1-4c22-abf8-172d2a590db8	1d5cab8ca5fdd2c8dcef72bf965cea379af0610ef2e8ff1cee95458777afa881	2026-02-03 02:54:09.899043+00	20260131082234_add_mentor_context_fields	\N	\N	2026-02-03 02:54:09.892255+00	1
1658febc-1f59-4523-a573-a20ebdd96e88	11e33c4663f2b0ddc218bb2130f8d81d73296c19aeae45ea3cbbeafdc7afd17a	2026-02-03 02:54:09.925767+00	20260131085637_add_code_review_models	\N	\N	2026-02-03 02:54:09.900988+00	1
705fb396-2c78-4799-9f1d-1fe8528df0aa	927b7f0814347cd47a21c4128661747a3a6677ce7b22ba9eada8fc1171886614	2026-02-03 02:54:09.991348+00	20260201000000_week1_curriculum	\N	\N	2026-02-03 02:54:09.928282+00	1
4561b645-16bf-4839-ad19-bffbcb193e66	d082f8c219d574f0934149e08564dd15527a281c846ca24b7b28b4ab5bd84c6f	2026-02-03 02:54:10.005977+00	20260201100000_add_unique_project_submission	\N	\N	2026-02-03 02:54:09.993941+00	1
c2f35c62-b4c7-41e7-a6dd-c0df7274fe7c	5c8fd70e4133bed0507a06b91fefc4b55b16c1cf1e1874fc89ac7403cff2716e	\N	20260203061035_add_quiz_questions	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260203061035_add_quiz_questions\n\nDatabase error code: 42704\n\nDatabase error:\nERROR: type "vector" does not exist\n\nPosition:\n[1m 17[0m -- CreateTable\n[1m 18[0m CREATE TABLE "DocumentChunk" (\n[1m 19[0m     "id" TEXT NOT NULL,\n[1m 20[0m     "documentId" TEXT NOT NULL,\n[1m 21[0m     "content" TEXT NOT NULL,\n[1m 22[1;31m     "embedding" vector(1536),[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42704), message: "type \\"vector\\" does not exist", detail: None, hint: None, position: Some(Original(566)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("parse_type.c"), line: Some(270), routine: Some("typenameType") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260203061035_add_quiz_questions"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260203061035_add_quiz_questions"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	\N	2026-02-03 06:10:44.508786+00	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: CodeReviewFeedback CodeReviewFeedback_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."CodeReviewFeedback"
    ADD CONSTRAINT "CodeReviewFeedback_pkey" PRIMARY KEY (id);


--
-- Name: ConceptCompletion ConceptCompletion_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ConceptCompletion"
    ADD CONSTRAINT "ConceptCompletion_pkey" PRIMARY KEY (id);


--
-- Name: ConceptQuizAttempt ConceptQuizAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ConceptQuizAttempt"
    ADD CONSTRAINT "ConceptQuizAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Concept Concept_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Concept"
    ADD CONSTRAINT "Concept_pkey" PRIMARY KEY (id);


--
-- Name: CurriculumWeek CurriculumWeek_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."CurriculumWeek"
    ADD CONSTRAINT "CurriculumWeek_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: LabAttempt LabAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LabAttempt"
    ADD CONSTRAINT "LabAttempt_pkey" PRIMARY KEY (id);


--
-- Name: LabSubmission LabSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Lab Lab_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Lab"
    ADD CONSTRAINT "Lab_pkey" PRIMARY KEY (id);


--
-- Name: LearningEvent LearningEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LearningEvent"
    ADD CONSTRAINT "LearningEvent_pkey" PRIMARY KEY (id);


--
-- Name: MentorConversation MentorConversation_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."MentorConversation"
    ADD CONSTRAINT "MentorConversation_pkey" PRIMARY KEY (id);


--
-- Name: ProjectSubmission ProjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: ReviewComment ReviewComment_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ReviewComment"
    ADD CONSTRAINT "ReviewComment_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SkillDiagnosis SkillDiagnosis_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."SkillDiagnosis"
    ADD CONSTRAINT "SkillDiagnosis_pkey" PRIMARY KEY ("userId");


--
-- Name: UserProgress UserProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserWeekProgress UserWeekProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeekProjectSubmission WeekProjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: WeekProject WeekProject_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."WeekProject"
    ADD CONSTRAINT "WeekProject_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: CodeReviewFeedback_submissionId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "CodeReviewFeedback_submissionId_idx" ON public."CodeReviewFeedback" USING btree ("submissionId");


--
-- Name: ConceptCompletion_conceptId_completedAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ConceptCompletion_conceptId_completedAt_idx" ON public."ConceptCompletion" USING btree ("conceptId", "completedAt");


--
-- Name: ConceptCompletion_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ConceptCompletion_userId_sprintId_idx" ON public."ConceptCompletion" USING btree ("userId", "sprintId");


--
-- Name: ConceptQuizAttempt_userId_attemptedAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ConceptQuizAttempt_userId_attemptedAt_idx" ON public."ConceptQuizAttempt" USING btree ("userId", "attemptedAt");


--
-- Name: ConceptQuizAttempt_userId_conceptSlug_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ConceptQuizAttempt_userId_conceptSlug_idx" ON public."ConceptQuizAttempt" USING btree ("userId", "conceptSlug");


--
-- Name: Concept_slug_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "Concept_slug_key" ON public."Concept" USING btree (slug);


--
-- Name: Concept_weekId_orderIndex_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "Concept_weekId_orderIndex_idx" ON public."Concept" USING btree ("weekId", "orderIndex");


--
-- Name: Concept_weekId_orderIndex_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "Concept_weekId_orderIndex_key" ON public."Concept" USING btree ("weekId", "orderIndex");


--
-- Name: CurriculumWeek_weekNumber_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "CurriculumWeek_weekNumber_key" ON public."CurriculumWeek" USING btree ("weekNumber");


--
-- Name: LabAttempt_userId_labId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "LabAttempt_userId_labId_idx" ON public."LabAttempt" USING btree ("userId", "labId");


--
-- Name: LabAttempt_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "LabAttempt_userId_sprintId_idx" ON public."LabAttempt" USING btree ("userId", "sprintId");


--
-- Name: LabSubmission_userId_labId_exerciseNumber_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "LabSubmission_userId_labId_exerciseNumber_key" ON public."LabSubmission" USING btree ("userId", "labId", "exerciseNumber");


--
-- Name: LabSubmission_userId_labId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "LabSubmission_userId_labId_idx" ON public."LabSubmission" USING btree ("userId", "labId");


--
-- Name: Lab_slug_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "Lab_slug_key" ON public."Lab" USING btree (slug);


--
-- Name: Lab_weekId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "Lab_weekId_idx" ON public."Lab" USING btree ("weekId");


--
-- Name: LearningEvent_eventType_occurredAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "LearningEvent_eventType_occurredAt_idx" ON public."LearningEvent" USING btree ("eventType", "occurredAt");


--
-- Name: LearningEvent_userId_occurredAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "LearningEvent_userId_occurredAt_idx" ON public."LearningEvent" USING btree ("userId", "occurredAt");


--
-- Name: MentorConversation_userId_updatedAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "MentorConversation_userId_updatedAt_idx" ON public."MentorConversation" USING btree ("userId", "updatedAt" DESC);


--
-- Name: ProjectSubmission_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ProjectSubmission_userId_createdAt_idx" ON public."ProjectSubmission" USING btree ("userId", "createdAt");


--
-- Name: ProjectSubmission_userId_projectNumber_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ProjectSubmission_userId_projectNumber_idx" ON public."ProjectSubmission" USING btree ("userId", "projectNumber");


--
-- Name: ReviewComment_feedbackId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "ReviewComment_feedbackId_idx" ON public."ReviewComment" USING btree ("feedbackId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: UserProgress_userId_sprintId_conceptId_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "UserProgress_userId_sprintId_conceptId_key" ON public."UserProgress" USING btree ("userId", "sprintId", "conceptId");


--
-- Name: UserProgress_userId_sprintId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "UserProgress_userId_sprintId_idx" ON public."UserProgress" USING btree ("userId", "sprintId");


--
-- Name: UserProgress_userId_status_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "UserProgress_userId_status_idx" ON public."UserProgress" USING btree ("userId", status);


--
-- Name: UserWeekProgress_userId_weekId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "UserWeekProgress_userId_weekId_idx" ON public."UserWeekProgress" USING btree ("userId", "weekId");


--
-- Name: UserWeekProgress_userId_weekId_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "UserWeekProgress_userId_weekId_key" ON public."UserWeekProgress" USING btree ("userId", "weekId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WeekProjectSubmission_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "WeekProjectSubmission_userId_createdAt_idx" ON public."WeekProjectSubmission" USING btree ("userId", "createdAt");


--
-- Name: WeekProjectSubmission_userId_projectId_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "WeekProjectSubmission_userId_projectId_key" ON public."WeekProjectSubmission" USING btree ("userId", "projectId");


--
-- Name: WeekProject_slug_key; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE UNIQUE INDEX "WeekProject_slug_key" ON public."WeekProject" USING btree (slug);


--
-- Name: WeekProject_weekId_idx; Type: INDEX; Schema: public; Owner: aicelerate
--

CREATE INDEX "WeekProject_weekId_idx" ON public."WeekProject" USING btree ("weekId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CodeReviewFeedback CodeReviewFeedback_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."CodeReviewFeedback"
    ADD CONSTRAINT "CodeReviewFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."ProjectSubmission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConceptCompletion ConceptCompletion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ConceptCompletion"
    ADD CONSTRAINT "ConceptCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Concept Concept_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Concept"
    ADD CONSTRAINT "Concept_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabAttempt LabAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LabAttempt"
    ADD CONSTRAINT "LabAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabSubmission LabSubmission_labId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_labId_fkey" FOREIGN KEY ("labId") REFERENCES public."Lab"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabSubmission LabSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LabSubmission"
    ADD CONSTRAINT "LabSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lab Lab_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Lab"
    ADD CONSTRAINT "Lab_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningEvent LearningEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."LearningEvent"
    ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MentorConversation MentorConversation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."MentorConversation"
    ADD CONSTRAINT "MentorConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectSubmission ProjectSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewComment ReviewComment_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."ReviewComment"
    ADD CONSTRAINT "ReviewComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public."CodeReviewFeedback"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillDiagnosis SkillDiagnosis_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."SkillDiagnosis"
    ADD CONSTRAINT "SkillDiagnosis_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProgress UserProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."UserProgress"
    ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWeekProgress UserWeekProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWeekProgress UserWeekProgress_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."UserWeekProgress"
    ADD CONSTRAINT "UserWeekProgress_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProjectSubmission WeekProjectSubmission_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."WeekProject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProjectSubmission WeekProjectSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."WeekProjectSubmission"
    ADD CONSTRAINT "WeekProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeekProject WeekProject_weekId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aicelerate
--

ALTER TABLE ONLY public."WeekProject"
    ADD CONSTRAINT "WeekProject_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES public."CurriculumWeek"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3iIkGguZd6f39AF0OWUpcDAHJv0WDgC6nrxKSalNOO74YbbZf2ciIkD39zED2kX

