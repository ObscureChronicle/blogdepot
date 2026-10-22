/**
 * 特性 / 兵种持有人名单（构建时生成）
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 方式读取全部人物词条，交给 wiki-owners-parser.ts 汇总。
 * 取代原先需要手动运行 find-trait-owners / find-class-owners 脚本生成的 JSON。
 * 与 wiki-links.ts 一样，只能在服务端渲染的组件里导入。
 */
import { buildOwners } from './wiki-owners-parser';

const rawFiles = import.meta.glob('../content/projects/bio/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const { traits, classes } = buildOwners(rawFiles);

export const TRAIT_OWNERS = traits;
export const CLASS_OWNERS = classes;
