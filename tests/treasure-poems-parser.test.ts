import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTreasurePoemRows, parseTreasurePoem, parseTreasurePoemLocalization } from '../src/utils/treasure-poems-parser.ts';

const mdx = (props: string) => `---\ntitle: 倚天\ntags:\n  - equipment\n\n---\n\n<EquipmentWiki\n${props}\n/>\n`;

test('parseTreasurePoem: 读取本传与星命诀相同的单首附诗', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={'东到蓬莱山，上至天之门。'}\ndlcDescription={'东到蓬莱山，上至天之门。'}`));
    assert.equal(parsed.title, '倚天');
    assert.deepEqual(parsed.base, ['东到蓬莱山，上至天之门。']);
    assert.deepEqual(parsed.dlc, ['东到蓬莱山，上至天之门。']);
});

test('parseTreasurePoem: 两版不同时分别返回', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={'昔年江畔，共谁策马？'}\ndlcDescription={'日中见沬，折其右肱。'}`));
    assert.deepEqual(parsed.base, ['昔年江畔，共谁策马？']);
    assert.deepEqual(parsed.dlc, ['日中见沬，折其右肱。']);
});

test('parseTreasurePoem: 本传为空时只返回星命诀文本', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={''}\ndlcDescription={'平明寻白羽，没在石棱中。'}`));
    assert.deepEqual(parsed.base, []);
    assert.deepEqual(parsed.dlc, ['平明寻白羽，没在石棱中。']);
});

test('parseTreasurePoem: 读取 baseVariants / dlcVariants 里的多首附诗', () => {
    const parsed = parseTreasurePoem(
        mdx(
            `baseVariants={[\n  { description: ['明明日月光，何所不光昭。'], equipment: {} },\n  { description: ['登高眺所思，举袂当朝阳。'], equipment: {} }\n]}\ndlcDescription={'明明日月光，何所不光昭。'}`
        )
    );
    assert.deepEqual(parsed.base, ['明明日月光，何所不光昭。', '登高眺所思，举袂当朝阳。']);
    assert.deepEqual(parsed.dlc, ['明明日月光，何所不光昭。']);
});

test('parseTreasurePoem: 去空串、去重并保留顺序', () => {
    const parsed = parseTreasurePoem(mdx(`baseDescription={'甲'}\nbaseVariants={[{ description: ['甲', '乙', ''] }]}`));
    assert.deepEqual(parsed.base, ['甲', '乙']);
});

test('parseTreasurePoemLocalization: 读取词条自身的三语文本', () => {
    const parsed = parseTreasurePoemLocalization(mdx(`poemLocalization={{ hant: '昔年江畔，共誰策馬？', ja: '昔年江畔、共に誰と策馬したか？', en: 'Who rode with me?' }}`));
    assert.deepEqual(parsed, { hant: '昔年江畔，共誰策馬？', ja: '昔年江畔、共に誰と策馬したか？', en: 'Who rode with me?' });
});

test('parseTreasurePoemLocalization: 空字符串原样保留，缺项补空字符串', () => {
    assert.deepEqual(parseTreasurePoemLocalization(mdx(`poemLocalization={{ hant: '', ja: '' }}`)), { hant: '', ja: '', en: '' });
});

test('parseTreasurePoemLocalization: 没有该属性时返回 null', () => {
    assert.equal(parseTreasurePoemLocalization(mdx(`baseDescription={'甲'}`)), null);
});

test('buildTreasurePoemRows: 只收录写了 poemLocalization 的词条，并按 slug 排序', () => {
    const rows = buildTreasurePoemRows({
        'src\\content\\projects\\treasure\\yitian.mdx': mdx(`baseDescription={'东到蓬莱山，上至天之门。'}\npoemLocalization={{ hant: '', ja: '', en: '' }}`),
        'src\\content\\projects\\treasure\\li.mdx': mdx(`dlcDescription={'日中见沬，折其右肱。'}\npoemLocalization={{ hant: '甲', ja: '', en: '' }}`),
        'src\\content\\projects\\treasure\\no-local.mdx': mdx(`baseDescription={'无本地化'}`)
    });
    assert.deepEqual(
        rows.map((r) => [r.slug, r.title, r.dlc[0], r.hant]),
        [
            ['li', '倚天', '日中见沬，折其右肱。', '甲'],
            ['yitian', '倚天', undefined, '']
        ]
    );
});
