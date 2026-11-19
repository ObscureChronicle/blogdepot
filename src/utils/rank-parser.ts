/**
 * 总人物属性表的解析逻辑（纯函数）
 *
 * 从人物 MDX 原始文本中解析 <CharacterWiki ... /> 的属性 props，生成可排序
 * 对比表所需的行数据和扫描报告。不依赖 import.meta.glob，可以直接用 node:test 测试；
 * 读取文件的部分在 rank-data.ts。
 */
import { extractBaseForms, type RawBaseForm } from './bio-forms-parser.ts';
import { comparePinyin, pinyinKey } from './sort-by-pinyin.ts';

/** 星命诀行的来源标签；本传各形态依次为「本传」「本传2」「本传3」… */
export const DLC_SOURCE = '星命诀';

export interface RankRow {
    /** 人物名：优先 frontmatter title，缺失时取 nameTableData.name.simplified */
    name: string;
    /** 人物词条页链接（/projects/bio/<slug>） */
    href: string;
    /** 拼音排序键（无声调） */
    pinyin: string;
    /** 数据来源标签：本传第 n 个形态为「本传」（n=1）或「本传n」，星命诀为 DLC_SOURCE */
    source: string;
    /** 数据来源顺序：本传第 n 个形态为 n-1，星命诀排在全站最多形态数之后 */
    sourceIndex: number;
    /**
     * 七个输出列的值，缺失为 null（渲染为「—」）：
     * [统御, 智略, 武勇, 魅力, 运势, 胆识, 冷静]
     */
    values: (number | null)[];
}

export interface RankReport {
    fileCount: number;
    characters: number;
    rows: number;
    skipped: { file: string; reason: string }[];
    failures: { file: string; field: string; reason: string }[];
}

const NUM_RE = /^-?\d+$/;

/** 提取 JSX 数组 prop 的内部文本，如 baseData={[90, 85]} → "90, 85" */
function extractArray(raw: string, field: string): string | undefined {
    const re = new RegExp(`\\b${field}\\s*=\\s*\\{\\s*\\[([^\\]]*)\\]`);
    const m = raw.match(re);
    return m ? m[1] : undefined;
}

/** 将 "90, 85, 84" 解析为数字数组，非法 token 记为 null（渲染为「—」） */
function parseNums(inner: string): (number | null)[] {
    return inner.split(',').map((t) => {
        const s = t.trim();
        return s !== '' && NUM_RE.test(s) ? Number(s) : null;
    });
}

/** 从 frontmatter 提取 title（缺失时回退到 nameTableData.name.simplified） */
function extractName(raw: string): string {
    const titleMatch = raw.match(/^title:\s*(.+)\s*$/m);
    if (titleMatch) {
        const title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
        if (title) return title;
    }
    const nameMatch = raw.match(/\bsimplified:\s*(['"])([^'"]*)\1/);
    return nameMatch ? nameMatch[2].trim() : '';
}

/** 本传第 index 个形态（从 0 起）的来源标签 */
function baseSource(index: number): string {
    return index === 0 ? '本传' : `本传${index + 1}`;
}

/**
 * 由 bio 目录 MDX 原始文本生成排行表行数据与扫描报告。
 * @param rawFiles 文件路径 → MDX 原始文本（路径只用来取 slug）
 */
export function buildRankData(rawFiles: Record<string, string>): { rows: RankRow[]; sources: string[]; report: RankReport } {
    const report: RankReport = { fileCount: 0, characters: 0, rows: 0, skipped: [], failures: [] };
    const rows: RankRow[] = [];

    for (const [key, raw] of Object.entries(rawFiles)) {
        report.fileCount++;
        const slug = key.replace(/\\/g, '/').split('/').pop()!.replace(/\.mdx$/, '');
        const shortFile = `${slug}.mdx`;
        const name = extractName(raw);
        if (!name) {
            report.skipped.push({ file: shortFile, reason: '无法确定人物名（frontmatter title 与 nameTableData 均缺失）' });
            continue;
        }

        let forms: RawBaseForm[];
        try {
            forms = extractBaseForms(raw) ?? [];
        } catch (e) {
            report.failures.push({ file: shortFile, field: 'baseForms', reason: (e as Error).message });
            forms = [];
        }
        // 每组：来源、数组内部原文、出错时报告用的字段名
        const groups = forms.map((form, i) => ({
            source: baseSource(i),
            sourceIndex: i,
            baseInner: form.data,
            extraInner: form.data2,
            baseField: `baseForms[${i}].data`,
            extraField: `baseForms[${i}].data2`
        }));
        groups.push({
            source: DLC_SOURCE,
            sourceIndex: -1, // 扫描完所有人物、知道最多形态数后再定
            baseInner: extractArray(raw, 'dlcData'),
            extraInner: extractArray(raw, 'dlcData2'),
            baseField: 'dlcData',
            extraField: 'dlcData2'
        });

        const groupRows: RankRow[] = [];
        for (const group of groups) {
            const { baseInner, extraInner } = group;

            // 某组两个数组都缺失 → 该组不生成行
            if (baseInner === undefined && extraInner === undefined) continue;

            const base = baseInner !== undefined ? parseNums(baseInner) : [];
            const extra = extraInner !== undefined ? parseNums(extraInner) : [];

            // 数组存在但一个有效数字都没有 → 记为解析失败，不静默忽略
            if (baseInner !== undefined && base.every((v) => v === null)) {
                report.failures.push({ file: shortFile, field: group.baseField, reason: '未能解析出任何数值' });
            }
            if (extraInner !== undefined && extra.every((v) => v === null)) {
                report.failures.push({ file: shortFile, field: group.extraField, reason: '未能解析出任何数值' });
            }

            // arr 索引：[0]统御 [1]运势 [2]武勇 [3]智略 [4]魅力；arr2 索引：[0]胆识 [1]冷静
            const at = (arr: (number | null)[], i: number) => (arr.length > i ? arr[i] : null);
            groupRows.push({
                name,
                href: `/projects/bio/${slug}/`,
                pinyin: pinyinKey(name),
                source: group.source,
                sourceIndex: group.sourceIndex,
                values: [
                    at(base, 0), // 统御
                    at(base, 3), // 智略
                    at(base, 2), // 武勇
                    at(base, 4), // 魅力
                    at(base, 1), // 运势
                    at(extra, 0), // 胆识
                    at(extra, 1) // 冷静
                ]
            });
        }

        if (groupRows.length === 0) {
            report.skipped.push({ file: shortFile, reason: '无任何属性数组（本传、星命诀数据全缺）' });
            continue;
        }
        report.characters++;
        rows.push(...groupRows);
    }

    // 星命诀排在全站最多的本传形态之后，保证 sourceIndex 与 sources 下标一一对应
    const baseCount = rows.reduce((max, r) => (r.source === DLC_SOURCE ? max : Math.max(max, r.sourceIndex + 1)), 0);
    for (const r of rows) if (r.source === DLC_SOURCE) r.sourceIndex = baseCount;
    const sources = [...Array.from({ length: baseCount }, (_, i) => baseSource(i)), DLC_SOURCE];

    // 人物按拼音升序；同人物内按 本传 → 本传2 → … → 星命诀 固定顺序
    rows.sort((a, b) => {
        const byName = comparePinyin(a.pinyin, b.pinyin);
        if (byName !== 0) return byName;
        return a.sourceIndex - b.sourceIndex;
    });

    report.rows = rows.length;
    return { rows, sources, report };
}
