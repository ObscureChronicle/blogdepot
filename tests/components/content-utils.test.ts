import { describe, expect, it, vi } from 'vitest';
import { loadCollection } from './helpers/load-content.ts';

// 见 get-static-paths.test.ts 顶部的注释：mock 掉 getCollection，改成从磁盘读真实内容文件。
vi.mock('astro:content', () => ({
    getCollection: async (name: 'blog' | 'projects') => loadCollection(name)
}));

const { getSortedBlogPosts } = await import('../../src/utils/content-utils.ts');

describe('getSortedBlogPosts', () => {
    it('returns every blog post, newest first', async () => {
        const posts = await getSortedBlogPosts();
        expect(posts.length).toBe(loadCollection('blog').length);
        expect(posts.every((p) => p.collection === 'blog')).toBe(true);
        for (let i = 1; i < posts.length; i++) {
            expect(posts[i - 1].data.publishDate.getTime()).toBeGreaterThanOrEqual(posts[i].data.publishDate.getTime());
        }
    });
});
