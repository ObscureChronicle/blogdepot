/**
 * 特性词条 level 的解析逻辑（纯函数）
 *
 * level 写在特性词条 MDX 的布局标签上（如 `<TraitWiki level={2} ... />`），
 * 1 顶级、2 专属、3 负面、不设为普通。构建期扫描在 trait-levels.ts；
 * 这里不依赖 import.meta.glob，可以直接用 node:test 测试。
 */

/** 从词条原文抽出 level；没有该属性返回 undefined */
export function extractTraitLevel(raw: string): number | undefined {
    const m = raw.match(/\blevel\s*=\s*\{\s*(\d+)\s*\}/);
    return m ? Number(m[1]) : undefined;
}
