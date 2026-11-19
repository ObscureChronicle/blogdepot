import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBlogTitle } from '../src/utils/blog-title.ts';

test('splitBlogTitle: splits the series prefix from the subject at the first ・', () => {
    assert.deepEqual(splitBlogTitle('2025年创作手记・曹操'), { eyebrow: '2025年创作手记', main: '曹操' });
    assert.deepEqual(splitBlogTitle('2025年创作手记・何晏（附：曹羲）'), { eyebrow: '2025年创作手记', main: '何晏（附：曹羲）' });
});

test('splitBlogTitle: only the first ・ separates, later ones stay in the main title', () => {
    assert.deepEqual(splitBlogTitle('手记・甲・乙'), { eyebrow: '手记', main: '甲・乙' });
});

test('splitBlogTitle: keeps the whole title when there is no separator or one side is empty', () => {
    assert.deepEqual(splitBlogTitle('2023年创作手记'), { eyebrow: null, main: '2023年创作手记' });
    assert.deepEqual(splitBlogTitle('・曹操'), { eyebrow: null, main: '・曹操' });
    assert.deepEqual(splitBlogTitle('创作手记・'), { eyebrow: null, main: '创作手记・' });
});
