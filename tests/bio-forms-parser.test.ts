import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractBaseForms } from '../src/utils/bio-forms-parser.ts';

test('extractBaseForms: returns undefined when the prop is absent', () => {
    assert.equal(extractBaseForms(`dlcData={[1, 2, 3, 4, 5]}`), undefined);
});

test('extractBaseForms: reads every form, keeping array text raw and data / data2 apart', () => {
    const raw = `baseForms={[
    { name: '奋武将军', data: [90, 85, 84, 95, 93], data2: [8, 9], traits: ['中原', '明候'] },
    { name: "魏武挥鞭", data2: [7, 6], data: [100, 85, 79, 97, 93], traits: ["中原", "霸者*"] }
  ]}
  dlcData={[1, 1, 1, 1, 1]}`;
    assert.deepEqual(extractBaseForms(raw), [
        { name: '奋武将军', data: '90, 85, 84, 95, 93', data2: '8, 9', traits: ['中原', '明候'] },
        { name: '魏武挥鞭', data: '100, 85, 79, 97, 93', data2: '7, 6', traits: ['中原', '霸者*'] }
    ]);
});

test('extractBaseForms: a single unnamed form; missing fields stay undefined / empty', () => {
    assert.deepEqual(extractBaseForms(`baseForms={[{ data: [1, 2, 3, 4, 5] }]}`), [{ name: undefined, data: '1, 2, 3, 4, 5', data2: undefined, traits: [] }]);
});

test('extractBaseForms: brackets inside strings do not end the array', () => {
    assert.deepEqual(extractBaseForms(`baseForms={[{ name: '形态]}', data: [1], data2: [2], traits: ['甲'] }]}`)?.[0].name, '形态]}');
});

test('extractBaseForms: throws on unbalanced brackets instead of silently ignoring', () => {
    assert.throws(() => extractBaseForms(`baseForms={[{ data: [1, 2] }`), /没有配对/);
});

test('extractBaseForms: an extra figure field does not leak into data / data2', () => {
    assert.deepEqual(extractBaseForms(`baseForms={[{ data: [1, 2], data2: [3, 4], traits: ['甲'], figure: [0, 1] }]}`), [
        { name: undefined, data: '1, 2', data2: '3, 4', traits: ['甲'] }
    ]);
});
