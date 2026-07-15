import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllTags } from '../src/utils/data-utils.ts';

function post(tags?: string[]) {
    return { data: { tags } } as any;
}

test('getAllTags: returns the mapped {name, id} pair for a recognized Chinese tag', () => {
    const result = getAllTags([post(['人物'])]);
    assert.deepEqual(result, [{ name: '人物', id: 'biography' }]);
});

test('getAllTags: an English slug tag is mapped back to its Chinese name', () => {
    const result = getAllTags([post(['biography'])]);
    assert.deepEqual(result, [{ name: '人物', id: 'biography' }]);
});

test('getAllTags: Chinese name and its English slug for the same tag dedupe to one entry', () => {
    const result = getAllTags([post(['人物']), post(['biography'])]);
    assert.deepEqual(result, [{ name: '人物', id: 'biography' }]);
});

test('getAllTags: an unrecognized tag name gets id "unknown"', () => {
    const result = getAllTags([post(['某个没登记过的标签'])]);
    assert.deepEqual(result, [{ name: '某个没登记过的标签', id: 'unknown' }]);
});

test('getAllTags: two different unrecognized tags both collapse into a single "unknown" entry (current behavior, not fixed here)', () => {
    const result = getAllTags([post(['未登记标签A']), post(['未登记标签B'])]);
    assert.deepEqual(result, [{ name: '未登记标签A', id: 'unknown' }]);
});

test('getAllTags: posts with no tags or empty tags array produce no entries', () => {
    assert.deepEqual(getAllTags([post(undefined), post([])]), []);
});

test('getAllTags: multiple distinct recognized tags are all returned, each once', () => {
    const result = getAllTags([post(['人物', '兵装与宝物']), post(['人物'])]);
    assert.deepEqual(result, [
        { name: '人物', id: 'biography' },
        { name: '兵装与宝物', id: 'equipment' }
    ]);
});
