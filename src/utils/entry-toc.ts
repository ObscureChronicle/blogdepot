// 词条页章节目录：由页面上的 h2 生成目录树与锚点 id。
// 只做纯数据处理，读写 DOM 在 EntryToc.astro 的脚本里。

export type TocHeading = {
    text: string;
    /** group：版本标题（本传 / 联动 / 星命诀）；section：普通章节标题 */
    kind: 'group' | 'section';
    /** 标题上已有的 id，有就沿用 */
    id?: string;
};

export type TocEntry = {
    id: string;
    text: string;
    children: TocEntry[];
};

export type Toc = {
    items: TocEntry[];
    /** 与输入一一对应的 id，供脚本写回 h2 */
    ids: string[];
};

// 字母、数字（含汉字）以外的字符一律换成「-」，避免 URL 片段里出现空格、冒号等
const toSlug = (text: string) =>
    text
        .trim()
        .replace(/[^\p{L}\p{N}_-]+/gu, '-')
        .replace(/^-+|-+$/g, '') || 'section';

/**
 * 把按页面顺序排列的标题整理成目录。
 * 版本标题之后的章节都归到该版本下面，id 加版本前缀（如「星命诀-说明」），
 * 这样不同版本里同名的小节也有各自的锚点；仍然重名时追加 -2、-3。
 */
export function buildToc(headings: TocHeading[]): Toc {
    const used = new Set<string>();
    const unique = (base: string) => {
        let id = base;
        for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
        used.add(id);
        return id;
    };

    // 先登记已有 id，生成的 id 不能和它们撞车
    for (const heading of headings) if (heading.id) used.add(heading.id);

    const items: TocEntry[] = [];
    const ids: string[] = [];
    let group: TocEntry | null = null;

    for (const heading of headings) {
        const text = heading.text.replace(/\s+/g, ' ').trim();
        const prefix = heading.kind === 'section' && group ? `${toSlug(group.text)}-` : '';
        const id = heading.id ?? unique(prefix + toSlug(text));
        const entry: TocEntry = { id, text, children: [] };
        ids.push(id);

        if (heading.kind === 'group') {
            group = entry;
            items.push(entry);
        } else if (group) {
            group.children.push(entry);
        } else {
            items.push(entry);
        }
    }

    return { items, ids };
}
