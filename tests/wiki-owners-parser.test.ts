import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildOwners, extractStringArray, OWNER_DISPLAY_NAMES, ownersOfTraitEntry } from '../src/utils/wiki-owners-parser.ts';
import { buildWikiLinkMaps } from '../src/utils/wiki-link-parser.ts';

const bio = (title: string, props: string) => `---\ntitle: ${title}\n---\n\n<CharacterWiki\n${props}\n/>\n`;

test('extractStringArray: reads single- or double-quoted string arrays, keeping the * suffix', () => {
    assert.deepEqual(extractStringArray(`traitsBase={['中原', '武库*']}`, 'traitsBase'), ['中原', '武库*']);
    assert.deepEqual(extractStringArray(`traitsBase={["河北", "龙胆"]}`, 'traitsBase'), ['河北', '龙胆']);
    assert.deepEqual(extractStringArray(`baseclass={[]}`, 'baseclass'), []);
    assert.deepEqual(extractStringArray(`intro={'x'}`, 'traitsBase'), []);
});

test('buildOwners: traits of every baseForms form count as 本传, traitsDLC as 星命诀, without duplicates', () => {
    const { traits } = buildOwners({
        'bio/guanyu.mdx': bio('关羽', `baseForms={[\n    { name: '甲', traits: ['中原', '国士'] },\n    { name: '乙', traits: ['中原', '桓武*'] }\n  ]}\ntraitsDLC={['中原']}`)
    });
    assert.deepEqual(traits['中原'], { base: ['关羽'], dlc: ['关羽'] });
    // 强化别名归一化到去星后的名字，不单独成行
    assert.deepEqual(traits['桓武'], { base: ['关羽'], dlc: [] });
    assert.equal(traits['桓武*'], undefined);
});

test('buildOwners: enhanced aliases are merged into the base name and recorded separately', () => {
    const { traits, enhancedTraits } = buildOwners({
        'bio/liaohao.mdx': bio('廖豪', `baseForms={[{ traits: ['豪桀*'] }]}\ntraitsDLC={['豪桀*']}`),
        'bio/caimao.mdx': bio('蔡瑁', `baseForms={[{ traits: ['豪桀'] }]}`)
    });
    assert.deepEqual(traits['豪桀'], { base: ['蔡瑁', '廖豪'], dlc: ['廖豪'] });
    assert.deepEqual(enhancedTraits['豪桀'], { base: ['廖豪'], dlc: ['廖豪'] });
});

test('buildOwners: collects class owners from baseclass / dlcclass', () => {
    const { classes } = buildOwners({
        'bio/caocao.mdx': bio('曹操', `baseclass={['骑兵']}\ndlcclass={['刀骑兵']}`)
    });
    assert.deepEqual(classes, { 骑兵: { base: ['曹操'], dlc: [] }, 刀骑兵: { base: [], dlc: ['曹操'] } });
});

test('buildOwners: owner lists follow file name order regardless of input order', () => {
    const files = {
        'bio/zhoutai_2.mdx': bio('州泰', `baseForms={[{ traits: ['荆扬'] }]}`),
        'bio/zhoutai.mdx': bio('周泰', `baseForms={[{ traits: ['荆扬'] }]}`),
        'bio/agui.mdx': bio('阿贵', `baseForms={[{ traits: ['荆扬'] }]}`)
    };
    assert.deepEqual(buildOwners(files).traits['荆扬'].base, ['阿贵', '周泰', '州泰']);
});

test('buildOwners: uses the per-version display name registered in OWNER_DISPLAY_NAMES', () => {
    const { traits } = buildOwners({
        'bio/hanxun.mdx': bio('韩荀（韩猛）', `baseForms={[{ traits: ['中原'] }]}\ntraitsDLC={['中原']}`)
    });
    assert.deepEqual(traits['中原'], { base: ['韩猛'], dlc: ['韩荀'] });
});

test('OWNER_DISPLAY_NAMES: every display name still links to its character entry', () => {
    // 显示名必须是 wiki-link-parser 从标题自动拆出的名字之一，否则表格里会变成纯文本
    for (const [title, names] of Object.entries(OWNER_DISPLAY_NAMES)) {
        const { maps } = buildWikiLinkMaps({ 'projects/bio/x.mdx': `---\ntitle: ${title}\n---\n` });
        for (const name of Object.values(names)) assert.equal(maps.character[name], '/projects/bio/x/', `${title} → ${name}`);
    }
});

test('OWNER_DISPLAY_NAMES (real content): every registered title still exists as a bio entry', () => {
    const dir = 'src/content/projects/bio';
    const titles = new Set(
        fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.mdx'))
            .map((f) => fs.readFileSync(`${dir}/${f}`, 'utf8').match(/^title:\s*(.+?)\s*$/m)?.[1])
    );
    for (const title of Object.keys(OWNER_DISPLAY_NAMES)) assert.ok(titles.has(title), title);
});

test('ownersOfTraitEntry: merges every trait name linking to the entry, in link order, without duplicates', () => {
    const links = { '关陇': '/projects/trait/guanzhong/', '中原': '/projects/trait/zhongyuan/', '关中': '/projects/trait/guanzhong/' };
    const owners = {
        '关陇': { base: ['马超'], dlc: [] },
        '关中': { base: ['马超', '韩遂'], dlc: ['韩遂'] },
        '中原': { base: ['曹操'], dlc: ['曹操'] }
    };
    assert.deepEqual(ownersOfTraitEntry('guanzhong', links, owners), { base: ['马超', '韩遂'], dlc: ['韩遂'] });
});

test('ownersOfTraitEntry: an entry nobody holds (or not in links) gets empty lists', () => {
    assert.deepEqual(ownersOfTraitEntry('laoge', { '老革': '/projects/trait/laoge/' }, {}), { base: [], dlc: [] });
    assert.deepEqual(ownersOfTraitEntry('unknown', {}, {}), { base: [], dlc: [] });
});
