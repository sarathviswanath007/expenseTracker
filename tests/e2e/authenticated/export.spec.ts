import { test, expect } from "@playwright/test";

test("downloads a CSV of the month", async ({ page }) => {
  await page.goto("/export");

  await page.getByRole("button", { name: /CSV/ }).click();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /Download CSV/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(
    /^budgetwise-(report|summary|budget|expenses)-\d{4}-\d{2}\.csv$/,
  );

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");

  expect(text).toContain("Measure");
  expect(text).toContain("Income");
});

test("downloads an Excel workbook", async ({ page }) => {
  await page.goto("/export");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /Download Excel/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(
    /^budgetwise-report-\d{4}-\d{2}\.xlsx$/,
  );

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const file = Buffer.concat(chunks);

  // xlsx is a zip container.
  expect(file.subarray(0, 2).toString("latin1")).toBe("PK");
  expect(file.byteLength).toBeGreaterThan(1000);
});

test("requires at least one section", async ({ page }) => {
  await page.goto("/export");

  for (const label of [/Monthly summary/, /Budget by category/, /^Expenses/]) {
    await page.getByRole("checkbox", { name: label }).uncheck();
  }

  await expect(page.getByText("Choose at least one section.")).toBeVisible();
});
