import { expect, test } from '@playwright/test';

const URL = '/blog/changelog/';

test('changelog: toolbar appears, newest version is open and years are divided', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-changelog-toolbar]')).toBeVisible();

    const entries = page.locator('[data-changelog-entry]');
    await expect(entries.first()).toHaveAttribute('open', '');
    await expect(entries.nth(1)).not.toHaveAttribute('open', '');

    // 第一个年份分隔在最新版本之前，且每个年份只出现一次
    const years = await page.locator('[data-changelog-year]').evaluateAll((els) => els.map((el) => el.textContent));
    expect(years[0]).toBe(await entries.first().getAttribute('data-year'));
    expect(new Set(years).size).toBe(years.length);
    await expect(page.locator('[data-changelog-status]')).toHaveText(/^共 \d+ 个版本$/);
});

test('changelog: category filter keeps only matching items and restores on 全部', async ({ page }) => {
    await page.goto(URL);
    const toolbar = page.locator('[data-changelog-toolbar]');
    await toolbar.locator('[data-changelog-category="剧情"]').click();
    await expect(toolbar.locator('[data-changelog-category="剧情"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-changelog-status]')).toHaveText(/^命中 \d+ 项，分布在 \d+ 个版本$/);

    // 可见条目全部带「剧情」标签
    const visibleTags = await page
        .locator('[data-changelog-entry]:not([hidden]) li[data-changelog-item]:not([hidden])')
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.tags ?? ''));
    expect(visibleTags.length).toBeGreaterThan(0);
    for (const tags of visibleTags) expect(tags.split(' ')).toContain('剧情');

    await toolbar.locator('[data-changelog-all]').click();
    await expect(page.locator('[data-changelog-status]')).toHaveText(/^共 \d+ 个版本$/);
    await expect(page.locator('li[data-changelog-item][hidden]')).toHaveCount(0);
    // 恢复筛选前的展开状态：只有最新版本展开
    await expect(page.locator('[data-changelog-entry][open]')).toHaveCount(1);
});

test('changelog: search highlights hits and reports empty results', async ({ page }) => {
    await page.goto(URL);
    const search = page.locator('[data-changelog-search]');
    await search.fill('木牛流马');
    await expect(page.locator('.changelog-mark').first()).toHaveText('木牛流马');
    await expect(page.locator('[data-changelog-entry]:not([hidden])').first()).toHaveAttribute('open', '');

    await search.fill('这段文字不会出现在日志里');
    await expect(page.locator('[data-changelog-status]')).toHaveText('没有符合条件的更新');
    await expect(page.locator('[data-changelog-entry]:not([hidden])')).toHaveCount(0);

    await search.fill('');
    await expect(page.locator('.changelog-mark')).toHaveCount(0);
});

test('changelog: expand all / collapse all toggles every visible version', async ({ page }) => {
    await page.goto(URL);
    const toggle = page.locator('[data-changelog-toggle-all]');
    const entries = page.locator('[data-changelog-entry]');
    const total = await entries.count();

    await toggle.click();
    await expect(page.locator('[data-changelog-entry][open]')).toHaveCount(total);
    await expect(toggle).toHaveText('全部收起');

    await toggle.click();
    await expect(page.locator('[data-changelog-entry][open]')).toHaveCount(0);
    await expect(toggle).toHaveText('全部展开');
});

test('changelog: #version in the address opens that version below the sticky toolbar', async ({ page }) => {
    await page.goto(`${URL}#E1.10`);
    const target = page.locator('[id="E1.10"]');
    await expect(target).toHaveAttribute('open', '');
    await expect
        .poll(async () => {
            const toolbarBottom = await page.locator('[data-changelog-toolbar]').evaluate((el) => el.getBoundingClientRect().bottom);
            return (await target.evaluate((el) => el.getBoundingClientRect().top)) >= toolbarBottom;
        }, '目标版本被吸顶筛选栏挡住')
        .toBe(true);
});

test('changelog: an in-page #version link opens a version hidden by the filter', async ({ page }) => {
    await page.goto(URL);
    await page.locator('[data-changelog-search]').fill('这段文字不会出现在日志里');
    await expect(page.locator('[id="E1.21"]')).toBeHidden();

    // 页内锚点链接：不会重新加载页面
    await page.evaluate(() => {
        const a = document.createElement('a');
        a.href = '#E1.21';
        a.id = 'e2e-hash-link';
        a.textContent = 'E1.21';
        document.querySelector('article')?.prepend(a);
    });
    await page.locator('#e2e-hash-link').click();
    await expect(page.locator('[id="E1.21"]')).toBeVisible();
    await expect(page.locator('[id="E1.21"]')).toHaveAttribute('open', '');
    await expect(page.locator('[data-changelog-search]')).toHaveValue('');
});
