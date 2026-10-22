/**
 * 百科「名称 → 词条链接」映射的生成逻辑（纯函数）
 *
 * 从词条 MDX 原始文本的 frontmatter title 生成人物、物品、兵种三张映射表，
 * 供布局组件把文本里的名字自动变成链接。不依赖 import.meta.glob，可以直接用
 * node:test 测试；读取文件的部分在 wiki-links.ts。
 */

export type WikiLinkKind = 'character' | 'item' | 'class';

export type WikiLinkMaps = Record<WikiLinkKind, Record<string, string>>;

/** 内容目录 → 映射表类别 */
const DIR_KIND: Record<string, WikiLinkKind> = {
    bio: 'character',
    treasure: 'item',
    equipment: 'item',
    class: 'class'
};

/**
 * 物品标题「甲（乙）」里的乙不一定是别名（如「周易注（王弼）」的乙是注者），
 * 所以物品只按这张表登记别名；人物标题的括号内一律是别名，自动拆分。
 */
export const ITEM_ALIASES: Record<string, string[]> = {
    '蛇矛（丈八蛇矛）': ['蛇矛', '丈八蛇矛'],
    '鱼鳞甲（鱼鳞铠）': ['鱼鳞甲', '鱼鳞铠']
};

/** 按字符编码比较文件路径：不依赖运行环境的 locale，保证各环境下扫描顺序一致 */
export function comparePaths([a]: [string, unknown], [b]: [string, unknown]): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

/** 从 frontmatter 取 title，去掉首尾引号；没有则返回 null */
export function extractTitle(raw: string): string | null {
    const m = raw.match(/^title:\s*(.+?)\s*$/m);
    const title = m ? m[1].replace(/^['"]|['"]$/g, '').trim() : '';
    return title || null;
}

/** 宝物 / 配饰 / 兵装 / 兵种的总览页（00_item-type、equipment-type、00_total 等）不参与映射 */
export function isOverviewPage(slug: string): boolean {
    return slug.startsWith('00_') || slug.endsWith('-type');
}

/** 一个词条能被哪些名字引用到：完整标题 + 别名 */
export function namesForTitle(kind: WikiLinkKind, title: string): string[] {
    if (kind === 'character') {
        // 人物标题形如「陆逊（陆议）」：本名与括号内的别名都指向同一词条
        const m = title.match(/^(.+?)（(.+)）$/);
        return m ? [title, m[1], m[2]] : [title];
    }
    if (kind === 'item') return [title, ...(ITEM_ALIASES[title] ?? [])];
    return [title];
}

/**
 * @param rawFiles 文件路径（形如 .../projects/<目录>/<slug>.mdx）→ MDX 原始文本
 * @returns 三张映射表，以及同名冲突等需要人工留意的警告
 */
export function buildWikiLinkMaps(rawFiles: Record<string, string>): { maps: WikiLinkMaps; warnings: string[] } {
    const maps: WikiLinkMaps = { character: {}, item: {}, class: {} };
    const warnings: string[] = [];

    // 按路径排序，保证不同环境下 glob 返回顺序不同时结果也一致
    for (const [file, raw] of Object.entries(rawFiles).sort(comparePaths)) {
        const [dir, fileName] = file.replace(/\\/g, '/').split('/').slice(-2);
        const kind = DIR_KIND[dir];
        const slug = fileName.replace(/\.mdx$/, '');
        if (!kind || isOverviewPage(slug)) continue;

        const title = extractTitle(raw);
        if (!title) {
            warnings.push(`${dir}/${fileName} 缺少 title，未加入映射`);
            continue;
        }

        const href = `/projects/${dir}/${slug}`;
        const map = maps[kind];
        for (const name of namesForTitle(kind, title)) {
            const existing = map[name];
            if (existing && existing !== href) {
                // 同名时优先不带数字后缀的 slug（如 xxx 优先于 xxx2）
                const keepExisting = !/\d$/.test(existing) || /\d$/.test(slug);
                warnings.push(`「${name}」同时对应 ${existing} 和 ${href}，采用 ${keepExisting ? existing : href}`);
                if (keepExisting) continue;
            }
            map[name] = href;
        }
    }

    return { maps, warnings };
}
