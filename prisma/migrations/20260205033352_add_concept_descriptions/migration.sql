-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "ConceptQuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptSlug" TEXT NOT NULL,
    "questionsData" JSONB NOT NULL,
    "answersData" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConceptQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConceptQuizAttempt_userId_conceptSlug_idx" ON "ConceptQuizAttempt"("userId", "conceptSlug");

-- CreateIndex
CREATE INDEX "ConceptQuizAttempt_userId_attemptedAt_idx" ON "ConceptQuizAttempt"("userId", "attemptedAt");

-- AddForeignKey
ALTER TABLE "ConceptQuizAttempt" ADD CONSTRAINT "ConceptQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
