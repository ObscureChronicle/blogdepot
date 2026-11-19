import { expect, test, type Page } from '@playwright/test';
import { onlyOn } from './helpers';

// 章节标题不应被吸顶导航挡住
async function expectBelowNav(page: Page, id: string) {
    const heading = page.locator(`h2[id="${id}"]`);
    await expect(heading).toBeInViewport();
    await expect
        .poll(async () => {
            const navBottom = await page.locator('.nav-bar').evaluate((el) => el.getBoundingClientRect().bottom);
            const headingTop = await heading.evaluate((el) => el.getBoundingClientRect().top);
            return headingTop >= navBottom;
        }, '章节标题被吸顶导航挡住')
        .toBe(true);
}

test('desktop: side table of contents jumps to a section and highlights it', async ({ page }) => {
    onlyOn('desktop', '宽屏侧栏只在 ≥1280px 显示');
    await page.goto('/projects/bio/caocao/');
    const side = page.locator('[data-entry-toc-side]');
    await expect(side).toBeVisible();
    await expect(page.locator('[data-entry-toc-fab]')).toBeHidden();

    await side.getByRole('link', { name: '登场战役' }).click();
    await expectBelowNav(page, '登场战役');
    await expect(side.locator('a[aria-current]')).toHaveText('登场战役');
});

test('mobile: floating button opens the contents panel and closes it after jumping', async ({ page }) => {
    onlyOn('mobile', '悬浮按钮只在窄屏显示');
    await page.goto('/projects/bio/caocao/');
    await expect(page.locator('[data-entry-toc-side]')).toBeHidden();

    const fab = page.locator('[data-entry-toc-fab]');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(fab).toBeVisible();
    await fab.click();

    const panel = page.locator('[data-entry-toc-panel]');
    await expect(panel).toBeVisible();
    await expect(fab).toHaveAttribute('aria-expanded', 'true');
    await panel.getByRole('link', { name: '登场战役' }).click();
    await expect(panel).toBeHidden();
    await expectBelowNav(page, '登场战役');
});

test('short entry has no table of contents', async ({ page }) => {
    await page.goto('/projects/status/benbo/');
    await expect(page.locator('[data-entry-toc]')).toBeHidden();
    await expect(page.locator('[data-entry-toc-side]')).toBeHidden();
    await expect(page.locator('[data-entry-toc-fab]')).toBeHidden();
});
