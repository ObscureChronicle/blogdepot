import { expect, test } from '@playwright/test';

test.describe('主题切换', () => {
    test('点击切换按钮会给 <html> 加/去 dark class', async ({ page }) => {
        await page.goto('/');
        const html = page.locator('html');
        const wasDark = (await html.getAttribute('class'))?.includes('dark') ?? false;

        await page.click('#theme-toggle');
        await expect(html).toHaveClass(wasDark ? /^((?!dark).)*$/ : /dark/);
    });

    test('切换后刷新页面，深色模式状态会保留（localStorage 持久化）', async ({ page }) => {
        await page.goto('/');
        const html = page.locator('html');
        const wasDark = (await html.getAttribute('class'))?.includes('dark') ?? false;

        await page.click('#theme-toggle');
        const isDarkAfterClick = (await html.getAttribute('class'))?.includes('dark') ?? false;
        expect(isDarkAfterClick).toBe(!wasDark);

        await page.reload();
        const isDarkAfterReload = (await page.locator('html').getAttribute('class'))?.includes('dark') ?? false;
        expect(isDarkAfterReload).toBe(isDarkAfterClick);
    });
});

test.describe('移动端导航菜单', () => {
    test('点击展开按钮会打开菜单，再点一次会关闭', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', '菜单展开按钮 md:hidden，只在窄视口下可见');

        await page.goto('/');
        const toggle = page.locator('.menu-toggle');
        const menu = page.locator('.menu');

        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).not.toHaveClass(/is-visible/);

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(menu).toHaveClass(/is-visible/);

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).not.toHaveClass(/is-visible/);
    });
});
