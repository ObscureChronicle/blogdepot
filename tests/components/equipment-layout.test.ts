import { getContainerRenderer as reactContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import EquipmentWiki from '../../src/components/Layout_Equipments.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeAll(async () => {
    // 效果表 EquipmentStats 是 React 组件，需要注册 React 渲染器
    const renderers = await loadRenderers([reactContainerRenderer()]);
    container = await experimental_AstroContainer.create({ renderers });
});

const render = (props: Record<string, unknown>) => container.renderToString(EquipmentWiki, { props });

const variant = (description: string, effect: string, extra: Record<string, unknown> = {}) => ({
    description,
    equipment: { base: { 效果: [effect] } },
    ...extra
});

const blocks = (html: string, group: string) =>
    [...html.matchAll(new RegExp(`<(\\w+)[^>]*data-variant-group="${group}"[^>]*data-variant-index="(\\d)"([^>]*)>`, 'g'))].map((m) => ({
        tag: m[1],
        index: m[2],
        hidden: /\bhidden\b/.test(m[0])
    }));

describe('Layout_Equipments.astro 多首附诗', () => {
    it('renders 其一/其二/其三 toggle buttons, the first one active', async () => {
        const html = await render({ baseVariants: [variant('甲诗', '甲效果'), variant('乙诗', '乙效果'), variant('丙诗', '丙效果')], baseOwner: ['曹髦'] });
        const buttons = [...html.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>\s*([^<]*?)\s*<\/button>/g)].map((m) => [m[2], m[1]]);
        expect(buttons).toEqual([
            ['其一', 'true'],
            ['其二', 'false'],
            ['其三', 'false']
        ]);
    });

    it('renders every poem and effect, hiding all but the first, so 说明 and 效果 switch together', async () => {
        const html = await render({ baseVariants: [variant('甲诗', '甲效果'), variant('乙诗', '乙效果')] });
        for (const text of ['甲诗', '乙诗', '甲效果', '乙效果']) expect(html).toContain(text);

        const tagged = blocks(html, 'treasure-base');
        expect(tagged.filter((b) => b.tag === 'p').map((b) => [b.index, b.hidden])).toEqual([
            ['0', false],
            ['1', true]
        ]);
        expect(tagged.filter((b) => b.tag === 'div' && b.index === '1').every((b) => b.hidden)).toBe(true);
    });

    it('uses a variant owner when given and falls back to baseOwner otherwise', async () => {
        const html = await render({ baseVariants: [variant('甲诗', '甲效果'), variant('乙诗', '乙效果', { owner: ['荀溯之'] })], baseOwner: ['陈泰'] });
        const ownerSection = html.slice(html.indexOf('正主'));
        expect(ownerSection).toContain('陈泰');
        expect(ownerSection).toContain('荀溯之');
    });

    it('honours a custom label', async () => {
        const html = await render({ baseVariants: [variant('甲诗', '甲效果', { label: '初版' }), variant('乙诗', '乙效果')] });
        expect(html).toMatch(/>\s*初版\s*<\/button>/);
        expect(html).toMatch(/>\s*其二\s*<\/button>/);
    });

    it('keeps single-poem entries free of toggles and variant attributes', async () => {
        const html = await render({ baseDescription: '愿飞安得翼，欲济河无梁。', baseEquipment: { base: { 效果: ['攻击时附加状态'] } }, baseOwner: ['朱然'] });
        expect(html).toContain('愿飞安得翼');
        expect(html).not.toContain('data-variant');
        expect(html).not.toContain('<button');
    });
});

describe('Layout_Equipments.astro 关联人物', () => {
    it('renders relatedPeople as character links below 正主', async () => {
        const html = await render({ baseOwner: ['曹髦'], relatedPeople: ['曹操', '无名氏'] });
        expect(html).toContain('>关联人物</h2>');
        expect(html.indexOf('>正主</h2>')).toBeLessThan(html.indexOf('>关联人物</h2>'));
        expect(html).toContain('href="/projects/bio/caocao/"');
        expect(html).toContain('<span>无名氏</span>');
    });

    it('renders no section without relatedPeople', async () => {
        const html = await render({ baseOwner: ['曹髦'] });
        expect(html).not.toContain('关联人物');
    });
});
