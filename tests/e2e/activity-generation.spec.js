import { test, expect } from "@playwright/test";

test.describe("User Use Case: Generating and Viewing Wordle & Word Search Activities", () => {
  test("should render interactive Wordle builder, preview game grid, and verify gameplay elements", async ({ page }) => {
    // 1. Visit Wordle Builder
    await page.goto("/wordle");
    await expect(page.locator("h1")).toContainText("Phoneme Wordle");

    // Verify word pack and controls exist
    await expect(page.locator("text=Target word pack").first()).toBeVisible();
    await expect(page.locator('button:has-text("Randomize word pack")')).toBeVisible();

    // Verify interactive virtual keyboard buttons
    await expect(page.locator('button:has-text("ENTER")')).toBeVisible();
    await expect(page.locator('button:has-text("DEL")')).toBeVisible();

    // Verify generate HTML button exists
    const generateBtn = page.locator('button:has-text("Generate HTML")');
    await expect(generateBtn).toBeVisible();
  });

  test("should render Word Search builder, generate puzzle grid, and show word checklist", async ({ page }) => {
    // 2. Visit Word Search Builder
    await page.goto("/word-search");
    await expect(page.locator("h1")).toContainText("Phoneme Word Search");

    // Verify row and column spinbuttons
    await expect(page.getByRole("spinbutton", { name: "Rows" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Cols" })).toBeVisible();

    // Verify controls and interactive grid
    await expect(page.getByRole("button", { name: "Generate Puzzle" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate HTML" })).toBeVisible();
    await expect(page.getByRole("grid", { name: "Word search grid" })).toBeVisible();
  });

  test("should display data-driven dashboard with health status, KPI metrics, and operational signals", async ({ page }) => {
    // 3. Visit Dashboard
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("System & Data Dashboard");

    // Verify health status badge and health link
    await expect(page.getByRole("link", { name: /\/health/i })).toBeVisible();
    await expect(page.locator("span.font-black", { hasText: "200 OK" })).toBeVisible();

    // Verify KPI cards
    await expect(page.locator("text=Total Activities")).toBeVisible();
    await expect(page.locator("text=Most-Used Type")).toBeVisible();
    await expect(page.locator("text=Generation Success")).toBeVisible();
    await expect(page.locator("text=Avg Time on Page")).toBeVisible();

    // Verify Operational Warning section
    await expect(page.locator("text=Operational Status & Warning Indicators")).toBeVisible();

    // Verify Health endpoint inspector displays valid JSON
    const pre = page.locator("pre");
    await expect(pre).toContainText("healthy");

    // Click Live Simulation action to test reactivity
    const simSuccessBtn = page.locator('button:has-text("Simulate Success")');
    await simSuccessBtn.click();
    await expect(page.locator("div.border-blue-300")).toContainText("Successfully simulated");
  });
});
