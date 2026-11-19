import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatProjectTitle, getProjectCategory, getProjectCategoryName, groupBy, pickFeaturedProjects, withNeighbors } from '../src/utils/neighbor-utils.ts';

test('withNeighbors: first item has no prev, last item has no next', () => {
    const result = withNeighbors(['a', 'b', 'c']);
    assert.deepEqual(result, [
        { item: 'a', prev: null, next: 'b' },
        { item: 'b', prev: 'a', next: 'c' },
        { item: 'c', prev: 'b', next: null }
    ]);
});

test('withNeighbors: a single item has neither prev nor next', () => {
    assert.deepEqual(withNeighbors(['only']), [{ item: 'only', prev: null, next: null }]);
});

test('withNeighbors: empty input returns empty array', () => {
    assert.deepEqual(withNeighbors([]), []);
});

test('groupBy: keeps first-seen group order and input order within each group', () => {
    const groups = groupBy(['b1', 'a1', 'b2', 'a2'], (s) => s[0]);
    assert.deepEqual([...groups.keys()], ['b', 'a']);
    assert.deepEqual(groups.get('b'), ['b1', 'b2']);
    assert.deepEqual(groups.get('a'), ['a1', 'a2']);
});

test('getProjectCategory: returns the first non wiki-* tag regardless of position', () => {
    assert.equal(getProjectCategory({ id: 'caocao', data: { tags: ['wiki-c', 'biography'] } }), 'biography');
    assert.equal(getProjectCategory({ id: 'caocao', data: { tags: ['biography', 'wiki-c'] } }), 'biography');
});

test('getProjectCategory: falls back to the entry id when there is no category tag', () => {
    assert.equal(getProjectCategory({ id: 'reference', data: { tags: ['wiki-r'] } }), 'reference');
    assert.equal(getProjectCategory({ id: 'empty', data: { tags: [] } }), 'empty');
});

test('getProjectCategoryName: maps the category tag to its Chinese display name', () => {
    assert.equal(getProjectCategoryName({ id: 'bio/chendao', data: { tags: ['biography'] } }), '人物');
    assert.equal(getProjectCategoryName({ id: 'treasure/chendao', data: { tags: ['equipment'] } }), '兵装与宝物');
    assert.equal(getProjectCategoryName({ id: 'disambiguation/chendao', data: { tags: ['wiki-c', 'disambiguation'] } }), '消歧义');
});

test('getProjectCategoryName: returns null when there is no registered category tag', () => {
    assert.equal(getProjectCategoryName({ id: 'x', data: { tags: ['wiki-x'] } }), null);
    assert.equal(getProjectCategoryName({ id: 'x', data: { tags: ['not-registered'] } }), null);
});

test('formatProjectTitle: appends the category with a middle dot, or keeps the title as is', () => {
    assert.equal(formatProjectTitle('陈到', '人物'), '陈到 · 人物');
    assert.equal(formatProjectTitle('陈到', null), '陈到');
    assert.equal(formatProjectTitle('参考文献', '参考文献'), '参考文献');
});

test('pickFeaturedProjects: returns entries in the order of the id list', () => {
    const entries = [{ id: 'bio/a' }, { id: 'bio/b' }, { id: 'bio/c' }];
    assert.deepEqual(
        pickFeaturedProjects(['bio/c', 'bio/a'], entries).map((e) => e.id),
        ['bio/c', 'bio/a']
    );
});

test('pickFeaturedProjects: throws and names every missing id', () => {
    assert.throws(() => pickFeaturedProjects(['bio/a', 'bio/typo', 'bio/x'], [{ id: 'bio/a' }]), /bio\/typo、bio\/x/);
});

test('pickFeaturedProjects: an empty list returns an empty array', () => {
    assert.deepEqual(pickFeaturedProjects([], [{ id: 'bio/a' }]), []);
});
