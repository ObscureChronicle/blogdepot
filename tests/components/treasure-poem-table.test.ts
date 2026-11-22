import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/utils/treasure-poems-data', () => ({
    getTreasurePoemGroups: () => [
        {
            slug: 'yitian',
            title: '倚天',
            rows: [{ text: '东到蓬莱山，上至天之门。', editions: ['base', 'dlc'], hant: '', ja: '', en: '' }]
        },
        {
            slug: 'li',
            title: '离',
            rows: [
                {
                    text: '昔年江畔，共谁策马？',
                    editions: ['base'],
                    hant: '昔年江畔，共誰策馬？',
                    ja: '昔年江畔、共に誰と策馬したか？',
                    en: 'By the river years ago, who rode with me?'
                },
                { text: '日中见沬，折其右肱。', editions: ['dlc'], hant: '', ja: '', en: '' }
            ]
        },
        { slug: '00_treasure-type', title: '配饰', rows: [] }
    ]
}));

import TableTreasurePoems from '../../src/components/Table_TreasurePoems.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

const render = () => container.renderToString(TableTreasurePoems);

describe('Table_TreasurePoems.astro', () => {
    it('renders the two-level header and one name cell per entry', async () => {
        const html = await render();
        for (const text of ['名称', '附诗', '原文', '本地化']) expect(html).toContain(text);
        expect(html).toContain('href="/projects/treasure/yitian/"');
        expect((html.match(/href="\/projects\/treasure\/li\/"/g) || []).length).toBe(1);
    });

    it('renders the three language radios with 繁體字 selected by default', async () => {
        const html = await render();
        expect(html).toContain('value="hant" checked');
        expect(html).toContain('value="ja"');
        expect(html).toContain('value="en"');
        expect(html).toContain('繁體字');
        expect(html).toContain('日本語');
        expect(html).toContain('English');
    });

    it('gives every poem its own row and pairs the localization with that row', async () => {
        const html = await render();
        expect(html).toContain('rowspan="2"');
        expect(html).toContain('昔年江畔，共誰策馬？');
        expect(html).toContain('昔年江畔、共に誰と策馬したか？');
        expect(html).toContain('By the river years ago, who rode with me?');
        expect(html).toContain('日中见沬，折其右肱。');
        expect(html).toContain('—');
        // 三列各一行的本地化占位：yitian 1 行 + li 2 行
        expect((html.match(/data-poem-lang="hant"/g) || []).length).toBe(3);
    });

    it('labels both editions when the poems differ, and leaves identical editions unlabeled', async () => {
        const html = await render();
        expect((html.match(/本传/g) || []).length).toBe(1);
        expect((html.match(/星命诀/g) || []).length).toBe(1);
    });

    it('skips entries with no poem rows', async () => {
        const html = await render();
        expect(html).not.toContain('href="/projects/treasure/00_treasure-type/"');
    });
});
