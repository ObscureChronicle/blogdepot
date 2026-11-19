/**
 * 兵种词条本传部分的转职数据（纯函数）：parents / upgrades / condition。
 * 不依赖 import.meta.glob，校验脚本（scripts/validate-content.ts）与构建时模块（class-conditions.ts）共用。
 */
import { extractTitle } from './wiki-link-parser.ts';

export type ClassRelations = { parents: string[]; upgrades: string[]; condition: string[] };

/**
 * 读取兵种词条本传部分的 parents / upgrades / condition。
 * Layout_Classes 写在顶层属性（parents={[...]}）；Layout_ClassesPlus 只取 base={{ ... }} 里的（parents: [...]），
 * 星命诀 / 联动分区的「解锁道具」「可变化阵势」「解锁条件」不是转职数据。
 */
export function extractBaseClassRelations(raw: string): ClassRelations {
    let scope = raw;
    const baseStart = raw.search(/\bbase=\{\{/);
    if (baseStart >= 0) {
        const rest = raw.slice(baseStart);
        const end = rest.search(/\b(?:dlc|collab)=\{\{/);
        scope = end >= 0 ? rest.slice(0, end) : rest;
    } else if (/\b(?:dlc|collab)=\{\{/.test(raw)) {
        return { parents: [], upgrades: [], condition: [] };
    }
    const read = (field: string) => {
        const m = scope.match(new RegExp(`\\b${field}\\s*(?:=\\s*\\{|:)\\s*\\[([^\\]]*)\\]`));
        return m ? [...m[1].matchAll(/(['"])(.*?)\1/g)].map((s) => s[2].trim()).filter(Boolean) : [];
    };
    return { parents: read('parents'), upgrades: read('upgrades'), condition: read('condition') };
}

/** 兵种名 → 本传转职条件；只收录有条件的兵种 */
export function buildClassConditions(rawFiles: Record<string, string>): Record<string, string[]> {
    const conditions: Record<string, string[]> = {};
    for (const raw of Object.values(rawFiles)) {
        const title = extractTitle(raw);
        const { condition } = extractBaseClassRelations(raw);
        if (title && condition.length > 0) conditions[title] = condition;
    }
    return conditions;
}
