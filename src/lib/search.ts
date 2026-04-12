import type { SearchFilters, TitleRecord, ToneFilter } from "@/lib/types";

const toneValues: ToneFilter[] = ["all", "calm", "balanced", "intense"];

function isToneFilter(value: string): value is ToneFilter {
  return toneValues.includes(value as ToneFilter);
}

function isKindFilter(value: string): value is SearchFilters["kind"] {
  return value === "all" || value === "movie" || value === "series";
}

function takeFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function isTruthy(value: string): boolean {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
    Array.from({ length: b.length + 1 }, (_, columnIndex) => {
      if (rowIndex === 0) {
        return columnIndex;
      }

      if (columnIndex === 0) {
        return rowIndex;
      }

      return 0;
    }),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function getAllowedDistance(token: string): number {
  if (token.length <= 4) {
    return 1;
  }

  if (token.length <= 8) {
    return 2;
  }

  return 3;
}

export function getTextMatchScore(
  primaryTexts: Array<string | null | undefined>,
  secondaryTexts: Array<string | null | undefined>,
  q: string,
): number {
  if (!q) {
    return 0;
  }

  const normalizedQuery = normalizeSearchText(q);

  if (!normalizedQuery) {
    return 0;
  }

  const normalizedPrimaryTexts = primaryTexts
    .map((value) => normalizeSearchText(value ?? ""))
    .filter(Boolean);
  const normalizedSecondaryTexts = secondaryTexts
    .map((value) => normalizeSearchText(value ?? ""))
    .filter(Boolean);
  const primaryHaystack = normalizedPrimaryTexts.join(" ");
  const secondaryHaystack = normalizedSecondaryTexts.join(" ");
  const haystack = `${primaryHaystack} ${secondaryHaystack}`.trim();

  if (normalizedPrimaryTexts.some((value) => value === normalizedQuery)) {
    return 120;
  }

  if (normalizedPrimaryTexts.some((value) => value.startsWith(normalizedQuery))) {
    return 100;
  }

  if (haystack.includes(normalizedQuery)) {
    return 84;
  }

  const queryTokens = tokenize(normalizedQuery);
  const candidateTokens = tokenize(`${primaryHaystack} ${secondaryHaystack}`);

  if (!queryTokens.length || !candidateTokens.length) {
    return 0;
  }

  let score = 0;

  for (const queryToken of queryTokens) {
    let tokenScore = 0;

    for (const candidateToken of candidateTokens) {
      if (candidateToken === queryToken) {
        tokenScore = Math.max(tokenScore, 60);
        continue;
      }

      if (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken)) {
        tokenScore = Math.max(tokenScore, 45);
        continue;
      }

      const distance = levenshteinDistance(queryToken, candidateToken);

      if (distance <= getAllowedDistance(queryToken)) {
        tokenScore = Math.max(tokenScore, 34 - distance * 8);
      }
    }

    if (!tokenScore) {
      return 0;
    }

    score += tokenScore;
  }

  return score;
}

function getQueryMatchScore(title: TitleRecord, q: string): number {
  return getTextMatchScore(
    [title.external.title, title.external.originalTitle],
    [title.external.synopsis],
    q,
  );
}

export function parseSearchFilters(
  searchParams: Record<string, string | string[] | undefined> = {},
): SearchFilters {
  const q = takeFirst(searchParams.q).trim().slice(0, 80);
  const toneValue = takeFirst(searchParams.tone);
  const kindValue = takeFirst(searchParams.kind);

  return {
    q,
    tone: isToneFilter(toneValue) ? toneValue : "all",
    kind: isKindFilter(kindValue) ? kindValue : "all",
    avoidPeaks: isTruthy(takeFirst(searchParams.avoidPeaks)),
    avoidDensity:
      isTruthy(takeFirst(searchParams.avoidDensity)) ||
      isTruthy(takeFirst(searchParams.avoidShouting)),
  };
}

export function hasSensoryFilters(filters: SearchFilters): boolean {
  return filters.tone !== "all" || filters.avoidPeaks || filters.avoidDensity;
}

export function matchesAvoidanceFilters(
  profile: Pick<TitleRecord["stimulusProfile"], "peakIntensity" | "stimulusDensity">,
  filters: Pick<SearchFilters, "avoidPeaks" | "avoidDensity">,
): boolean {
  if (filters.avoidPeaks && profile.peakIntensity >= 3) {
    return false;
  }

  if (filters.avoidDensity && profile.stimulusDensity >= 3) {
    return false;
  }

  return true;
}

export function getToneLabel(title: TitleRecord): "ruhig" | "ausgeglichen" | "intensiv" {
  const value = title.stimulusProfile.stimulusDensity;

  if (value <= 1) {
    return "ruhig";
  }

  if (value === 2) {
    return "ausgeglichen";
  }

  return "intensiv";
}

function matchesQuery(title: TitleRecord, q: string): boolean {
  return !q || getQueryMatchScore(title, q) > 0;
}

function matchesTone(title: TitleRecord, tone: ToneFilter): boolean {
  const load = title.stimulusProfile.stimulusDensity;

  if (tone === "all") {
    return true;
  }

  if (tone === "calm") {
    return load <= 1;
  }

  if (tone === "balanced") {
    return load === 2;
  }

  return load >= 3;
}

function sortByQueryRelevance(a: TitleRecord, b: TitleRecord, q: string): number {
  if (!q) {
    return a.external.title.localeCompare(b.external.title, "de");
  }

  const aScore = getQueryMatchScore(a, q);
  const bScore = getQueryMatchScore(b, q);

  if (aScore !== bScore) {
    return bScore - aScore;
  }

  return a.external.title.localeCompare(b.external.title, "de");
}

export function filterTitles(titles: TitleRecord[], filters: SearchFilters): TitleRecord[] {
  return titles
    .filter((title) => matchesQuery(title, filters.q))
    .filter((title) => matchesTone(title, filters.tone))
    .filter((title) => filters.kind === "all" || title.external.kind === filters.kind)
    .filter((title) => matchesAvoidanceFilters(title.stimulusProfile, filters))
    .sort((a, b) => sortByQueryRelevance(a, b, filters.q));
}
