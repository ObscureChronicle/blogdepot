import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blogSchema } from '../src/content-schemas.ts';
import { checkFrontmatter, checkInternalLinks, contentRoute } from '../scripts/content-checks.ts';

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

const routes = new Set(['/projects/trait/trait_00_personal/', '/projects/stage/stage_dlc_04/', '/blog/post-1/']);
const page = '/projects/trait/trait_aoshang/';

test('checkInternalLinks: relative and absolute links to existing pages pass, case-insensitively', () => {
    const raw = `<a href="../trait_00_personal">x</a> <a href="/projects/stage/stage_DLC_04/">y</a> <a href="/blog/post-1">z</a>`;
    assert.deepEqual(checkInternalLinks(raw, page, routes), []);
});

test('checkInternalLinks: reports a link to a missing page, including escaped quotes inside JSX strings', () => {
    const raw = `introHtml={'<a href=\\"../trait_missing\\">x</a>'}`;
    const findings = checkInternalLinks(raw, page, routes);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /\/projects\/trait\/trait_missing\//);
});

test('checkInternalLinks: ignores external links, anchors and paths outside /projects and /blog', () => {
    const raw = `<a href="https://example.com">a</a> <a href="#top">b</a> <a href="/tags/biography">c</a>`;
    assert.deepEqual(checkInternalLinks(raw, page, routes), []);
});
