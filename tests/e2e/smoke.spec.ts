import { expect, test } from '@playwright/test';

test('homepage loads and renders the site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/后汉稽异录/);
});
