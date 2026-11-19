/**
 * 兵种「名称 → 本传转职条件」（构建时生成）
 *
 * 用 Vite 的 import.meta.glob 以 ?raw 方式读取兵种词条，交给 class-relations.ts 解析。
 * 与 wiki-links.ts 一样，只能在服务端渲染的组件里导入。
 */
import { buildClassConditions } from './class-relations';

const rawFiles = import.meta.glob('../content/projects/class/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

export const CLASS_CONDITIONS = buildClassConditions(rawFiles);
