import { expect, test, type Page } from '@playwright/test';

// 回到顶部按钮是普通 Astro <script>（不是 React island），监听挂在 window/document 上；
// 除了首次加载，还要确认 ClientRouter 换页后按钮依然能用。
async function expectScrollToTopWorks(page: Page) {
    const button = page.locator('[data-scroll-top]');
    await expect(button).not.toHaveClass(/visible/);
    await page.evaluate(() => window.scrollTo(0, 2000));
    await expect(button).toHaveClass(/visible/);
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(button).not.toHaveClass(/visible/);
}

test.describe('回到顶部按钮', () => {
    test('滚动后出现，点击回到顶部；ClientRouter 换页后依然可用', async ({ page }) => {
        // 人物页内容够长，移动端也能滚过 300px 的显示阈值
        await page.goto('/projects/bio/caocao/');
        await expectScrollToTopWorks(page);

        // 「下一篇」链接在页面底部，换页后再测一次
        await page.locator('main a[href^="/projects/bio/"]').last().click();
        await expect(page).not.toHaveURL(/\/caocao\/$/);
        await expectScrollToTopWorks(page);
    });
});
