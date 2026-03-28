import { readFile } from "node:fs/promises";
import path from "node:path";

async function ensureDatabaseUrlFromEnvFiles(): Promise<void> {
  if (process.env.DATABASE_URL?.trim()) {
    return;
  }

  for (const fileName of [".env.local", ".env"]) {
    try {
      const contents = await readFile(path.join(process.cwd(), fileName), "utf-8");

      for (const line of contents.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#") || !trimmed.startsWith("DATABASE_URL=")) {
          continue;
        }

        let value = trimmed.slice("DATABASE_URL=".length).trim();

        if (
          (value.startsWith("\"") && value.endsWith("\"")) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (value) {
          process.env.DATABASE_URL = value;
          return;
        }
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "ENOENT") {
        throw error;
      }
    }
  }
}

async function main() {
  await ensureDatabaseUrlFromEnvFiles();
  const { ensureCatalogBootstrapped, resetCatalogBootstrapStateForTests } = await import(
    "../src/lib/catalog-db"
  );
  const { disconnectPrisma } = await import("../src/lib/prisma");

  try {
    resetCatalogBootstrapStateForTests();
    await ensureCatalogBootstrapped();
  } finally {
    await disconnectPrisma();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
