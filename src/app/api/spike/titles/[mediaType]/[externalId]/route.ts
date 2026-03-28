import { NextResponse } from "next/server";

import { getMetadataDetail, parseSpikeDetailParams } from "@/lib/metadata-spike";

type RouteContext = {
  params: Promise<{ mediaType: string; externalId: string }>;
};

function getStatusCode(kind: "disabled" | "error" | "success", reason?: string) {
  if (kind === "success") {
    return 200;
  }

  if (kind === "disabled") {
    return 503;
  }

  if (reason === "not_found") {
    return 404;
  }

  if (reason === "timeout") {
    return 504;
  }

  return 502;
}

export async function GET(_request: Request, context: RouteContext) {
  const rawParams = await context.params;
  const parsed = parseSpikeDetailParams(rawParams);

  if (!parsed) {
    return NextResponse.json(
      {
        kind: "error",
        reason: "invalid_query",
        message: "Der Detailpfad ist ungültig.",
      },
      { status: 400 },
    );
  }

  const result = await getMetadataDetail(parsed);

  return NextResponse.json(result, {
    status: getStatusCode(result.kind, result.kind === "error" ? result.reason : undefined),
  });
}
