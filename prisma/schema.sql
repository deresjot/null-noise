CREATE TABLE IF NOT EXISTS "ExternalTitle" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "externalSource" TEXT NOT NULL,
  "externalSourceId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "originalTitle" TEXT,
  "kind" TEXT NOT NULL,
  "releaseYear" INTEGER,
  "synopsis" TEXT,
  "runtimeMinutes" INTEGER,
  "posterPath" TEXT,
  "languageCode" TEXT NOT NULL DEFAULT 'de',
  "profileNotes" TEXT NOT NULL,
  "profileBaseSourceType" TEXT NOT NULL,
  "profileBaseLastReviewedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "StimulusAggregate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "titleId" TEXT NOT NULL,
  "volumeLevel" INTEGER NOT NULL,
  "peakIntensity" INTEGER NOT NULL,
  "stimulusDensity" INTEGER NOT NULL,
  "soothingEffect" INTEGER NOT NULL,
  "confidenceLevel" TEXT NOT NULL,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "sourceType" TEXT NOT NULL,
  "lastReviewedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "StimulusAggregate_titleId_fkey"
    FOREIGN KEY ("titleId") REFERENCES "ExternalTitle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TitleRating" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "titleId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "volumeLevel" INTEGER NOT NULL,
  "peakIntensity" INTEGER NOT NULL,
  "stimulusDensity" INTEGER NOT NULL,
  "soothingEffect" INTEGER NOT NULL,
  "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TitleRating_titleId_fkey"
    FOREIGN KEY ("titleId") REFERENCES "ExternalTitle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ContentFlag" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "titleId" TEXT NOT NULL,
  "flag" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "ContentFlag_titleId_fkey"
    FOREIGN KEY ("titleId") REFERENCES "ExternalTitle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RatingAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "titleSlug" TEXT NOT NULL,
  "ipHash" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TitleImportAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceKey" TEXT NOT NULL,
  "ipHash" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalTitle_slug_key"
  ON "ExternalTitle"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "ExternalTitle_externalSource_externalSourceId_key"
  ON "ExternalTitle"("externalSource", "externalSourceId");
CREATE UNIQUE INDEX IF NOT EXISTS "StimulusAggregate_titleId_key"
  ON "StimulusAggregate"("titleId");
CREATE INDEX IF NOT EXISTS "StimulusAggregate_sourceType_lastReviewedAt_idx"
  ON "StimulusAggregate"("sourceType", "lastReviewedAt");
CREATE INDEX IF NOT EXISTS "TitleRating_titleId_submittedAt_idx"
  ON "TitleRating"("titleId", "submittedAt");
CREATE INDEX IF NOT EXISTS "TitleRating_sourceType_idx"
  ON "TitleRating"("sourceType");
CREATE UNIQUE INDEX IF NOT EXISTS "ContentFlag_titleId_flag_key"
  ON "ContentFlag"("titleId", "flag");
CREATE INDEX IF NOT EXISTS "RatingAttempt_titleSlug_submittedAt_idx"
  ON "RatingAttempt"("titleSlug", "submittedAt");
CREATE INDEX IF NOT EXISTS "RatingAttempt_ipHash_submittedAt_idx"
  ON "RatingAttempt"("ipHash", "submittedAt");
CREATE INDEX IF NOT EXISTS "TitleImportAttempt_sourceKey_submittedAt_idx"
  ON "TitleImportAttempt"("sourceKey", "submittedAt");
CREATE INDEX IF NOT EXISTS "TitleImportAttempt_ipHash_submittedAt_idx"
  ON "TitleImportAttempt"("ipHash", "submittedAt");
