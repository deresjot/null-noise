import { NextResponse } from "next/server";

import { getTmdbPosterUrl } from "@/lib/metadata-spike";

type PosterRouteProps = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(_request: Request, { params }: PosterRouteProps) {
  const resolvedParams = await params;
  const joinedPath = resolvedParams.path?.join("/");

  if (!joinedPath || joinedPath.includes("..")) {
    return new NextResponse("ungueltiger_poster_pfad", { status: 400 });
  }

  const upstreamUrl = getTmdbPosterUrl(joinedPath);

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
