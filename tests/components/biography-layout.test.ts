import { getContainerRenderer as reactContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import BiographyLayout from '../../src/components/BiographyLayout.astro';
import { EDITIONS } from '../../src/data/editions';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeAll(async () => {
    // 能力区是 React island（CharacterAbilitySection），需要注册 React 渲染器才能做服务端渲染
    const renderers = await loadRenderers([reactContainerRenderer()]);
    container = await experimental_AstroContainer.create({ renderers });
});

const render = (props: Record<string, unknown>) => container.renderToString(BiographyLayout, { props: { intro: '主要', nameTableData: {}, ...props } });

const form = (name: string, n: number, traits: string[]) => ({ name, data: [n, n, n, n, n], data2: [n, n], traits, figure: [n, 0, 0, 0, 0] });

describe('BiographyLayout.astro 能力区', () => {
    it('renders one toggle button per base form, the first one active, showing its traits', async () => {
        const html = await render({
            baseForms: [form('初期', 1, ['甲特性']), form('中期', 2, ['乙特性']), form('后期', 3, ['丙特性'])]
        });
        const buttons = [...html.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>([^<]*)<\/button>/g)].map((m) => [m[2], m[1]]);
        expect(buttons).toEqual([
            ['初期', 'true'],
            ['中期', 'false'],
            ['后期', 'false']
        ]);
        // island 的 props 属性里带着所有形态的数据，只检查实际渲染出来的部分
        const rendered = html.slice(html.indexOf('await-children>'));
        expect(rendered).toContain('甲特性');
        expect(rendered).not.toContain('乙特性');
    });

    it('passes each form its own figure (上限加成) to the island', async () => {
        const html = await render({ baseForms: [form('初期', 1, []), form('后期', 2, [])] });
        const props = JSON.parse(html.match(/<astro-island[^>]*\sprops="([^"]*)"/)![1].replaceAll('&quot;', '"'));
        // Astro 序列化格式：数组为 [1, [[0, 值], ...]]，对象为 [0, { 键: 值 }]
        const figures = props.baseForms[1].map(([, f]: [number, { figure: [number, [number, number][]] }]) => f.figure[1].map(([, v]) => v));
        expect(figures).toEqual([
            [1, 0, 0, 0, 0],
            [2, 0, 0, 0, 0]
        ]);
    });

    it('renders no toggle for a single form', async () => {
        const html = await render({ baseForms: [{ data: [1, 1, 1, 1, 1], data2: [1, 1], traits: ['甲特性'] }] });
        expect(html).not.toContain('aria-pressed');
        expect(html).toContain(EDITIONS.base.shortName);
        expect(html).toContain('甲特性');
    });

    it('adds an invisible placeholder toggle in the 星命诀 column so both columns line up', async () => {
        const html = await render({
            baseForms: [form('初期', 1, []), form('后期', 2, [])],
            dlcData: [5, 5, 5, 5, 5],
            dlcData2: [5, 5],
            dlcAttributeFigure: [0, 0, 0, 0, 0],
            traitsDLC: ['星特性']
        });
        expect(html).toMatch(/<div aria-hidden="true" class="invisible hidden sm:block">/);
        expect(html).toContain('星特性');
    });

    it('still renders the ability section for a 星命诀-only character', async () => {
        const html = await render({ dlcData: [5, 5, 5, 5, 5], dlcData2: [5, 5], dlcAttributeFigure: [0, 0, 0, 0, 0], traitsDLC: ['星特性'] });
        expect(html).toContain(`登场于${EDITIONS.dlc.name}的主要角色。`);
        expect(html).toContain('>能力</h2>');
        expect(html).toContain('星特性');
        expect(html).not.toContain('aria-hidden="true" class="invisible');
    });

    it('treats a character with neither base nor 星命诀 data as a background character', async () => {
        const html = await render({});
        expect(html).toContain('背景人物。');
        expect(html).not.toContain('>能力</h2>');
    });
});
