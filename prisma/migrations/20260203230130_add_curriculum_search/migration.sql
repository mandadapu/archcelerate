-- CreateTable
CREATE TABLE "CurriculumContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "filePath" TEXT,
    "weekNumber" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "lastIndexed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumChunk" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "chunkIndex" INTEGER NOT NULL,
    "heading" TEXT,
    "codeBlock" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumContent_userId_slug_key" ON "CurriculumContent"("userId", "slug");

-- CreateIndex
CREATE INDEX "CurriculumContent_userId_idx" ON "CurriculumContent"("userId");

-- CreateIndex
CREATE INDEX "CurriculumContent_weekNumber_idx" ON "CurriculumContent"("weekNumber");

-- CreateIndex
CREATE INDEX "CurriculumContent_type_idx" ON "CurriculumContent"("type");

-- CreateIndex
CREATE INDEX "CurriculumContent_isPublic_idx" ON "CurriculumContent"("isPublic");

-- CreateIndex
CREATE INDEX "CurriculumContent_lastIndexed_idx" ON "CurriculumContent"("lastIndexed");

-- CreateIndex
CREATE INDEX "CurriculumChunk_contentId_idx" ON "CurriculumChunk"("contentId");

-- AddForeignKey
ALTER TABLE "CurriculumContent" ADD CONSTRAINT "CurriculumContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumChunk" ADD CONSTRAINT "CurriculumChunk_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "CurriculumContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
