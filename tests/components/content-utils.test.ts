import { describe, expect, it } from 'vitest';
import { loadCollection } from './helpers/load-content.ts';
import { getSortedBlogPosts } from '../../src/utils/content-utils.ts';

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
