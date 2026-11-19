// 日志列表「类别 / 年份」筛选用的纯函数。不导入 astro:content 运行时，可以直接用 node:test 测试。
import type { CollectionEntry } from 'astro:content';
import { isPinyinIndexTag, resolveTag } from './data-utils.ts';

type BlogPost = CollectionEntry<'blog'>;

export type BlogCategoryGroup = { id: string; name: string; posts: BlogPost[] };
export type BlogYearGroup = { year: string; posts: BlogPost[] };

/** 日志的类别：第一个非音序标签；没有标签的日志不属于任何类别 */
export function getBlogCategory(post: BlogPost): { id: string; name: string } | null {
    const tag = (post.data.tags || []).find((t) => !isPinyinIndexTag(t));
    return tag ? resolveTag(tag) : null;
}

/** 日志的年份。publishDate 是按 UTC 零点解析的日期，用 UTC 取年份，避免时区把 1 月 1 日算进上一年 */
export function getBlogYear(post: BlogPost): string {
    return String(post.data.publishDate.getUTCFullYear());
}

/** 按类别分组：篇数多的在前，篇数相同按首次出现顺序；组内保持传入顺序 */
export function groupBlogPostsByCategory(posts: BlogPost[]): BlogCategoryGroup[] {
    const groups = new Map<string, BlogCategoryGroup>();
    for (const post of posts) {
        const category = getBlogCategory(post);
        if (!category) continue;
        const group = groups.get(category.id) ?? { ...category, posts: [] };
        group.posts.push(post);
        groups.set(category.id, group);
    }
    // Array.prototype.sort 是稳定排序，篇数相同的类别保留首次出现顺序
    return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length);
}

/**
 * 列表页插入年份小标题用：把已排好序的日志切成「连续同年」的若干段，不重新排序。
 * 与 groupBlogPostsByYear 不同，同一年份被别的年份隔开时会出现两段。
 */
export function splitBlogPostsByYearRuns(posts: BlogPost[]): BlogYearGroup[] {
    const runs: BlogYearGroup[] = [];
    for (const post of posts) {
        const year = getBlogYear(post);
        const last = runs.at(-1);
        if (last && last.year === year) last.posts.push(post);
        else runs.push({ year, posts: [post] });
    }
    return runs;
}

/** 按年份分组：新年份在前；组内保持传入顺序 */
export function groupBlogPostsByYear(posts: BlogPost[]): BlogYearGroup[] {
    const groups = new Map<string, BlogPost[]>();
    for (const post of posts) {
        const year = getBlogYear(post);
        groups.set(year, [...(groups.get(year) ?? []), post]);
    }
    return [...groups.entries()].map(([year, items]) => ({ year, posts: items })).sort((a, b) => Number(b.year) - Number(a.year));
}
