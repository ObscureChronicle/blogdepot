import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRankData } from '../src/utils/rank-parser.ts';

// 拼一份最小的人物 MDX：frontmatter + <CharacterWiki ... /> 的属性
function mdx(title: string | null, props: string) {
    const fm = title === null ? '---\ntags: []\n---' : `---\ntitle: ${title}\n---`;
    return `${fm}\n\n<CharacterWiki\n${props}\n/>\n`;
}

test('buildRankData: maps baseData/baseData2 into the seven output values in display order', () => {
    // baseData 顺序：[统御, 运势, 武勇, 智略, 魅力]；输出顺序：[统御, 智略, 武勇, 魅力, 运势, 胆识, 冷静]
    const { rows, report } = buildRankData({
        '../content/projects/bio/caocao.mdx': mdx('曹操', 'baseData={[90, 80, 70, 95, 85]}\nbaseData2={[8, 7]}')
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
    assert.deepEqual(report, { fileCount: 1, characters: 1, rows: 1, skipped: [], failures: [] });
});

test('buildRankData: 本传2 falls back to baseData2 for 胆识/冷静 when postBaseData2 is missing', () => {
    const { rows } = buildRankData({
        'bio/guanyu.mdx': mdx('关羽', 'baseData={[1, 2, 3, 4, 5]}\nbaseData2={[6, 7]}\npostData={[11, 12, 13, 14, 15]}')
    });
    const post = rows.find((r) => r.source === '本传2');
    assert.ok(post);
    assert.deepEqual(post.values, [11, 14, 13, 15, 12, 6, 7]);
});

test('buildRankData: one row per present group, ordered 本传 → 本传2 → 星命诀 within a character', () => {
    const { rows } = buildRankData({
        'bio/zhaoyun.mdx': mdx('赵云', 'dlcData={[1, 1, 1, 1, 1]}\npostData={[2, 2, 2, 2, 2]}\nbaseData={[3, 3, 3, 3, 3]}')
    });
    assert.deepEqual(
        rows.map((r) => r.source),
        ['本传', '本传2', '星命诀']
    );
});

test('buildRankData: characters are sorted by pinyin', () => {
    const { rows } = buildRankData({
        'bio/zhangfei.mdx': mdx('张飞', 'baseData={[1, 1, 1, 1, 1]}'),
        'bio/agui.mdx': mdx('阿贵', 'baseData={[1, 1, 1, 1, 1]}'),
        'bio/caocao.mdx': mdx('曹操', 'baseData={[1, 1, 1, 1, 1]}')
    });
    assert.deepEqual(
        rows.map((r) => r.name),
        ['阿贵', '曹操', '张飞']
    );
});

test('buildRankData: strips quotes from the title, and falls back to nameTableData simplified name', () => {
    const { rows } = buildRankData({
        'bio/a.mdx': mdx("'荀彧'", 'baseData={[1, 1, 1, 1, 1]}'),
        'bio/b.mdx': mdx(null, "nameTableData={{ name: { simplified: '郭嘉' } }}\nbaseData={[1, 1, 1, 1, 1]}")
    });
    assert.deepEqual(rows.map((r) => r.name).sort(), ['荀彧', '郭嘉'].sort());
});

test('buildRankData: invalid tokens become null; an array with no valid number is reported as a failure', () => {
    const { rows, report } = buildRankData({
        'bio/x.mdx': mdx('某人', 'baseData={[90, ?, 70, , 85]}\nbaseData2={[abc]}')
    });
    assert.deepEqual(rows[0].values, [90, null, 70, 85, null, null, null]);
    assert.deepEqual(report.failures, [{ file: 'x.mdx', field: 'baseData2', reason: '未能解析出任何数值' }]);
});

test('buildRankData: skips files with no name or no attribute arrays, and records why', () => {
    const { rows, report } = buildRankData({
        'bio/noname.mdx': mdx(null, 'baseData={[1, 1, 1, 1, 1]}'),
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
    const { rows } = buildRankData({ 'src\\content\\projects\\bio\\liubei.mdx': mdx('刘备', 'baseData={[1, 1, 1, 1, 1]}') });
    assert.equal(rows[0].href, '/projects/bio/liubei/');
});
