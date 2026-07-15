import type { CollectionEntry } from 'astro:content';
import { slugify } from './common-utils.ts';

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

export function getAllTags(posts: Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>) {
    const rawTags = posts.flatMap((post) => post.data.tags || []).filter(Boolean);

    // 统一将英文 tag 也映射为其中文源（如果可能）
    const tags = [
        ...new Set(
            rawTags.map((tag) => {
                const mapped = SLUG_TAG_MAP[tag];
                return mapped || tag; // 如果是英文 id，返回它的中文对应
            })
        )
    ];

    return tags
        .map((tag) => ({
            name: tag,
            id: TAG_SLUG_MAP[tag] || 'unknown'
        }))
        .filter((obj, pos, arr) => arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos);
}

export function getPostsByTag(posts: Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>, tagId: string) {
    return posts.filter((post) => (post.data.tags || []).map((tag) => slugify(tag)).includes(tagId));
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
