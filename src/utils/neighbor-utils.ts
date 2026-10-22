// 详情页「上一篇 / 下一篇」相关的纯函数。只依赖类型，不导入 astro:content，
// 因此可以直接用 node:test 测试。

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
    return entry.data.tags.find((tag) => !tag.startsWith('wiki-')) ?? entry.id;
}
