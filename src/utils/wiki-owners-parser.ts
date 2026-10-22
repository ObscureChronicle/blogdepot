/**
 * 特性 / 兵种「持有人」名单的生成逻辑（纯函数）
 *
 * 从人物 MDX 原始文本里读取 traitsBase / traitsPost / traitsDLC、baseclass / dlcclass，
 * 反向汇总成「特性或兵种 → 本传 / 星命诀持有人」。不依赖 import.meta.glob，
 * 可以直接用 node:test 测试；读取文件的部分在 wiki-owners.ts。
 */
import { comparePaths, extractTitle } from './wiki-link-parser.ts';

export type OwnerLists = { base: string[]; dlc: string[] };
export type OwnersByName = Record<string, OwnerLists>;

/**
 * 标题为「本名（别名）」的人物在本传 / 星命诀里使用的名字不同（如韩荀在本传中叫韩猛），
 * 词条数据里推不出来，所以在这里登记。没有登记的版本显示完整标题。
 * 这些名字都在 wiki-link-parser 自动拆出的别名里，仍然能链接到人物词条。
 */
export const OWNER_DISPLAY_NAMES: Record<string, Partial<Record<keyof OwnerLists, string>>> = {
    '韩荀（韩猛）': { base: '韩猛', dlc: '韩荀' },
    '於夫罗（挛鞮於夫罗）': { base: '於夫罗', dlc: '挛鞮於夫罗' },
    '呼厨泉（挛鞮呼厨泉）': { dlc: '挛鞮呼厨泉' },
    '去卑（挛鞮去卑）': { dlc: '挛鞮去卑' },
    '柯回（姚柯回）': { base: '柯回' },
    '令狐浚（令狐愚）': { base: '令狐愚' },
    '陆逊（陆议）': { base: '陆逊' },
    '马忠（狐笃）': { base: '马忠' },
    '文俶（文鸯）': { base: '文鸯' }
};

/** 读取 JSX 字符串数组属性，如 traitsBase={['中原', '武库*']} → ['中原', '武库*']；没有该属性返回 [] */
export function extractStringArray(raw: string, field: string): string[] {
    const m = raw.match(new RegExp(`\\b${field}\\s*=\\s*\\{\\s*\\[([^\\]]*)\\]`));
    if (!m) return [];
    return [...m[1].matchAll(/(['"])(.*?)\1/g)].map((s) => s[2].trim()).filter(Boolean);
}

/**
 * @param rawFiles 人物文件路径 → MDX 原始文本
 * @returns 特性持有人（本传含后期形态 traitsPost）与兵种持有人。
 *          名单按人物文件名排序，与之前脚本按目录顺序扫描的结果一致。
 */
export function buildOwners(rawFiles: Record<string, string>): { traits: OwnersByName; classes: OwnersByName } {
    const traits: OwnersByName = {};
    const classes: OwnersByName = {};

    const add = (owners: OwnersByName, key: string, side: keyof OwnerLists, person: string) => {
        const lists = (owners[key] ??= { base: [], dlc: [] });
        const name = OWNER_DISPLAY_NAMES[person]?.[side] ?? person;
        if (!lists[side].includes(name)) lists[side].push(name);
    };

    for (const [file, raw] of Object.entries(rawFiles).sort(comparePaths)) {
        const person = extractTitle(raw) ?? file.replace(/\\/g, '/').split('/').pop()!.replace(/\.mdx$/, '');

        for (const trait of [...extractStringArray(raw, 'traitsBase'), ...extractStringArray(raw, 'traitsPost')]) add(traits, trait, 'base', person);
        for (const trait of extractStringArray(raw, 'traitsDLC')) add(traits, trait, 'dlc', person);
        for (const cls of extractStringArray(raw, 'baseclass')) add(classes, cls, 'base', person);
        for (const cls of extractStringArray(raw, 'dlcclass')) add(classes, cls, 'dlc', person);
    }

    return { traits, classes };
}
