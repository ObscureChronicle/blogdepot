/**
 * 配饰附诗原文的解析（纯函数）。
 *
 * 宝物词条的附诗写在 Layout_Equipments 的 props 里，没有进 frontmatter，
 * 所以构建时直接读 MDX 原文解析。支持两种写法：
 *   baseDescription={'…'} / dlcDescription={'…'}
 *   baseVariants={[{ description: ['…'], … }]} / dlcVariants={…}
 * 同名多诗时每个形态各有一句，按原文顺序返回。
 */

import { extractTitle } from './wiki-link-parser.ts';

export type ParsedTreasurePoem = {
    title: string;
    /** 本传原文，按出现顺序；没有则为空数组 */
    base: string[];
    /** 星命诀原文，按出现顺序；没有则为空数组 */
    dlc: string[];
};

/** 从 start（指向某个开括号）开始找到配对的闭括号；字符串里的括号不计 */
function findClosingBracket(text: string, start: number): number {
    const open = text[start];
    const close = open === '[' ? ']' : '}';
    let depth = 0;
    let quote: string | null = null;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === '\\') i++;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') quote = ch;
        else if (ch === open) depth++;
        else if (ch === close && --depth === 0) return i;
    }
    return -1;
}

/** 读取 `prop={…}` 花括号内部的原文；没有该属性或括号不配对时返回 null */
function readPropBlock(raw: string, prop: string): string | null {
    const m = new RegExp(`\\b${prop}\\s*=\\s*\\{`).exec(raw);
    if (!m) return null;
    const start = raw.indexOf('{', m.index);
    const end = findClosingBracket(raw, start);
    return end === -1 ? null : raw.slice(start + 1, end);
}

/** 去掉字符串字面量两端的引号并还原常见转义 */
function unquote(literal: string): string {
    return literal
        .slice(1, -1)
        .replace(/\\(['"`\\])/g, '$1')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
}

/** 读取字符串 prop（如 baseDescription={'…'}）；不是字符串字面量时按空处理 */
function readStringProp(raw: string, prop: string): string {
    const block = readPropBlock(raw, prop)?.trim() ?? '';
    if (block.length < 2) return '';
    const first = block[0];
    if (first !== "'" && first !== '"' && first !== '`') return '';
    const end = block.lastIndexOf(first);
    return end > 0 ? unquote(block.slice(0, end + 1)) : '';
}

/** 读取多形态写法里的 description；数组内每个字符串是一首诗 */
function readVariantDescriptions(raw: string, prop: string): string[] {
    const block = readPropBlock(raw, prop);
    if (!block) return [];

    const result: string[] = [];
    const re = /description\s*:\s*(\[[^\]]*\]|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
    for (const match of block.matchAll(re)) {
        const value = match[1].trim();
        const literals = value.startsWith('[') ? [...value.matchAll(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g)].map((x) => x[0]) : [value];
        for (const literal of literals) result.push(unquote(literal));
    }
    return result;
}

/** 去空白、去空串、去重，保留首次出现的顺序 */
function normalizePoems(list: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of list) {
        const text = item.trim();
        if (!text || seen.has(text)) continue;
        seen.add(text);
        result.push(text);
    }
    return result;
}

export function parseTreasurePoem(raw: string): ParsedTreasurePoem {
    const base = normalizePoems([readStringProp(raw, 'baseDescription'), ...readVariantDescriptions(raw, 'baseVariants')]);
    const dlc = normalizePoems([readStringProp(raw, 'dlcDescription'), ...readVariantDescriptions(raw, 'dlcVariants')]);
    return { title: extractTitle(raw) ?? '', base, dlc };
}
