import { NextResponse } from "next/server";

import { getTmdbPosterUrl, tmdbPosterSizes, type TmdbPosterSize } from "@/lib/metadata-spike";

type PosterRouteProps = {
  params: Promise<{ path?: string[] }>;
};

function resolvePosterRequest(pathSegments: string[]): {
  posterPath: string;
  size: TmdbPosterSize;
} | null {
  if (!pathSegments.length) {
    return null;
  }

  const firstSegment = pathSegments[0];
  const hasExplicitSize = tmdbPosterSizes.includes(firstSegment as TmdbPosterSize);
  const size = hasExplicitSize ? (firstSegment as TmdbPosterSize) : "w342";
  const posterSegments = hasExplicitSize ? pathSegments.slice(1) : pathSegments;
  const joinedPath = posterSegments.join("/");

  if (!joinedPath || joinedPath.includes("..")) {
    return null;
  }

  return {
    posterPath: joinedPath,
    size,
  };
}

export async function GET(_request: Request, { params }: PosterRouteProps) {
  const resolvedParams = await params;
  const resolvedRequest = resolvePosterRequest(resolvedParams.path ?? []);

  if (!resolvedRequest) {
    return new NextResponse("ungueltiger_poster_pfad", { status: 400 });
  }

  const upstreamUrl = getTmdbPosterUrl(resolvedRequest.posterPath, resolvedRequest.size);

  if (!upstreamUrl) {
    return new NextResponse("ungueltiger_poster_pfad", { status: 400 });
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!upstreamResponse.ok) {
    return new NextResponse("poster_nicht_verfuegbar", { status: upstreamResponse.status });
  }

  return new NextResponse(upstreamResponse.body, {
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
