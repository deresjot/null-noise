import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const forbiddenAccessibilityTerms = new RegExp(
  `\\b${["barriere", "arm"].join("")}(?:e|en|er|es)?\\b`,
  "iu",
);

async function collectTextFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectTextFiles(entryPath);
      }

      if (/\.(css|md|ts|tsx)$/u.test(entry.name)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

describe("content safety wording", () => {
  it("does not introduce reduced-accessibility wording in source, docs or tests", async () => {
    const roots = ["src", "docs", "tests"];
    const files = (await Promise.all(roots.map(collectTextFiles))).flat();
    const matches: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");

      if (forbiddenAccessibilityTerms.test(content)) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });
});
