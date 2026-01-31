-- AlterTable
ALTER TABLE "User" ADD COLUMN     "diagnosisCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SkillDiagnosis" (
    "userId" TEXT NOT NULL,
    "quizAnswers" JSONB NOT NULL,
    "skillScores" JSONB NOT NULL,
    "recommendedPath" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillDiagnosis_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "SkillDiagnosis" ADD CONSTRAINT "SkillDiagnosis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
