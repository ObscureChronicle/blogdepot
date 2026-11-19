// 文存（wen-yan 分类）详情页的版式判断。不导入 astro:content 运行时，可以直接用 node:test 测试。
import { resolveTag } from './data-utils.ts';

/** plain：刻本版式；letter：刻本版式上再叠加尺牍笺纸 */
export type WenyanVariant = 'plain' | 'letter';

/**
 * 根据文章的标签和 frontmatter 的 form 字段决定文存版式。
 * 不属于文存的文章返回 null（form 写了也忽略）；标签用中文名「文存」或 slug「wen-yan」都认。
 */
export function getWenyanVariant(tags: readonly string[], form?: string): WenyanVariant | null {
    const isWenyan = tags.some((tag) => resolveTag(tag).id === 'wen-yan');
    if (!isWenyan) return null;
    return form === 'letter' ? 'letter' : 'plain';
}
