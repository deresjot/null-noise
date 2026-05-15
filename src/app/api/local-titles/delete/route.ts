import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { deleteStoredLocalTitleSeedBySlug } from "@/lib/local-titles";
import { hasTrustedOrigin } from "@/lib/ratings";
import { arePublicWritesEnabled } from "@/lib/runtime-config";

const deleteLocalTitleSchema = z.object({
  slug: z.string().trim().min(1).max(160),
  successPath: z.string().trim().min(1).max(300),
  errorPath: z.string().trim().min(1).max(300),
});

function normalizePath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/suche";
  }

  return value;
}

function buildRedirectUrl(request: NextRequest, path: string, status: string): URL {
  const safePath = normalizePath(path);
  const url = new URL(safePath, request.url);

  url.searchParams.set("deleted", status);
  return url;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = deleteLocalTitleSchema.safeParse({
    slug: formData.get("slug"),
    successPath: formData.get("successPath"),
    errorPath: formData.get("errorPath"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(buildRedirectUrl(request, "/suche", "error"), 303);
  }

  const { slug, successPath, errorPath } = parsed.data;

  if (!arePublicWritesEnabled()) {
    return NextResponse.redirect(buildRedirectUrl(request, errorPath, "inactive"), 303);
  }

  if (
    !hasTrustedOrigin({
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      secFetchSite: request.headers.get("sec-fetch-site"),
    })
  ) {
    return NextResponse.redirect(buildRedirectUrl(request, errorPath, "error"), 303);
  }

  try {
    const result = await deleteStoredLocalTitleSeedBySlug(slug);

    if (!result.deleted) {
      return NextResponse.redirect(buildRedirectUrl(request, errorPath, "missing"), 303);
    }

    revalidatePath("/suche");
    revalidatePath("/api/titles");
    revalidatePath(`/api/titles/${slug}`);

    return NextResponse.redirect(buildRedirectUrl(request, successPath, "success"), 303);
  } catch {
    return NextResponse.redirect(buildRedirectUrl(request, errorPath, "error"), 303);
  }
}
