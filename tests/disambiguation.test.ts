import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildDisambiguationIndex, findDisambiguation, isDisambiguationEntry } from '../src/utils/disambiguation.ts';
import { extractTitle } from '../src/utils/wiki-link-parser.ts';

const entries = [
    { id: 'disambiguation/chendao', title: '陈到' },
    { id: 'bio/chendao', title: '陈到' },
    { id: 'treasure/chendao', title: '陈到' },
    { id: 'bio/caocao', title: '曹操' }
];
const index = buildDisambiguationIndex(entries);

test('isDisambiguationEntry: only ids under disambiguation/ count', () => {
    assert.equal(isDisambiguationEntry({ id: 'disambiguation/chendao' }), true);
    assert.equal(isDisambiguationEntry({ id: 'bio/disambiguation' }), false);
});

test('findDisambiguation: entries sharing a disambiguation title link back to it', () => {
    assert.equal(findDisambiguation({ id: 'bio/chendao', title: '陈到' }, index), 'disambiguation/chendao');
    assert.equal(findDisambiguation({ id: 'treasure/chendao', title: '陈到' }, index), 'disambiguation/chendao');
});

test('findDisambiguation: the disambiguation page itself gets no backlink', () => {
    assert.equal(findDisambiguation({ id: 'disambiguation/chendao', title: '陈到' }, index), null);
});

test('findDisambiguation: entries without a disambiguation page get no backlink', () => {
    assert.equal(findDisambiguation({ id: 'bio/caocao', title: '曹操' }, index), null);
});

// 真实内容一致性：每个消歧义页至少能回链到 2 个同名词条（不写死总数，新增消歧义页时无需改测试）
test('findDisambiguation (real content): every disambiguation page is linked back from at least two entries', () => {
    const root = 'src/content/projects';
    const all: { id: string; title: string }[] = [];
    for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const f of fs.readdirSync(path.join(root, dir.name)).filter((n) => /\.mdx?$/.test(n))) {
            const title = extractTitle(fs.readFileSync(path.join(root, dir.name, f), 'utf8'));
            if (title) all.push({ id: `${dir.name}/${f.replace(/\.mdx?$/, '')}`, title });
        }
    }

    const realIndex = buildDisambiguationIndex(all);
    assert.ok(realIndex.size > 0, '应至少存在一个消歧义页');

    const backlinks = new Map<string, number>();
    for (const entry of all) {
        const target = findDisambiguation(entry, realIndex);
        if (target) backlinks.set(target, (backlinks.get(target) ?? 0) + 1);
    }
    for (const id of realIndex.values()) {
        assert.ok((backlinks.get(id) ?? 0) >= 2, `${id} 的同名词条少于 2 个`);
    }
});
