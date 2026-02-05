-- CreateTable
CREATE TABLE "SkillDomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxTotalPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityDomainMapping" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityDomainMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPoints" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proficiencyLevel" TEXT,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "scorePercentage" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserActivityScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillDomain_slug_key" ON "SkillDomain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SkillDomain_orderIndex_key" ON "SkillDomain"("orderIndex");

-- CreateIndex
CREATE INDEX "SkillDomain_orderIndex_idx" ON "SkillDomain"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Activity_weekNumber_activityType_idx" ON "Activity"("weekNumber", "activityType");

-- CreateIndex
CREATE INDEX "ActivityDomainMapping_activityId_idx" ON "ActivityDomainMapping"("activityId");

-- CreateIndex
CREATE INDEX "ActivityDomainMapping_domainId_idx" ON "ActivityDomainMapping"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDomainMapping_activityId_domainId_key" ON "ActivityDomainMapping"("activityId", "domainId");

-- CreateIndex
CREATE INDEX "UserSkillScore_userId_idx" ON "UserSkillScore"("userId");

-- CreateIndex
CREATE INDEX "UserSkillScore_domainId_idx" ON "UserSkillScore"("domainId");

-- CreateIndex
CREATE INDEX "UserSkillScore_proficiencyLevel_idx" ON "UserSkillScore"("proficiencyLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillScore_userId_domainId_key" ON "UserSkillScore"("userId", "domainId");

-- CreateIndex
CREATE INDEX "UserActivityScore_userId_weekNumber_idx" ON "UserActivityScore"("userId", "weekNumber");

-- CreateIndex
CREATE INDEX "UserActivityScore_userId_activityType_idx" ON "UserActivityScore"("userId", "activityType");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivityScore_userId_activityId_key" ON "UserActivityScore"("userId", "activityId");

-- AddForeignKey
ALTER TABLE "ActivityDomainMapping" ADD CONSTRAINT "ActivityDomainMapping_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDomainMapping" ADD CONSTRAINT "ActivityDomainMapping_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillScore" ADD CONSTRAINT "UserSkillScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillScore" ADD CONSTRAINT "UserSkillScore_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityScore" ADD CONSTRAINT "UserActivityScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
