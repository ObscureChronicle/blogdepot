import { defineConfig, devices } from '@playwright/test';

// E2E 测的是真实构建产物（astro preview 服务 dist/），而不是 astro dev，
// 更接近实际部署后的行为（比如 ClientRouter 的页面过渡、prefetch）。
const PORT = 4324;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry'
    },
    webServer: {
        command: `npm run build && npm run preview -- --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['Pixel 5'] } }
    ]
});
