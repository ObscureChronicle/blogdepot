import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import { loadCollection } from './helpers/load-content.ts';

// 见 get-static-paths.test.ts 顶部的注释：astro:content 在 Vitest 下依赖
// Astro 自己的内容层同步状态，CI 全新 checkout 时会静默返回空数组。
// mock 掉 getCollection，改成从磁盘读真实内容文件。
vi.mock('astro:content', () => ({
    getCollection: async (name: 'blog' | 'projects') => loadCollection(name)
}));

const { GET } = await import('../../src/pages/rss.xml.js');
const { sortItemsByDateDesc } = await import('../../src/utils/data-utils.ts');

async function fetchFeed() {
    const res = await GET({ site: new URL('https://example.com') } as any);
    const text = await res.text();
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    return { text, items };
}

function field(itemXml: string, tag: string): string | null {
    return itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? null;
}

describe('rss.xml.js', () => {
    it('returns well-formed RSS XML with the site title/description/link', async () => {
        const { text } = await fetchFeed();
        expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(text).toMatch(/^[\s\S]*<rss version="2\.0">[\s\S]*<\/rss>$/);
        expect(text).toContain('<link>https://example.com/</link>');
    });

    it('includes exactly one <item> per real blog post', async () => {
        const realPosts = await getCollection('blog');
        const { items } = await fetchFeed();
        expect(items.length).toBe(realPosts.length);
    });

    it('gives every item a non-empty title, link, and pubDate', async () => {
        const { items } = await fetchFeed();
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(field(item, 'title')).toBeTruthy();
            expect(field(item, 'link')).toMatch(/^https:\/\/example\.com\/blog\/[^/]+\/$/);
            expect(field(item, 'pubDate')).toBeTruthy();
        }
    });

    it('orders items by publish date descending, matching sortItemsByDateDesc', async () => {
        const realPosts = (await getCollection('blog')).sort(sortItemsByDateDesc);
        const { items } = await fetchFeed();
        const feedLinks = items.map((item) => field(item, 'link'));
        const expectedLinks = realPosts.map((p) => `https://example.com/blog/${p.id}/`);
        expect(feedLinks).toEqual(expectedLinks);
    });
});
