import type { CollectionEntry } from 'astro:content';

// 测试用的内容条目工厂：补齐 schema 解析后必有的字段，只需传入用例关心的部分，
// 返回值带完整的 CollectionEntry 类型，测试里不必再用 as any 绕过类型检查。
// 只有 type 导入 astro:content，Node 运行时会被擦除，node:test 和 Vitest 都能用。

type BlogData = CollectionEntry<'blog'>['data'];
type ProjectData = CollectionEntry<'projects'>['data'];

export function blogEntry(id: string, data: Partial<BlogData> = {}): CollectionEntry<'blog'> {
    return {
        id,
        collection: 'blog',
        data: { title: id, publishDate: new Date('2024-01-01T00:00:00Z'), isFeatured: false, tags: [], ...data }
    };
}

/** projects 的 publishDate 可选，百科词条一般不填 */
export function projectEntry(id: string, data: Partial<ProjectData> = {}): CollectionEntry<'projects'> {
    return {
        id,
        collection: 'projects',
        data: { title: id, isFeatured: false, tags: [], ...data }
    };
}
