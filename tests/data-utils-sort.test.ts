import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortItemsByDateDesc } from '../src/utils/data-utils.ts';

function entry(id: string, publishDate?: string) {
    return { id, data: { publishDate: publishDate ? new Date(publishDate) : undefined } } as any;
}

test('sortItemsByDateDesc: sorts newest first', () => {
    const items = [entry('old', '2020-01-01'), entry('new', '2025-01-01'), entry('mid', '2022-06-15')];
    const sorted = [...items].sort(sortItemsByDateDesc);
    assert.deepEqual(
        sorted.map((i) => i.id),
        ['new', 'mid', 'old']
    );
});

test('sortItemsByDateDesc: items without publishDate sort after all dated items', () => {
    const items = [entry('undated'), entry('dated', '2020-01-01')];
    const sorted = [...items].sort(sortItemsByDateDesc);
    assert.deepEqual(
        sorted.map((i) => i.id),
        ['dated', 'undated']
    );
});

test('sortItemsByDateDesc: two undated items compare as equal', () => {
    assert.equal(sortItemsByDateDesc(entry('a'), entry('b')), 0);
});

test('sortItemsByDateDesc: identical dates compare as equal', () => {
    assert.equal(sortItemsByDateDesc(entry('a', '2024-05-01'), entry('b', '2024-05-01')), 0);
});

test('sortItemsByDateDesc: mixed dated blog + undated projects keeps undated ones in original relative order (stable sort)', () => {
    const items = [entry('wiki-entry'), entry('blog-post', '2024-01-01'), entry('another-wiki')];
    const sorted = [...items].sort(sortItemsByDateDesc);
    assert.deepEqual(
        sorted.map((i) => i.id),
        ['blog-post', 'wiki-entry', 'another-wiki']
    );
});
