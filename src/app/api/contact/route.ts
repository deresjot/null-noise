import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { storeContactMessage } from "@/lib/contact-messages";

const contactSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .email("Bitte gib eine gültige E-Mail-Adresse ein, zum Beispiel name@example.com.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Bitte schreibe mindestens 10 Zeichen, damit der Kontext verständlich ist.")
    .max(3000, "Bitte kürze die Nachricht auf höchstens 3000 Zeichen."),
});

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 5;
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

function hashClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rawClientHint = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const salt =
    process.env.CONTACT_RATE_LIMIT_SALT ??
    process.env.NULL_NOISE_RATE_LIMIT_SALT ??
    "null-noise-contact-rate-limit";

  return createHash("sha256").update(`${salt}:${rawClientHint}`).digest("hex");
}

function isRateLimited(request: NextRequest) {
  const key = hashClientKey(request);
  const now = Date.now();
  const current = contactRateLimit.get(key);

  if (!current || current.resetAt <= now) {
    contactRateLimit.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  current.count += 1;
  contactRateLimit.set(key, current);

  return current.count > rateLimitMaxRequests;
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);

    return NextResponse.json(
      {
        fieldErrors: {
          email: flattened.fieldErrors.email?.[0],
          message: flattened.fieldErrors.message?.[0],
        },
      },
      { status: 400 },
    );
  }

  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Bitte warte kurz, bevor du eine weitere Nachricht sendest." }, { status: 429 });
  }

  const email = parsed.data.email || undefined;
  const message = parsed.data.message.trim();

  try {
    await storeContactMessage({ email, message });
  } catch {
    return NextResponse.json(
      { error: "Die Nachricht konnte gerade nicht gespeichert werden." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, delivered: false, stored: true });
}
