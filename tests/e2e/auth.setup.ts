import { test as setup, expect } from "@playwright/test";
import { STORAGE_STATE } from "./storage-state";

/**
 * Signs in once and saves the session for the authenticated project, so the
 * specs themselves never touch the login form. Only runs when E2E_EMAIL and
 * E2E_PASSWORD are set — see tests/e2e/README.md.
 */
setup("sign in", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must be set to run the authenticated tests.",
    );
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
