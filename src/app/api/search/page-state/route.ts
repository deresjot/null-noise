import { NextRequest, NextResponse } from "next/server";

import { createSearchPageState } from "@/lib/search-page-state";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const state = await createSearchPageState(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  return NextResponse.json(state);
}
