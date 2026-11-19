import { expect, test } from '@playwright/test';

// 依赖 jsDelivr 上的 Algolia 前端库和 Algolia 服务，网络不通时会失败（e2e 本身是非阻塞项）
test('nav search button opens the full-screen search panel on any page', async ({ page }) => {
    await page.goto('/projects/bio/caocao/');
    // 平时不加载搜索脚本，点击后才加载
    await expect(page.locator('script[src*="algoliasearchNetlify"]')).toHaveCount(0);

    await page.getByRole('button', { name: '搜索词条' }).click();
    const input = page.locator('.aa-DetachedContainer input');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('placeholder', '搜索词条…');
    await expect(page.locator('.aa-DetachedCancelButton')).toHaveText('取消');

    await input.fill('曹操');
    await expect(page.locator('.aa-DetachedContainer .aa-Item').first()).toBeVisible({ timeout: 10_000 });

    await page.locator('.aa-DetachedCancelButton').click();
    await expect(page.locator('.aa-DetachedContainer')).toHaveCount(0);
});
