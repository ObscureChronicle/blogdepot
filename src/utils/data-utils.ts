import type { CollectionEntry } from 'astro:content';

// projects.publishDate 是可选的（百科条目不讲究发布时间），缺失时视为最旧、排在最后。
// 不能用 -Infinity 当哨兵值直接相减：两个都缺失时 -Infinity - (-Infinity) 是 NaN，不是 0。
export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    if (!itemA.data.publishDate && !itemB.data.publishDate) return 0;
    if (!itemA.data.publishDate) return 1;
    if (!itemB.data.publishDate) return -1;
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export const TAG_SLUG_MAP: Record<string, string> = {
    参考文献: 'reference',
    创作手记: 'diary',
    更新日志: 'changelog',
    事典: 'encyclopedia',
    文存: 'wen-yan',
    人物: 'biography',
    兵装与宝物: 'equipment',
    特性与军略: 'trait',
    关卡: 'stage',
    状态: 'status',
    A: 'wiki-a',
    B: 'wiki-b',
    C: 'wiki-c',
    D: 'wiki-d',
    E: 'wiki-e',
    F: 'wiki-f',
    G: 'wiki-g',
    H: 'wiki-h',
    I: 'wiki-i',
    J: 'wiki-j',
    K: 'wiki-k',
    L: 'wiki-l',
    M: 'wiki-m',
    N: 'wiki-n',
    O: 'wiki-o',
    P: 'wiki-p',
    Q: 'wiki-q',
    R: 'wiki-r',
    S: 'wiki-s',
    T: 'wiki-t',
    U: 'wiki-u',
    V: 'wiki-v',
    W: 'wiki-w',
    X: 'wiki-x',
    Y: 'wiki-y',
    Z: 'wiki-z'
};

// 反转映射（英文 id → 中文 name）
export const SLUG_TAG_MAP: Record<string, string> = Object.fromEntries(Object.entries(TAG_SLUG_MAP).map(([cn, en]) => [en, cn]));

// 把原始标签字符串（可能是中文名，也可能是英文 slug，大小写/首尾空白不敏感）
// 归一化成 { name: 中文名, id: 英文 slug }。未登记的标签统一归为 id: 'unknown'。
// getAllTags 和 getPostsByTag 共用这一套映射，保证"标签能被发现"和"文章能按
// 标签筛出来"用的是同一个判断标准，不会出现只有一边认得某个标签的情况。
export function resolveTag(rawTag: string): { name: string; id: string } {
    const slugTag = rawTag.trim().toLowerCase();
    const name = SLUG_TAG_MAP[slugTag] || rawTag;
    const id = TAG_SLUG_MAP[name] || 'unknown';
    return { name, id };
}

export function getAllTags(posts: Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>) {
    const rawTags = posts.flatMap((post) => post.data.tags || []).filter(Boolean);
    const resolved = rawTags.map(resolveTag);

    return resolved.filter((tag, pos, arr) => arr.findIndex((t) => t.id === tag.id) === pos);
}

export function getPostsByTag(posts: Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>, tagId: string) {
    return posts.filter((post) => (post.data.tags || []).some((tag) => resolveTag(tag).id === tagId));
}

// 按 name 做不区分大小写的排序（原地排序，和 Array.prototype.sort 行为一致）。
// 之前在 tags/index.astro（两处）、tags/wiki-index-by-catogory、
// tags/wiki-index-by-reading 里各自复制了一份完全相同的比较器。
export function sortTagsByName<T extends { name: string }>(tags: T[]): T[] {
    return tags.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
}
