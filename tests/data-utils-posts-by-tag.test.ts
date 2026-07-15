import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPostsByTag } from '../src/utils/data-utils.ts';

function post(id: string, tags?: string[]) {
    return { id, data: { tags } } as any;
}

test('getPostsByTag: matches a post whose tags include the given slug', () => {
    const posts = [post('a', ['biography'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: excludes posts without the given tag', () => {
    const posts = [post('a', ['equipment']), post('b', ['biography'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['b']
    );
});

test('getPostsByTag: matches when the tag is one of several on the post', () => {
    const posts = [post('a', ['equipment', 'biography', 'trait'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: matching is case/whitespace-insensitive for English slug tags', () => {
    const posts = [post('a', [' Biography '])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: a Chinese tag name now matches its English slug id (fixed — resolveTag shares the same lookup as getAllTags)', () => {
    const posts = [post('a', ['人物'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: an unrecognized tag resolves to "unknown" and matches tagId "unknown"', () => {
    const posts = [post('a', ['某个没登记过的标签'])];
    assert.deepEqual(
        getPostsByTag(posts, 'unknown').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: posts with no tags or empty tags array never match', () => {
    const posts = [post('a', undefined), post('b', [])];
    assert.deepEqual(getPostsByTag(posts, 'biography'), []);
});
