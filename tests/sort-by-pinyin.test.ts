import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortPostsByTitlePinyin } from '../src/utils/sort-by-pinyin.ts';

function post(id: string, title: string) {
    return { id, data: { title } } as any;
}

test('sortPostsByTitlePinyin: sorts Chinese titles into pinyin order', () => {
    const posts = [post('bashu', '巴蜀'), post('agui', '阿贵'), post('bafu', '霸府')];
    const sorted = sortPostsByTitlePinyin(posts);
    assert.deepEqual(
        sorted.map((p) => p.id),
        ['agui', 'bafu', 'bashu']
    );
});

test('sortPostsByTitlePinyin: does not mutate the original array', () => {
    const posts = [post('bashu', '巴蜀'), post('agui', '阿贵')];
    const original = [...posts];
    sortPostsByTitlePinyin(posts);
    assert.deepEqual(posts, original);
});

test('sortPostsByTitlePinyin: a post with a missing title sorts first (empty string)', () => {
    const posts = [post('has-title', '阿贵'), post('no-title', '')];
    const sorted = sortPostsByTitlePinyin(posts);
    assert.deepEqual(
        sorted.map((p) => p.id),
        ['no-title', 'has-title']
    );
});

test('sortPostsByTitlePinyin: already-sorted input stays in the same order', () => {
    const posts = [post('agui', '阿贵'), post('bafu', '霸府'), post('bashu', '巴蜀')];
    const sorted = sortPostsByTitlePinyin(posts);
    assert.deepEqual(
        sorted.map((p) => p.id),
        ['agui', 'bafu', 'bashu']
    );
});

test('sortPostsByTitlePinyin: empty input returns empty array', () => {
    assert.deepEqual(sortPostsByTitlePinyin([]), []);
});
