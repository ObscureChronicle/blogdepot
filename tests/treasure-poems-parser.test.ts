import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTreasurePoem } from '../src/utils/treasure-poems-parser.ts';

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
