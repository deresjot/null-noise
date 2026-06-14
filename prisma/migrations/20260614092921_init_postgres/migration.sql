-- CreateEnum
CREATE TYPE "TitleKind" AS ENUM ('movie', 'series');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('niedrig', 'mittel', 'hoch');

-- CreateEnum
CREATE TYPE "AggregateSourceType" AS ENUM ('editorial_seed', 'provisional_seed', 'metadata_inference', 'community_median', 'mixed');

-- CreateEnum
CREATE TYPE "RatingSourceType" AS ENUM ('seed', 'anonymous');

-- CreateEnum
CREATE TYPE "RatingAttemptStatus" AS ENUM ('accepted', 'rejected_rate_limited', 'rejected_cooldown', 'rejected_too_fast', 'suspicious');

-- CreateEnum
CREATE TYPE "TitleImportAttemptStatus" AS ENUM ('accepted', 'rejected_rate_limited', 'suspicious');

-- CreateTable
CREATE TABLE "ExternalTitle" (
    "id" TEXT NOT NULL,
    "externalSource" TEXT NOT NULL,
    "externalSourceId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "kind" "TitleKind" NOT NULL,
    "releaseYear" INTEGER,
    "synopsis" TEXT,
    "runtimeMinutes" INTEGER,
    "posterPath" TEXT,
    "languageCode" TEXT NOT NULL DEFAULT 'de',
    "profileNotes" TEXT NOT NULL,
    "profileBaseSourceType" "AggregateSourceType" NOT NULL,
    "profileBaseLastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StimulusAggregate" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "volumeLevel" INTEGER NOT NULL,
    "peakIntensity" INTEGER NOT NULL,
    "stimulusDensity" INTEGER NOT NULL,
    "soothingEffect" INTEGER NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "AggregateSourceType" NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StimulusAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitleRating" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "sourceType" "RatingSourceType" NOT NULL,
    "volumeLevel" INTEGER NOT NULL,
    "peakIntensity" INTEGER NOT NULL,
    "stimulusDensity" INTEGER NOT NULL,
    "soothingEffect" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitleRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFlag" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ContentFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingAttempt" (
    "id" TEXT NOT NULL,
    "titleSlug" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "status" "RatingAttemptStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitleImportAttempt" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "status" "TitleImportAttemptStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitleImportAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalTitle_slug_key" ON "ExternalTitle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalTitle_externalSource_externalSourceId_key" ON "ExternalTitle"("externalSource", "externalSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "StimulusAggregate_titleId_key" ON "StimulusAggregate"("titleId");

-- CreateIndex
CREATE INDEX "StimulusAggregate_sourceType_lastReviewedAt_idx" ON "StimulusAggregate"("sourceType", "lastReviewedAt");

-- CreateIndex
CREATE INDEX "TitleRating_titleId_submittedAt_idx" ON "TitleRating"("titleId", "submittedAt");

-- CreateIndex
CREATE INDEX "TitleRating_sourceType_idx" ON "TitleRating"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFlag_titleId_flag_key" ON "ContentFlag"("titleId", "flag");

-- CreateIndex
CREATE INDEX "RatingAttempt_titleSlug_submittedAt_idx" ON "RatingAttempt"("titleSlug", "submittedAt");

-- CreateIndex
CREATE INDEX "RatingAttempt_ipHash_submittedAt_idx" ON "RatingAttempt"("ipHash", "submittedAt");

-- CreateIndex
CREATE INDEX "TitleImportAttempt_sourceKey_submittedAt_idx" ON "TitleImportAttempt"("sourceKey", "submittedAt");

-- CreateIndex
CREATE INDEX "TitleImportAttempt_ipHash_submittedAt_idx" ON "TitleImportAttempt"("ipHash", "submittedAt");

-- AddForeignKey
ALTER TABLE "StimulusAggregate" ADD CONSTRAINT "StimulusAggregate_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "ExternalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleRating" ADD CONSTRAINT "TitleRating_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "ExternalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "ExternalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
