import "server-only";

import { z } from "zod";

const LETTERBOXD_API_BASE_URL = "https://api.letterboxd.com/api/v0";

export type LetterboxdFilmState =
  | {
      kind: "disabled";
      source: "letterboxd";
      websiteUrl: string;
      message: string;
    }
  | {
      kind: "error";
      source: "letterboxd";
      websiteUrl: string;
      message: string;
    }
  | {
      kind: "not_found";
      source: "letterboxd";
      websiteUrl: string;
      message: string;
    }
  | {
      kind: "success";
      source: "letterboxd";
      websiteUrl: string;
      message: string;
      filmName: string | null;
      averageRating: number | null;
      top250Position: number | null;
    };

type LetterboxdDependencies = {
  clientId?: string;
  clientSecret?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

const rawLetterboxdTokenSchema = z.object({
  access_token: z.string().min(1),
});

const rawLetterboxdFilmSchema = z.object({
  id: z.string().min(1),
  name: z.string().nullish(),
  rating: z.number().nullish(),
  top250Position: z.number().int().nullish(),
});

const DEFAULT_TIMEOUT_MS = 4_000;

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function getLetterboxdClientId(value?: string): string | null {
  return normalizeText(value ?? process.env.LETTERBOXD_CLIENT_ID);
}

function getLetterboxdClientSecret(value?: string): string | null {
  return normalizeText(value ?? process.env.LETTERBOXD_CLIENT_SECRET);
}

export function getLetterboxdTmdbWebsiteUrl(tmdbId: number): string {
  return `https://letterboxd.com/tmdb/${tmdbId}`;
}

async function fetchLetterboxdAccessToken(
  dependencies: LetterboxdDependencies = {},
): Promise<string | null> {
  const clientId = getLetterboxdClientId(dependencies.clientId);
  const clientSecret = getLetterboxdClientSecret(dependencies.clientSecret);

  if (!clientId || !clientSecret) {
    return null;
  }

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetchImpl(`${LETTERBOXD_API_BASE_URL}/auth/token`, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error("LETTERBOXD_AUTH_FAILED");
  }

  const payload = await response.json().catch(() => null);
  const parsed = rawLetterboxdTokenSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("LETTERBOXD_INVALID_TOKEN_RESPONSE");
  }

  return parsed.data.access_token;
}

export async function getLetterboxdFilmByTmdbId(
  tmdbId: number,
  dependencies: LetterboxdDependencies = {},
): Promise<LetterboxdFilmState> {
  const websiteUrl = getLetterboxdTmdbWebsiteUrl(tmdbId);

  try {
    const accessToken = await fetchLetterboxdAccessToken(dependencies);

    if (!accessToken) {
      return {
        kind: "disabled",
        source: "letterboxd",
        websiteUrl,
        message: "Hier hängt Letterboxd gerade nur als direkter Weiterweg dran.",
      };
    }

    const fetchImpl = dependencies.fetchImpl ?? fetch;
    const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const response = await fetchImpl(`${LETTERBOXD_API_BASE_URL}/film/tmdb:${tmdbId}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status === 404) {
      return {
        kind: "not_found",
        source: "letterboxd",
        websiteUrl,
        message: "Für diesen Film liegt bei Letterboxd gerade nichts Greifbares vor.",
      };
    }

    if (!response.ok) {
      return {
        kind: "error",
        source: "letterboxd",
        websiteUrl,
        message: "Letterboxd liefert gerade keinen sauberen Zusatzblick.",
      };
    }

    const payload = await response.json().catch(() => null);
    const parsed = rawLetterboxdFilmSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        kind: "error",
        source: "letterboxd",
        websiteUrl,
        message: "Letterboxd liefert hier gerade keine lesbaren Filmdaten.",
      };
    }

    return {
      kind: "success",
      source: "letterboxd",
      websiteUrl,
      message: "Zusatzblick von Letterboxd.",
      filmName: normalizeText(parsed.data.name),
      averageRating: parsed.data.rating ?? null,
      top250Position: parsed.data.top250Position ?? null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        kind: "error",
        source: "letterboxd",
        websiteUrl,
        message: "Letterboxd antwortet gerade zu langsam.",
      };
    }

    if (
      error instanceof Error &&
      (error.message === "LETTERBOXD_AUTH_FAILED" ||
        error.message === "LETTERBOXD_INVALID_TOKEN_RESPONSE")
    ) {
      return {
        kind: "error",
        source: "letterboxd",
        websiteUrl,
        message: "Letterboxd ist hier gerade nicht sauber erreichbar.",
      };
    }

    return {
      kind: "error",
      source: "letterboxd",
      websiteUrl,
      message: "Letterboxd konnte gerade nicht erreicht werden.",
    };
  }
}
