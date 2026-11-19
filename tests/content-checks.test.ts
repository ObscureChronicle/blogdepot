import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blogSchema } from '../src/content-schemas.ts';
import fs from 'node:fs';
import path from 'node:path';
import { classTreeCards } from '../src/data/class-tree.ts';
import {
    checkClassTree,
    checkDisambiguation,
    checkEditionSectionTitles,
    checkFrontmatter,
    checkInternalLinks,
    checkLegacyAttributeFigure,
    checkLegacyTermHeadings,
    checkLegacyTraitOwners,
    contentRoute
} from '../scripts/content-checks.ts';
import { extractBaseClassRelations, type ClassRelations } from '../src/utils/class-relations.ts';

const validBlog = { title: '标题', publishDate: '2024-01-01', tags: ['diary'] };

test('checkFrontmatter: a valid entry has no findings', () => {
    assert.deepEqual(checkFrontmatter('blog', blogSchema, validBlog), []);
});

test('checkFrontmatter: schema violations are errors', () => {
    const findings = checkFrontmatter('blog', blogSchema, { tags: [] });
    assert.ok(findings.some((f) => f.level === 'error' && f.message.startsWith('[schema] title')));
});

test('checkFrontmatter: legacy singular "tag" is an error, unknown tags and extra fields are warnings', () => {
    const findings = checkFrontmatter('blog', blogSchema, { ...validBlog, tag: 'x', tags: ['不存在的标签'], extra: 1 });
    assert.deepEqual(
        findings.map((f) => f.level),
        ['error', 'warning', 'warning']
    );
});

test('contentRoute: lowercases the id and adds a trailing slash; pages live at the site root', () => {
    assert.equal(contentRoute('projects', 'stage/stage_DLC_04'), '/projects/stage/stage_dlc_04/');
    assert.equal(contentRoute('blog', 'post-1'), '/blog/post-1/');
    assert.equal(contentRoute('pages', 'about'), '/about/');
});

const routes = new Set(['/projects/trait/00_personal/', '/projects/stage/stage_dlc_04/', '/blog/post-1/']);
const page = '/projects/trait/aoshang/';

test('checkInternalLinks: relative and absolute links to existing pages pass, case-insensitively', () => {
    const raw = `<a href="../00_personal">x</a> <a href="/projects/stage/stage_DLC_04/">y</a> <a href="/blog/post-1">z</a>`;
    assert.deepEqual(checkInternalLinks(raw, page, routes), []);
});

test('checkInternalLinks: reports a link to a missing page, including escaped quotes inside JSX strings', () => {
    const raw = `introHtml={'<a href=\\"../missing\\">x</a>'}`;
    const findings = checkInternalLinks(raw, page, routes);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /\/projects\/trait\/missing\//);
});

test('checkInternalLinks: ignores external links, anchors and paths outside /projects and /blog', () => {
    const raw = `<a href="https://example.com">a</a> <a href="#top">b</a> <a href="/tags/biography">c</a>`;
    assert.deepEqual(checkInternalLinks(raw, page, routes), []);
});

test('checkEditionSectionTitles: version headings with the right variant class pass', () => {
    const raw = [
        `<h2 class="section-title section-title--base">本传</h2>`,
        `<h2 class="section-title section-title--dlc">星命诀</h2>`,
        `<h2  class='section-title section-title--base'>术语（本传）</h2>`,
        `<h2 class='section-title section-title--dlc'>术语（星命诀）</h2>`,
        `<h2 class='section-title'>初始设定</h2>`
    ].join('\n');
    assert.deepEqual(checkEditionSectionTitles(raw), []);
});

test('checkEditionSectionTitles: version headings missing the variant class are errors', () => {
    const raw = [
        `<h2 class='section-title'>本传</h2>`,
        `<h2 class='section-title'>星命诀</h2>`,
        `<h2 class='section-title'>术语（本传）</h2>`,
        `<h2 class='section-title'>术语（星命诀）</h2>`
    ].join('\n');
    const findings = checkEditionSectionTitles(raw);
    assert.equal(findings.length, 4);
    assert.ok(findings.every((f) => f.level === 'error'));
    assert.ok(findings.some((f) => f.message.includes('section-title--base')));
    assert.ok(findings.some((f) => f.message.includes('section-title--dlc')));
});

test('checkEditionSectionTitles: ignores h2 elements that are not section titles', () => {
    const raw = `<h2 class='other'>星命诀</h2>\n<h2>本传</h2>`;
    assert.deepEqual(checkEditionSectionTitles(raw), []);
});

test('checkLegacyTermHeadings: explicit h2 and Markdown headings for class terms are errors', () => {
    const raw = [
        `<h2 class='section-title section-title--base'>术语（本传）</h2>`,
        `<h2 class="section-title section-title--dlc">术语（星命诀）</h2>`,
        `## 术语（本传）`
    ].join('\n');
    const findings = checkLegacyTermHeadings(raw);
    assert.equal(findings.length, 3);
    assert.ok(findings.every((f) => f.level === 'error' && f.message.includes('terms 字段')));
});

test('checkLegacyTermHeadings: other headings and terms text are fine', () => {
    const raw = [
        `<h2 class='section-title section-title--base'>本传</h2>`,
        `<h2 class='section-title section-title--dlc'>星命诀</h2>`,
        `<ClassWiki terms={['术语性说明写进字段即可。']} />`
    ].join('\n');
    assert.deepEqual(checkLegacyTermHeadings(raw), []);
});

const bio = { id: 'bio/chendao', title: '陈到', tags: ['biography'] };
const guard = { id: 'treasure/chendao', title: '陈到', tags: ['equipment'] };
const disambiguationPage = { id: 'disambiguation/chendao', title: '陈到', tags: ['disambiguation', 'wiki-c'] };

test('checkDisambiguation: duplicated titles with a disambiguation page and no pinyin tags pass', () => {
    assert.deepEqual(checkDisambiguation([bio, guard, disambiguationPage, { id: 'bio/caocao', title: '曹操', tags: ['biography', 'wiki-c'] }]), []);
});

test('checkDisambiguation: duplicated titles without a disambiguation page warn on every entry', () => {
    const findings = checkDisambiguation([bio, guard]);
    assert.deepEqual(
        findings.map((f) => [f.id, f.level]),
        [
            ['bio/chendao', 'warning'],
            ['treasure/chendao', 'warning']
        ]
    );
});

test('checkDisambiguation: duplicated entries must not keep a pinyin index tag', () => {
    const findings = checkDisambiguation([{ ...bio, tags: ['biography', 'wiki-c'] }, guard, disambiguationPage]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].id, 'bio/chendao');
    assert.match(findings[0].message, /wiki-X/);
});

test('checkDisambiguation: a disambiguation page needs the disambiguation category tag', () => {
    const findings = checkDisambiguation([bio, guard, { ...disambiguationPage, tags: ['wiki-c'] }]);
    assert.deepEqual(
        findings.map((f) => f.id),
        ['disambiguation/chendao']
    );
});

const rel = (parents: string[], upgrades: string[]): ClassRelations => ({ parents, upgrades, condition: [] });
const sampleClasses = () =>
    new Map<string, ClassRelations>([
        ['刀兵', rel([], ['重装刀兵'])],
        ['重装刀兵', rel(['刀兵'], ['亲卫队'])],
        ['亲卫队', rel(['重装刀兵'], [])]
    ]);
const sampleCard = () => ({ root: '刀兵', mid: ['重装刀兵'], high: [{ name: '亲卫队', col: 0 }], links: [{ from: ['重装刀兵'], to: ['亲卫队'] }] });
const messages = (findings: { message: string }[]) => findings.map((f) => f.message);

test('checkClassTree: a card matching the data has no findings', () => {
    assert.deepEqual(checkClassTree([sampleCard()], sampleClasses()), []);
});

test('checkClassTree: reports asymmetric parents / upgrades', () => {
    const classes = sampleClasses();
    classes.set('亲卫队', rel([], []));
    assert.deepEqual(messages(checkClassTree([sampleCard()], classes)), ['「重装刀兵」的可转职兵种有「亲卫队」，但「亲卫队」的前置里没有「重装刀兵」']);
});

test('checkClassTree: reports relations that are not drawn and lines that are not in the data', () => {
    const undrawn = { ...sampleCard(), high: [], links: [] };
    assert.ok(messages(checkClassTree([undrawn], sampleClasses())).some((m) => m.includes('「重装刀兵 → 亲卫队」，但兵种树') && m.includes('没有画出')));

    const extra = sampleCard();
    extra.mid.push('亲卫队');
    assert.ok(messages(checkClassTree([extra], sampleClasses())).includes('兵种树「刀兵」卡片：画了「刀兵 → 亲卫队」，但兵种词条里没有这条转职关系'));
});

test('checkClassTree: reports malformed cards', () => {
    const card = {
        root: '刀兵',
        mid: ['重装刀兵'],
        high: [
            { name: '亲卫队', col: 3 },
            { name: '不存在', col: 3 }
        ],
        links: [{ from: ['刀兵'], to: ['亲卫队'] }]
    };
    const found = messages(checkClassTree([card], sampleClasses()));
    assert.ok(found.includes('兵种树「刀兵」卡片：「不存在」不是已有的兵种词条'));
    assert.ok(found.includes('兵种树「刀兵」卡片：第三行有重复的列号'));
    assert.ok(found.includes('兵种树「刀兵」卡片：「亲卫队」的列号 3 超出第二行范围'));
    assert.ok(found.includes('兵种树「刀兵」卡片：连线起点「刀兵」不在第二行'));
    assert.ok(found.includes('兵种树「刀兵」卡片：「不存在」没有任何连线'));
});

test('checkClassTree: real data — the class tree matches every class entry', () => {
    const dir = path.join(import.meta.dirname, '../src/content/projects/class');
    const classes = new Map<string, ClassRelations>();
    for (const file of fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const title = raw.match(/^title:\s*(.+?)\s*$/m)?.[1];
        if (title) classes.set(title, extractBaseClassRelations(raw));
    }
    assert.ok(classes.size > 50);
    assert.deepEqual(checkClassTree(classTreeCards, classes), []);
});

test('checkLegacyAttributeFigure: a top-level AttributeFigure prop is an error', () => {
    const findings = checkLegacyAttributeFigure(`<CharacterWiki\n  AttributeFigure={[1, 0, 0, 0, 0]}\n/>`);
    assert.equal(findings.length, 1);
    assert.ok(findings[0].level === 'error' && findings[0].message.includes('figure 字段'));
});

test('checkLegacyAttributeFigure: figure inside baseForms and dlcAttributeFigure are fine', () => {
    const raw = `<CharacterWiki\n  baseForms={[{ data: [1], figure: [1, 0, 0, 0, 0] }]}\n  dlcAttributeFigure={[0, 0, 0, 0, 0]}\n/>`;
    assert.deepEqual(checkLegacyAttributeFigure(raw), []);
});

test('checkLegacyTraitOwners: hand-written baseOwner / dlcOwner on a trait entry is an error', () => {
    const findings = checkLegacyTraitOwners(`<TraitWiki\n  level={3}\n  dlcOwner={[ '关羽' ]}\n/>`);
    assert.equal(findings.length, 1);
    assert.ok(findings[0].level === 'error' && findings[0].message.includes('自动生成'));
});

test('checkLegacyTraitOwners: a trait entry without owner props is fine', () => {
    assert.deepEqual(checkLegacyTraitOwners(`<TraitWiki\n  level={3}\n  dlcDescription={'x'}\n/>`), []);
});
