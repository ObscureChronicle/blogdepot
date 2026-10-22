/**
 * 总人物属性表的解析逻辑（纯函数）
 *
 * 从人物 MDX 原始文本中解析 <CharacterWiki ... /> 的属性 props，生成可排序
 * 对比表所需的行数据和扫描报告。不依赖 import.meta.glob，可以直接用 node:test 测试；
 * 读取文件的部分在 rank-data.ts。
 */
import { comparePinyin, pinyinKey } from './sort-by-pinyin.ts';

export interface RankRow {
    /** 人物名：优先 frontmatter title，缺失时取 nameTableData.name.simplified */
    name: string;
    /** 人物词条页链接（/projects/bio/<slug>） */
    href: string;
    /** 拼音排序键（无声调） */
    pinyin: string;
    /** 数据来源标签 */
    source: '本传' | '本传2' | '星命诀';
    /** 数据来源固定枚举顺序：本传=0 < 本传2=1 < 星命诀=2 */
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

interface Group {
    source: RankRow['source'];
    sourceIndex: number;
    baseField: string;
    extraField: string;
}

const GROUPS: Group[] = [
    { source: '本传', sourceIndex: 0, baseField: 'baseData', extraField: 'baseData2' },
    { source: '本传2', sourceIndex: 1, baseField: 'postData', extraField: 'postBaseData2' },
    { source: '星命诀', sourceIndex: 2, baseField: 'dlcData', extraField: 'dlcData2' }
];

/**
 * 由 bio 目录 MDX 原始文本生成排行表行数据与扫描报告。
 * @param rawFiles 文件路径 → MDX 原始文本（路径只用来取 slug）
 */
export function buildRankData(rawFiles: Record<string, string>): { rows: RankRow[]; report: RankReport } {
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

        const groupRows: RankRow[] = [];
        for (const group of GROUPS) {
            const baseInner = extractArray(raw, group.baseField);
            let extraInner = extractArray(raw, group.extraField);

            // 本传2 特例：postBaseData2 缺失但 postData 存在时，胆识/冷静沿用本传 的 baseData2
            if (group.source === '本传2' && extraInner === undefined && baseInner !== undefined) {
                extraInner = extractArray(raw, 'baseData2');
            }

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
                href: `/projects/bio/${slug}`,
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
            report.skipped.push({ file: shortFile, reason: '无任何属性数组（三组数据全缺）' });
            continue;
        }
        report.characters++;
        rows.push(...groupRows);
    }

    // 人物按拼音升序；同人物内按 本传 → 本传2 → 星命诀 固定顺序
    rows.sort((a, b) => {
        const byName = comparePinyin(a.pinyin, b.pinyin);
        if (byName !== 0) return byName;
        return a.sourceIndex - b.sourceIndex;
    });

    report.rows = rows.length;
    return { rows, report };
}
