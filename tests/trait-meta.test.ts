import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRAIT_MAP, TraitColor, traitColorFromLevel } from '../src/data/trait-meta.ts';
import { extractTraitLevel } from '../src/utils/trait-level-parser.ts';

// TRAIT_MAP 是手工维护的静态数据（浏览器端组件也要用，不能构建时扫描），用真实内容检查它没有跟词条脱节
const dir = 'src/content/projects/trait';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
const slugOf = (link: string) => link.replace('/projects/trait/', '').replace(/\/$/, '');

/** 强化别名：名字以 * 结尾（如「辅弼*」），颜色固定为 Super，对应词条不得设 level */
const isEnhancedAlias = (name: string) => name.endsWith('*');

test('TRAIT_MAP: every link points to an existing trait entry', () => {
    const slugs = new Set(files.map((f) => f.replace(/\.mdx$/, '')));
    for (const [name, info] of Object.entries(TRAIT_MAP)) assert.ok(slugs.has(slugOf(info.link)), `${name} → ${info.link}`);
});

test('TRAIT_MAP: every trait entry (except overview pages) is listed under its title or each of its「本名（别名）」names', () => {
    for (const f of files.filter((n) => !n.startsWith('00_'))) {
        const title = fs.readFileSync(`${dir}/${f}`, 'utf8').match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '';
        const m = title.match(/^(.+?)（(.+)）$/);
        const names = m ? [m[1], m[2]] : [title];
        for (const name of names) assert.equal(TRAIT_MAP[name] && slugOf(TRAIT_MAP[name].link), f.replace(/\.mdx$/, ''), `${f}: ${name}`);
    }
});

test('Trait color: 带 * 的名字必为 Super，不带 * 的名字不得硬编码颜色', () => {
    for (const [name, info] of Object.entries(TRAIT_MAP)) {
        if (isEnhancedAlias(name)) {
            assert.equal(info.color, TraitColor.Super, `${name} 应为强化配色`);
        } else {
            assert.equal(info.color, undefined, `${name} 不应硬编码颜色，应由词条 level 派生`);
        }
    }
});

test('traitColorFromLevel: 1 顶级 / 2 专属 / 3 负面 / 不设与其他值都是普通', () => {
    assert.equal(traitColorFromLevel(1), TraitColor.Ordinary);
    assert.equal(traitColorFromLevel(2), TraitColor.Super);
    assert.equal(traitColorFromLevel(3), TraitColor.Bad);
    for (const level of [undefined, 0, 4, -1]) assert.equal(traitColorFromLevel(level), undefined, String(level));
});

test('Trait color: 强化别名对应的词条不设 level（颜色来自 * 后缀）', () => {
    const rawBySlug = new Map(files.map((f) => [f.replace(/\.mdx$/, ''), fs.readFileSync(`${dir}/${f}`, 'utf8')]));
    for (const [name, info] of Object.entries(TRAIT_MAP)) {
        if (!isEnhancedAlias(name)) continue;
        const slug = slugOf(info.link);
        const raw = rawBySlug.get(slug);
        assert.ok(raw, `${name} → ${info.link} 的词条不存在`);
        assert.equal(extractTraitLevel(raw), undefined, `${name} 的词条 ${slug} 不应设置 level`);
    }
});
