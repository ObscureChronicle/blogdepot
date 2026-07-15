import { expect, test } from '@playwright/test';

// NavLink 命中时加的是独立的 "underline" class；未命中时链接本身也常年带着
// "hover:underline" 这种悬浮态 class，纯 /underline/ 的正则会把两者都匹配上，
// 必须用词边界排除 "hover:underline" 这种前缀写法。
const ACTIVE_CLASS = /(?:^|\s)underline(?:\s|$)/;

// 桌面端菜单在小屏幕下用 CSS（max-md:absolute + max-md:invisible）隐藏，链接元素本身
// 仍在 DOM 里但不可见/不可交互，用 ul 限定桌面端这一份，和 pagination-jump.spec.ts
// 里同样的原因，避免选中被藏起来的移动端副本。
test.describe('主导航高亮', () => {
    test.beforeEach(async ({}, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', '只在 desktop project 下有意义');
    });

    test('主页只在路径正好是 / 时高亮，不会在其他页面上一直亮着', async ({ page }) => {
        const home = page.locator('ul').getByRole('link', { name: '主页', exact: true });

        await page.goto('/');
        await expect(home).toHaveClass(ACTIVE_CLASS);

        await page.goto('/blog/');
        await expect(home).not.toHaveClass(ACTIVE_CLASS);
    });

    test('百科词条详情页（/projects/...）会让「百科」nav 高亮', async ({ page }) => {
        await page.goto('/projects/bio/caocao/');
        const wiki = page.locator('ul').getByRole('link', { name: '百科', exact: true });
        await expect(wiki).toHaveClass(ACTIVE_CLASS);
    });

    test('日志详情页会让「日志」nav 高亮，且不会同时点亮「百科」', async ({ page }) => {
        await page.goto('/blog/');
        const firstPost = page.locator('main a[href^="/blog/"]').first();
        await firstPost.click();

        const blog = page.locator('ul').getByRole('link', { name: '日志', exact: true });
        const wiki = page.locator('ul').getByRole('link', { name: '百科', exact: true });
        await expect(blog).toHaveClass(ACTIVE_CLASS);
        await expect(wiki).not.toHaveClass(ACTIVE_CLASS);
    });
});
