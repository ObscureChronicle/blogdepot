import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getProjectCategory, groupBy, withNeighbors } from '../src/utils/neighbor-utils.ts';

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
