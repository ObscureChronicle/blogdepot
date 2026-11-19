// 日志标题拆分：「2025年创作手记・曹操」→ 眉题「2025年创作手记」+ 主标题「曹操」。
// 系列前缀在列表里重复几十次，把有区分度的部分放大显示。纯函数，可直接用 node:test 测试。

export type BlogTitleParts = { eyebrow: string | null; main: string };

const SEPARATOR = '・';

/** 按第一个「・」拆分；没有分隔符或任一侧为空时整句作为主标题 */
export function splitBlogTitle(title: string): BlogTitleParts {
    const index = title.indexOf(SEPARATOR);
    if (index === -1) return { eyebrow: null, main: title };
    const eyebrow = title.slice(0, index).trim();
    const main = title.slice(index + SEPARATOR.length).trim();
    if (!eyebrow || !main) return { eyebrow: null, main: title };
    return { eyebrow, main };
}
