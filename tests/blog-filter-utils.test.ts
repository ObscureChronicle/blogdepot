import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBlogCategory, getBlogYear, groupBlogPostsByCategory, groupBlogPostsByYear } from '../src/utils/blog-filter-utils.ts';
import { blogEntry } from './helpers/fixtures.ts';

function post(id: string, publishDate: string, tags: string[]) {
    return blogEntry(id, { publishDate: new Date(publishDate), tags });
}

test('getBlogCategory: resolves the first non-pinyin tag, accepting both slug and Chinese name', () => {
    assert.deepEqual(getBlogCategory(post('a', '2025-01-01', ['wiki-a', 'diary'])), { id: 'diary', name: '创作手记' });
    assert.deepEqual(getBlogCategory(post('b', '2025-01-01', ['文存'])), { id: 'wen-yan', name: '文存' });
});

test('getBlogCategory: returns null when a post has no category tag', () => {
    assert.equal(getBlogCategory(post('a', '2025-01-01', [])), null);
    assert.equal(getBlogCategory(post('b', '2025-01-01', ['wiki-b'])), null);
});

test('getBlogYear: uses the UTC year so that Jan 1 does not slip into the previous year', () => {
    assert.equal(getBlogYear(post('a', '2025-01-01', [])), '2025');
    assert.equal(getBlogYear(post('b', '2024-12-31', [])), '2024');
});

test('groupBlogPostsByCategory: orders groups by size, keeps post order, skips untagged posts', () => {
    const posts = [
        post('c1', '2025-03-01', ['changelog']),
        post('d1', '2025-02-01', ['diary']),
        post('x', '2025-01-15', []),
        post('d2', '2025-01-01', ['diary'])
    ];
    const groups = groupBlogPostsByCategory(posts);
    assert.deepEqual(
        groups.map((g) => [g.id, g.name, g.posts.map((p) => p.id)]),
        [
            ['diary', '创作手记', ['d1', 'd2']],
            ['changelog', '更新日志', ['c1']]
        ]
    );
});

test('groupBlogPostsByCategory: ties keep the order in which categories first appear', () => {
    const groups = groupBlogPostsByCategory([post('w', '2025-02-01', ['wen-yan']), post('c', '2025-01-01', ['changelog'])]);
    assert.deepEqual(
        groups.map((g) => g.id),
        ['wen-yan', 'changelog']
    );
});

test('groupBlogPostsByYear: newest year first, keeps post order within a year', () => {
    const posts = [post('a', '2016-08-09', []), post('b', '2025-05-01', []), post('c', '2025-01-01', []), post('d', '2019-10-10', [])];
    const groups = groupBlogPostsByYear(posts);
    assert.deepEqual(
        groups.map((g) => [g.year, g.posts.map((p) => p.id)]),
        [
            ['2025', ['b', 'c']],
            ['2019', ['d']],
            ['2016', ['a']]
        ]
    );
});
