import { afterEach, describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

async function getContentSecurityPolicy() {
  const headers = await nextConfig.headers?.();
  const rootHeaders = headers?.find((entry) => entry.source === "/:path*")?.headers;

  return rootHeaders?.find((header) => header.key === "Content-Security-Policy")?.value;
}

describe("security headers", () => {
  it("does not upgrade insecure localhost requests in development", async () => {
    process.env.NODE_ENV = "development";

    await expect(getContentSecurityPolicy()).resolves.not.toContain("upgrade-insecure-requests");
  });

  it("keeps upgrade-insecure-requests outside development", async () => {
    process.env.NODE_ENV = "production";

    await expect(getContentSecurityPolicy()).resolves.toContain("upgrade-insecure-requests");
  });
});
