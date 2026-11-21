/**
 * 配饰附诗总览的数据源（构建时计算）。
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 读取 treasure 目录下的 MDX 原文，按
 * src/data/treasure-poems.ts 登记的 slug 顺序解析出名称与原文，再拼上本地化占位数据。
 */
import { TREASURE_POEMS } from '../data/treasure-poems.ts';
import { parseTreasurePoem, type ParsedTreasurePoem } from './treasure-poems-parser.ts';

const rawFiles = import.meta.glob('../content/projects/treasure/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

function slugOf(file: string): string {
    const parts = file.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].replace(/\.mdx$/, '');
}

const rawBySlug = new Map(Object.entries(rawFiles).map(([file, raw]) => [slugOf(file), raw]));

export type TreasurePoemRow = ParsedTreasurePoem & {
    slug: string;
    hant?: string;
    ja?: string;
    en?: string;
};

export function getTreasurePoemRows(): TreasurePoemRow[] {
    return TREASURE_POEMS.map((entry) => {
        const raw = rawBySlug.get(entry.slug);
        if (!raw) throw new Error(`[treasure-poems] 找不到词条：${entry.slug}`);
        return { ...parseTreasurePoem(raw), ...entry };
    });
}
