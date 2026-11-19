/**
 * 特性 / 兵种持有人名单（构建时生成）
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 方式读取全部人物词条，交给 wiki-owners-parser.ts 汇总。
 * 取代原先需要手动运行 find-trait-owners / find-class-owners 脚本生成的 JSON。
 * 与 wiki-links.ts 一样，只能在服务端渲染的组件里导入。
 */
import { TRAIT_MAP } from '../data/trait-meta';
import { buildOwners, ownersOfTraitEntry, type OwnerLists } from './wiki-owners-parser';

const rawFiles = import.meta.glob('../content/projects/bio/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const { traits, classes } = buildOwners(rawFiles);

export const TRAIT_OWNERS = traits;
export const CLASS_OWNERS = classes;

const TRAIT_LINKS = Object.fromEntries(Object.entries(TRAIT_MAP).map(([name, info]) => [name, info.link]));

/** 特性词条（按文件名 slug）的持有人，供 Layout_Traits.astro 使用 */
export function getTraitEntryOwners(slug: string): OwnerLists {
    return ownersOfTraitEntry(slug, TRAIT_LINKS, traits);
}
