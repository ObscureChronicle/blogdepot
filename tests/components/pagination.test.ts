import { experimental_AstroContainer } from 'astro/container';
import type { Page } from 'astro';
import { beforeEach, describe, expect, it } from 'vitest';
import Pagination from '../../src/components/Pagination.astro';

const BASE = '/blog';

function pageUrl(n: number): string {
    return n <= 1 ? BASE : `${BASE}/${n}`;
}

function makePage(currentPage: number, lastPage: number): Page<unknown> {
    return {
        data: [],
        start: 0,
        end: 0,
        size: 4,
        total: lastPage * 4,
        currentPage,
        lastPage,
        url: {
            current: pageUrl(currentPage),
            prev: currentPage > 1 ? pageUrl(currentPage - 1) : undefined,
            next: currentPage < lastPage ? pageUrl(currentPage + 1) : undefined,
            first: currentPage === 1 ? undefined : pageUrl(1),
            last: currentPage === lastPage ? undefined : pageUrl(lastPage)
        }
    };
}

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

function render(page: Page<unknown>, extraProps: Record<string, unknown> = {}) {
    return container.renderToString(Pagination, { props: { page, basePath: BASE, ...extraProps } });
}

describe('Pagination.astro', () => {
    it('renders both prev and next buttons on a middle page', async () => {
        const html = await render(makePage(5, 10));
        expect(html).toContain(`href="${pageUrl(4)}"`);
        expect(html).toContain(`href="${pageUrl(6)}"`);
    });

    it('omits the prev button and data-prev-href on the first page', async () => {
        const html = await render(makePage(1, 10));
        expect(html).not.toContain('aria-label="Go to page 0 of 10"');
        expect(html).not.toContain('data-prev-href');
    });

    it('omits the next button and data-next-href on the last page', async () => {
        const html = await render(makePage(10, 10));
        expect(html).not.toContain('aria-label="Go to page 11 of 10"');
        expect(html).not.toContain('data-next-href');
    });

    it('shows the mobile "page X of Y" text', async () => {
        const html = await render(makePage(3, 8));
        expect(html).toContain('第 3 页，共 8 页');
    });

    it('renders no page-number list or jump box when there is only one page', async () => {
        const html = await render(makePage(1, 1));
        expect(html).not.toContain('pagination-jump');
        expect(html).not.toContain('<ul');
    });

    it('lists every page number with no ellipsis when the total is below the threshold', async () => {
        const html = await render(makePage(2, 5));
        for (let n = 1; n <= 5; n++) {
            expect(html).toContain(`aria-label="Go to page ${n} of 5"`);
        }
        expect(html).not.toContain('…');
    });

    it('marks the current page link with aria-current="page"', async () => {
        const html = await render(makePage(3, 5));
        expect(html).toContain('aria-label="Go to page 3 of 5" aria-current="page"');
        expect(html).not.toContain('aria-label="Go to page 2 of 5" aria-current="page"');
    });

    it('shows ellipsis and a desktop jump box once the total exceeds the threshold', async () => {
        const html = await render(makePage(10, 30));
        expect(html).toContain('…');
        expect(html).toContain('pagination-jump-input');
        expect(html).toContain('共 30 页');
    });

    it('generates correct hrefs via buildPageUrl for boundary and sibling pages', async () => {
        const html = await render(makePage(10, 30));
        expect(html).toContain(`href="${BASE}"`);
        expect(html).toContain(`href="${BASE}/30"`);
        expect(html).toContain(`href="${BASE}/9"`);
        expect(html).toContain(`href="${BASE}/11"`);
    });

    it('includes data-astro-prefetch on prev/next and page-number links', async () => {
        const html = await render(makePage(5, 10));
        const prefetchCount = (html.match(/data-astro-prefetch/g) || []).length;
        expect(prefetchCount).toBeGreaterThan(0);
    });

    it('shows the mobile jump box even when the desktop ellipsis threshold is not reached', async () => {
        const html = await render(makePage(1, 3));
        const jumpBoxCount = (html.match(/pagination-jump/g) || []).length;
        expect(jumpBoxCount).toBeGreaterThan(0);
        // 桌面端阈值内（3 页 <= 7）不应该出现省略号
        expect(html).not.toContain('…');
    });

    it('respects custom siblingCount/boundaryCount to widen the visible page range', async () => {
        const narrow = await render(makePage(10, 30));
        const wide = await render(makePage(10, 30), { siblingCount: 3, boundaryCount: 2 });
        const countPageLinks = (html: string) => (html.match(/aria-label="Go to page \d+ of 30"/g) || []).length;
        expect(countPageLinks(wide)).toBeGreaterThan(countPageLinks(narrow));
    });
});
