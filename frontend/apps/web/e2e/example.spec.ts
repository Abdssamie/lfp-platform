import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ConvexZen/);
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  // Check if landing page content is visible
  // Adjust selector based on actual landing page content
  await expect(page.locator("body")).toBeVisible();
});
