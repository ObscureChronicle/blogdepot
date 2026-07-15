import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import IconButton from '../../src/components/IconButton.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

describe('IconButton.astro', () => {
    it('renders an <a> with the given href when href is provided', async () => {
        const html = await container.renderToString(IconButton, {
            props: { href: '/somewhere' },
            slots: { default: 'Icon' }
        });
        expect(html).toContain('<a');
        expect(html).toContain('href="/somewhere"');
        expect(html).toContain('Icon');
        expect(html).not.toContain('<button');
    });

    it('renders a <button> with cursor-pointer when no href is provided', async () => {
        const html = await container.renderToString(IconButton, {
            slots: { default: 'Icon' }
        });
        expect(html).toContain('<button');
        expect(html).toContain('cursor-pointer');
        expect(html).not.toContain('<a ');
    });

    it('merges a custom class alongside the base button classes', async () => {
        const html = await container.renderToString(IconButton, {
            props: { class: 'absolute left-0' },
            slots: { default: 'Icon' }
        });
        expect(html).toContain('absolute left-0');
        expect(html).toContain('rounded-full');
    });

    it('spreads extra passthrough attributes onto the rendered element', async () => {
        const html = await container.renderToString(IconButton, {
            props: { href: '/x', 'aria-label': 'Go somewhere', 'data-astro-prefetch': true },
            slots: { default: 'Icon' }
        });
        expect(html).toContain('aria-label="Go somewhere"');
        expect(html).toContain('data-astro-prefetch');
    });
});
