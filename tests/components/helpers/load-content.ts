import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { blogSchema, projectsSchema } from '../../../src/content-schemas.ts';

// astro:content 是虚拟模块，getCollection() 依赖 Astro 自己的内容层同步状态
// （node_modules/.astro/data-store.json），而 vitest.config.ts 里用的
// getViteConfig() 内部把 sync 写死成了 false（Astro 官方就是这么实现的，
// 不是配置疏漏）——这在本地因为一直有上一次 astro build/dev 留下的缓存,
// 看起来"能用",但在全新 checkout（比如 CI 的 npm ci 之后直接跑测试）下
// getCollection() 会静默返回空数组，不会报错，非常隐蔽。
//
// 这里绕开 astro:content，直接读磁盘上的真实内容文件，构造跟
// CollectionEntry 形状一致的对象，在需要真实内容规模（比如跨很多页的
// 标签）做集成测试的地方，用 vi.mock('astro:content', ...) 换掉
// getCollection 的实现。
//
// frontmatter 用 Astro 构建时同一份 schema 解析：日期字符串转成 Date、
// 补上默认值、去掉 schema 外的字段，跟运行时代码拿到的 data 形状一致。

const SCHEMAS = { blog: blogSchema, projects: projectsSchema };

export type LoadedEntry = {
    id: string;
    collection: 'blog' | 'projects';
    data: Record<string, unknown>;
};

export function loadCollection(collectionName: 'blog' | 'projects'): LoadedEntry[] {
    const base = path.join(process.cwd(), 'src/content', collectionName);
    const files = fs.globSync('**/*.{md,mdx}', { cwd: base });
    return files.map((file) => {
        const raw = fs.readFileSync(path.join(base, file), 'utf8');
        const id = file.replace(/\.(md|mdx)$/, '').split(path.sep).join('/');
        return {
            id,
            collection: collectionName,
            data: SCHEMAS[collectionName].parse(matter(raw).data)
        };
    });
}
