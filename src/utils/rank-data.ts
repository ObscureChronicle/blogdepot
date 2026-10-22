/**
 * 总人物属性表数据源（构建时计算）
 *
 * 使用 Vite 的 import.meta.glob 以 ?raw 方式在构建时读取 bio 目录下全部人物
 * MDX 的原始文本，交给 rank-parser.ts 解析成可排序对比表所需的行数据，
 * 并输出扫描报告。不手工维护任何静态数据。
 */
import { buildRankData, type RankReport, type RankRow } from './rank-parser';

const rawFiles = import.meta.glob('../content/projects/bio/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const { rows, report } = buildRankData(rawFiles);

export function getRankRows(): RankRow[] {
    return rows;
}

export function getRankReport(): RankReport {
    return report;
}

// 构建时输出扫描报告，便于核对数据覆盖情况
console.log(
    `[rank] 扫描 ${report.fileCount} 个人物文件，${report.characters} 个人物有效，生成 ${report.rows} 行数据；` +
    `跳过 ${report.skipped.length} 个文件，解析失败 ${report.failures.length} 处。`
);
if (report.skipped.length > 0) {
    console.log(`[rank] 跳过明细: ${JSON.stringify(report.skipped)}`);
}
if (report.failures.length > 0) {
    console.log(`[rank] 解析失败明细: ${JSON.stringify(report.failures)}`);
}
