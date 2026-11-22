import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTreasurePoemGroups, parseTreasurePoem } from '../src/utils/treasure-poems-parser.ts';

const mdx = (props: string) => `---\ntitle: 倚天\ntags:\n  - item\n\n---\n\n<EquipmentWiki\n${props}\n/>\n`;

test('parseTreasurePoem: 单首附诗各自读取本传与星命诀的本地化', () => {
    const parsed = parseTreasurePoem(
        mdx(`baseDescription={'昔年江畔，共谁策马？'}\nbaseLocalization={{ hant: '昔年江畔，共誰策馬？', ja: '昔年江畔', en: 'By the river' }}\ndlcDescription={'日中见沬，折其右肱。'}\ndlcLocalization={{ hant: '', ja: '日中', en: '' }}`)
    );
    assert.equal(parsed.hasLocalization, true);
    assert.deepEqual(parsed.base, [{ text: '昔年江畔，共谁策马？', localization: { hant: '昔年江畔，共誰策馬？', ja: '昔年江畔', en: 'By the river' } }]);
    assert.deepEqual(parsed.dlc, [{ text: '日中见沬，折其右肱。', localization: { hant: '', ja: '日中', en: '' } }]);
});

test('parseTreasurePoem: 多首附诗时本地化逐首对应', () => {
    const parsed = parseTreasurePoem(
        mdx(`baseVariants={[
  { description: ['甲诗'], localization: { hant: '甲繁', ja: '甲日', en: '甲英' }, equipment: {} },
  { description: ['乙诗'], localization: { hant: '乙繁', ja: '', en: '' }, equipment: {} }
]}`)
    );
    assert.equal(parsed.hasLocalization, true);
    assert.deepEqual(
        parsed.base.map((p) => [p.text, p.localization.hant]),
        [
            ['甲诗', '甲繁'],
            ['乙诗', '乙繁']
        ]
    );
    assert.deepEqual(parsed.base[0].localization, { hant: '甲繁', ja: '甲日', en: '甲英' });
});

test('parseTreasurePoem: 本传多首与星命诀单首分开对应，不串行', () => {
    const parsed = parseTreasurePoem(
        mdx(`baseVariants={[
  { description: ['甲诗'], localization: { hant: '甲繁', ja: '', en: '' }, equipment: {} },
  { description: ['乙诗'], localization: { hant: '乙繁', ja: '', en: '' }, equipment: {} }
]}\ndlcDescription={'丙诗'}\ndlcLocalization={{ hant: '丙繁', ja: '', en: '' }}`)
    );
    assert.deepEqual(
        parsed.base.map((p) => p.localization.hant),
        ['甲繁', '乙繁']
    );
    assert.deepEqual(
        parsed.dlc.map((p) => [p.text, p.localization.hant]),
        [['丙诗', '丙繁']]
    );
});

test('parseTreasurePoem: 没有本地化时 hasLocalization 为 false，但原文仍解析', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={'甲'}\ndlcDescription={'乙'}`));
    assert.equal(parsed.hasLocalization, false);
    assert.deepEqual(
        parsed.base.map((p) => p.text),
        ['甲']
    );
});

test('parseTreasurePoem: 空的 description 不产出附诗行', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={'甲'}\nbaseLocalization={{ hant: '', ja: '', en: '' }}\ndlcDescription={''}`));
    assert.equal(parsed.base.length, 1);
    assert.deepEqual(parsed.dlc, []);
});

test('buildTreasurePoemGroups: 只收录写了本地化的词条，每首一行，两版相同则合并', () => {
    const groups = buildTreasurePoemGroups({
        'src\\content\\projects\\treasure\\yitian.mdx': mdx(`baseDescription={'甲'}\nbaseLocalization={{ hant: '', ja: '', en: '' }}\ndlcDescription={'甲'}\ndlcLocalization={{ hant: '', ja: '', en: '' }}`),
        'src\\content\\projects\\treasure\\li.mdx': mdx(`baseDescription={'乙'}\nbaseLocalization={{ hant: '', ja: '', en: '' }}\ndlcDescription={'丙'}\ndlcLocalization={{ hant: '', ja: '', en: '' }}`),
        'src\\content\\projects\\treasure\\no-local.mdx': mdx(`baseDescription={'丁'}`)
    });
    assert.deepEqual(
        groups.map((g) => [g.slug, g.rows.map((r) => [r.text, r.editions])]),
        [
            ['li', [['乙', ['base']], ['丙', ['dlc']]]],
            ['yitian', [['甲', ['base', 'dlc']]]]
        ]
    );
});

test('buildTreasurePoemGroups: 原文相同但本地化不同时不合并', () => {
    const groups = buildTreasurePoemGroups({
        'src\\content\\projects\\treasure\\same.mdx': mdx(`baseDescription={'甲'}\nbaseLocalization={{ hant: '甲繁', ja: '', en: '' }}\ndlcDescription={'甲'}\ndlcLocalization={{ hant: '', ja: '', en: '' }}`)
    });
    assert.deepEqual(
        groups[0].rows.map((r) => [r.text, r.editions, r.hant]),
        [
            ['甲', ['base'], '甲繁'],
            ['甲', ['dlc'], '']
        ]
    );
});
