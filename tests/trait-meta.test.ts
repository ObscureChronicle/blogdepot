import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRAIT_MAP } from '../src/data/trait-meta.ts';

// TRAIT_MAP 是手工维护的静态数据（浏览器端组件也要用，不能构建时扫描），用真实内容检查它没有跟词条脱节
const dir = 'src/content/projects/trait';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
const slugOf = (link: string) => link.replace('/projects/trait/', '');

test('TRAIT_MAP: every link points to an existing trait entry', () => {
    const slugs = new Set(files.map((f) => f.replace(/\.mdx$/, '')));
    for (const [name, info] of Object.entries(TRAIT_MAP)) assert.ok(slugs.has(slugOf(info.link)), `${name} → ${info.link}`);
});

test('TRAIT_MAP: every trait entry (except overview pages) is listed under its title or each of its「本名（别名）」names', () => {
    for (const f of files.filter((n) => !n.startsWith('trait_00_'))) {
        const title = fs.readFileSync(`${dir}/${f}`, 'utf8').match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '';
        const m = title.match(/^(.+?)（(.+)）$/);
        const names = m ? [m[1], m[2]] : [title];
        for (const name of names) assert.equal(TRAIT_MAP[name] && slugOf(TRAIT_MAP[name].link), f.replace(/\.mdx$/, ''), `${f}: ${name}`);
    }
});
