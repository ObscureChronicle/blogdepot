// 详情页「上一篇 / 下一篇」相关的纯函数。不导入 astro:content 运行时，
// 因此可以直接用 node:test 测试。
import { isPinyinIndexTag, SLUG_TAG_MAP } from './data-utils.ts';

export type WithNeighbors<T> = { item: T; prev: T | null; next: T | null };

/** 给已排好序的列表中每一项配上前后相邻项：prev 是列表中的前一项，next 是后一项 */
export function withNeighbors<T>(sorted: T[]): WithNeighbors<T>[] {
    return sorted.map((item, index) => ({
        item,
        prev: index > 0 ? sorted[index - 1] : null,
        next: index < sorted.length - 1 ? sorted[index + 1] : null
    }));
}

/** 按 keyFn 分组，组的顺序与组内顺序都保持输入时的先后 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    for (const item of items) {
        const key = keyFn(item);
        const group = groups.get(key) ?? [];
        group.push(item);
        groups.set(key, group);
    }
    return groups;
}

/** 百科词条的分类：第一个非 wiki-X 拼音索引标签；没有分类标签时退回词条 id，自成一组 */
export function getProjectCategory(entry: { id: string; data: { tags: string[] } }): string {
    return entry.data.tags.find((tag) => !isPinyinIndexTag(tag)) ?? entry.id;
}

/** 词条分类的中文显示名（与 /tags/ 页一致，如 'biography' → '人物'）；分类标签未登记时返回 null */
export function getProjectCategoryName(entry: { id: string; data: { tags: string[] } }): string | null {
    return SLUG_TAG_MAP[getProjectCategory(entry)] ?? null;
}

/**
 * 词条页 <title> 用的标题：带上分类以区分同名词条（如「陈到 · 人物」）。
 * 没有分类名、或分类名与标题相同（如「参考文献」词条的分类也叫参考文献）时保持原标题，避免重复。
 */
export function formatProjectTitle(title: string, categoryName: string | null): string {
    return categoryName && categoryName !== title ? `${title} · ${categoryName}` : title;
}

/** 按名单顺序取出重点词条；名单里有找不到的 id 时抛错，让构建失败而不是悄悄少显示一条 */
export function pickFeaturedProjects<T extends { id: string }>(ids: string[], entries: T[]): T[] {
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length > 0) {
        throw new Error(`featuredProjects 中有不存在的词条：${missing.join('、')}（请检查 src/data/site-config.ts）`);
    }
    return ids.map((id) => byId.get(id) as T);
}
