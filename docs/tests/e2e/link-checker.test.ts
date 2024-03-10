import { expect, test } from '@playwright/test'

test('doc navigation test', async ({ page }) => {
  await page.goto('/docs/main')
  await page.click("text=Beginner's Guide")
  await expect(page).toHaveURL('/docs/main/quick-start')
})
