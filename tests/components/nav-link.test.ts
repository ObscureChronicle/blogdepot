import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import NavLink from '../../src/components/NavLink.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

function render(href: string, currentPath: string, extraProps: Record<string, unknown> = {}) {
    return container.renderToString(NavLink, {
        props: { href, ...extraProps },
        slots: { default: 'Link text' },
        request: new Request(`https://example.com${currentPath}`)
    });
}

describe('NavLink.astro', () => {
    it('applies the active underline classes when href matches the current path exactly', async () => {
        const html = await render('/blog', '/blog');
        expect(html).toContain('underline');
    });

    it('applies the active classes when href matches the current path modulo a trailing slash', async () => {
        const html = await render('/blog', '/blog/');
        expect(html).toContain('underline');
    });

    it('does not apply the active classes when href does not match the current path', async () => {
        const html = await render('/blog', '/projects');
        expect(html).not.toContain('underline');
    });

    it('renders the href and slot content', async () => {
        const html = await render('/about', '/blog');
        expect(html).toContain('href="/about"');
        expect(html).toContain('Link text');
    });

    it('passes through extra attributes and a custom class', async () => {
        const html = await render('/about', '/blog', { class: 'text-xl', 'aria-current': 'page' });
        expect(html).toContain('text-xl');
        expect(html).toContain('aria-current="page"');
    });
});
