import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPageUrl, clampPage, getPaginationRange } from '../src/utils/pagination-utils.ts';

test('getPaginationRange: shows every page when total is below the threshold', () => {
    assert.deepEqual(getPaginationRange(1, 1), [1]);
    assert.deepEqual(getPaginationRange(3, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test('getPaginationRange: near the first page shows a single trailing ellipsis', () => {
    assert.deepEqual(getPaginationRange(1, 20), [1, 2, 'ellipsis', 20]);
});

test('getPaginationRange: near the last page shows a single leading ellipsis', () => {
    assert.deepEqual(getPaginationRange(20, 20), [1, 'ellipsis', 19, 20]);
});

test('getPaginationRange: current page in the middle shows both ellipses', () => {
    assert.deepEqual(getPaginationRange(10, 20), [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
});

test('getPaginationRange: a single-page gap is shown as a page number, not an ellipsis', () => {
    assert.deepEqual(getPaginationRange(4, 8), [1, 2, 3, 4, 5, 'ellipsis', 8]);
});

test('getPaginationRange: respects custom sibling/boundary counts', () => {
    assert.deepEqual(getPaginationRange(10, 30, 2, 2), [1, 2, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 29, 30]);
});

test('buildPageUrl: page 1 has no numeric suffix', () => {
    assert.equal(buildPageUrl('/blog', 1), '/blog');
    assert.equal(buildPageUrl('/tags/wiki-1', 1), '/tags/wiki-1');
});

test('buildPageUrl: page N (>1) appends the page number', () => {
    assert.equal(buildPageUrl('/blog', 2), '/blog/2');
    assert.equal(buildPageUrl('/tags/wiki-1', 5), '/tags/wiki-1/5');
});

test('buildPageUrl: strips trailing slashes from basePath', () => {
    assert.equal(buildPageUrl('/blog/', 3), '/blog/3');
});

test('clampPage: clamps below range, above range, and passes through valid values', () => {
    assert.equal(clampPage(0, 20), 1);
    assert.equal(clampPage(-5, 20), 1);
    assert.equal(clampPage(999, 20), 20);
    assert.equal(clampPage(7, 20), 7);
});
