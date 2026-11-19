import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import ClassTree from '../../src/components/ClassTree.astro';
import ClassTreeDiagram from '../../src/components/ClassTreeDiagram.astro';
import { classTreeCards } from '../../src/data/class-tree';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

const cardLabels = (html: string) => [...html.matchAll(/aria-label="兵种树：([^"]+)"/g)].map((m) => m[1]);

describe('ClassTreeDiagram.astro', () => {
    it('renders every card with linked nodes by default', async () => {
        const html = await container.renderToString(ClassTreeDiagram);
        expect(cardLabels(html)).toEqual(classTreeCards.map((card) => card.root));
        expect(html).toContain('href="/projects/class/hufuqibing/"');
        expect(html).toContain('mx-[calc(50%-50vw)]');
        expect(html.match(/<table/g)).toHaveLength(classTreeCards.length);
    });

    it('draws a many-to-many link group as one bus edge', async () => {
        const html = await container.renderToString(ClassTreeDiagram, { props: { cards: classTreeCards.filter((c) => c.root === '弓骑兵') } });
        expect(html).toContain('data-from="强弓骑|游袭弓骑|重甲弓骑|弩骑兵|胡服骑兵|马上重弩兵" data-to="西羌弓骑|浮图弩骑|西域弓骑"');
    });

    it('marks the current class and stays within the text width when inline', async () => {
        const html = await container.renderToString(ClassTreeDiagram, { props: { cards: classTreeCards.slice(0, 1), current: '虎兵', inline: true } });
        expect(html.match(/ctree-node is-current/g)).toHaveLength(1);
        expect(html).not.toContain('mx-[calc(50%-50vw)]');
    });
});

describe('ClassTree.astro', () => {
    it('shows every card containing the current class in the base edition', async () => {
        const html = await container.renderToString(ClassTree, {
            params: { id: 'class/hufuqibing' },
            props: { parents: ['刀骑兵', '矛骑兵', '弓骑兵'], upgrades: ['虎豹骑'] }
        });
        expect(cardLabels(html)).toEqual(['刀骑兵', '矛骑兵', '弓骑兵']);
        expect(html).toContain('>兵种树</h2>');
        expect(html).not.toContain('可转职兵种');
    });

    it('lists the conditions of every second-row class under the card on a base class page', async () => {
        const html = await container.renderToString(ClassTree, {
            params: { id: 'class/daobing' },
            props: { tone: 'base', upgrades: ['重装刀兵'] }
        });
        expect(cardLabels(html)).toEqual(['刀兵']);
        expect(html).toContain('智略≥60');
        expect(html).toContain('<span class="text-stat-neg">无条件，但后续亦无法再度转职</span>');
        expect(html).not.toContain('转职条件</span>');
    });

    it('lists only its own condition once on a second-row class page', async () => {
        const html = await container.renderToString(ClassTree, {
            params: { id: 'class/hufuqibing' },
            props: { parents: ['刀骑兵', '矛骑兵', '弓骑兵'], condition: ['未曾「厌弃」异族'] }
        });
        expect(cardLabels(html)).toHaveLength(3);
        expect(html.match(/<tbody>/g)).toHaveLength(1);
        expect(html).toContain('未曾「厌弃」异族');
        expect(html).not.toContain('武勇≥90');
        expect(html.indexOf('<table')).toBeGreaterThan(html.lastIndexOf('class-tree-card'));
    });

    it('shows no condition table on a third-row class page', async () => {
        const html = await container.renderToString(ClassTree, {
            params: { id: 'class/hubaoqi' },
            props: { parents: ['驿传刀骑'] }
        });
        expect(cardLabels(html)).toEqual(['刀骑兵', '矛骑兵']);
        expect(html).not.toContain('<table');
    });

    it('keeps the text list for the 星命诀 section', async () => {
        const html = await container.renderToString(ClassTree, {
            params: { id: 'class/daobing' },
            props: { tone: 'dlc', parents: ['虎贲营印绶'], upgrades: ['方阵'], treeTitle: '详情', parentsLabel: '解锁道具', upgradesLabel: '可变化阵势' }
        });
        expect(cardLabels(html)).toEqual([]);
        expect(html).toContain('解锁道具');
        expect(html).toContain('可变化阵势');
    });
});
