// 更新日志条目解析：ChangelogEntry 的 items 是一组字符串，按书写习惯约定了几种格式。
// 构建时用来生成结构化的列表，客户端筛选脚本也复用这里的筛选判断。
//
// - 「【标签】正文」：普通条目，可以有多个标签，如「【修正】【本地化】…」；
// - 以空白（通常是 Tab）开头：上一条的补充。去掉空白后以「·」开头的是子项，其余是备注；
// - 顶格以「*」开头：上一条的备注；如果前面还没有条目，就是整个版本的说明；
// - 没有标签、也不以「*」开头：上一条的子项（老版本的子项在源码里靠缩进表示，缩进没有进入字符串）。

export type ChangelogChild = { kind: 'note' | 'sub'; text: string };

export type ChangelogLine = { kind: 'item'; tags: string[]; text: string; children: ChangelogChild[] } | { kind: 'remark'; text: string };

/** 主要类别：决定标签颜色，也是筛选栏的按钮 */
export const CHANGELOG_CATEGORIES = ['剧情', '平衡', '功能', '补完', '修正', '系统'] as const;

/** 筛选栏的按钮：主要类别加上「本地化」这个次级标签 */
export const CHANGELOG_FILTERS: readonly string[] = [...CHANGELOG_CATEGORIES, '本地化'];

// 类名必须整段写在源码里，Tailwind 才能扫描到
const TAG_CLASS: Record<string, string> = {
    剧情: 'text-purple-800 dark:text-purple-300',
    平衡: 'text-amber-800 dark:text-amber-300',
    功能: 'text-sky-800 dark:text-sky-300',
    补完: 'text-emerald-800 dark:text-emerald-300',
    修正: 'text-rose-800 dark:text-rose-300',
    系统: 'text-stone-700 dark:text-stone-300'
};

// 次级标签（本地化、测试等）和未登记的标签：用浅一档的灰，不抢主要类别的颜色
const SECONDARY_TAG_CLASS = 'text-stone-500 dark:text-stone-400';

export function changelogTagClass(tag: string): string {
    return TAG_CLASS[tag] ?? SECONDARY_TAG_CLASS;
}

// 筛选按钮前的小圆点：面积小，用比标签底色深的色阶才看得出类别
const DOT_CLASS: Record<string, string> = {
    剧情: 'bg-purple-500',
    平衡: 'bg-amber-500',
    功能: 'bg-sky-500',
    补完: 'bg-emerald-500',
    修正: 'bg-rose-500',
    系统: 'bg-stone-500'
};

export function changelogDotClass(tag: string): string {
    return DOT_CLASS[tag] ?? 'border border-stone-500';
}

const TAG_RE = /^\s*【([^】]+)】/;

/** 拆出行首连续的【标签】，返回标签和剩余正文 */
function splitTags(raw: string): { tags: string[]; text: string } {
    const tags: string[] = [];
    let rest = raw;
    let match = TAG_RE.exec(rest);
    while (match) {
        tags.push(match[1].trim());
        rest = rest.slice(match[0].length);
        match = TAG_RE.exec(rest);
    }
    return { tags, text: rest.trim() };
}

export function parseChangelogItems(items: readonly string[]): ChangelogLine[] {
    const lines: ChangelogLine[] = [];
    let lastItem: Extract<ChangelogLine, { kind: 'item' }> | null = null;

    for (const raw of items) {
        const text = raw.trim();
        if (text === '') continue;

        const indented = /^\s/.test(raw);
        const { tags, text: body } = splitTags(raw);

        if (tags.length > 0) {
            lastItem = { kind: 'item', tags, text: body, children: [] };
            lines.push(lastItem);
            continue;
        }

        if (indented || text.startsWith('*')) {
            const child: ChangelogChild = text.startsWith('·') ? { kind: 'sub', text: text.slice(1).trim() } : { kind: 'note', text };
            if (lastItem) lastItem.children.push(child);
            // 版本开头的「*」说明：去掉星号，整体用说明样式
            else lines.push({ kind: 'remark', text: text.replace(/^\*+/, '').trim() });
            continue;
        }

        if (lastItem) {
            lastItem.children.push({ kind: 'sub', text });
        } else {
            lastItem = { kind: 'item', tags: [], text, children: [] };
            lines.push(lastItem);
        }
    }
    return lines;
}

/** 按第一个标签统计条目数，顺序与 CHANGELOG_CATEGORIES 一致，未登记的类别排在后面 */
export function countChangelogCategories(lines: readonly ChangelogLine[]): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const line of lines) {
        if (line.kind !== 'item' || line.tags.length === 0) continue;
        counts.set(line.tags[0], (counts.get(line.tags[0]) ?? 0) + 1);
    }
    const order = (name: string) => {
        const i = (CHANGELOG_CATEGORIES as readonly string[]).indexOf(name);
        return i === -1 ? CHANGELOG_CATEGORIES.length : i;
    };
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => order(a.name) - order(b.name));
}

export type ChangelogFilter = { categories: readonly string[]; query: string };

/**
 * 一个条目（连同它的备注、子项）是否符合筛选。
 * 类别是多选取并集：条目的任一标签被选中即可；没有选类别时不限类别。
 * 关键词不区分大小写，匹配正文和备注、子项，不匹配标签文字本身。
 */
export function matchesChangelogFilter(unit: { tags: readonly string[]; texts: readonly string[] }, filter: ChangelogFilter): boolean {
    if (filter.categories.length > 0 && !unit.tags.some((t) => filter.categories.includes(t))) return false;
    const query = filter.query.trim().toLowerCase();
    if (query === '') return true;
    return unit.texts.some((t) => t.toLowerCase().includes(query));
}

/** 把文字按关键词切段，用来给命中部分加 <mark>；关键词为空时返回整段 */
export function splitByQuery(text: string, query: string): { text: string; hit: boolean }[] {
    const q = query.trim().toLowerCase();
    if (q === '') return [{ text, hit: false }];
    const parts: { text: string; hit: boolean }[] = [];
    const lower = text.toLowerCase();
    let from = 0;
    let i = lower.indexOf(q);
    while (i !== -1) {
        if (i > from) parts.push({ text: text.slice(from, i), hit: false });
        parts.push({ text: text.slice(i, i + q.length), hit: true });
        from = i + q.length;
        i = lower.indexOf(q, from);
    }
    if (from < text.length) parts.push({ text: text.slice(from), hit: false });
    return parts;
}
