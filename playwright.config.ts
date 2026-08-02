import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? "3000");
const serverCommand =
  process.env.PLAYWRIGHT_SERVER_COMMAND ??
  `npm run dev -- --hostname 127.0.0.1 --port ${port}`;
const useWebKit = process.env.PLAYWRIGHT_BROWSER === "webkit";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 30_000,
  },
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    storageState: {
      cookies: [],
      origins: [
        {
          localStorage: [{ name: "null-noise-preview-unlocked", value: "true" }],
          origin: `http://127.0.0.1:${port}`,
        },
      ],
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: serverCommand,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: useWebKit ? "webkit" : "chromium",
      use: { ...devices[useWebKit ? "Desktop Safari" : "Desktop Chrome"] },
    },
  ],
});
