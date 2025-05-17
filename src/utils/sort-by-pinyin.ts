import { pinyin } from 'pinyin-pro';

export function sortPostsByTitlePinyin(posts: any[]) {
    return [...posts].sort((a, b) => {
        const pinyinA = pinyin(a.data.title || '', { toneType: 'none' });
        const pinyinB = pinyin(b.data.title || '', { toneType: 'none' });

        return pinyinA.localeCompare(pinyinB);
    });
}
