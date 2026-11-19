import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import BlogFilter from '../../src/components/BlogFilter.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

function currentLinks(html: string): string[] {
    return [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map((m) => m[1]);
}

describe('BlogFilter.astro', () => {
    it('links to every category and year with trailing slashes', async () => {
        const html = await container.renderToString(BlogFilter, { props: { active: { kind: 'all' } } });
        expect(html).toContain('href="/blog/"');
        expect(html).toContain('href="/blog/category/diary/"');
        expect(html).toContain('href="/blog/year/2025/"');
        expect(html).toMatch(/创作手记\s*<span[^>]*>\d+<\/span>/);
    });

    it.each([
        [{ kind: 'all' }, '/blog/'],
        [{ kind: 'category', id: 'diary' }, '/blog/category/diary/'],
        [{ kind: 'year', year: '2025' }, '/blog/year/2025/']
    ])('marks only the active item as current (%o)', async (active, href) => {
        const html = await container.renderToString(BlogFilter, { props: { active } });
        expect(currentLinks(html)).toEqual([href]);
    });
});
