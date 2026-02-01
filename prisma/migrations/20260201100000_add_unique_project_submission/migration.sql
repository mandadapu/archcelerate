-- DropIndex
DROP INDEX IF EXISTS "WeekProjectSubmission_userId_projectId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "WeekProjectSubmission_userId_projectId_key" ON "WeekProjectSubmission"("userId", "projectId");
