import { type CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export const TAG_SLUG_MAP: Record<string, string> = {
    创作手记: 'diary'
};

// 反转映射（英文 id → 中文 name）
export const SLUG_TAG_MAP: Record<string, string> = Object.fromEntries(Object.entries(TAG_SLUG_MAP).map(([cn, en]) => [en, cn]));

export function getAllTags(posts: CollectionEntry<'blog'>[]) {
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

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tagId: string) {
    const filteredPosts: CollectionEntry<'blog'>[] = posts.filter((post) => (post.data.tags || []).map((tag) => slugify(tag)).includes(tagId));
    return filteredPosts;
}
