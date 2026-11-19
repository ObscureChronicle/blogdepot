import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildToc, type TocHeading } from '../src/utils/entry-toc.ts';

const section = (text: string, id?: string): TocHeading => ({ text, kind: 'section', id });
const group = (text: string): TocHeading => ({ text, kind: 'group' });

test('buildToc: flat sections use their text as id', () => {
    const toc = buildToc([section('剧中别称'), section('能力'), section('登场战役')]);
    assert.deepEqual(toc.ids, ['剧中别称', '能力', '登场战役']);
    assert.deepEqual(
        toc.items.map((e) => [e.text, e.children.length]),
        [
            ['剧中别称', 0],
            ['能力', 0],
            ['登场战役', 0]
        ]
    );
});

test('buildToc: punctuation and spaces become dashes, whitespace in text is collapsed', () => {
    const toc = buildToc([section('NE1：辉格史的悖论'), section('  视频流程   By zgzilmm ')]);
    assert.deepEqual(toc.ids, ['NE1-辉格史的悖论', '视频流程-By-zgzilmm']);
    assert.equal(toc.items[1].text, '视频流程 By zgzilmm');
});

test('buildToc: sections after a group are nested and prefixed with the group name', () => {
    const toc = buildToc([section('持有人'), group('本传'), section('说明'), section('兵种参数'), group('星命诀'), section('说明')]);
    assert.deepEqual(toc.ids, ['持有人', '本传', '本传-说明', '本传-兵种参数', '星命诀', '星命诀-说明']);
    assert.deepEqual(
        toc.items.map((e) => [e.text, e.children.map((c) => c.text)]),
        [
            ['持有人', []],
            ['本传', ['说明', '兵种参数']],
            ['星命诀', ['说明']]
        ]
    );
});

test('buildToc: duplicate ids get -2, -3 suffixes', () => {
    assert.deepEqual(buildToc([section('更多'), section('更多'), section('更多')]).ids, ['更多', '更多-2', '更多-3']);
});

test('buildToc: existing ids are kept and generated ids avoid them', () => {
    assert.deepEqual(buildToc([section('能力'), section('列传', '能力')]).ids, ['能力-2', '能力']);
});

test('buildToc: heading with no usable characters still gets an id', () => {
    assert.deepEqual(buildToc([section('——'), section('？')]).ids, ['section', 'section-2']);
});
