import { expect, test } from '@playwright/test';
import { onlyOn } from './helpers';

// 兵种树节点与转职条件表行的联动高亮（悬停只在桌面端有意义）
test.beforeEach(() => onlyOn('desktop', '悬停联动只在有鼠标的桌面端生效'));

test('overview: hovering a node highlights its condition row in the same card only', async ({ page }) => {
    await page.goto('/projects/class/00_total/');
    const daoCard = page.locator('[data-ctree-scope]').filter({ has: page.locator('svg[aria-label="兵种树：刀兵"]') });
    const maoCard = page.locator('[data-ctree-scope]').filter({ has: page.locator('svg[aria-label="兵种树：矛兵"]') });

    await daoCard.locator('.ctree-node[data-name="荷剑矛兵"]').hover();
    await expect(daoCard.locator('tr[data-name="荷剑矛兵"]')).toHaveClass(/is-hl/);
    await expect(maoCard.locator('tr[data-name="荷剑矛兵"]')).not.toHaveClass(/is-hl/);
});

test('overview: hovering a condition row activates the matching node', async ({ page }) => {
    await page.goto('/projects/class/00_total/');
    const daoCard = page.locator('[data-ctree-scope]').filter({ has: page.locator('svg[aria-label="兵种树：刀兵"]') });

    await daoCard.locator('tr[data-name="突袭刀兵"]').hover();
    await expect(daoCard.locator('.ctree-node[data-name="突袭刀兵"]')).toHaveClass(/is-active/);
    await expect(daoCard.locator('svg.class-tree-card')).toHaveClass(/is-dim/);
});

test('second-row class page: its single condition row activates the class in every card', async ({ page }) => {
    await page.goto('/projects/class/hufuqibing/');
    await page.locator('tr[data-name="胡服骑兵"]').hover();
    await expect(page.locator('.ctree-node.is-active[data-name="胡服骑兵"]')).toHaveCount(3);

    await page.locator('svg[aria-label="兵种树：矛骑兵"] .ctree-node[data-name="胡服骑兵"]').hover();
    await expect(page.locator('tr[data-name="胡服骑兵"]')).toHaveClass(/is-hl/);
});
