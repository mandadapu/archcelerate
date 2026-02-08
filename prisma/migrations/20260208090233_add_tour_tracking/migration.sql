-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tourCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tourStartedAt" TIMESTAMP(3);
