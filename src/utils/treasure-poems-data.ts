/**
 * 配饰附诗总览的数据源（构建时计算）。
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 读取 treasure 目录下的 MDX 原文，
 * 只收录写了 poemLocalization 的词条（本地化文本写在词条自身），
 * 再解析出名称与原文。新增词条只要写了该字段就自动进表。
 */
import { buildTreasurePoemRows, type TreasurePoemRow } from './treasure-poems-parser.ts';

const rawFiles = import.meta.glob('../content/projects/treasure/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

export type { TreasurePoemRow };

export function getTreasurePoemRows(): TreasurePoemRow[] {
    return buildTreasurePoemRows(rawFiles);
}
