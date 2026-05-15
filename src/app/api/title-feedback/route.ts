import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrGetStoredLocalTitleSeed } from "@/lib/local-titles";
import { getMetadataDetail } from "@/lib/metadata-spike";
import {
  appendStoredRating,
  appendStoredRatingAttempt,
  createQuickFeedbackRatingInput,
  evaluateRatingAttempt,
  extractClientAddress,
  hasTrustedOrigin,
  hashClientAddress,
  listStoredRatingAttempts,
  quickFeedbackChoiceSchema,
  ratingGuardConfig,
} from "@/lib/ratings";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import { getTitleBySlugState } from "@/lib/queries";

const recentRatingsCookieName = "nn_recent_ratings";

const baseFeedbackSchema = z.object({
  feedback: quickFeedbackChoiceSchema,
  returnPath: z.string().trim().max(260).catch("/suche"),
  renderedAt: z.coerce.number().optional(),
});

const localFeedbackSchema = baseFeedbackSchema.extend({
  mode: z.literal("local"),
  slug: z.string().trim().min(1),
});

const externalFeedbackSchema = baseFeedbackSchema.extend({
  mode: z.literal("external"),
  source: z.literal("tmdb"),
  mediaType: z.enum(["movie", "series"]),
  sourceId: z.coerce.number().int().positive(),
});

const feedbackSchema = z.union([localFeedbackSchema, externalFeedbackSchema]);

function buildFeedbackRedirect(request: NextRequest, returnPath: string, status: string): URL {
  const fallbackUrl = new URL("/suche", request.url);

  if (returnPath.startsWith("/") && !returnPath.startsWith("//")) {
    const url = new URL(returnPath, request.url);
    url.searchParams.set("feedback", status);
    url.hash = "reading-feedback";
    return url;
  }

  fallbackUrl.searchParams.set("feedback", status);
  fallbackUrl.hash = "reading-feedback";
  return fallbackUrl;
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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = feedbackSchema.safeParse({
    mode: formData.get("mode"),
    slug: formData.get("slug"),
    source: formData.get("source"),
    mediaType: formData.get("mediaType"),
    sourceId: formData.get("sourceId"),
    feedback: formData.get("feedback"),
    returnPath: formData.get("returnPath"),
    renderedAt: formData.get("renderedAt"),
  });

  const returnPath =
    typeof formData.get("returnPath") === "string" ? String(formData.get("returnPath")) : "/suche";

  if (!parsed.success) {
    return NextResponse.redirect(buildFeedbackRedirect(request, returnPath, "invalid"), 303);
  }

  if (!arePublicWritesEnabled()) {
    return NextResponse.redirect(
      buildFeedbackRedirect(request, parsed.data.returnPath, "inactive"),
      303,
    );
  }

  let slug = parsed.data.mode === "local" ? parsed.data.slug : null;
  let revalidateExternalPath: string | null = null;

  if (parsed.data.mode === "external") {
    const detailState = await getMetadataDetail({
      source: parsed.data.source,
      mediaType: parsed.data.mediaType,
      externalId: parsed.data.sourceId,
    });

    if (detailState.kind !== "success") {
      return NextResponse.redirect(
        buildFeedbackRedirect(request, parsed.data.returnPath, "error"),
        303,
      );
    }

    try {
      const localSeedState = await createOrGetStoredLocalTitleSeed(detailState.item);
      slug = localSeedState.seed.external.slug;
      revalidateExternalPath = `/spike/metadaten/${parsed.data.mediaType}/${parsed.data.sourceId}`;
    } catch {
      return NextResponse.redirect(
        buildFeedbackRedirect(request, parsed.data.returnPath, "error"),
        303,
      );
    }
  }

  if (!slug) {
    return NextResponse.redirect(buildFeedbackRedirect(request, parsed.data.returnPath, "invalid"), 303);
  }

  const { data: title } = await getTitleBySlugState(slug);

  if (!title) {
    return NextResponse.redirect(buildFeedbackRedirect(request, parsed.data.returnPath, "error"), 303);
  }

  const recentRatings = parseRecentRatingsCookie(request.cookies.get(recentRatingsCookieName)?.value);
  const now = Date.now();
  const lastSubmittedAt = recentRatings[slug];
  const ipHash = hashClientAddress(
    extractClientAddress({
      forwardedFor: request.headers.get("x-forwarded-for"),
      realIp: request.headers.get("x-real-ip"),
    }),
  );
  const hasRecentCookieCooldown =
    typeof lastSubmittedAt === "number" &&
    now - lastSubmittedAt < ratingGuardConfig.titleCooldownMs;

  try {
    const attemptStatus = evaluateRatingAttempt({
      titleId: slug,
      ipHash,
      recentAttempts: await listStoredRatingAttempts(),
      now,
      renderedAt: parsed.data.renderedAt,
      hasTrustedOrigin: hasTrustedOrigin({
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
        host: request.headers.get("host"),
        forwardedHost: request.headers.get("x-forwarded-host"),
        secFetchSite: request.headers.get("sec-fetch-site"),
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

      const status =
        attemptStatus === "rejected_cooldown"
          ? "cooldown"
          : attemptStatus === "rejected_too_fast"
            ? "too-fast"
            : "limited";

      return NextResponse.redirect(buildFeedbackRedirect(request, parsed.data.returnPath, status), 303);
    }

    await appendStoredRating(
      createQuickFeedbackRatingInput({
        choice: parsed.data.feedback,
        titleId: slug,
        profile: title.stimulusProfile,
        soothingEffect: title.soothingEffect,
      }),
    );
    await appendStoredRatingAttempt({
      titleId: slug,
      ipHash,
      status: "accepted",
      submittedAt: new Date(now).toISOString(),
    });
  } catch {
    return NextResponse.redirect(buildFeedbackRedirect(request, parsed.data.returnPath, "error"), 303);
  }

  recentRatings[slug] = now;
  revalidatePath("/suche");
  revalidatePath(`/titel/${slug}`);
  if (revalidateExternalPath) {
    revalidatePath(revalidateExternalPath);
  }

  const response = NextResponse.redirect(
    buildFeedbackRedirect(request, parsed.data.returnPath, "success"),
    303,
  );
  response.cookies.set(recentRatingsCookieName, serializeRecentRatingsCookie(recentRatings), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ratingGuardConfig.titleCooldownMs / 1000),
  });
  return response;
}
