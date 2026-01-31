-- CreateTable
CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectNumber" INTEGER NOT NULL,
    "githubRepoUrl" TEXT NOT NULL,
    "deployedUrl" TEXT,
    "submissionData" JSONB,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "overallScore" DOUBLE PRECISION,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReviewFeedback" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "functionalityScore" DOUBLE PRECISION,
    "codeQualityScore" DOUBLE PRECISION,
    "aiBestPracticesScore" DOUBLE PRECISION,
    "architectureScore" DOUBLE PRECISION,
    "suggestions" JSONB,
    "goodPractices" JSONB,
    "criticalIssues" JSONB,
    "improvementsNeeded" JSONB,
    "reviewIteration" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeReviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "severity" TEXT NOT NULL,
    "category" TEXT,
    "message" TEXT NOT NULL,
    "suggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectSubmission_userId_projectNumber_idx" ON "ProjectSubmission"("userId", "projectNumber");

-- CreateIndex
CREATE INDEX "ProjectSubmission_userId_createdAt_idx" ON "ProjectSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeReviewFeedback_submissionId_idx" ON "CodeReviewFeedback"("submissionId");

-- CreateIndex
CREATE INDEX "ReviewComment_feedbackId_idx" ON "ReviewComment"("feedbackId");

-- AddForeignKey
ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewFeedback" ADD CONSTRAINT "CodeReviewFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "CodeReviewFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
