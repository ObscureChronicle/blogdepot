import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRankData } from '../src/utils/rank-parser.ts';

// 拼一份最小的人物 MDX：frontmatter + <CharacterWiki ... /> 的属性
function mdx(title: string | null, props: string) {
    const fm = title === null ? '---\ntags: []\n---' : `---\ntitle: ${title}\n---`;
    return `${fm}\n\n<CharacterWiki\n${props}\n/>\n`;
}

// 只有一个本传形态的 baseForms
const one = (data: string, data2 = '') => `baseForms={[{ data: [${data}]${data2 ? `, data2: [${data2}]` : ''} }]}`;

test('buildRankData: maps form data/data2 into the seven output values in display order', () => {
    // data 顺序：[统御, 运势, 武勇, 智略, 魅力]；输出顺序：[统御, 智略, 武勇, 魅力, 运势, 胆识, 冷静]
    const { rows, sources, report } = buildRankData({
        '../content/projects/bio/caocao.mdx': mdx('曹操', one('90, 80, 70, 95, 85', '8, 7'))
    });
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0], {
        name: '曹操',
        href: '/projects/bio/caocao/',
        pinyin: 'cao cao',
        source: '本传',
        sourceIndex: 0,
        values: [90, 95, 70, 85, 80, 8, 7]
    });
    assert.deepEqual(sources, ['本传', '星命诀']);
    assert.deepEqual(report, { fileCount: 1, characters: 1, rows: 1, skipped: [], failures: [] });
});

test('buildRankData: one row per form, ordered 本传 → 本传2 → 本传3 → 星命诀 within a character', () => {
    const forms = `baseForms={[
    { name: '甲', data: [1, 1, 1, 1, 1], data2: [1, 1] },
    { name: '乙', data: [2, 2, 2, 2, 2], data2: [2, 2] },
    { name: '丙', data: [3, 3, 3, 3, 3], data2: [3, 3] }
  ]}`;
    const { rows } = buildRankData({ 'bio/zhaoyun.mdx': mdx('赵云', `dlcData={[9, 9, 9, 9, 9]}\n${forms}`) });
    assert.deepEqual(
        rows.map((r) => [r.source, r.values[0]]),
        [
            ['本传', 1],
            ['本传2', 2],
            ['本传3', 3],
            ['星命诀', 9]
        ]
    );
});

test('buildRankData: 星命诀 sourceIndex comes after the most forms anyone has, matching sources', () => {
    const { rows, sources } = buildRankData({
        'bio/a.mdx': mdx('甲', `baseForms={[{ data: [1] }, { data: [2] }, { data: [3] }]}`),
        'bio/b.mdx': mdx('乙', `dlcData={[1, 1, 1, 1, 1]}`)
    });
    assert.deepEqual(sources, ['本传', '本传2', '本传3', '星命诀']);
    for (const r of rows) assert.equal(sources[r.sourceIndex], r.source);
});

test('buildRankData: unbalanced baseForms is reported as a failure', () => {
    const { report } = buildRankData({ 'bio/x.mdx': mdx('某人', `baseForms={[{ data: [1] }\ndlcData={[1, 1, 1, 1, 1]}`) });
    assert.equal(report.failures[0].field, 'baseForms');
});

test('buildRankData: characters are sorted by pinyin', () => {
    const { rows } = buildRankData({
        'bio/zhangfei.mdx': mdx('张飞', one('1, 1, 1, 1, 1')),
        'bio/agui.mdx': mdx('阿贵', one('1, 1, 1, 1, 1')),
        'bio/caocao.mdx': mdx('曹操', one('1, 1, 1, 1, 1'))
    });
    assert.deepEqual(
        rows.map((r) => r.name),
        ['阿贵', '曹操', '张飞']
    );
});

test('buildRankData: strips quotes from the title, and falls back to nameTableData simplified name', () => {
    const { rows } = buildRankData({
        'bio/a.mdx': mdx("'荀彧'", one('1, 1, 1, 1, 1')),
        'bio/b.mdx': mdx(null, `nameTableData={{ name: { simplified: '郭嘉' } }}\n${one('1, 1, 1, 1, 1')}`)
    });
    assert.deepEqual(rows.map((r) => r.name).sort(), ['荀彧', '郭嘉'].sort());
});

test('buildRankData: invalid tokens become null; an array with no valid number is reported as a failure', () => {
    const { rows, report } = buildRankData({
        'bio/x.mdx': mdx('某人', one('90, ?, 70, , 85', 'abc'))
    });
    assert.deepEqual(rows[0].values, [90, null, 70, 85, null, null, null]);
    assert.deepEqual(report.failures, [{ file: 'x.mdx', field: 'baseForms[0].data2', reason: '未能解析出任何数值' }]);
});

test('buildRankData: skips files with no name or no attribute arrays, and records why', () => {
    const { rows, report } = buildRankData({
        'bio/noname.mdx': mdx(null, one('1, 1, 1, 1, 1')),
        'bio/nodata.mdx': mdx('背景人物', "intro={'只有介绍'}")
    });
    assert.equal(rows.length, 0);
    assert.equal(report.fileCount, 2);
    assert.equal(report.characters, 0);
    assert.deepEqual(
        report.skipped.map((s) => s.file),
        ['noname.mdx', 'nodata.mdx']
    );
});

test('buildRankData: takes the slug from Windows-style paths too', () => {
    const { rows } = buildRankData({ 'src\\content\\projects\\bio\\liubei.mdx': mdx('刘备', one('1, 1, 1, 1, 1')) });
    assert.equal(rows[0].href, '/projects/bio/liubei/');
});
