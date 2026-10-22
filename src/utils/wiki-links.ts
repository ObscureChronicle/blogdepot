/**
 * 百科「名称 → 词条链接」映射（构建时生成）
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 方式读取人物、宝物、兵装、兵种词条的原始文本，
 * 交给 wiki-link-parser.ts 生成映射。新增或改名词条后不再需要手动运行生成脚本。
 *
 * 注意：只能在服务端渲染的组件里导入。被 client:* 水合的组件导入它时，
 * 会把全部词条原文打进浏览器端 JS。
 */
import { buildWikiLinkMaps, type WikiLinkKind } from './wiki-link-parser';

// 只读 raw 文本，不能直接 import MDX 模块：人物 MDX 会导入布局组件，
// 布局组件又导入本文件，会形成循环依赖。
const rawFiles = import.meta.glob('../content/projects/{bio,treasure,equipment,class}/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const { maps, warnings } = buildWikiLinkMaps(rawFiles);

export const CHARACTER_MAP = maps.character;
export const ITEM_MAP = maps.item;
export const CLASS_MAP = maps.class;

/** 名称对应的词条链接；没有对应词条时返回 null */
export function getWikiLink(kind: WikiLinkKind, name: string): string | null {
    return maps[kind][name] ?? null;
}

if (warnings.length > 0) {
    console.log(`[wiki-links] ${warnings.length} 条警告:\n${warnings.join('\n')}`);
}
