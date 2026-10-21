import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparePinyin, pinyinKey, sortPostsByTitlePinyin } from '../src/utils/sort-by-pinyin.ts';

function post(id: string, title: string) {
    return { id, data: { title } };
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

test('sortPostsByTitlePinyin: titles with the same pinyin keep their input order (stable sort)', () => {
    const posts = [post('zhoutai', '周泰'), post('zhoutai2', '州泰'), post('zhouyu', '周瑜')];
    const sorted = sortPostsByTitlePinyin(posts);
    assert.deepEqual(
        sorted.map((p) => p.id),
        ['zhoutai', 'zhoutai2', 'zhouyu']
    );
});

test('pinyinKey: converts Chinese to toneless pinyin', () => {
    assert.equal(pinyinKey('曹操'), 'cao cao');
});

test('comparePinyin: uses zh-Hans-CN collation regardless of the runtime default locale', () => {
    // pinyin-pro 转不出拼音的生僻字会原样保留，它的位置取决于 locale
    // （en-US 下排在 zhou 组末尾，zh-Hans-CN 下排在开头）
    const keys = ['zhou tai', pinyinKey('周㬂'), 'zhou fang'];
    assert.deepEqual([...keys].sort(comparePinyin), ['zhou 㬂', 'zhou fang', 'zhou tai']);
});
