import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { searchCatalog } from "@/lib/queries";

const querySchema = z.object({
  q: z.string().trim().max(80).catch(""),
  tone: z.enum(["all", "calm", "balanced", "intense"]).catch("all"),
  kind: z.enum(["all", "movie", "series"]).catch("all"),
  avoidPeaks: z.string().optional(),
  avoidDensity: z.string().optional(),
  avoidShouting: z.string().optional(),
}).transform((value) => ({
  q: value.q,
  tone: value.tone,
  kind: value.kind,
  avoidPeaks: value.avoidPeaks === "true" || value.avoidPeaks === "on",
  avoidDensity:
    value.avoidDensity === "true" ||
    value.avoidDensity === "on" ||
    value.avoidShouting === "true" ||
    value.avoidShouting === "on",
}));

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ungueltige_filter",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = await searchCatalog(parsed.data);

  return NextResponse.json({
    filters: parsed.data,
    count: data.length,
    data,
  });
}
