import { expect, test } from '@playwright/test';

test.describe('日志列表筛选', () => {
    test('点击类别进入该类别的列表，选中项标记 aria-current，分页留在该类别下', async ({ page }) => {
        await page.goto('/blog/');
        const filter = page.getByRole('navigation', { name: '日志筛选' });
        await expect(filter.getByRole('link', { name: /^全部/ })).toHaveAttribute('aria-current', 'page');

        await filter.getByRole('link', { name: /^创作手记/ }).click();
        await expect(page).toHaveURL(/\/blog\/category\/diary\/$/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('日志・创作手记');
        await expect(filter.getByRole('link', { name: /^创作手记/ })).toHaveAttribute('aria-current', 'page');
        await expect(page.getByRole('navigation', { name: '分页' }).getByRole('link', { name: /^下一页/ })).toHaveAttribute(
            'href',
            '/blog/category/diary/2/'
        );
    });

    test('点击年份只列出该年的日志', async ({ page }) => {
        await page.goto('/blog/');
        await page.getByRole('navigation', { name: '日志筛选' }).getByRole('link', { name: /^2023/ }).click();
        await expect(page).toHaveURL(/\/blog\/year\/2023\/$/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('日志・2023年');
        const dates = await page.locator('main time').allTextContents();
        expect(dates.length).toBeGreaterThan(0);
    });

    test('筛选栏不会撑出横向滚动条', async ({ page }) => {
        await page.goto('/blog/');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
    });
});
