import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

const serviceWorkerSource = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

async function activateServiceWorker(hostname: string, cacheNames: string[]) {
  const listeners = new Map<string, (event: { waitUntil(promise: Promise<unknown>): void }) => void>();
  const deletedCaches: string[] = [];
  const unregister = vi.fn().mockResolvedValue(true);
  const claim = vi.fn().mockResolvedValue(undefined);

  const self = {
    addEventListener: (type: string, listener: (event: { waitUntil(promise: Promise<unknown>): void }) => void) => {
      listeners.set(type, listener);
    },
    clients: { claim },
    location: { hostname, origin: `https://${hostname}` },
    registration: { unregister },
    skipWaiting: vi.fn().mockResolvedValue(undefined),
  };
  const caches = {
    delete: vi.fn(async (cacheName: string) => {
      deletedCaches.push(cacheName);
      return true;
    }),
    keys: vi.fn().mockResolvedValue(cacheNames),
  };

  runInNewContext(serviceWorkerSource, { caches, fetch: vi.fn(), self, URL });

  let activation: Promise<unknown> | undefined;
  listeners.get("activate")?.({ waitUntil: (promise) => { activation = promise; } });
  await activation;

  return { claim, deletedCaches, unregister };
}

describe("service worker cache activation", () => {
  it("keeps the current and foreign caches while deleting old null-noise caches", async () => {
    const result = await activateServiceWorker("null-noise.vercel.app", [
      "null-noise-pwa-v1",
      "null-noise-pwa-v2",
      "another-app-cache",
    ]);

    expect(result.deletedCaches).toEqual(["null-noise-pwa-v1"]);
    expect(result.unregister).not.toHaveBeenCalled();
    expect(result.claim).toHaveBeenCalledOnce();
  });

  it("keeps the localhost unregister behavior and clears only null-noise caches", async () => {
    const result = await activateServiceWorker("localhost", [
      "null-noise-pwa-v1",
      "null-noise-pwa-v2",
      "another-app-cache",
    ]);

    expect(result.deletedCaches).toEqual(["null-noise-pwa-v1", "null-noise-pwa-v2"]);
    expect(result.unregister).toHaveBeenCalledOnce();
    expect(result.claim).toHaveBeenCalledOnce();
  });
});
