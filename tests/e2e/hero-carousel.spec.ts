import { expect, test, type Page } from '@playwright/test';

// 激活状态以 data-active 为准：上层图片和下层简介各一组，同一下标同步切换，
// 这里只看下层面板（带 role="group" 的那一组）。
const panel = (page: Page, index: number) => page.locator('[data-hero-carousel] div[data-hero-slide]').nth(index);
const progress = (page: Page) => page.locator('[data-hero-progress]');

test.describe('首页轮播', () => {
    test.beforeEach(async ({ page }) => {
        // 不依赖外网：Steam widget 请求一律拦掉，断言只看 iframe 的 src 属性
        await page.route('**/store.steampowered.com/**', (route) => route.abort());
    });

    test('点击箭头切换，并在首次切到第 2 张时才加载它的 Steam widget', async ({ page }) => {
        await page.goto('/');
        const secondIframe = panel(page, 1).locator('iframe');
        await expect(secondIframe).not.toHaveAttribute('src');

        await page.getByRole('button', { name: '下一个' }).click();
        await expect(panel(page, 1)).toHaveAttribute('data-active', 'true');
        await expect(panel(page, 0)).toHaveAttribute('data-active', 'false');
        await expect(secondIframe).toHaveAttribute('src', /\/widget\/2694320\//);

        await page.getByRole('button', { name: '上一个' }).click();
        await expect(panel(page, 0)).toHaveAttribute('data-active', 'true');
    });

    test('进度线动画走完后自动切到下一张', async ({ page }) => {
        await page.goto('/');
        await expect(panel(page, 0)).toHaveAttribute('data-active', 'true');

        // page.clock 管不到 CSS 动画，直接用 Web Animations API 把动画拨到快结束，免得真等 10 秒
        await progress(page).evaluate((el) => {
            const [animation] = el.getAnimations();
            animation.currentTime = 9990;
        });
        await expect(panel(page, 1)).toHaveAttribute('data-active', 'true');
    });

    test('鼠标悬停时暂停，移开后恢复', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', '触屏设备没有悬停');
        await page.goto('/');
        const carousel = page.locator('[data-hero-carousel]');
        const playState = () => progress(page).evaluate((el) => el.getAnimations()[0]?.playState);

        await carousel.hover();
        await expect(carousel).toHaveAttribute('data-paused', 'true');
        expect(await playState()).toBe('paused');

        await page.mouse.move(0, 0);
        await expect(carousel).toHaveAttribute('data-paused', 'false');
        expect(await playState()).toBe('running');
    });

    test('触屏点击箭头后不会被当成悬停而停住自动播放', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', '只有触屏会在点击时模拟 mouseenter');
        await page.goto('/');
        const carousel = page.locator('[data-hero-carousel]');

        await page.getByRole('button', { name: '下一个' }).tap();
        await expect(panel(page, 1)).toHaveAttribute('data-active', 'true');
        await expect(carousel).toHaveAttribute('data-paused', 'false');
    });

    test('减少动态效果偏好下不自动播放，但箭头仍可手动切换', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');

        expect(await progress(page).evaluate((el) => el.getAnimations().length)).toBe(0);

        await page.getByRole('button', { name: '下一个' }).click();
        await expect(panel(page, 1)).toHaveAttribute('data-active', 'true');
    });

    test('首次加载及经 ClientRouter 离开再回到首页后，都不会重复绑定', async ({ page }) => {
        // 只有两张时，重复绑定的两份实例会同步切换，单看 DOM 结果区分不出来，
        // 所以在页面脚本运行前包装 addEventListener，直接统计"下一个"按钮上的 click 监听器数量
        await page.addInitScript(() => {
            const counts = new WeakMap<EventTarget, number>();
            const original = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, ...rest: unknown[]) {
                if (type === 'click') counts.set(this, (counts.get(this) ?? 0) + 1);
                return (original as (...args: unknown[]) => void).call(this, type, ...rest);
            };
            (window as unknown as { __clickListeners: (el: Element) => number }).__clickListeners = (el) => counts.get(el) ?? 0;
        });
        const nextListeners = () =>
            page.locator('[data-hero-next]').evaluate((el) => (window as unknown as { __clickListeners: (el: Element) => number }).__clickListeners(el));

        await page.goto('/');
        // 首次加载时模块脚本和 astro:page-load 都会调用一次初始化
        await expect.poll(nextListeners).toBe(1);
        // 整页刷新会清掉这个标记，用来确认下面两次都是客户端导航
        await page.evaluate(() => ((window as unknown as { __spa: boolean }).__spa = true));

        await page.getByRole('link', { name: '所有日志' }).click();
        await expect(page).toHaveURL(/\/blog\/?$/);
        // 日志列表页不显示站点标题头，用后退返回首页（ClientRouter 同样按客户端导航处理）
        await page.goBack();
        await expect(page).toHaveURL(/\/$/);
        expect(await page.evaluate(() => (window as unknown as { __spa?: boolean }).__spa)).toBe(true);
        await expect.poll(nextListeners).toBe(1);

        await page.getByRole('button', { name: '下一个' }).click();
        await expect(panel(page, 1)).toHaveAttribute('data-active', 'true');
        await page.getByRole('button', { name: '下一个' }).click();
        await expect(panel(page, 0)).toHaveAttribute('data-active', 'true');
    });
});
