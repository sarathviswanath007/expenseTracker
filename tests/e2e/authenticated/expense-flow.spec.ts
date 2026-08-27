import { test, expect } from "@playwright/test";

/**
 * A distinctive amount is the handle for finding this test's own row again,
 * so the test never touches data it didn't create.
 */
function uniqueAmount() {
  return 7000 + Math.floor(Math.random() * 2999);
}

test("an expense added from the dashboard reaches the expense list, then is removed", async ({
  page,
}) => {
  const amount = uniqueAmount();

  await page.goto("/dashboard");

  await page.getByLabel("Amount").fill(String(amount));
  await page.getByRole("button", { name: "Add expense" }).click();

  await expect(page.getByText(/expense added/i)).toBeVisible();

  await page.goto("/expenses");
  const row = page.getByRole("row").filter({ hasText: String(amount) });
  await expect(row).toHaveCount(1);

  // Deletion is behind a native confirm().
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText("Expense deleted.")).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: String(amount) }),
  ).toHaveCount(0);
});

test("the add-expense form refuses an empty amount", async ({ page }) => {
  await page.goto("/expenses");

  await page.getByRole("button", { name: "Add expense" }).click();

  await expect(page.getByText("Enter an amount.")).toBeVisible();
});

test("filters narrow the list and clear again", async ({ page }) => {
  await page.goto("/expenses");

  await page.getByLabel("From").fill("1990-01-01");
  await page.getByLabel("To").fill("1990-01-31");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page).toHaveURL(/from=1990-01-01/);
  await expect(page.getByText("No matching expenses")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).not.toHaveURL(/from=1990-01-01/);
});
