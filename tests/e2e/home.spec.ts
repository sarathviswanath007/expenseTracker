import { test, expect } from "@playwright/test";

test("landing page loads and shows the core message", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/BudgetWise AI/);
  await expect(
    page.getByRole("heading", { name: /Track smarter\. Spend better\. Save more\./i }),
  ).toBeVisible();
});

test("landing page links to signup and login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign up" }).first()).toHaveAttribute(
    "href",
    "/signup",
  );
  await expect(page.getByRole("link", { name: "Log in" }).first()).toHaveAttribute(
    "href",
    "/login",
  );
});
