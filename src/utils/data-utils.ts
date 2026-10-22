import type { CollectionEntry } from 'astro:content';

// projects.publishDate 是可选的（百科条目不讲究发布时间），缺失时视为最旧、排在最后。
// 不能用 -Infinity 当哨兵值直接相减：两个都缺失时 -Infinity - (-Infinity) 是 NaN，不是 0。
export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    if (!itemA.data.publishDate && !itemB.data.publishDate) return 0;
    if (!itemA.data.publishDate) return 1;
    if (!itemB.data.publishDate) return -1;
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

// 分类标签：中文名 → 英文 slug。新增分类标签时在这里登记，否则 check:content 会报 warning。
const CATEGORY_TAG_SLUGS = {
    参考文献: 'reference',
    创作手记: 'diary',
    更新日志: 'changelog',
    事典: 'encyclopedia',
    文存: 'wen-yan',
    人物: 'biography',
    兵装与宝物: 'equipment',
    列表: 'list',
    特性与军略: 'trait',
    关卡: 'stage',
    状态: 'status',
    兵种: 'class'
} as const;

// 音序标签：A → wiki-a … Z → wiki-z
const PINYIN_INDEX_TAG_SLUGS = Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => {
        const letter = String.fromCharCode(65 + i);
        return [letter, `wiki-${letter.toLowerCase()}`];
    })
);

export const TAG_SLUG_MAP: Record<string, string> = { ...CATEGORY_TAG_SLUGS, ...PINYIN_INDEX_TAG_SLUGS };

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

// 按 name 做不区分大小写的排序，返回新数组，不修改传入的数组。
export function sortTagsByName<T extends { name: string }>(tags: T[]): T[] {
    return [...tags].sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
}

// 一次遍历统计每个标签 id 下的文章数，计数规则与 getPostsByTag 一致：
// 同一篇文章的多个原始标签归一化成同一个 id 时只算一次。
export function countPostsByTag(posts: Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>): Map<string, number> {
    const counts = new Map<string, number>();
    for (const post of posts) {
        const ids = new Set((post.data.tags || []).map((tag) => resolveTag(tag).id));
        for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
}

// 是否为音序（拼音首字母）标签，如 wiki-a。分类标签与音序标签在多处需要区分。
export function isPinyinIndexTag(tag: string): boolean {
    return tag.startsWith('wiki-');
}
