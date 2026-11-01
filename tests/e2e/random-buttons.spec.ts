import { expect, test } from '@playwright/test';

// 首页随机按钮：路径池在点击时才从 /random-paths.json 加载，用 ClientRouter 跳转；
// 换页回首页后按钮要依然有效，并且每次点击只发生一次跳转。
test.describe('首页随机按钮', () => {
    test('随机百科条目、随机日志都能跳到对应页面，换页回首页后依然有效', async ({ page }) => {
        const jsonRequests: string[] = [];
        page.on('request', (req) => {
            if (req.url().endsWith('/random-paths.json')) jsonRequests.push(req.url());
        });

        await page.goto('/');
        expect(jsonRequests).toEqual([]);

        await page.locator('[data-random="projects"]').click();
        await expect(page).toHaveURL(/\/projects\/[^/]+\/[^/]+\/$/);

        await page.goBack();
        await expect(page).toHaveURL(/\/$/);
        await page.locator('[data-random="blog"]').click();
        await expect(page).toHaveURL(/\/blog\/[^/]+\/$/);

        // 路径池只加载一次
        expect(jsonRequests).toHaveLength(1);
    });
});
