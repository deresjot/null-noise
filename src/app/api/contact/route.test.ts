import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalEnv = { ...process.env };

function contactRequest(body: unknown, forwardedFor: string) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": forwardedFor,
    },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe("contact route", () => {
  it("accepts a valid message without reply email in local dry-run mode", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.VERCEL_ENV;

    const response = await POST(
      contactRequest({ message: "Diese Nachricht ist lang genug." }, "203.0.113.10"),
    );

    await expect(response.json()).resolves.toMatchObject({ ok: true, delivered: false, mode: "development" });
    expect(response.status).toBe(200);
  });

  it("does not claim success in production when mail configuration is missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    process.env.VERCEL_ENV = "production";

    const response = await POST(
      contactRequest({ message: "Diese Nachricht ist lang genug." }, "203.0.113.11"),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "Das Kontaktformular ist gerade nicht vollständig eingerichtet.",
    });
  });

  it("sends through Resend with optional reply_to when configured", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.CONTACT_TO_EMAIL = "kontakt@example.com";
    process.env.CONTACT_FROM_EMAIL = "null-noise <kontakt@example.com>";
    process.env.VERCEL_ENV = "preview";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      contactRequest(
        {
          email: "reply@example.com",
          message: "Diese Nachricht ist lang genug.",
        },
        "203.0.113.12",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
        }),
        body: expect.any(String),
      }),
    );
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as Record<string, unknown>;
    expect(payload).toMatchObject({
      from: "null-noise <kontakt@example.com>",
      to: ["kontakt@example.com"],
      subject: "Kontakt zu null-noise",
      reply_to: "reply@example.com",
    });
    expect(String(payload.text)).toContain("Direkte Antwort möglich: ja");
  });
});
