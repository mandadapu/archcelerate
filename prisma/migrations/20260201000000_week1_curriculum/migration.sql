-- CreateTable
CREATE TABLE "CurriculumWeek" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objectives" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentPath" TEXT NOT NULL,
    "estimatedMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "exerciseNumber" INTEGER NOT NULL,
    "submissionData" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekProject" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requirements" JSONB NOT NULL,
    "successCriteria" JSONB NOT NULL,
    "estimatedHours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeekProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekProjectSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "githubUrl" TEXT,
    "deployedUrl" TEXT,
    "writeupContent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWeekProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "conceptsCompleted" INTEGER NOT NULL DEFAULT 0,
    "conceptsTotal" INTEGER NOT NULL,
    "labCompleted" BOOLEAN NOT NULL DEFAULT false,
    "projectCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserWeekProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumWeek_weekNumber_key" ON "CurriculumWeek"("weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_slug_key" ON "Concept"("slug");

-- CreateIndex
CREATE INDEX "Concept_weekId_orderIndex_idx" ON "Concept"("weekId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_weekId_orderIndex_key" ON "Concept"("weekId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_slug_key" ON "Lab"("slug");

-- CreateIndex
CREATE INDEX "Lab_weekId_idx" ON "Lab"("weekId");

-- CreateIndex
CREATE INDEX "LabSubmission_userId_labId_idx" ON "LabSubmission"("userId", "labId");

-- CreateIndex
CREATE UNIQUE INDEX "LabSubmission_userId_labId_exerciseNumber_key" ON "LabSubmission"("userId", "labId", "exerciseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeekProject_slug_key" ON "WeekProject"("slug");

-- CreateIndex
CREATE INDEX "WeekProject_weekId_idx" ON "WeekProject"("weekId");

-- CreateIndex
CREATE INDEX "WeekProjectSubmission_userId_projectId_idx" ON "WeekProjectSubmission"("userId", "projectId");

-- CreateIndex
CREATE INDEX "WeekProjectSubmission_userId_createdAt_idx" ON "WeekProjectSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserWeekProgress_userId_weekId_idx" ON "UserWeekProgress"("userId", "weekId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWeekProgress_userId_weekId_key" ON "UserWeekProgress"("userId", "weekId");

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "CurriculumWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "CurriculumWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSubmission" ADD CONSTRAINT "LabSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSubmission" ADD CONSTRAINT "LabSubmission_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekProject" ADD CONSTRAINT "WeekProject_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "CurriculumWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekProjectSubmission" ADD CONSTRAINT "WeekProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekProjectSubmission" ADD CONSTRAINT "WeekProjectSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WeekProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeekProgress" ADD CONSTRAINT "UserWeekProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeekProgress" ADD CONSTRAINT "UserWeekProgress_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "CurriculumWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
