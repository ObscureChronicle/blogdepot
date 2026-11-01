import { vi } from 'vitest';
import { loadCollection } from './load-content.ts';

// 所有组件测试共用：astro:content 是虚拟模块，getCollection() 依赖 Astro 自己的
// 内容层同步状态，而 vitest.config.ts 用的 getViteConfig() 内部把 sync 写死成了
// false——本地因为有上一次 build/dev 留下的缓存，看起来"能用"，但在全新 checkout
// （比如 CI 的 npm ci 之后直接跑测试）下会静默返回空数组，不报错（实测在 CI 上
// 就是这样翻车的）。所以在 setupFiles 里统一 mock 掉 getCollection，改成从磁盘
// 读真实内容文件（见 load-content.ts），新写的测试不会再掉进这个坑。
vi.mock('astro:content', () => ({
    getCollection: async (name: 'blog' | 'projects') => loadCollection(name)
}));
