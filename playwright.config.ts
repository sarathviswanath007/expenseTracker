import { defineConfig, devices, type Project } from "@playwright/test";
import { STORAGE_STATE } from "./tests/e2e/storage-state";

/**
 * The authenticated suite needs a real account, and it writes data — so it
 * only runs when credentials are supplied. Without them the public suite
 * still runs, which keeps CI meaningful for anyone without the secrets.
 */
const hasCredentials = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

const authenticatedProjects: Project[] = [
  {
    name: "setup",
    testMatch: /auth\.setup\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "authenticated",
    testMatch: /authenticated\/.*\.spec\.ts/,
    dependencies: ["setup"],
    use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
  },
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "public",
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    ...(hasCredentials ? authenticatedProjects : []),
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
