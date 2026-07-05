import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appendStoredTitleImportAttempt: vi.fn(),
  createOrGetStoredLocalTitleSeed: vi.fn(),
  getMetadataDetail: vi.fn(),
  listStoredLocalTitleSeeds: vi.fn(),
  listStoredTitleImportAttempts: vi.fn(),
  writesEnabled: false,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/runtime-config", () => ({
  arePublicWritesEnabled: () => mocks.writesEnabled,
}));

vi.mock("@/lib/local-titles", () => ({
  appendStoredTitleImportAttempt: mocks.appendStoredTitleImportAttempt,
  createOrGetStoredLocalTitleSeed: mocks.createOrGetStoredLocalTitleSeed,
  createTitleExternalLookupKey: (source: string, sourceId: number) => `${source}:${sourceId}`,
  evaluateTitleImportAttempt: () => "accepted",
  findStoredLocalTitleSeedByExternal: () => null,
  listStoredLocalTitleSeeds: mocks.listStoredLocalTitleSeeds,
  listStoredTitleImportAttempts: mocks.listStoredTitleImportAttempts,
}));

vi.mock("@/lib/metadata-spike", () => ({
  getMetadataDetail: mocks.getMetadataDetail,
}));

import { POST } from "./route";

const originalEnv = { ...process.env };

function importRequest() {
  const formData = new FormData();
  formData.set("source", "tmdb");
  formData.set("mediaType", "movie");
  formData.set("sourceId", "123");
  formData.set("q", "Arrival");
  formData.set("returnPath", "/suche?q=Arrival");

  return new NextRequest("http://localhost/api/local-titles", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "x-forwarded-for": "203.0.113.10",
    },
    body: formData,
  });
}

beforeEach(() => {
  mocks.writesEnabled = false;
  mocks.listStoredLocalTitleSeeds.mockResolvedValue([]);
  mocks.listStoredTitleImportAttempts.mockResolvedValue([]);
  mocks.getMetadataDetail.mockResolvedValue({ kind: "success", item: { title: "Arrival" } });
  mocks.createOrGetStoredLocalTitleSeed.mockResolvedValue({
    created: true,
    seed: { external: { slug: "arrival" } },
  });
  mocks.appendStoredTitleImportAttempt.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
});

describe("local title import route", () => {
  it("returns inactive before hashing, rate limiting or database access when writes are disabled", async () => {
    delete process.env.NULL_NOISE_RATE_LIMIT_SALT;

    const response = await POST(importRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("import=inactive");
    expect(mocks.listStoredLocalTitleSeeds).not.toHaveBeenCalled();
    expect(mocks.listStoredTitleImportAttempts).not.toHaveBeenCalled();
    expect(mocks.getMetadataDetail).not.toHaveBeenCalled();
  });

  it("returns a controlled error without database access when writes are enabled but salt is missing", async () => {
    mocks.writesEnabled = true;
    process.env.NODE_ENV = "production";
    delete process.env.NULL_NOISE_RATE_LIMIT_SALT;

    const response = await POST(importRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("import=unavailable");
    expect(mocks.listStoredLocalTitleSeeds).not.toHaveBeenCalled();
    expect(mocks.listStoredTitleImportAttempts).not.toHaveBeenCalled();
    expect(mocks.getMetadataDetail).not.toHaveBeenCalled();
  });

  it("keeps the successful import path when writes and salt are configured", async () => {
    mocks.writesEnabled = true;
    process.env.NODE_ENV = "production";
    process.env.NULL_NOISE_RATE_LIMIT_SALT = "unit-test-salt";

    const response = await POST(importRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/titel/arrival?import=created");
    expect(mocks.listStoredLocalTitleSeeds).toHaveBeenCalledOnce();
    expect(mocks.listStoredTitleImportAttempts).toHaveBeenCalledOnce();
    expect(mocks.createOrGetStoredLocalTitleSeed).toHaveBeenCalledOnce();
    expect(mocks.appendStoredTitleImportAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ sourceKey: "tmdb:123", status: "accepted" }),
    );
  });
});
