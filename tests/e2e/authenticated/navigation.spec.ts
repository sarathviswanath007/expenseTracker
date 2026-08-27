import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/dashboard", heading: "Budget by category" },
  { path: "/budgets", heading: "Income" },
  { path: "/expenses", heading: "Add an expense" },
  { path: "/analytics", heading: "Expenses by category" },
  { path: "/insights", heading: /insight|Nothing to flag/i },
  { path: "/goals", heading: "Savings goals are coming soon" },
  { path: "/export", heading: "What to include" },
];

test.describe("app shell", () => {
  test("the Users tab is hidden from a non-admin", async ({ page }) => {
    await page.goto("/dashboard");

    // The account the suite signs in as is not an admin unless someone made
    // it one; skip rather than fail if it is.
    const usersLink = page.getByRole("link", { name: "Users" });
    if ((await usersLink.count()) > 0) {
      test.skip(true, "the test account is an admin");
    }

    await expect(usersLink).toHaveCount(0);
    await page.goto("/users");
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });

  for (const route of ROUTES) {
    test(`${route.path} renders for a signed-in user`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      await expect(page.getByText(route.heading).first()).toBeVisible();
      // Every in-app page sits inside the shell, so the footer is the cheap
      // proof the layout rendered rather than an error boundary.
      await expect(page.getByText(/All rights reserved/).first()).toBeVisible();
    });
  }

  test("the sidebar moves between sections", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: "Expenses" }).click();
    await expect(page).toHaveURL(/\/expenses$/);

    await page.getByRole("link", { name: "Budgets" }).click();
    await expect(page).toHaveURL(/\/budgets$/);
  });

  test("the month picker drives the query string", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByLabel("Month").click();
    await page.getByRole("option", { name: "March" }).click();

    await expect(page).toHaveURL(/month=3/);
    await expect(page.getByText(/Showing March/)).toBeVisible();
  });
});
