import { expect, test } from '@playwright/test';

const TAG_PATH = '/tags/biography/20/';

test.describe('分页键盘方向键翻页', () => {
    test('按 → 跳到下一页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('ArrowRight');
        await expect(page).toHaveURL(/\/tags\/biography\/21\/?$/);
    });

    test('按 ← 跳到上一页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('ArrowLeft');
        await expect(page).toHaveURL(/\/tags\/biography\/19\/?$/);
    });

    test('焦点在跳转输入框里时，方向键不会触发翻页', async ({ page }) => {
        await page.goto(TAG_PATH);
        // 页面上跳转框有移动端/桌面端两份，只有一份在当前视口下可见，选那一份
        const input = page.locator('.pagination-jump-input').locator('visible=true');
        await input.click();
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(300);
        await expect(page).toHaveURL(/\/tags\/biography\/20\/?$/);
    });

    test('带修饰键（如 Cmd/Ctrl）按方向键不会触发翻页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('Control+ArrowRight');
        await page.waitForTimeout(300);
        await expect(page).toHaveURL(/\/tags\/biography\/20\/?$/);
    });
});
