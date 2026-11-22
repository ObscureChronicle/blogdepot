/**
 * 配饰附诗总览的数据源（构建时计算）。
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 读取 treasure 目录下的 MDX 原文，
 * 只收录写了本地化（单首的 baseLocalization / dlcLocalization，多首的
 * 每个形态里的 localization）的词条。每首附诗单独一行，本地化跟行不跟词条。
 */
import { buildTreasurePoemGroups, type TreasurePoemGroup } from './treasure-poems-parser.ts';

const rawFiles = import.meta.glob('../content/projects/treasure/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

export type { TreasurePoemGroup };

export function getTreasurePoemGroups(): TreasurePoemGroup[] {
    return buildTreasurePoemGroups(rawFiles);
}
