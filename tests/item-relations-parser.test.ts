import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildItemRelations, extractItemPeople, ownerNote, sortRelatedItems, type RelatedItem } from '../src/utils/item-relations-parser.ts';

const item = (title: string, props: string) => `---\ntitle: ${title}\ntags: []\n---\n\n<EquipmentWiki\n${props}\n/>\n`;

const CHARACTERS = {
    曹操: '/projects/bio/caocao/',
    许褚: '/projects/bio/xuchu/',
    '韩荀（韩猛）': '/projects/bio/hanxun/',
    韩荀: '/projects/bio/hanxun/',
    韩猛: '/projects/bio/hanxun/'
};

test('extractItemPeople: reads owners per edition, variant owners and relatedPeople', () => {
    const raw = item(
        '青釭',
        `  baseVariants={[
    { description: '甲', equipment: {}, owner: ['夏侯恩'] },
    { description: '乙', equipment: {}, owner: ['曹操', '夏侯恩'] },
    { description: '丙', equipment: {} }
  ]}
  baseOwner={['夏侯惇']}
  dlcOwner={['曹操']}
  relatedPeople={['许褚']}`
    );
    assert.deepEqual(extractItemPeople(raw), {
        owner: { base: ['夏侯惇', '夏侯恩', '曹操'], dlc: ['曹操'] },
        related: ['许褚']
    });
});

test('extractItemPeople: an entry without any of the props yields empty lists', () => {
    assert.deepEqual(extractItemPeople(item('毛诗驳', '')), { owner: { base: [], dlc: [] }, related: [] });
});

test('buildItemRelations: maps each person to items with per-edition owner flags, resolving aliases and skipping unknown names', () => {
    const relations = buildItemRelations(
        {
            'projects/treasure/yitian.mdx': item('倚天', "  baseOwner={['曹操']}\n  dlcOwner={['曹操']}"),
            'projects/treasure/qinggang.mdx': item('青釭', "  dlcOwner={['曹操']}\n  relatedPeople={['许褚']}"),
            'projects/treasure/yanyun.mdx': item('燕云', "  baseOwner={['曹魏']}\n  relatedPeople={['曹操']}"),
            'projects/weapon/zhugeliannu.mdx': item('诸葛连弩', "  relatedPeople={['韩猛']}"),
            'projects/treasure/00_item-type.mdx': item('宝物', "  relatedPeople={['曹操']}"),
            'projects/class/gongbing.mdx': item('弓兵', "  baseOwner={['曹操']}")
        },
        CHARACTERS
    );
    assert.deepEqual(relations['/projects/bio/caocao/'], [
        { name: '青釭', href: '/projects/treasure/qinggang/', owner: { base: false, dlc: true } },
        { name: '倚天', href: '/projects/treasure/yitian/', owner: { base: true, dlc: true } },
        { name: '燕云', href: '/projects/treasure/yanyun/', owner: { base: false, dlc: false } }
    ]);
    assert.deepEqual(relations['/projects/bio/xuchu/'], [{ name: '青釭', href: '/projects/treasure/qinggang/', owner: { base: false, dlc: false } }]);
    assert.deepEqual(relations['/projects/bio/hanxun/'], [{ name: '诸葛连弩', href: '/projects/weapon/zhugeliannu/', owner: { base: false, dlc: false } }]);
    // 势力名解析不到人物词条，被跳过
    assert.equal(Object.keys(relations).length, 3);
});

test('buildItemRelations: a person written both as owner and related keeps the owner flag', () => {
    const relations = buildItemRelations({ 'projects/treasure/yitian.mdx': item('倚天', "  baseOwner={['曹操']}\n  relatedPeople={['曹操']}") }, CHARACTERS);
    assert.deepEqual(relations['/projects/bio/caocao/'], [{ name: '倚天', href: '/projects/treasure/yitian/', owner: { base: true, dlc: false } }]);
});

test('sortRelatedItems: owners first, then the rest, each group by pinyin', () => {
    const it = (name: string, base = false, dlc = false): RelatedItem => ({ name, href: `/${name}/`, owner: { base, dlc } });
    const sorted = sortRelatedItems([it('典韦'), it('燕云', false, true), it('安乐公印'), it('倚天', true, true), it('青釭', true)]);
    assert.deepEqual(
        sorted.map((i) => i.name),
        ['青釭', '燕云', '倚天', '安乐公印', '典韦']
    );
});

test('ownerNote: marks the edition only when the item is an owner in one edition', () => {
    assert.equal(ownerNote({ base: true, dlc: true }), '正主');
    assert.equal(ownerNote({ base: true, dlc: false }), '正主·本传');
    assert.equal(ownerNote({ base: false, dlc: true }), '正主·星命诀');
    assert.equal(ownerNote({ base: false, dlc: false }), null);
});
