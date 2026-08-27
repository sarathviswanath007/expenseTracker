import { test, expect } from "@playwright/test";

test("login page shows required fields and validates before submitting", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Continue with Google/i }),
  ).toBeDisabled();

  await page.getByLabel("Email").fill("user@localhost");
  await page.getByLabel("Password").fill("something");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(
    page.getByText("Please enter a valid email address."),
  ).toBeVisible();
});

test("signup page validates password length and matching confirmation", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByLabel("Confirm password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(
    page.getByText("Password must be at least 8 characters."),
  ).toBeVisible();

  await page.getByLabel("Password", { exact: true }).fill("longenough1");
  await page.getByLabel("Confirm password").fill("longenough2");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Passwords do not match.")).toBeVisible();
});

test("forgot password page requests a reset link", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send reset link" }),
  ).toBeVisible();
});
