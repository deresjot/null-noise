import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createTmdbSearchDiagnostics,
  getPreferredMetadataSpikeSource,
  searchMetadata,
  searchTmdbMetadata,
} from "@/lib/metadata-spike";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
  diagnostics: z
    .enum(["0", "1", "false", "true"])
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

function getStatusCode(kind: Awaited<ReturnType<typeof searchMetadata>>["kind"], reason?: string) {
  if (kind === "success" || kind === "empty") {
    return 200;
  }

  if (kind === "disabled") {
    return 503;
  }

  if (kind === "error" && reason === "timeout") {
    return 504;
  }

  if (kind === "error" && reason === "invalid_query") {
    return 400;
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
        message: "Bitte eine Suchanfrage mit mindestens zwei Zeichen übergeben.",
      },
      { status: 400 },
    );
  }

  const diagnosticsRequested = process.env.NODE_ENV !== "production" && parsed.data.diagnostics;
  const preferredSource = getPreferredMetadataSpikeSource();
  const tmdbDiagnostics =
    diagnosticsRequested && preferredSource === "tmdb" ? createTmdbSearchDiagnostics() : null;

  const result =
    tmdbDiagnostics !== null
      ? await searchTmdbMetadata(parsed.data.q, {
          source: "tmdb",
          tmdbDiagnostics,
        })
      : await searchMetadata(parsed.data.q);

  return NextResponse.json(
    diagnosticsRequested
      ? {
          ...result,
          diagnostics: tmdbDiagnostics,
        }
      : result,
    {
    status: getStatusCode(result.kind, result.kind === "error" ? result.reason : undefined),
    },
  );
}
