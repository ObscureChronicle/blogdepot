import { expect, test } from '@playwright/test';

// 人物能力区的形态切换（baseForms 多于一个时才有按钮），按钮同时切换雷达图、柱状图和特质表
test('switching base form swaps the traits table', async ({ page }) => {
    await page.goto('/projects/bio/caocao/');
    // 星命诀栏里那份占位按钮是 aria-hidden 的，按角色查询只会拿到真正的按钮
    const first = page.getByRole('button', { name: '奋武将军' });
    const second = page.getByRole('button', { name: '魏武挥鞭' });
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('明候', { exact: true })).toBeVisible();
    await expect(page.getByText('号令', { exact: true })).toHaveCount(0);

    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('号令', { exact: true })).toBeVisible();
    await expect(page.getByText('明候', { exact: true })).toHaveCount(0);
});

test('a single-form character has no form toggle', async ({ page }) => {
    await page.goto('/projects/bio/agui/');
    await expect(page.locator('h2', { hasText: '能力' })).toBeVisible();
    await expect(page.locator('[aria-pressed]')).toHaveCount(0);
});
