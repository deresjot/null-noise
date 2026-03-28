import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { searchTmdbMetadata } from "@/lib/metadata-spike";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
});

function getStatusCode(result: Awaited<ReturnType<typeof searchTmdbMetadata>>): number {
  if (result.kind === "success" || result.kind === "empty") {
    return 200;
  }

  if (result.kind === "disabled") {
    return 503;
  }

  if (result.kind === "error" && result.reason === "invalid_query") {
    return 400;
  }

  if (result.kind === "error" && result.reason === "timeout") {
    return 504;
  }

  return 502;
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        kind: "error",
        reason: "invalid_query",
        message: "Bitte mindestens zwei Zeichen eingeben.",
        items: [],
      },
      { status: 400 },
    );
  }

  const result = await searchTmdbMetadata(parsed.data.q, {
    source: "tmdb",
  });

  return NextResponse.json(
    result.kind === "success"
      ? {
          kind: "success",
          message: result.message,
          items: result.items.slice(0, 6).map((item) => ({
            externalId: item.externalId,
            title: item.title,
            mediaType: item.mediaType,
            releaseYear: item.releaseYear,
            source: item.externalSource,
          })),
        }
      : {
          kind: result.kind,
          message: result.message,
          items: [],
        },
    {
      status: getStatusCode(result),
    },
  );
}
