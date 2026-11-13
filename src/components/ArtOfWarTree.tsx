import { useMemo, useState } from 'react';
import { treeColumns, treeEdges, treeGroups, treeLevels, treeNodes, type TreeSkillNode } from '../data/art-of-war-tree';

// 盘面坐标：按“等级行 × 列”排布，列序号已压缩掉纯空列
const CELL_W = 64;
const CELL_H = 90;
const NODE_W = 56;
const NODE_H = 32;
const PAD = 18;

const width = PAD * 2 + (treeColumns - 1) * CELL_W + NODE_W;
const height = PAD * 2 + (treeLevels - 1) * CELL_H + NODE_H;

const nodeX = (node: TreeSkillNode) => PAD + node.col * CELL_W;
const nodeY = (node: TreeSkillNode) => PAD + (node.level - 1) * CELL_H;

const nodeBySlug = new Map(treeNodes.map((node) => [node.slug, node]));

function edgePath(from: TreeSkillNode, to: TreeSkillNode, kind: 'pre' | 'exclusive') {
    if (kind === 'exclusive') {
        const left = nodeX(from) < nodeX(to) ? from : to;
        const right = left === from ? to : from;
        return {
            x1: nodeX(left) + NODE_W,
            y1: nodeY(left) + NODE_H / 2,
            x2: nodeX(right),
            y2: nodeY(right) + NODE_H / 2
        };
    }
    return {
        x1: nodeX(from) + NODE_W / 2,
        y1: nodeY(from) + NODE_H,
        x2: nodeX(to) + NODE_W / 2,
        y2: nodeY(to)
    };
}

export default function ArtOfWarTree() {
    const [active, setActive] = useState<string | null>(null);

    // 悬停时记录相关军略及其关系类型，用于区分前置（蓝）与互斥（红）光圈
    const related = useMemo(() => {
        if (!active) return null;
        const map = new Map<string, 'pre' | 'exclusive'>();
        for (const edge of treeEdges) {
            const other = edge.from === active ? edge.to : edge.to === active ? edge.from : null;
            if (!other) continue;
            // 同时存在两种关系时按互斥处理
            if (edge.kind === 'exclusive') map.set(other, 'exclusive');
            else if (!map.has(other)) map.set(other, 'pre');
        }
        return map;
    }, [active]);

    return (
        // full-bleed 撑破正文 max-w-3xl 限制，让军略盘占满视口宽度（设上限避免超宽屏过宽）
        <div className="not-prose my-4 mx-[calc(50%-50vw)] w-screen">
            <div className="mx-auto max-w-[134rem] px-10">
                <div className="overflow-x-auto pb-2">
                    <svg role="img" aria-label="军略盘：七个等级的军略前置与互斥关系" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                        <defs>
                            <marker id="aow-pre" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#5b9bd5" />
                            </marker>
                            <marker id="aow-exclusive" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff4d4d" />
                            </marker>
                            {/* 渐变发光：由内到外多层模糊叠加，形成柔和的光晕 */}
                            <filter id="aow-glow" x="-80%" y="-80%" width="260%" height="260%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="far" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="near" />
                                <feMerge>
                                    <feMergeNode in="far" />
                                    <feMergeNode in="near" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* 等级行标识 */}
                        {Array.from({ length: treeLevels }, (_, i) => (
                            <text key={i} x={2} y={PAD + i * CELL_H + NODE_H / 2} dominantBaseline="central" fontSize={11} fill="#9ca3af">
                                LV{i + 1}
                            </text>
                        ))}

                        {/* 连线画在节点下层 */}
                        <g>
                            {treeEdges.map((edge, i) => {
                                const from = nodeBySlug.get(edge.from);
                                const to = nodeBySlug.get(edge.to);
                                if (!from || !to) return null;
                                const isRelated = !active || edge.from === active || edge.to === active;
                                const geo = edgePath(from, to, edge.kind);
                                return (
                                    <line
                                        key={`${edge.from}-${edge.to}-${i}`}
                                        {...geo}
                                        stroke={edge.kind === 'pre' ? '#5b9bd5' : '#ff4d4d'}
                                        strokeWidth={edge.kind === 'pre' ? 1.4 : 1.2}
                                        markerEnd={edge.kind === 'pre' ? 'url(#aow-pre)' : 'url(#aow-exclusive)'}
                                        markerStart={edge.kind === 'exclusive' ? 'url(#aow-exclusive)' : undefined}
                                        opacity={isRelated ? 0.95 : 0.12}
                                    />
                                );
                            })}
                        </g>

                        {/* 节点 */}
                        <g>
                            {treeNodes.map((node) => {
                                const isActive = active === node.slug;
                                const isRelated = !related || related.has(node.slug);
                                const relatedKind = related?.get(node.slug);
                                // 悬停目标用自身配色发光，相关军略按关系类型用蓝/红发光
                                const haloColor = isActive ? node.color : relatedKind === 'pre' ? '#5b9bd5' : relatedKind === 'exclusive' ? '#ff4d4d' : null;
                                return (
                                    <a
                                        key={node.slug}
                                        href={`/projects/art-of-war/${node.slug}/`}
                                        onMouseEnter={() => setActive(node.slug)}
                                        onMouseLeave={() => setActive(null)}
                                        onFocus={() => setActive(node.slug)}
                                        onBlur={() => setActive(null)}
                                        style={{ opacity: isRelated || isActive ? 1 : 0.25 }}
                                    >
                                        <title>{`${node.name}（${node.group}）`}</title>
                                        {haloColor && (
                                            <rect
                                                x={nodeX(node) - (isActive ? 5 : 4)}
                                                y={nodeY(node) - (isActive ? 5 : 4)}
                                                width={NODE_W + (isActive ? 10 : 8)}
                                                height={NODE_H + (isActive ? 10 : 8)}
                                                rx={isActive ? 7 : 6}
                                                fill={haloColor}
                                                fillOpacity={isActive ? 0.35 : 0.25}
                                                stroke={haloColor}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                filter="url(#aow-glow)"
                                                pointerEvents="none"
                                            />
                                        )}
                                        <rect
                                            x={nodeX(node)}
                                            y={nodeY(node)}
                                            width={NODE_W}
                                            height={NODE_H}
                                            rx={3}
                                            fill={node.color}
                                            stroke={isActive ? '#111827' : '#374151'}
                                            strokeWidth={isActive ? 2.2 : 1.2}
                                        />
                                        <text
                                            x={nodeX(node) + NODE_W / 2}
                                            y={nodeY(node) + NODE_H / 2 + 1}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={16}
                                            fontWeight={600}
                                            fill="#ffffff"
                                            stroke="#111111"
                                            strokeWidth={1.5}
                                            paintOrder="stroke"
                                        >
                                            {node.name}
                                        </text>
                                    </a>
                                );
                            })}
                        </g>
                    </svg>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                        <svg width="30" height="10" aria-hidden="true">
                            <line x1="2" y1="5" x2="22" y2="5" stroke="#5b9bd5" strokeWidth="1.6" />
                            <path d="M 22 1 L 28 5 L 22 9 z" fill="#5b9bd5" />
                        </svg>
                        前置
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <svg width="30" height="10" aria-hidden="true">
                            <line x1="6" y1="5" x2="24" y2="5" stroke="#ff4d4d" strokeWidth="1.4" />
                            <path d="M 6 1 L 0 5 L 6 9 z" fill="#ff4d4d" />
                            <path d="M 24 1 L 30 5 L 24 9 z" fill="#ff4d4d" />
                        </svg>
                        互斥
                    </span>
                    {treeGroups.map((item) => (
                        <span key={item.group} className="inline-flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-sm border border-neutral-700" style={{ backgroundColor: item.color }} />
                            {item.group}
                        </span>
                    ))}
                    <span className="text-neutral-400">悬停高亮相关军略，点击进入词条</span>
                </div>
            </div>
        </div>
    );
}
