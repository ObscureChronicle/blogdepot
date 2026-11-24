import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRAIT_MAP, TraitColor, traitColorFromLevel } from '../src/data/trait-meta.ts';
import { extractTraitLevel } from '../src/utils/trait-level-parser.ts';

// TRAIT_MAP 是手工维护的静态数据（浏览器端组件也要用，不能构建时扫描），用真实内容检查它没有跟词条脱节
const dir = 'src/content/projects/trait';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
const slugOf = (link: string) => link.replace('/projects/trait/', '').replace(/\/$/, '');

/** 允许硬编码颜色的强化别名（带 *）白名单 */
const ENHANCED_ALIASES = new Set(['豪桀*', '桓武*', '武库*']);

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

test('Trait color: only the three enhanced aliases carry a hard-coded color', () => {
    for (const [name, info] of Object.entries(TRAIT_MAP)) {
        if (ENHANCED_ALIASES.has(name)) {
            assert.equal(info.color, TraitColor.Super, `${name} 应为强化配色`);
        } else {
            assert.equal(info.color, undefined, `${name} 不应硬编码颜色，应由词条 level 派生`);
        }
    }
    for (const name of ENHANCED_ALIASES) assert.ok(TRAIT_MAP[name], `${name} 未登记`);
});

test('traitColorFromLevel: 1 顶级 / 2 专属 / 3 负面 / 不设与其他值都是普通', () => {
    assert.equal(traitColorFromLevel(1), TraitColor.Ordinary);
    assert.equal(traitColorFromLevel(2), TraitColor.Super);
    assert.equal(traitColorFromLevel(3), TraitColor.Bad);
    for (const level of [undefined, 0, 4, -1]) assert.equal(traitColorFromLevel(level), undefined, String(level));
});

test('Trait color: 有 level 的非 * 名字不硬编码颜色；三个 * 别名对应的词条不设 level', () => {
    for (const f of files) {
        if (f.startsWith('00_')) continue;
        const raw = fs.readFileSync(`${dir}/${f}`, 'utf8');
        const level = extractTraitLevel(raw);
        const title = raw.match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '';
        const m = title.match(/^(.+?)（(.+)）$/);
        const names = m ? [m[1], m[2]] : [title];
        for (const name of names) {
            const info = TRAIT_MAP[name];
            if (!info) continue;
            // 强化别名是唯一允许保留颜色的名字，且其词条本身不设 level（颜色来自白名单）
            if (ENHANCED_ALIASES.has(name)) {
                assert.equal(level, undefined, `${name} 的词条不应设置 level（颜色来自白名单）`);
                assert.equal(info.color, TraitColor.Super, name);
                continue;
            }
            // 其余名字（无论有没有 level）都不硬编码颜色，渲染时由 traitColorFromLevel 派生
            assert.equal(info.color, undefined, `${name} 不应硬编码颜色`);
        }
    }
});
