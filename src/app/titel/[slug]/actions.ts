"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  appendStoredRating,
  appendStoredRatingAttempt,
  evaluateRatingAttempt,
  extractClientAddress,
  hasTrustedOrigin,
  hashClientAddress,
  listStoredRatingAttempts,
  ratingGuardConfig,
  titleRatingInputSchema,
} from "@/lib/ratings";
import { arePublicWritesEnabled } from "@/lib/runtime-config";

const recentRatingsCookieName = "nn_recent_ratings";

function redirectToRatingStatus(slug: string, status: string): never {
  redirect(`/titel/${slug}?rating=${status}#rating-feedback`);
}

function parseRecentRatingsCookie(value: string | undefined): Record<string, number> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Record<string, number>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] =>
        typeof entry[0] === "string" && typeof entry[1] === "number",
      ),
    );
  } catch {
    return {};
  }
}

function serializeRecentRatingsCookie(recentRatings: Record<string, number>): string {
  const now = Date.now();

  return JSON.stringify(
    Object.fromEntries(
      Object.entries(recentRatings).filter(
        ([, timestamp]) => now - timestamp < ratingGuardConfig.titleCooldownMs,
      ),
    ),
  );
}

export async function submitTitleRatingAction(slug: string, formData: FormData): Promise<void> {
  if (!arePublicWritesEnabled()) {
    redirectToRatingStatus(slug, "inactive");
  }

  const cookieStore = await cookies();
  const headersList = await headers();
  const recentRatings = parseRecentRatingsCookie(
    cookieStore.get(recentRatingsCookieName)?.value,
  );
  const lastSubmittedAt = recentRatings[slug];
  const now = Date.now();
  const ipHash = hashClientAddress(
    extractClientAddress({
      forwardedFor: headersList.get("x-forwarded-for"),
      realIp: headersList.get("x-real-ip"),
    }),
  );
  const hasRecentCookieCooldown =
    typeof lastSubmittedAt === "number" &&
    now - lastSubmittedAt < ratingGuardConfig.titleCooldownMs;

  const parsedRating = titleRatingInputSchema.safeParse({
    titleId: formData.get("titleId"),
    volumeLevel: formData.get("volumeLevel"),
    peakIntensity: formData.get("peakIntensity"),
    stimulusDensity: formData.get("stimulusDensity"),
    soothingEffect: formData.get("soothingEffect"),
  });

  if (!parsedRating.success || parsedRating.data.titleId !== slug) {
    redirectToRatingStatus(slug, "invalid");
  }

  try {
    const attemptStatus = evaluateRatingAttempt({
      titleId: slug,
      ipHash,
      recentAttempts: await listStoredRatingAttempts(),
      now,
      renderedAt: Number(formData.get("renderedAt") ?? NaN),
      hasTrustedOrigin: hasTrustedOrigin({
        origin: headersList.get("origin"),
        referer: headersList.get("referer"),
        host: headersList.get("host"),
        forwardedHost: headersList.get("x-forwarded-host"),
        secFetchSite: headersList.get("sec-fetch-site"),
      }),
      hasRecentCookieCooldown,
    });

    if (attemptStatus !== "accepted") {
      await appendStoredRatingAttempt({
        titleId: slug,
        ipHash,
        status: attemptStatus,
        submittedAt: new Date(now).toISOString(),
      });

      if (attemptStatus === "rejected_cooldown") {
        redirectToRatingStatus(slug, "cooldown");
      }

      if (attemptStatus === "rejected_too_fast") {
        redirectToRatingStatus(slug, "too-fast");
      }

      redirectToRatingStatus(slug, "limited");
    }

    await appendStoredRating(parsedRating.data);
    await appendStoredRatingAttempt({
      titleId: slug,
      ipHash,
      status: "accepted",
      submittedAt: new Date(now).toISOString(),
    });
  } catch {
    redirectToRatingStatus(slug, "error");
  }

  recentRatings[slug] = Date.now();
  cookieStore.set(recentRatingsCookieName, serializeRecentRatingsCookie(recentRatings), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ratingGuardConfig.titleCooldownMs / 1000),
  });

  redirectToRatingStatus(slug, "success");
}
