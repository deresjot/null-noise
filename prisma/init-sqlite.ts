import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

async function readEnvFile(fileName: string): Promise<Record<string, string>> {
  try {
    const contents = await readFile(path.join(process.cwd(), fileName), "utf-8");

    return Object.fromEntries(
      contents
        .split(/\r?\n/)
        .map(parseEnvLine)
        .filter((entry): entry is [string, string] => Boolean(entry)),
    );
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function resolveDatabaseUrl(): Promise<string> {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const localEnv = await readEnvFile(".env.local");
  if (localEnv.DATABASE_URL) {
    return localEnv.DATABASE_URL;
  }

  const defaultEnv = await readEnvFile(".env");
  if (defaultEnv.DATABASE_URL) {
    return defaultEnv.DATABASE_URL;
  }

  throw new Error("DATABASE_URL is required to initialize the SQLite schema.");
}

function resolveSqliteFilePath(databaseUrl: string): string {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Only SQLite DATABASE_URL values with file: are supported.");
  }

  const rawPath = databaseUrl.slice("file:".length);

  if (!rawPath) {
    throw new Error("DATABASE_URL must point to a SQLite file.");
  }

  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  return path.resolve(process.cwd(), rawPath);
}

async function main() {
  const databaseUrl = await resolveDatabaseUrl();
  const databaseFilePath = resolveSqliteFilePath(databaseUrl);
  const schemaSql = await readFile(path.join(process.cwd(), "prisma", "schema.sql"), "utf-8");

  await mkdir(path.dirname(databaseFilePath), { recursive: true });

  const database = new DatabaseSync(databaseFilePath);

  try {
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(schemaSql);
  } finally {
    database.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
