import { NextRequest } from "next/server";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listContactMessages } from "@/lib/contact-messages";

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
  it("stores a valid message without reply email when mail is not configured", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "null-noise-contact-test-"));
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.VERCEL_ENV;
    process.env.CONTACT_MESSAGES_FILE = path.join(tempDir, "messages.json");

    try {
      const response = await POST(
        contactRequest({ message: "Diese Nachricht ist lang genug." }, "203.0.113.10"),
      );

      await expect(response.json()).resolves.toMatchObject({ ok: true, delivered: false, stored: true });
      expect(response.status).toBe(200);

      await expect(listContactMessages()).resolves.toMatchObject([
        {
          message: "Diese Nachricht ist lang genug.",
        },
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
