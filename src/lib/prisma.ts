import "server-only";

import path from "node:path";

import { PrismaClient } from "@prisma/client";

const configuredDatabaseUrl = process.env.DATABASE_URL?.trim();

if (configuredDatabaseUrl) {
  process.env.DATABASE_URL = normalizeDatabaseUrl(configuredDatabaseUrl);
}

const globalForPrisma = globalThis as typeof globalThis & {
  __nullNoisePrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__nullNoisePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__nullNoisePrisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

function normalizeDatabaseUrl(value: string): string {
  if (!value.startsWith("file:")) {
    return value;
  }

  const rawPath = value.slice("file:".length);

  if (!rawPath || path.isAbsolute(rawPath)) {
    return value;
  }

  const cleanedPath = rawPath.replace(/^\.\//, "");

  if (cleanedPath.startsWith("prisma/")) {
    return `file://${path.join(process.cwd(), "prisma", path.basename(cleanedPath))}`;
  }

  return `file://${path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath)}`;
}
