import { test, expect } from "@playwright/test";

test("landing page loads and shows the core message", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/BudgetWise AI/);
  await expect(
    page.getByRole("heading", {
      name: /Understand your money\. Make smarter decisions\./i,
    }),
  ).toBeVisible();
});

test("landing page links to signup and login", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /get started/i }).first(),
  ).toHaveAttribute("href", "/signup");
  await expect(
    page.getByRole("link", { name: /log in/i }).first(),
  ).toHaveAttribute("href", "/login");
});

test("landing page explains the product before signup", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /how it works/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /see how it works/i }),
  ).toHaveAttribute("href", "#how-it-works");
});
