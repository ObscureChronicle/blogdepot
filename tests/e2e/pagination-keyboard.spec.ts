import { expect, test } from '@playwright/test';
import { expectNoNavigation } from './helpers';

// 取中间页（前后都还有页），只要求 biography 不少于 11 页；不要写成接近末尾的页码，
// 内容增减后总页数会变（曾经写死第 20 页，人物分类变成 19 页后整组用例都访问到 404）
const TAG_PATH = '/tags/biography/10/';

test.describe('分页键盘方向键翻页', () => {
    test('按 → 跳到下一页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('ArrowRight');
        await expect(page).toHaveURL(/\/tags\/biography\/11\/?$/);
    });

    test('按 ← 跳到上一页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('ArrowLeft');
        await expect(page).toHaveURL(/\/tags\/biography\/9\/?$/);
    });

    test('焦点在跳转输入框里时，方向键不会触发翻页', async ({ page }) => {
        await page.goto(TAG_PATH);
        // 页面上跳转框有移动端/桌面端两份，只有一份在当前视口下可见，选那一份
        const input = page.locator('.pagination-jump-input').locator('visible=true');
        await input.click();
        await expectNoNavigation(page, () => page.keyboard.press('ArrowLeft'));
    });

    test('带修饰键（如 Cmd/Ctrl）按方向键不会触发翻页', async ({ page }) => {
        await page.goto(TAG_PATH);
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await expectNoNavigation(page, () => page.keyboard.press('Control+ArrowRight'));
    });
});
