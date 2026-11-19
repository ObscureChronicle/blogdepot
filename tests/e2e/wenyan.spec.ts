import { expect, test } from '@playwright/test';

test.describe('文存版式', () => {
    test('普通文存（廖豪传）：刻本版式 + 朱印，不叠加笺纸，也不显示通用结尾符', async ({ page }) => {
        await page.goto('/blog/wenyan-1/');

        await expect(page.locator('article.wenyan')).toHaveCount(1);
        await expect(page.locator('.wenyan-excerpt')).toBeVisible();
        await expect(page.locator('.wenyan-seal')).toBeVisible();
        await expect(page.locator('.wenyan-body--letter')).toHaveCount(0);
        await expect(page.locator('.note-end')).toHaveCount(0);
    });

    test('书信（与公子书）：笺纸行线与正文行对齐，抬头顶格、落款右对齐', async ({ page }, testInfo) => {
        await page.goto('/blog/wenyan-3/');

        const body = page.locator('.wenyan-body--letter');
        await expect(body).toBeVisible();

        // 每个段落的上边缘和高度都应落在行线网格上（行高的整数倍），否则文字会压线
        const offsets = await body.evaluate((el) => {
            const style = getComputedStyle(el);
            const contentTop = el.getBoundingClientRect().top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
            // 朱印所在的段落在最后，高度由印章决定，不参与网格检查
            return [...el.querySelectorAll(':scope > p:not(.wenyan-seal-wrap)')].map((p) => {
                const line = parseFloat(getComputedStyle(p).lineHeight);
                const rect = p.getBoundingClientRect();
                const remainder = (value: number) => Math.min(value % line, line - (value % line));
                return { top: remainder(rect.top - contentTop), height: remainder(rect.height) };
            });
        });
        expect(offsets.length).toBeGreaterThan(0);
        for (const { top, height } of offsets) {
            expect(top).toBeLessThan(1);
            expect(height).toBeLessThan(1);
        }

        await expect(page.locator('p.wenyan-salute')).toHaveCSS('text-indent', '0px');
        await expect(page.locator('p.wenyan-sign')).toHaveCSS('text-align', 'right');

        // 截图留在 test-results/ 和 HTML 报告里，方便人工核对笺纸效果
        const shot = testInfo.outputPath('letter.png');
        await body.screenshot({ path: shot });
        await testInfo.attach('笺纸版式', { path: shot, contentType: 'image/png' });
    });

    test('非文存日志不受影响：仍是通用结尾符，没有文存的类', async ({ page }) => {
        await page.goto('/blog/post-yuantan/');

        await expect(page.locator('.note-end')).toHaveCount(1);
        await expect(page.locator('.wenyan, .wenyan-body, .wenyan-seal')).toHaveCount(0);
    });
});
