import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildWikiLinkMaps, extractTitle, isOverviewPage, namesForTitle } from '../src/utils/wiki-link-parser.ts';

const mdx = (title: string) => `---\ntitle: ${title}\ntags: []\n---\n\n正文\n`;

test('extractTitle: reads the frontmatter title and strips quotes', () => {
    assert.equal(extractTitle(mdx('曹操')), '曹操');
    assert.equal(extractTitle(mdx("'曹操'")), '曹操');
    assert.equal(extractTitle('---\ntags: []\n---\n'), null);
});

test('isOverviewPage: overview pages are excluded, normal entries are not', () => {
    assert.equal(isOverviewPage('00_item-type'), true);
    assert.equal(isOverviewPage('equipment-type'), true);
    assert.equal(isOverviewPage('00_total'), true);
    assert.equal(isOverviewPage('treasure-shemao'), false);
});

test('namesForTitle: a character title「本名（别名）」is reachable by both names', () => {
    assert.deepEqual(namesForTitle('character', '陆逊（陆议）'), ['陆逊（陆议）', '陆逊', '陆议']);
    assert.deepEqual(namesForTitle('character', '曹操'), ['曹操']);
});

test('namesForTitle: item parentheses are NOT split automatically, only registered aliases are added', () => {
    assert.deepEqual(namesForTitle('item', '周易注（王弼）'), ['周易注（王弼）']);
    assert.deepEqual(namesForTitle('item', '蛇矛（丈八蛇矛）'), ['蛇矛（丈八蛇矛）', '蛇矛', '丈八蛇矛']);
});

test('buildWikiLinkMaps: routes each content dir to its map and skips overview pages', () => {
    const { maps, warnings } = buildWikiLinkMaps({
        '../content/projects/bio/caocao.mdx': mdx('曹操'),
        '../content/projects/treasure/treasure-shemao.mdx': mdx('蛇矛（丈八蛇矛）'),
        '../content/projects/treasure/00_item-type.mdx': mdx('宝物'),
        '../content/projects/equipment/equipment-gedun.mdx': mdx('革盾'),
        '../content/projects/class/gongbing.mdx': mdx('弓兵'),
        '../content/projects/class/00_total.mdx': mdx('兵种')
    });
    assert.deepEqual(maps.character, { 曹操: '/projects/bio/caocao/' });
    assert.deepEqual(maps.item, {
        '蛇矛（丈八蛇矛）': '/projects/treasure/treasure-shemao/',
        蛇矛: '/projects/treasure/treasure-shemao/',
        丈八蛇矛: '/projects/treasure/treasure-shemao/',
        革盾: '/projects/equipment/equipment-gedun/'
    });
    assert.deepEqual(maps.class, { 弓兵: '/projects/class/gongbing/' });
    assert.deepEqual(warnings, []);
});

test('buildWikiLinkMaps: on a name clash prefers the slug without a numeric suffix, regardless of input order, and warns', () => {
    for (const files of [
        { 'projects/class/qibing2.mdx': mdx('骑兵'), 'projects/class/qibing.mdx': mdx('骑兵') },
        { 'projects/class/qibing.mdx': mdx('骑兵'), 'projects/class/qibing2.mdx': mdx('骑兵') }
    ]) {
        const { maps, warnings } = buildWikiLinkMaps(files);
        assert.equal(maps.class['骑兵'], '/projects/class/qibing/');
        assert.equal(warnings.length, 1);
    }
});

test('buildWikiLinkMaps: warns about entries without a title instead of silently dropping them', () => {
    const { maps, warnings } = buildWikiLinkMaps({ 'projects/bio/nobody.mdx': '---\ntags: []\n---\n' });
    assert.deepEqual(maps.character, {});
    assert.match(warnings[0], /bio\/nobody\.mdx/);
});

// 用真实内容做一致性检查：每个人物 / 物品 / 兵种词条都能按标题找到自己的链接，且没有同名冲突
test('buildWikiLinkMaps (real content): every entry is reachable by its own title, with no warnings', () => {
    const root = 'src/content/projects';
    const rawFiles: Record<string, string> = {};
    for (const dir of ['bio', 'treasure', 'equipment', 'class']) {
        for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => n.endsWith('.mdx'))) {
            rawFiles[`${root}/${dir}/${f}`] = fs.readFileSync(path.join(root, dir, f), 'utf8');
        }
    }
    const { maps, warnings } = buildWikiLinkMaps(rawFiles);
    assert.deepEqual(warnings, []);

    const kindOf: Record<string, 'character' | 'item' | 'class'> = { bio: 'character', treasure: 'item', equipment: 'item', class: 'class' };
    for (const [file, raw] of Object.entries(rawFiles)) {
        const [dir, name] = file.split('/').slice(-2);
        const slug = name.replace(/\.mdx$/, '');
        if (isOverviewPage(slug)) continue;
        assert.equal(maps[kindOf[dir]][extractTitle(raw)!], `/projects/${dir}/${slug}/`, file);
    }
});
