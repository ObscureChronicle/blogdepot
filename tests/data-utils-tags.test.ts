import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countPostsByTag, getAllTags, isPinyinIndexTag, sortTagsByName, SLUG_TAG_MAP, TAG_SLUG_MAP } from '../src/utils/data-utils.ts';

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

test('TAG_SLUG_MAP: has all 26 pinyin index tags, A → wiki-a … Z → wiki-z', () => {
    const letters = Object.keys(TAG_SLUG_MAP).filter((k) => /^[A-Z]$/.test(k));
    assert.equal(letters.length, 26);
    assert.equal(TAG_SLUG_MAP.A, 'wiki-a');
    assert.equal(TAG_SLUG_MAP.Z, 'wiki-z');
    assert.equal(SLUG_TAG_MAP['wiki-q'], 'Q');
});

test('isPinyinIndexTag: wiki-* tags are pinyin index tags, category tags are not', () => {
    assert.equal(isPinyinIndexTag('wiki-a'), true);
    assert.equal(isPinyinIndexTag('biography'), false);
});

test('countPostsByTag: counts posts per resolved tag id', () => {
    const counts = countPostsByTag([post(['biography', 'wiki-c']), post(['人物']), post(['equipment']), post(undefined)]);
    assert.equal(counts.get('biography'), 2);
    assert.equal(counts.get('wiki-c'), 1);
    assert.equal(counts.get('equipment'), 1);
    assert.equal(counts.get('trait'), undefined);
});

test('countPostsByTag: a post whose raw tags resolve to the same id is counted once (same rule as getPostsByTag)', () => {
    const counts = countPostsByTag([post(['人物', 'biography'])]);
    assert.equal(counts.get('biography'), 1);
});

test('sortTagsByName: returns a sorted copy without mutating the input', () => {
    const tags = [{ name: 'B' }, { name: 'a' }, { name: 'C' }];
    const sorted = sortTagsByName(tags);
    assert.deepEqual(
        sorted.map((t) => t.name),
        ['a', 'B', 'C']
    );
    assert.deepEqual(
        tags.map((t) => t.name),
        ['B', 'a', 'C']
    );
});
