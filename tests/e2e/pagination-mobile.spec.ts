import { expect, test } from '@playwright/test';

// 这几个用例专门验证移动端布局，只在 mobile project（窄视口）下有意义——
// 在桌面宽视口下，这里断言的移动端元素本来就该是隐藏状态，直接在这个 project
// 下跳过，而不是让它们以"违背设计"的方式失败。
function mobileOnly(testInfo: { project: { name: string } }) {
    test.skip(testInfo.project.name !== 'mobile', '只在 mobile project 下有意义');
}

test.describe('移动端分页布局', () => {
    test('移动端显示"第 X 页，共 Y 页"文案，桌面端页码列表隐藏', async ({ page }, testInfo) => {
        mobileOnly(testInfo);
        await page.goto('/tags/biography/20/');
        // 总页数不写死具体数字，只验证当前页码对、且格式正确——biography 标签
        // 下的内容以后增减，总页数会变，测试不该跟着报错。
        await expect(page.getByText(/第 20 页，共 \d+ 页/)).toBeVisible();
        await expect(page.locator('ul.hidden.sm\\:inline-flex')).toBeHidden();
    });

    test('页数较少（低于桌面省略号阈值）时，移动端跳转框依然存在且可用', async ({ page }, testInfo) => {
        mobileOnly(testInfo);
        await page.goto('/tags/trait/');
        const jumpInput = page.locator('div.pagination-jump .pagination-jump-input');
        await expect(jumpInput).toBeVisible();
        await jumpInput.fill('2');
        await jumpInput.press('Enter');
        await expect(page).toHaveURL(/\/tags\/trait\/2\/?$/);
    });

    test('只有 1 页时，移动端也不显示跳转框', async ({ page }, testInfo) => {
        mobileOnly(testInfo);
        await page.goto('/tags/wiki-a/');
        await expect(page.locator('.pagination-jump')).toHaveCount(0);
    });
});
