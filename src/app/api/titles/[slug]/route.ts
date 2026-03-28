import { NextResponse } from "next/server";

import { getTitleBySlugState } from "@/lib/queries";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { data, unavailable } = await getTitleBySlugState(slug);

  if (unavailable) {
    return NextResponse.json(
      {
        error: "catalog_unavailable",
        message: "Die lokale Titelbasis ist gerade nicht verfügbar.",
      },
      { status: 503 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
