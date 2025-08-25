-- CreateTable
CREATE TABLE "public"."Problem" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleSlug" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "personalDifficulty" INTEGER,
    "notes" TEXT,
    "solution" TEXT,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_titleSlug_key" ON "public"."Problem"("titleSlug");

-- CreateIndex
CREATE INDEX "Problem_titleSlug_idx" ON "public"."Problem"("titleSlug");

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "public"."Problem"("difficulty");

-- CreateIndex
CREATE INDEX "Submission_nextReviewDate_idx" ON "public"."Submission"("nextReviewDate");

-- CreateIndex
CREATE INDEX "Submission_solvedAt_idx" ON "public"."Submission"("solvedAt");

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
