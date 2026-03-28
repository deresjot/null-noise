import { afterEach, describe, expect, it } from "vitest";

import { arePublicWritesEnabled, getMetadataBase, getSiteUrl } from "@/lib/runtime-config";

const originalEnv = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL: process.env.VERCEL_URL,
  NULL_NOISE_ENABLE_WRITES: process.env.NULL_NOISE_ENABLE_WRITES,
  NODE_ENV: process.env.NODE_ENV,
};

function restoreEnvValue(key: keyof typeof originalEnv): void {
  const value = originalEnv[key];

  if (typeof value === "undefined") {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvValue("NEXT_PUBLIC_SITE_URL");
  restoreEnvValue("VERCEL_PROJECT_PRODUCTION_URL");
  restoreEnvValue("VERCEL_URL");
  restoreEnvValue("NULL_NOISE_ENABLE_WRITES");
  restoreEnvValue("NODE_ENV");
});

describe("runtime config", () => {
  it("prefers an explicit public site url for metadata", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://beta.null-noise.example/";
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://beta.null-noise.example");
    expect(getMetadataBase().toString()).toBe("https://beta.null-noise.example/");
  });

  it("falls back to vercel host information when no explicit site url exists", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "null-noise.vercel.app";
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://null-noise.vercel.app");
  });

  it("keeps writes enabled locally by default but disables them in production", () => {
    delete process.env.NULL_NOISE_ENABLE_WRITES;

    process.env.NODE_ENV = "development";
    expect(arePublicWritesEnabled()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(arePublicWritesEnabled()).toBe(false);
  });

  it("lets an explicit env override the default write mode", () => {
    process.env.NODE_ENV = "production";
    process.env.NULL_NOISE_ENABLE_WRITES = "true";
    expect(arePublicWritesEnabled()).toBe(true);

    process.env.NULL_NOISE_ENABLE_WRITES = "false";
    expect(arePublicWritesEnabled()).toBe(false);
  });
});
