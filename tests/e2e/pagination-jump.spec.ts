import { expect, test } from '@playwright/test';

// biography 标签下有 400+ 篇内容，稳定跨很多页，用来测跳转框最合适。
const TAG_PATH = '/tags/biography/';

// 页面上跳转框其实有两份（移动端一份、桌面端一份），用 ul 限定桌面端这一份，
// 避免选中被 CSS（sm:hidden）藏起来、不可交互的移动端副本。两份背后是同一段
// 脚本逻辑，移动端那份的存在性/可用性已经在 pagination-mobile.spec.ts 里单独
// 覆盖了，这里只在 desktop project 下跑，避免重复测同一段 JS 逻辑两遍。
test.describe('分页跳转输入框（桌面端）', () => {
    test.beforeEach(async ({}, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', '只在 desktop project 下有意义');
    });

    test('输入合法页码并按 Enter，跳转到对应页', async ({ page }) => {
        await page.goto(TAG_PATH);
        const input = page.locator('ul .pagination-jump-input');
        await input.fill('20');
        await input.press('Enter');
        await expect(page).toHaveURL(/\/tags\/biography\/20\/?$/);
    });

    test('输入合法页码并点击 Go，跳转到对应页', async ({ page }) => {
        await page.goto(TAG_PATH);
        const jumpContainer = page.locator('ul .pagination-jump');
        await jumpContainer.locator('.pagination-jump-input').fill('15');
        await jumpContainer.locator('.pagination-jump-btn').click();
        await expect(page).toHaveURL(/\/tags\/biography\/15\/?$/);
    });

    test('输入超出范围的页码，跳转会被 clamp 到最后一页', async ({ page }) => {
        await page.goto(TAG_PATH);
        const input = page.locator('ul .pagination-jump-input');
        // 总页数从页面自己的 data-last-page 属性动态读取，不写死具体数字——
        // 以后 biography 标签下的内容增减，总页数会变，测试不该跟着报错。
        const lastPage = Number(await input.getAttribute('data-last-page'));
        expect(lastPage).toBeGreaterThan(0);
        await input.fill(String(lastPage + 1000));
        await input.press('Enter');
        await expect(page).toHaveURL(new RegExp(`/tags/biography/${lastPage}/?$`));
    });

    test('空输入按 Enter 不会触发跳转', async ({ page }) => {
        await page.goto(`${TAG_PATH}20/`);
        const input = page.locator('ul .pagination-jump-input');
        await input.fill('');
        await input.press('Enter');
        await page.waitForTimeout(300);
        await expect(page).toHaveURL(/\/tags\/biography\/20\/?$/);
    });

    test('非整数输入按 Enter 不会触发跳转，输入框会有错误提示样式', async ({ page }) => {
        await page.goto(`${TAG_PATH}20/`);
        const input = page.locator('ul .pagination-jump-input');
        await input.fill('3.5');
        await input.press('Enter');
        await page.waitForTimeout(300);
        await expect(page).toHaveURL(/\/tags\/biography\/20\/?$/);
        await expect(input).toHaveClass(/border-red-500/);
    });
});
