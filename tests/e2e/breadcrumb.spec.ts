import { expect, test } from '@playwright/test';

test.describe('百科词条面包屑', () => {
    test('直接访问详情页时，只渲染静态两级兜底，且没有 JS 报错', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));

        await page.goto('/projects/bio/caocao/');

        const nav = page.getByRole('navigation', { name: '面包屑导航' });
        await expect(nav.getByRole('link', { name: '首页' })).toBeVisible();
        await expect(nav.getByRole('link', { name: '百科' })).toBeVisible();
        await expect(nav).toContainText('曹操');
        await expect(nav.locator('#breadcrumb-dynamic')).toBeHidden();

        expect(errors).toEqual([]);
    });

    test('从分类检索进入，面包屑中间层显示「分类：人物」，且链接回原分类页', async ({ page }) => {
        await page.goto('/tags/biography/');
        await page.getByRole('link', { name: '阿贵' }).click();

        const nav = page.getByRole('navigation', { name: '面包屑导航' });
        const dynamic = nav.locator('#breadcrumb-dynamic');
        await expect(dynamic).toBeVisible();
        await expect(dynamic).toHaveText('分类：人物');
        await expect(dynamic.getByRole('link')).toHaveAttribute('href', '/tags/biography/');
    });

    test('从音序检索进入，面包屑中间层显示「音序：D」，且链接回原字母页', async ({ page }) => {
        await page.goto('/tags/wiki-d/');
        await page.getByRole('link', { name: '戴陵' }).click();

        const nav = page.getByRole('navigation', { name: '面包屑导航' });
        const dynamic = nav.locator('#breadcrumb-dynamic');
        await expect(dynamic).toBeVisible();
        await expect(dynamic).toHaveText('音序：D');
        await expect(dynamic.getByRole('link')).toHaveAttribute('href', '/tags/wiki-d/');
    });
});
