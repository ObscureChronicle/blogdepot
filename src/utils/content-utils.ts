import { type CollectionEntry, getCollection } from 'astro:content';
import { sortItemsByDateDesc } from './data-utils';

// 合并 blog + projects 两个 collection 并按发布日期倒序排列。
// 依赖 Astro 运行时的 getCollection，只能在 Astro 构建/开发环境里调用；
// 单独放在这个文件是为了让 data-utils.ts 保持零运行时依赖，
// 可以在纯 Node 环境下直接单测（不需要真的起 Astro）。
export async function getAllPosts(): Promise<Array<CollectionEntry<'blog'> | CollectionEntry<'projects'>>> {
    const blogPosts = await getCollection('blog');
    const projectPosts = await getCollection('projects');
    return [...blogPosts, ...projectPosts].sort(sortItemsByDateDesc);
}
