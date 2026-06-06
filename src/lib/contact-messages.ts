import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ContactMessageRecord = {
  id: string;
  email?: string;
  message: string;
  submittedAt: string;
};

export type ContactMessageStoreInfo = {
  kind: "file";
  durable: boolean;
  label: string;
};

type ContactMessageFile = {
  messages: ContactMessageRecord[];
};

const maxStoredMessages = 200;

export function getContactMessageStoreInfo(): ContactMessageStoreInfo {
  const configuredPath = process.env.CONTACT_MESSAGES_FILE?.trim();
  const production = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (configuredPath) {
    return {
      kind: "file",
      durable: !configuredPath.startsWith("/tmp/"),
      label: configuredPath.startsWith("/tmp/") ? "Temporäre Datei" : "Konfigurierte Datei",
    };
  }

  return {
    kind: "file",
    durable: !production,
    label: production ? "Temporäre Vercel-Datei" : "Lokale Datei",
  };
}

export async function storeContactMessage(input: {
  email?: string;
  message: string;
}): Promise<ContactMessageRecord> {
  const record: ContactMessageRecord = {
    id: randomUUID(),
    email: input.email,
    message: input.message,
    submittedAt: new Date().toISOString(),
  };
  const filePath = getContactMessageFilePath();
  const file = await readContactMessageFile(filePath);
  const messages = [record, ...file.messages].slice(0, maxStoredMessages);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify({ messages }, null, 2)}\n`, "utf-8");

  return record;
}

export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  const file = await readContactMessageFile(getContactMessageFilePath());

  return file.messages;
}

function getContactMessageFilePath() {
  const configuredPath = process.env.CONTACT_MESSAGES_FILE?.trim();

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), configuredPath);
  }

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "/tmp/null-noise-contact-messages.json";
  }

  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "contact-messages.local.json");
}

async function readContactMessageFile(filePath: string): Promise<ContactMessageFile> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ContactMessageFile>;

    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages.filter(isContactMessageRecord) : [],
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { messages: [] };
    }

    throw error;
  }
}

function isContactMessageRecord(value: unknown): value is ContactMessageRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<ContactMessageRecord>;

  return (
    typeof record.id === "string" &&
    typeof record.message === "string" &&
    typeof record.submittedAt === "string" &&
    (record.email === undefined || typeof record.email === "string")
  );
}
