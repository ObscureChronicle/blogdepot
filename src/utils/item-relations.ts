/**
 * 人物页「关联装备」数据（构建时生成）
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 方式读取宝物、配饰、兵装词条，交给 item-relations-parser.ts 汇总。
 * 与 wiki-links.ts 一样，只能在服务端渲染的组件里导入。
 */
import { buildItemRelations, type RelatedItem } from './item-relations-parser';
import { CHARACTER_MAP } from './wiki-links';

const rawFiles = import.meta.glob('../content/projects/{treasure,equipment,weapon}/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const RELATIONS = buildItemRelations(rawFiles, CHARACTER_MAP);

/** 人物词条（按页面地址，如 /projects/bio/caocao/）的关联物品，正主在前 */
export function getRelatedItems(personHref: string): RelatedItem[] {
    return RELATIONS[personHref] ?? [];
}
