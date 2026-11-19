// 消歧义回链相关的纯函数。不导入 astro:content 运行时，因此可以直接用 node:test 测试。
//
// 约定（见 AGENTS.md）：重名词条在 disambiguation/ 下有一个同名消歧义页。
// 这里按「标题完全相同」把普通词条对应回它的消歧义页，与 scripts/content-checks.ts 的 checkDisambiguation 规则一致。

type EntrySummary = { id: string; title: string };

const DISAMBIGUATION_PREFIX = 'disambiguation/';

export function isDisambiguationEntry(entry: { id: string }): boolean {
    return entry.id.startsWith(DISAMBIGUATION_PREFIX);
}

/** 标题 → 消歧义页 id（如 '陈到' → 'disambiguation/chendao'） */
export function buildDisambiguationIndex(entries: EntrySummary[]): Map<string, string> {
    const index = new Map<string, string>();
    for (const entry of entries) {
        if (isDisambiguationEntry(entry)) index.set(entry.title, entry.id);
    }
    return index;
}

/** 普通词条的同名消歧义页 id；词条本身是消歧义页或没有同名消歧义页时返回 null */
export function findDisambiguation(entry: EntrySummary, index: Map<string, string>): string | null {
    if (isDisambiguationEntry(entry)) return null;
    return index.get(entry.title) ?? null;
}
