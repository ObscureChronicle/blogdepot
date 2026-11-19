import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { TreeSkillEdge, TreeSkillNode } from '../src/data/art-of-war-tree.ts';
import { getSkillRelations } from '../src/utils/art-of-war-relations.ts';

const names = (nodes: TreeSkillNode[]) => nodes.map((n) => n.name);

test('getSkillRelations: real data — 破竹 has two prerequisites and two unlocks', () => {
    const r = getSkillRelations('pozhu');
    assert.ok(r);
    assert.equal(r.node.level, 2);
    assert.deepEqual(names(r.prerequisites), ['强攻', '秣马']);
    assert.deepEqual(names(r.unlocks), ['掠袭', '喝阻']);
    assert.deepEqual(r.exclusives, []);
});

test('getSkillRelations: real data — 强攻 is a level-1 skill exclusive with 秣马', () => {
    const r = getSkillRelations('qianggong');
    assert.ok(r);
    assert.deepEqual(r.prerequisites, []);
    assert.deepEqual(names(r.unlocks), ['破竹', '猛进']);
    assert.deepEqual(names(r.exclusives), ['秣马']);
});

test('getSkillRelations: real data — exclusive relation is found from either side', () => {
    assert.deepEqual(names(getSkillRelations('luexi')?.exclusives ?? []), ['喝阻']);
    assert.deepEqual(names(getSkillRelations('hezu')?.exclusives ?? []), ['掠袭']);
});

test('getSkillRelations: unknown slug returns null', () => {
    assert.equal(getSkillRelations('not-on-the-tree'), null);
});

const node = (slug: string, level: number, col: number): TreeSkillNode => ({ name: slug.toUpperCase(), slug, level, col, color: '#000', group: '未分组' });

test('getSkillRelations: results are sorted by level then column, duplicates removed', () => {
    const nodes = [node('t', 3, 5), node('b', 2, 9), node('a', 2, 1), node('c', 1, 4), node('x', 3, 1), node('y', 3, 9)];
    const edges: TreeSkillEdge[] = [
        { from: 'b', to: 't', kind: 'pre' },
        { from: 'c', to: 't', kind: 'pre' },
        { from: 'a', to: 't', kind: 'pre' },
        { from: 'a', to: 't', kind: 'pre' },
        { from: 'y', to: 't', kind: 'exclusive' },
        { from: 't', to: 'x', kind: 'exclusive' }
    ];
    const r = getSkillRelations('t', nodes, edges);
    assert.ok(r);
    assert.deepEqual(names(r.prerequisites), ['C', 'A', 'B']);
    assert.deepEqual(names(r.exclusives), ['X', 'Y']);
    assert.deepEqual(r.unlocks, []);
});

test('getSkillRelations: edges pointing to nodes missing from the tree are ignored', () => {
    const r = getSkillRelations('t', [node('t', 2, 0)], [{ from: 'ghost', to: 't', kind: 'pre' }]);
    assert.deepEqual(r?.prerequisites, []);
});
