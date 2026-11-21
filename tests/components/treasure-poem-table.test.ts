import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/utils/treasure-poems-data', () => ({
    getTreasurePoemRows: () => [
        { slug: 'yitian', title: '倚天', base: ['东到蓬莱山，上至天之门。'], dlc: ['东到蓬莱山，上至天之门。'], hant: '', ja: '', en: '' },
        { slug: 'li', title: '离', base: ['昔年江畔，共谁策马？'], dlc: ['日中见沬，折其右肱。'], hant: '昔年江畔，共誰策馬？', ja: '昔年江畔、共に誰と策馬したか？', en: 'By the river years ago, who rode with me?' }
    ]
}));

import TableTreasurePoems from '../../src/components/Table_TreasurePoems.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

const render = () => container.renderToString(TableTreasurePoems);

describe('Table_TreasurePoems.astro', () => {
    it('renders the two-level header and a row per entry', async () => {
        const html = await render();
        for (const text of ['名称', '附诗', '原文', '本地化']) expect(html).toContain(text);
        expect(html).toContain('href="/projects/treasure/yitian/"');
        expect(html).toContain('href="/projects/treasure/li/"');
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

    it('shows — for missing localization and the localized text when present', async () => {
        const html = await render();
        expect(html).toContain('—');
        expect(html).toContain('昔年江畔，共誰策馬？');
        expect(html).toContain('昔年江畔、共に誰と策馬したか？');
        expect(html).toContain('By the river years ago, who rode with me?');
    });

    it('labels both editions only when the poems differ', async () => {
        const html = await render();
        expect(html).toContain('本传');
        expect(html).toContain('星命诀');
        expect(html).toContain('昔年江畔，共谁策马？');
        expect(html).toContain('日中见沬，折其右肱。');
    });
});
