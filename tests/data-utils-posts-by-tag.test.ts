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

test('getPostsByTag: matching is case-insensitive because tags are slugified', () => {
    const posts = [post('a', ['Biography'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        ['a']
    );
});

test('getPostsByTag: a Chinese tag name does NOT match its English slug id (slugify strips CJK to empty string; current behavior, not fixed here)', () => {
    const posts = [post('a', ['人物'])];
    assert.deepEqual(
        getPostsByTag(posts, 'biography').map((p) => p.id),
        []
    );
});

test('getPostsByTag: posts with no tags or empty tags array never match', () => {
    const posts = [post('a', undefined), post('b', [])];
    assert.deepEqual(getPostsByTag(posts, 'biography'), []);
});
