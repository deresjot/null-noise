import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  appendStoredTitleImportAttempt,
  createOrGetStoredLocalTitleSeed,
  createTitleExternalLookupKey,
  evaluateTitleImportAttempt,
  findStoredLocalTitleSeedByExternal,
  listStoredLocalTitleSeeds,
  listStoredTitleImportAttempts,
} from "@/lib/local-titles";
import { getMetadataDetail } from "@/lib/metadata-spike";
import { extractClientAddress, hasTrustedOrigin, hashClientAddress } from "@/lib/ratings";
import { arePublicWritesEnabled } from "@/lib/runtime-config";

const createLocalTitleSchema = z.object({
  source: z.literal("tmdb"),
  mediaType: z.enum(["movie", "series"]),
  sourceId: z.coerce.number().int().positive(),
  q: z.string().trim().max(80).catch(""),
});

function buildSearchRedirect(request: NextRequest, query: string, status: string): URL {
  const url = new URL("/suche", request.url);

  if (query) {
    url.searchParams.set("q", query);
  }

  url.searchParams.set("import", status);
  return url;
}

function buildDetailRedirect(request: NextRequest, slug: string, status: string): URL {
  const url = new URL(`/titel/${slug}`, request.url);
  url.searchParams.set("import", status);
  return url;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = createLocalTitleSchema.safeParse({
    source: formData.get("source"),
    mediaType: formData.get("mediaType"),
    sourceId: formData.get("sourceId"),
    q: formData.get("q"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(buildSearchRedirect(request, "", "unavailable"), 303);
  }

  const { mediaType, q, sourceId } = parsed.data;
  const sourceKey = createTitleExternalLookupKey("tmdb", sourceId);
  const ipHash = hashClientAddress(
    extractClientAddress({
      forwardedFor: request.headers.get("x-forwarded-for"),
      realIp: request.headers.get("x-real-ip"),
    }),
  );

  const existingSeed = findStoredLocalTitleSeedByExternal(
    await listStoredLocalTitleSeeds(),
    "tmdb",
    sourceId,
  );

  if (existingSeed) {
    return NextResponse.redirect(
      buildDetailRedirect(request, existingSeed.external.slug, "exists"),
      303,
    );
  }

  if (!arePublicWritesEnabled()) {
    return NextResponse.redirect(buildSearchRedirect(request, q, "inactive"), 303);
  }

  const attemptStatus = evaluateTitleImportAttempt({
    sourceKey,
    ipHash,
    recentAttempts: await listStoredTitleImportAttempts(),
    hasTrustedOrigin: hasTrustedOrigin({
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      secFetchSite: request.headers.get("sec-fetch-site"),
    }),
  });

  if (attemptStatus !== "accepted") {
    await appendStoredTitleImportAttempt({
      sourceKey,
      ipHash,
      status: attemptStatus,
    });

    return NextResponse.redirect(
      buildSearchRedirect(
        request,
        q,
        attemptStatus === "rejected_rate_limited" ? "limited" : "unavailable",
      ),
      303,
    );
  }

  const detailState = await getMetadataDetail({
    source: "tmdb",
    mediaType,
    externalId: sourceId,
  });

  if (detailState.kind !== "success") {
    return NextResponse.redirect(buildSearchRedirect(request, q, "unavailable"), 303);
  }

  const { seed, created } = await createOrGetStoredLocalTitleSeed(detailState.item);
  await appendStoredTitleImportAttempt({
    sourceKey,
    ipHash,
    status: "accepted",
  });

  revalidatePath("/suche");
  revalidatePath(`/titel/${seed.external.slug}`);
  revalidatePath("/api/titles");
  revalidatePath(`/api/titles/${seed.external.slug}`);

  return NextResponse.redirect(
    buildDetailRedirect(request, seed.external.slug, created ? "created" : "exists"),
    303,
  );
}
