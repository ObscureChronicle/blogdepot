import { expect, test, type Page, type Request } from '@playwright/test';

type ProjectName = 'desktop' | 'mobile';

/** 只在指定的 project（见 playwright.config.ts）下运行当前用例，在 test 或 beforeEach 里调用 */
export function onlyOn(project: ProjectName, reason: string) {
    test.skip(test.info().project.name !== project, reason);
}

type NavFlagWindow = Window & { __e2eNavStarted?: boolean };

/**
 * 断言 action 不会触发页面跳转。
 *
 * 站点用 ClientRouter，脚本里调用 navigate() 时会同步派发 astro:before-preparation，
 * 所以在派发 action 前挂一个监听，action 结束后检查标记即可，不需要固定等几百毫秒。
 * 同时监听整页导航请求，兜底 ClientRouter 退回 location.href 的情况。
 */
export async function expectNoNavigation(page: Page, action: () => Promise<void>) {
    const startUrl = page.url();
    await page.evaluate(() => {
        const win = window as NavFlagWindow;
        win.__e2eNavStarted = false;
        document.addEventListener('astro:before-preparation', () => (win.__e2eNavStarted = true), { once: true });
    });
    const navRequests: string[] = [];
    const onRequest = (req: Request) => {
        if (req.isNavigationRequest() && req.frame() === page.mainFrame()) navRequests.push(req.url());
    };
    page.on('request', onRequest);
    try {
        await action();
        // 等一个渲染帧再加一个宏任务，让 action 触发的回调都执行完
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0))));
        expect(await page.evaluate(() => (window as NavFlagWindow).__e2eNavStarted), 'ClientRouter 开始了跳转').toBe(false);
        expect(navRequests, '发生了整页跳转').toEqual([]);
        expect(page.url()).toBe(startUrl);
    } finally {
        page.off('request', onRequest);
    }
}
