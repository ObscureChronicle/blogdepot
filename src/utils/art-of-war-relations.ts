import { treeEdges, treeNodes, type TreeSkillEdge, type TreeSkillNode } from '../data/art-of-war-tree.ts';

export type SkillRelations = {
    node: TreeSkillNode;
    /** 前置军略：习得其中任意一个即可 */
    prerequisites: TreeSkillNode[];
    /** 后续军略：以本军略为前置的军略 */
    unlocks: TreeSkillNode[];
    /** 互斥军略：关系是双向的 */
    exclusives: TreeSkillNode[];
};

// 与军略盘上的阅读顺序一致：先按等级，再按列从左到右
const byPosition = (a: TreeSkillNode, b: TreeSkillNode) => a.level - b.level || a.col - b.col;

/**
 * 从军略盘数据中查出某个军略的前置、后续与互斥军略（星命诀）。
 * slug 不在军略盘上时返回 null，调用方据此不显示这部分内容。
 */
export function getSkillRelations(slug: string, nodes: TreeSkillNode[] = treeNodes, edges: TreeSkillEdge[] = treeEdges): SkillRelations | null {
    const bySlug = new Map(nodes.map((node) => [node.slug, node]));
    const node = bySlug.get(slug);
    if (!node) return null;

    const prerequisites = new Set<string>();
    const unlocks = new Set<string>();
    const exclusives = new Set<string>();
    for (const edge of edges) {
        if (edge.kind === 'pre') {
            if (edge.to === slug) prerequisites.add(edge.from);
            if (edge.from === slug) unlocks.add(edge.to);
        } else if (edge.from === slug) {
            exclusives.add(edge.to);
        } else if (edge.to === slug) {
            exclusives.add(edge.from);
        }
    }

    const resolve = (slugs: Set<string>) =>
        [...slugs]
            .map((s) => bySlug.get(s))
            .filter((n): n is TreeSkillNode => Boolean(n))
            .sort(byPosition);

    return { node, prerequisites: resolve(prerequisites), unlocks: resolve(unlocks), exclusives: resolve(exclusives) };
}
