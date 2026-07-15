/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// 只用来跑需要真正编译 .astro 文件的测试（比如 Astro Container API 渲染测试）。
// 纯逻辑单测继续用零依赖的 Node 内置 test runner（tests/*.test.ts，npm test），
// 两者用目录分开，避免各自的 runner 尝试去跑对方那一批文件。
export default getViteConfig({
    test: {
        include: ['tests/components/**/*.test.ts']
    }
});
