import { test, expect } from "@playwright/test";

test.describe("Builder Use Case: CRUD Operations for Word Lists & Activities", () => {
  const testListName = `E2E Test List ${Date.now()}`;
  const testActivityName = `E2E Config ${Date.now()}`;

  test("should perform full CRUD workflow on word lists and activity configurations", async ({ page }) => {
    await page.goto("/activities");
    await expect(page.locator("h1")).toContainText("Saved Activities");

    // 1. CREATE WORD LIST
    await page.fill('input[placeholder="Word list name"]', testListName);
    await page.fill('textarea[placeholder="Description (optional)"]', "Automated E2E test phoneme list");
    await page.fill('input[placeholder="English word"]', "ship");
    await page.fill('input[placeholder="e.g. sh-i-p or ʃ ɪ p"]', "sh-i-p");

    await page.click('button:has-text("+ Add word")');
    const englishInputs = page.locator('input[placeholder="English word"]');
    const phonemeInputs = page.locator('input[placeholder="e.g. sh-i-p or ʃ ɪ p"]');
    await englishInputs.nth(1).fill("fish");
    await phonemeInputs.nth(1).fill("f-i-sh");

    await page.click('button:has-text("Save Word List")');
    await expect(page.locator('role=status')).toContainText("Word list saved");
    
    // Find the row with our list name
    const listRow = page.locator('[data-testid^="word-list-row-"]', { hasText: testListName }).first();
    await expect(listRow).toBeVisible();

    // 2. READ & UPDATE WORD LIST
    await listRow.locator('button:has-text("Edit")').click();
    await expect(page.locator('input[placeholder="Word list name"]')).toHaveValue(testListName);
    await page.fill('textarea[placeholder="Description (optional)"]', "Updated description for E2E list");
    await page.click('button:has-text("Update Word List")');
    await expect(page.locator('role=status')).toContainText("Word list updated");

    // 3. CREATE ACTIVITY CONFIGURATION
    await page.fill('input[placeholder="Activity title"]', testActivityName);
    await page.selectOption('select:has(option:has-text("Select Linked Word List"))', { label: testListName });
    await page.selectOption('select:has(option[value="WORDLE"])', "WORDLE");
    await page.selectOption('select:has(option[value="hard"])', "hard");
    await page.click('button:has-text("Save Activity Configuration")');
    await expect(page.locator('role=status')).toContainText("saved to the database");
    
    const actRow = page.locator('[data-testid^="activity-row-"]', { hasText: testActivityName }).first();
    await expect(actRow).toBeVisible();

    // 4. UPDATE ACTIVITY CONFIGURATION (Verifying Dac's feedback!)
    await actRow.locator('button:has-text("Edit Configuration")').click();
    await expect(page.locator("text=Editing:")).toBeVisible();
    await page.fill('input[placeholder="Activity title"]', `${testActivityName} Updated`);
    await page.selectOption('select:has(option[value="easy"])', "easy");
    await page.click('button:has-text("Update Activity Configuration")');
    await expect(page.locator('role=status')).toContainText("successfully updated");

    // 5. DELETE ACTIVITY CONFIGURATION
    const updatedActRow = page.locator('[data-testid^="activity-row-"]', { hasText: `${testActivityName} Updated` }).first();
    await updatedActRow.locator('button:has-text("Delete")').click();
    await expect(page.locator('role=status')).toContainText("Activity deleted");

    // 6. DELETE WORD LIST
    page.on("dialog", (dialog) => dialog.accept());
    const finalDelRow = page.locator('[data-testid^="word-list-row-"]', { hasText: testListName }).first();
    await finalDelRow.locator('button:has-text("Delete")').click();
    await expect(page.locator('role=status')).toContainText("Word list deleted");
  });
});
