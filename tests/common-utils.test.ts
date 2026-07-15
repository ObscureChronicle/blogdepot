import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/utils/common-utils.ts';

test('slugify: undefined input returns empty string', () => {
    assert.equal(slugify(undefined), '');
});

test('slugify: empty string returns empty string', () => {
    assert.equal(slugify(''), '');
});

test('slugify: whitespace-only input returns empty string', () => {
    assert.equal(slugify('   '), '');
});

test('slugify: lowercases and hyphenates spaces', () => {
    assert.equal(slugify(' Hello World '), 'hello-world');
});

test('slugify: strips accents from Latin characters', () => {
    assert.equal(slugify('Café Münchën'), 'cafe-munchen');
});

test('slugify: replaces punctuation/underscore with hyphens', () => {
    assert.equal(slugify('Hello, World! & Friends_2024'), 'hello-world-friends-2024');
});

test('slugify: collapses consecutive spaces and hyphens into one', () => {
    assert.equal(slugify('a   b---c'), 'a-b-c');
});

test('slugify: strips CJK characters entirely (no transliteration)', () => {
    assert.equal(slugify('测试 Test'), 'test');
});

test('slugify: preserves pre-existing leading/trailing hyphens as-is', () => {
    assert.equal(slugify('-already-slugified-'), '-already-slugified-');
});
