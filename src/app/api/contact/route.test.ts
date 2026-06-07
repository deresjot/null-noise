import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mailMock = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn(() => ({
    sendMail: mailMock.sendMail,
  })),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mailMock.createTransport,
  },
}));

import { POST } from "./route";

const originalEnv = { ...process.env };

function contactRequest(body: unknown, forwardedFor = "203.0.113.10") {
  const rawBody = JSON.stringify(body);

  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": String(new TextEncoder().encode(rawBody).length),
      "x-forwarded-for": forwardedFor,
    },
    body: rawBody,
  });
}

beforeEach(() => {
  process.env = {
    ...originalEnv,
    SMTP_HOST: "mail.hosting.de",
    SMTP_PORT: "587",
    SMTP_SECURE: "false",
    SMTP_USER: "testing@sebastianjansen.com",
    SMTP_PASSWORD: "test-smtp-password",
    CONTACT_TO_EMAIL: "ziel@example.com",
    CONTACT_FROM_EMAIL: "testing@sebastianjansen.com",
  };
  mailMock.sendMail.mockResolvedValue({ accepted: ["ziel@example.com"] });
});

afterEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
});

describe("contact route", () => {
  it("sends a valid message via SMTP", async () => {
    const response = await POST(contactRequest({ message: "Diese Nachricht ist lang genug." }));

    await expect(response.json()).resolves.toMatchObject({ ok: true, delivered: true });
    expect(response.status).toBe(200);
    expect(mailMock.createTransport).toHaveBeenCalledWith({
      host: "mail.hosting.de",
      port: 587,
      secure: false,
      auth: {
        user: "testing@sebastianjansen.com",
        pass: "test-smtp-password",
      },
    });
    expect(mailMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "null-noise <testing@sebastianjansen.com>",
        to: "ziel@example.com",
        subject: "Neue Nachricht über null-noise",
      }),
    );
  });

  it("rejects messages shorter than 10 characters", async () => {
    const response = await POST(contactRequest({ message: "zu kurz" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.fieldErrors.message).toContain("mindestens 10 Zeichen");
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });

  it("rejects an invalid optional email address", async () => {
    const response = await POST(contactRequest({ email: "nicht-gueltig", message: "Diese Nachricht ist lang genug." }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.fieldErrors.email).toContain("gültige E-Mail-Adresse");
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });

  it("uses a valid optional email address as Reply-To", async () => {
    const response = await POST(
      contactRequest({ email: "antwort@example.com", message: "Diese Nachricht ist lang genug." }),
    );

    expect(response.status).toBe(200);
    expect(mailMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "antwort@example.com",
      }),
    );
  });

  it("uses CONTACT_TO_EMAIL from the server instead of request data", async () => {
    const response = await POST(
      contactRequest({
        message: "Diese Nachricht ist lang genug.",
        to: "angreifer@example.com",
      }),
    );

    expect(response.status).toBe(200);
    expect(mailMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ziel@example.com",
      }),
    );
    expect(JSON.stringify(mailMock.sendMail.mock.calls[0])).not.toContain("angreifer@example.com");
  });

  it("does not expose SMTP credentials in responses when sending fails", async () => {
    mailMock.sendMail.mockRejectedValueOnce(new Error("SMTP auth failed for testing@sebastianjansen.com"));

    const response = await POST(
      contactRequest({
        email: "person@example.com",
        message: "Diese Nachricht darf nicht im Fehlertext auftauchen.",
      }),
    );
    const responseText = await response.text();

    expect(response.status).toBe(500);
    expect(responseText).toContain("Die Nachricht konnte gerade nicht gesendet werden.");
    expect(responseText).not.toContain("testing@sebastianjansen.com");
    expect(responseText).not.toContain("test-smtp-password");
    expect(responseText).not.toContain("person@example.com");
    expect(responseText).not.toContain("Diese Nachricht darf nicht");
  });

  it("quietly accepts honeypot submissions without sending mail", async () => {
    const response = await POST(
      contactRequest({
        message: "Diese Nachricht ist lang genug.",
        website: "https://spam.example",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({ ok: true, delivered: true });
    expect(response.status).toBe(200);
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies before sending mail", async () => {
    const response = await POST(contactRequest({ message: "x".repeat(9000) }));

    expect(response.status).toBe(413);
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });
});
