import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWenyanVariant } from '../src/utils/wenyan.ts';

test('getWenyanVariant: returns null for posts outside 文存', () => {
    assert.equal(getWenyanVariant([]), null);
    assert.equal(getWenyanVariant(['diary']), null);
});

test('getWenyanVariant: ignores form on posts outside 文存', () => {
    assert.equal(getWenyanVariant(['diary'], 'letter'), null);
});

test('getWenyanVariant: recognizes both the slug and the Chinese tag name (case/whitespace-insensitive)', () => {
    assert.equal(getWenyanVariant(['wen-yan']), 'plain');
    assert.equal(getWenyanVariant(['文存']), 'plain');
    assert.equal(getWenyanVariant([' Wen-Yan ']), 'plain');
});

test('getWenyanVariant: form letter adds the letter-paper variant', () => {
    assert.equal(getWenyanVariant(['wen-yan'], 'letter'), 'letter');
});
