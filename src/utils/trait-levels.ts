/**
 * 特性词条 level 的构建期映射（名字 → level）
 *
 * 个人特性的颜色与排序等级由词条自身的 level 派生（见 trait-meta.ts 的 traitColorFromLevel）；
 * trait-meta.ts 同时被浏览器端组件使用，不能在里面用 import.meta.glob 扫描 MDX，
 * 所以在这里读词条原文，把映射作为 props 经 BiographyLayout → CharacterAbilitySection →
 * Table_Traits 下发给客户端。与 wiki-owners.ts 一样，只能在服务端渲染的组件里导入。
 */
import { TRAIT_MAP } from '../data/trait-meta';
import { extractTraitLevel } from './trait-level-parser';

const rawFiles = import.meta.glob('../content/projects/trait/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

/** 词条文件名 slug → level（未设置 level 的词条不出现） */
export const TRAIT_LEVELS_BY_SLUG: Record<string, number> = {};
for (const [file, raw] of Object.entries(rawFiles)) {
    const slug = file.replace(/\\/g, '/').split('/').pop()!.replace(/\.mdx$/, '');
    const level = extractTraitLevel(raw);
    if (level !== undefined) TRAIT_LEVELS_BY_SLUG[slug] = level;
}

/**
 * 特性名 → level；链接到同一词条的别名共享 level（如「关陇」「关中」都指向 guanzhong）。
 * 地域特性和没有 level 的普通特性不在表中。
 */
export const TRAIT_LEVELS: Record<string, number> = {};
for (const [name, info] of Object.entries(TRAIT_MAP)) {
    const slug = info.link.match(/\/projects\/trait\/([^/]+)\/$/)?.[1];
    const level = slug ? TRAIT_LEVELS_BY_SLUG[slug] : undefined;
    if (level !== undefined) TRAIT_LEVELS[name] = level;
}
