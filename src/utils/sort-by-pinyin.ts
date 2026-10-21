import { pinyin } from 'pinyin-pro';

/** 把中文转成无声调拼音，作为排序键（如「曹操」→ "cao cao"） */
export function pinyinKey(text: string): string {
    return pinyin(text, { toneType: 'none' });
}

/**
 * 比较两个拼音排序键。显式指定 locale：不传时取运行环境的默认 locale，
 * 本地与 CI/部署环境可能不同，pinyin-pro 转不出拼音的生僻字（如「㬂」）的位置就会不一致。
 */
export function comparePinyin(a: string, b: string): number {
    return a.localeCompare(b, 'zh-Hans-CN');
}

export function sortPostsByTitlePinyin<T extends { data: { title?: string } }>(posts: T[]): T[] {
    // 每个标题只转一次拼音，避免比较函数里反复调用 pinyin()
    return posts
        .map((post) => ({ post, key: pinyinKey(post.data.title || '') }))
        .sort((a, b) => comparePinyin(a.key, b.key))
        .map(({ post }) => post);
}
