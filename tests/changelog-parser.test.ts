import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changelogTagClass, countChangelogCategories, matchesChangelogFilter, parseChangelogItems, splitByQuery } from '../src/utils/changelog-parser.ts';

test('parseChangelogItems: splits leading tags, including several and a trailing tab', () => {
    const lines = parseChangelogItems(['【补完】补完了人物列传。', '【修正】【本地化】修正了日语版个别翻译的错误。', '【平衡】\t大调了弓兵系/弓骑系职业。']);
    assert.deepEqual(lines, [
        { kind: 'item', tags: ['补完'], text: '补完了人物列传。', children: [] },
        { kind: 'item', tags: ['修正', '本地化'], text: '修正了日语版个别翻译的错误。', children: [] },
        { kind: 'item', tags: ['平衡'], text: '大调了弓兵系/弓骑系职业。', children: [] }
    ]);
});

test('parseChangelogItems: tab-indented lines attach to the previous item as notes or sub-items', () => {
    const [item] = parseChangelogItems(['【修正】修正了日语版部分汉字字形。', '\t*日语旧字体→日语新字体/许容字体。', '\t**呃。', '\t·新增「胡服骑兵」。']);
    assert.equal(item.kind, 'item');
    assert.deepEqual(item.kind === 'item' && item.children, [
        { kind: 'note', text: '*日语旧字体→日语新字体/许容字体。' },
        { kind: 'note', text: '**呃。' },
        { kind: 'sub', text: '新增「胡服骑兵」。' }
    ]);
});

test('parseChangelogItems: a top-level * line is a note of the previous item, or a version remark when first', () => {
    const lines = parseChangelogItems(['*对之前的版本号做了一些调整。', '【功能】增加了键位设置。', '*默认为Q。']);
    assert.deepEqual(lines, [
        { kind: 'remark', text: '对之前的版本号做了一些调整。' },
        { kind: 'item', tags: ['功能'], text: '增加了键位设置。', children: [{ kind: 'note', text: '*默认为Q。' }] }
    ]);
});

test('parseChangelogItems: untagged lines become sub-items of the previous tagged item', () => {
    const lines = parseChangelogItems(['【平衡】大调了弓兵系。', '新增了全部兵种的转职。', '「漫击」（弩兵）：附加机动-1。', '【修正】修正了错字。']);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0].kind === 'item' && lines[0].children, [
        { kind: 'sub', text: '新增了全部兵种的转职。' },
        { kind: 'sub', text: '「漫击」（弩兵）：附加机动-1。' }
    ]);
});

test('parseChangelogItems: an untagged first line is an item without tags; blank lines are skipped', () => {
    assert.deepEqual(parseChangelogItems(['', '新增了全部兵种的转职。', '  ']), [{ kind: 'item', tags: [], text: '新增了全部兵种的转职。', children: [] }]);
});

test('countChangelogCategories: counts by first tag in category order', () => {
    const lines = parseChangelogItems(['【修正】a', '【补完】b', '【修正】【本地化】c', '【多语言包】d', '*e']);
    assert.deepEqual(countChangelogCategories(lines), [
        { name: '补完', count: 1 },
        { name: '修正', count: 2 },
        { name: '多语言包', count: 1 }
    ]);
});

test('changelogTagClass: secondary and unknown tags share the outline style', () => {
    assert.notEqual(changelogTagClass('补完'), changelogTagClass('修正'));
    assert.equal(changelogTagClass('本地化'), changelogTagClass('测试'));
});

test('matchesChangelogFilter: categories are a union, query is case-insensitive over texts only', () => {
    const unit = { tags: ['修正', '本地化'], texts: ['修正了日语版的错误。', '*感谢GUY的倾力帮助。'] };
    assert.equal(matchesChangelogFilter(unit, { categories: [], query: '' }), true);
    assert.equal(matchesChangelogFilter(unit, { categories: ['平衡', '本地化'], query: '' }), true);
    assert.equal(matchesChangelogFilter(unit, { categories: ['平衡'], query: '' }), false);
    assert.equal(matchesChangelogFilter(unit, { categories: [], query: ' guy ' }), true);
    // 标签文字本身不参与关键词匹配
    assert.equal(matchesChangelogFilter({ tags: ['补完'], texts: ['调整了敌军。'] }, { categories: [], query: '补完' }), false);
    // 没有标签的版本说明：选了类别就不显示
    assert.equal(matchesChangelogFilter({ tags: [], texts: ['说明'] }, { categories: ['修正'], query: '' }), false);
});

test('splitByQuery: marks every case-insensitive hit', () => {
    assert.deepEqual(splitByQuery('木牛流马', ''), [{ text: '木牛流马', hit: false }]);
    assert.deepEqual(splitByQuery('SS官方，ss更新', 'ss'), [
        { text: 'SS', hit: true },
        { text: '官方，', hit: false },
        { text: 'ss', hit: true },
        { text: '更新', hit: false }
    ]);
    assert.deepEqual(splitByQuery('木牛流马', '流马'), [
        { text: '木牛', hit: false },
        { text: '流马', hit: true }
    ]);
});
