import { experimental_AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ReferenceLayout from '../../src/components/Layout_Reference.astro';
import { CLASSIC_GROUPS, classics, works } from '../../src/data/references';

let html: string;

beforeAll(async () => {
    const container = await experimental_AstroContainer.create();
    html = await container.renderToString(ReferenceLayout);
});

describe('Layout_Reference.astro', () => {
    it('renders one shelf per classic group, in order, none of them empty', () => {
        const labels = [...html.matchAll(/<figcaption[^>]*>([^<]*)<\/figcaption>/g)].map((m) => m[1]);
        expect(labels).toEqual([...CLASSIC_GROUPS]);
        for (const group of CLASSIC_GROUPS) {
            expect(classics.some((book) => book.group === group)).toBe(true);
        }
    });

    it('puts every classic on a spine, with its title length for the spine height', () => {
        const spines = [...html.matchAll(/<li class="spine"[^>]*style="--len: (\d+)"[^>]*>\s*([^<]*?)\s*<\/li>/g)].map((m) => [m[2], Number(m[1])]);
        expect(spines).toEqual(classics.map((book) => [book.title, [...book.title].length]));
    });

    it('lists every work with its author and a bracketed title', () => {
        const items = [...html.matchAll(/<span class="work-author"[^>]*>([^<]*)<\/span>\s*<span class="work-title"[^>]*>([^<]*)<\/span>/g)].map((m) => [
            m[1],
            m[2]
        ]);
        expect(items).toEqual(works.map((work) => [work.author, `《${work.title}》`]));
    });

    it('matches the snapshot', () => {
        expect(html).toMatchSnapshot();
    });
});
