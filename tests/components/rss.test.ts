import { getCollection } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { GET } from '../../src/pages/rss.xml.js';
import { sortItemsByDateDesc } from '../../src/utils/data-utils.ts';

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
