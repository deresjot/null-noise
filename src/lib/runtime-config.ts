function parseBooleanEnv(value: string | undefined): boolean | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function normalizeSiteUrlCandidate(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  const host = trimmed.replace(/\/+$/, "");
  const isLocalHost =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0");

  return `${isLocalHost ? "http" : "https"}://${host}`;
}

export function getSiteUrl(): string {
  return (
    normalizeSiteUrlCandidate(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrlCandidate(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrlCandidate(process.env.VERCEL_URL) ??
    "http://localhost:3000"
  );
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function arePublicWritesEnabled(): boolean {
  const explicitSetting = parseBooleanEnv(process.env.NULL_NOISE_ENABLE_WRITES);

  if (explicitSetting !== null) {
    return explicitSetting;
  }

  return process.env.NODE_ENV !== "production";
}

export function getBetaNoteText(): string {
  if (arePublicWritesEnabled()) {
    return "Beta. Benutzbar, aber noch nicht fertig.";
  }

  return "Beta. Diese Instanz bleibt erst mal lesend. Suchen und Lesen gehen schon, Schreiben noch nicht.";
}
