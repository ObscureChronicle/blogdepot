/**
 * 配饰附诗原文与本地化的解析（纯函数）。
 *
 * 宝物词条的附诗写在 Layout_Equipments 的 props 里，没有进 frontmatter，
 * 所以构建时直接读 MDX 原文解析。支持两种写法：
 *   baseDescription={'…'} + baseLocalization={{ hant: '…', ja: '…', en: '…' }}
 *   baseVariants={[{ description: ['…'], localization: { hant: '…', … }, … }]}
 * 多首附诗时每首各自带一组本地化，表格里每首单独成行。
 */

import { extractTitle } from './wiki-link-parser.ts';

export type TreasurePoemLocalization = {
    /** 繁體字 */
    hant?: string;
    /** 日本語 */
    ja?: string;
    /** English */
    en?: string;
};

export type Edition = 'base' | 'dlc';

/** 一首附诗及其本地化文本 */
export type ParsedPoem = {
    text: string;
    localization: TreasurePoemLocalization;
};

export type ParsedTreasurePoem = {
    title: string;
    /** 本传附诗，按出现顺序 */
    base: ParsedPoem[];
    /** 星命诀附诗，按出现顺序 */
    dlc: ParsedPoem[];
    /** 词条里是否写了任意一组本地化；没写的词条不进附诗总览 */
    hasLocalization: boolean;
};

/** 总览表的一行：一首附诗及其对应的本地化 */
export type TreasurePoemRow = TreasurePoemLocalization & {
    text: string;
    editions: Edition[];
};

export type TreasurePoemGroup = {
    slug: string;
    title: string;
    rows: TreasurePoemRow[];
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

/** 读取对象字段 `field: {…}` 内部原文；没有该字段时返回 null */
function readFieldBlock(text: string, field: string): string | null {
    const m = new RegExp(`\\b${field}\\s*:\\s*\\{`).exec(text);
    if (!m) return null;
    const start = text.indexOf('{', m.index);
    const end = findClosingBracket(text, start);
    return end === -1 ? null : text.slice(start + 1, end);
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

/** 读取本地化对象里的 hant / ja / en；缺项按空字符串处理 */
function readLocalization(block: string | null): TreasurePoemLocalization {
    if (block === null) return {};
    const result: TreasurePoemLocalization = {};
    for (const key of ['hant', 'ja', 'en'] as const) {
        const match = new RegExp(`\\b${key}\\s*:\\s*('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|\`(?:[^\`\\\\]|\\\\.)*\`)`).exec(block);
        result[key] = match ? unquote(match[1]) : '';
    }
    return result;
}

/** 把 variants 数组切成每个形态对象的内部原文 */
function variantBodies(block: string): string[] {
    const start = block.indexOf('[');
    if (start === -1) return [];
    const bodies: string[] = [];
    let i = start + 1;
    while (i < block.length) {
        if (block[i] === '{') {
            const end = findClosingBracket(block, i);
            if (end === -1) break;
            bodies.push(block.slice(i + 1, end));
            i = end + 1;
        } else {
            i++;
        }
    }
    return bodies;
}

/** 读取形态里的 description，字符串或字符串数组都支持 */
function readDescriptionTexts(body: string): string[] {
    const m = /\bdescription\s*:\s*/.exec(body);
    if (!m) return [];
    let i = m.index + m[0].length;
    while (i < body.length && /\s/.test(body[i])) i++;

    if (body[i] === '[') {
        const end = findClosingBracket(body, i);
        if (end === -1) return [];
        return [...body.slice(i + 1, end).matchAll(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g)].map((x) => unquote(x[0]));
    }
    if (body[i] === "'" || body[i] === '"' || body[i] === '`') {
        const match = /^('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/.exec(body.slice(i));
        return match ? [unquote(match[1])] : [];
    }
    return [];
}

/** 去空白、去空串、按原文与本地化去重，保留首次出现的顺序 */
function normalizePoems(poems: ParsedPoem[]): ParsedPoem[] {
    const seen = new Set<string>();
    const result: ParsedPoem[] = [];
    for (const poem of poems) {
        const text = poem.text.trim();
        if (!text) continue;
        const key = JSON.stringify([text, poem.localization.hant, poem.localization.ja, poem.localization.en]);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ text, localization: poem.localization });
    }
    return result;
}

export function parseTreasurePoem(raw: string): ParsedTreasurePoem {
    let hasLocalization = false;

    const parseEdition = (edition: Edition): ParsedPoem[] => {
        const variantsBlock = readPropBlock(raw, `${edition}Variants`);
        const poems: ParsedPoem[] = [];

        if (variantsBlock !== null) {
            for (const body of variantBodies(variantsBlock)) {
                const localizationBlock = readFieldBlock(body, 'localization');
                if (localizationBlock !== null) hasLocalization = true;
                const localization = readLocalization(localizationBlock);
                for (const text of readDescriptionTexts(body)) poems.push({ text, localization });
            }
            return normalizePoems(poems);
        }

        const text = readStringProp(raw, `${edition}Description`);
        const localizationBlock = readPropBlock(raw, `${edition}Localization`);
        if (localizationBlock !== null) hasLocalization = true;
        if (text.trim()) poems.push({ text, localization: readLocalization(localizationBlock) });
        return normalizePoems(poems);
    };

    return { title: extractTitle(raw) ?? '', base: parseEdition('base'), dlc: parseEdition('dlc'), hasLocalization };
}

function slugOf(file: string): string {
    const parts = file.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].replace(/\.mdx$/, '');
}

const rowKey = (text: string, localization: TreasurePoemLocalization) =>
    JSON.stringify([text, localization.hant, localization.ja, localization.en]);

/**
 * 从 MDX 原文集合里收集写了本地化的词条，每首附诗一行；
 * 本传与星命诀原文、本地化都相同的同一首诗合并为一行。
 */
export function buildTreasurePoemGroups(files: Record<string, string>): TreasurePoemGroup[] {
    return Object.entries(files)
        .map(([file, raw]) => {
            const parsed = parseTreasurePoem(raw);
            if (!parsed.hasLocalization) return null;

            const rows: TreasurePoemRow[] = [];
            const add = (poem: ParsedPoem, edition: Edition) => {
                const key = rowKey(poem.text, poem.localization);
                const row = rows.find((r) => rowKey(r.text, r) === key);
                if (row) {
                    if (!row.editions.includes(edition)) row.editions.push(edition);
                    return;
                }
                rows.push({ text: poem.text, editions: [edition], ...poem.localization });
            };
            parsed.base.forEach((poem) => add(poem, 'base'));
            parsed.dlc.forEach((poem) => add(poem, 'dlc'));

            return rows.length > 0 ? { slug: slugOf(file), title: parsed.title, rows } : null;
        })
        .filter((group): group is TreasurePoemGroup => group !== null)
        .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}
