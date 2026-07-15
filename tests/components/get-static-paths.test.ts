import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import { loadCollection } from './helpers/load-content.ts';

// astro:content 是虚拟模块，getCollection() 依赖 Astro 自己的内容层同步状态，
// 而 vitest.config.ts 用的 getViteConfig() 内部把 sync 写死成了 false——这在
// 本地因为一直有上一次 astro build/dev 留下的缓存，看起来"能用"，但在全新
// checkout（比如 CI 的 npm ci 之后直接跑测试）下会静默返回空数组，不报错，
// 非常隐蔽（实测在 CI 上就是这样翻车的）。直接 mock 掉 getCollection，改成
// 从磁盘读真实内容文件，绕开 Astro 内容层的同步状态依赖。
vi.mock('astro:content', () => ({
    getCollection: async (name: 'blog' | 'projects') => loadCollection(name)
}));

const { getStaticPaths: getBlogPaths } = await import('../../src/pages/blog/[...page].astro');
const { getStaticPaths: getProjectsPaths } = await import('../../src/pages/projects/[...page].astro');
const { getStaticPaths: getTagsPaths } = await import('../../src/pages/tags/[id]/[...page].astro');
const { sortItemsByDateDesc } = await import('../../src/utils/data-utils.ts');
const { sortPostsByTitlePinyin } = await import('../../src/utils/sort-by-pinyin.ts');

// 这是一个最小化、忠实还原核心分块逻辑的 paginate() 替身，不生成真实 URL
// （那部分依赖 Astro 内部未公开的路由匹配器）。这里只关心：数据有没有被
// 正确按 pageSize 分块、页码有没有算对、传入的 props 有没有被保留。
function fakePaginate(data: unknown[], opts: { pageSize?: number; params?: Record<string, string>; props?: Record<string, unknown> } = {}) {
    const pageSize = opts.pageSize ?? 10;
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    return Array.from({ length: lastPage }, (_, i) => {
        const pageNum = i + 1;
        const start = (pageNum - 1) * pageSize;
        const end = Math.min(start + pageSize, data.length);
        return {
            params: { ...opts.params, page: pageNum === 1 ? undefined : String(pageNum) },
            props: {
                ...opts.props,
                page: {
                    data: data.slice(start, end),
                    start,
                    end: end - 1,
                    size: pageSize,
                    total: data.length,
                    currentPage: pageNum,
                    lastPage,
                    url: { current: '', next: undefined, prev: undefined }
                }
            }
        };
    });
}

describe('blog/[...page].astro getStaticPaths', () => {
    it('paginates every real blog post exactly once, sorted by date descending', async () => {
        const realPosts = (await getCollection('blog')).sort(sortItemsByDateDesc);
        const result = await getBlogPaths({ paginate: fakePaginate } as any);

        const allPaginatedIds = result.flatMap((r: any) => r.props.page.data.map((p: any) => p.id));
        expect(allPaginatedIds).toEqual(realPosts.map((p) => p.id));
        for (const r of result as any[]) {
            expect(r.props.page.data.length).toBeLessThanOrEqual(r.props.page.size);
        }
    });

    it('sets the same latestSlug on every generated page, not just the first', async () => {
        const realPosts = (await getCollection('blog')).sort(sortItemsByDateDesc);
        const result = await getBlogPaths({ paginate: fakePaginate } as any);

        expect(result.length).toBeGreaterThan(1);
        for (const r of result as any[]) {
            expect(r.props.latestSlug).toBe(realPosts[0].id);
        }
    });
});

describe('projects/[...page].astro getStaticPaths', () => {
    it('paginates every real project exactly once, sorted by title pinyin', async () => {
        const realProjects = sortPostsByTitlePinyin(await getCollection('projects'));
        const result = await getProjectsPaths({ paginate: fakePaginate } as any);

        const allPaginatedIds = result.flatMap((r: any) => r.props.page.data.map((p: any) => p.id));
        expect(allPaginatedIds).toEqual(realProjects.map((p) => p.id));
    });
});

describe('tags/[id]/[...page].astro getStaticPaths', () => {
    it('generates at least one page for a known blog-only tag, sorted by date descending', async () => {
        const result = await getTagsPaths({ paginate: fakePaginate } as any);
        const diaryPages = (result as any[]).filter((r) => r.params.id === 'diary');
        expect(diaryPages.length).toBeGreaterThan(0);

        const allDiaryPosts = diaryPages.flatMap((r) => r.props.page.data);
        expect(allDiaryPosts.every((p: any) => p.collection === 'blog')).toBe(true);
        for (let i = 1; i < allDiaryPosts.length; i++) {
            expect(new Date(allDiaryPosts[i - 1].data.publishDate).getTime()).toBeGreaterThanOrEqual(new Date(allDiaryPosts[i].data.publishDate).getTime());
        }
    });

    it('generates pages for a non-wiki projects tag ("equipment"), sorted by title pinyin (the item-5 bug fix)', async () => {
        const result = await getTagsPaths({ paginate: fakePaginate } as any);
        const equipmentPages = (result as any[]).filter((r) => r.params.id === 'equipment');
        expect(equipmentPages.length).toBeGreaterThan(0);

        const posts = equipmentPages.flatMap((r) => r.props.page.data);
        expect(posts.every((p: any) => p.collection === 'projects')).toBe(true);
        const expectedOrder = sortPostsByTitlePinyin(posts).map((p: any) => p.id);
        expect(posts.map((p: any) => p.id)).toEqual(expectedOrder);
    });

    it('sorts a large projects tag ("biography") by pinyin BEFORE pagination, so order is continuous across page boundaries', async () => {
        const result = await getTagsPaths({ paginate: fakePaginate } as any);
        const bioPages = (result as any[]).filter((r) => r.params.id === 'biography').sort((a, b) => a.props.page.currentPage - b.props.page.currentPage);

        // 这个标签的文章数量足够多，一定会跨多页，才能真正检验"分页前排序"这件事
        expect(bioPages.length).toBeGreaterThan(1);

        const flattened = bioPages.flatMap((r) => r.props.page.data);
        const expectedOrder = sortPostsByTitlePinyin(flattened).map((p: any) => p.id);
        expect(flattened.map((p: any) => p.id)).toEqual(expectedOrder);
    });

    it('still sorts a wiki-* tag by pinyin (regression check for the pre-existing wiki special case)', async () => {
        const result = await getTagsPaths({ paginate: fakePaginate } as any);
        const wikiATag = (result as any[]).filter((r) => r.params.id === 'wiki-a');
        if (wikiATag.length === 0) return; // 内容里可能暂时没有 wiki-a 的条目，跳过而不是误报失败

        const posts = wikiATag.flatMap((r) => r.props.page.data);
        const expectedOrder = sortPostsByTitlePinyin(posts).map((p: any) => p.id);
        expect(posts.map((p: any) => p.id)).toEqual(expectedOrder);
    });
});
