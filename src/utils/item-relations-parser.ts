/**
 * 物品 ↔ 人物关联的生成逻辑（纯函数）
 *
 * 物品词条（宝物 / 配饰 / 兵装）是「正主」与「关联人物」的唯一来源：
 * - 正主：baseOwner / dlcOwner，以及多首附诗时各形态的 owner（任一首的正主都算该版本的正主）
 * - 关联人物：relatedPeople，只写正主以外的人物
 * 人物页的「关联装备」由此反查生成。不依赖 import.meta.glob，可以直接用 node:test 测试；
 * 读取文件的部分在 item-relations.ts。
 */
import { EDITIONS } from '../data/editions.ts';
import { comparePinyin, pinyinKey } from './sort-by-pinyin.ts';
import { readPropBlock } from './treasure-poems-parser.ts';
import { comparePaths, extractTitle, isOverviewPage } from './wiki-link-parser.ts';
import { extractStringArray } from './wiki-owners-parser.ts';

/** 物品目录：都使用 Layout_Equipments.astro */
export const ITEM_DIRS = ['treasure', 'equipment', 'weapon'] as const;

export type ItemPeople = {
    owner: { base: string[]; dlc: string[] };
    related: string[];
};

export type RelatedItem = {
    name: string;
    href: string;
    /** 在哪些版本里是这个人物的正主；都为 false 时只是关联 */
    owner: { base: boolean; dlc: boolean };
};

/** 读取附诗形态数组里每个形态的 owner: [...]；没有该属性时返回 [] */
function extractVariantOwners(raw: string, prop: string): string[] {
    const block = readPropBlock(raw, prop);
    if (!block) return [];
    return [...block.matchAll(/\bowner\s*:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/(['"])(.*?)\1/g)].map((s) => s[2].trim()).filter(Boolean));
}

const uniq = (list: string[]) => [...new Set(list)];

/** 一个物品词条写到的正主（分版本）与关联人物 */
export function extractItemPeople(raw: string): ItemPeople {
    return {
        owner: {
            base: uniq([...extractStringArray(raw, 'baseOwner'), ...extractVariantOwners(raw, 'baseVariants')]),
            dlc: uniq([...extractStringArray(raw, 'dlcOwner'), ...extractVariantOwners(raw, 'dlcVariants')])
        },
        related: uniq(extractStringArray(raw, 'relatedPeople'))
    };
}

/**
 * @param rawFiles 物品文件路径（形如 .../projects/<目录>/<slug>.mdx）→ MDX 原始文本
 * @param characterMap 人名（含别名）→ 人物词条链接，即 wiki-link-parser 生成的 character 映射
 * @returns 人物词条链接 → 关联物品（已排序）。解析不到人物词条的名字（如势力「孙吴」）被跳过。
 */
export function buildItemRelations(rawFiles: Record<string, string>, characterMap: Record<string, string>): Record<string, RelatedItem[]> {
    const byPerson: Record<string, Map<string, RelatedItem>> = {};

    const entry = (personHref: string, name: string, href: string) => {
        const items = (byPerson[personHref] ??= new Map());
        let item = items.get(href);
        if (!item) items.set(href, (item = { name, href, owner: { base: false, dlc: false } }));
        return item;
    };

    for (const [file, raw] of Object.entries(rawFiles).sort(comparePaths)) {
        const [dir, fileName] = file.replace(/\\/g, '/').split('/').slice(-2);
        const slug = fileName.replace(/\.mdx$/, '');
        if (!(ITEM_DIRS as readonly string[]).includes(dir) || isOverviewPage(slug)) continue;
        const name = extractTitle(raw);
        if (!name) continue;
        const href = `/projects/${dir}/${slug}/`;

        const { owner, related } = extractItemPeople(raw);
        for (const side of ['base', 'dlc'] as const) {
            for (const person of owner[side]) {
                const personHref = characterMap[person];
                if (personHref) entry(personHref, name, href).owner[side] = true;
            }
        }
        for (const person of related) {
            const personHref = characterMap[person];
            if (personHref) entry(personHref, name, href);
        }
    }

    return Object.fromEntries(Object.entries(byPerson).map(([person, items]) => [person, sortRelatedItems([...items.values()])]));
}

const isOwner = (item: RelatedItem) => item.owner.base || item.owner.dlc;

/** 正主在前、其余在后，两组内部按物品名拼音排序 */
export function sortRelatedItems(items: RelatedItem[]): RelatedItem[] {
    return items
        .map((item) => ({ item, key: pinyinKey(item.name) }))
        .sort((a, b) => Number(isOwner(b.item)) - Number(isOwner(a.item)) || comparePinyin(a.key, b.key))
        .map(({ item }) => item);
}

/** 人物页「关联装备」里物品名后的标注：两个版本都是正主为「正主」，只有一个版本时注明版本；不是正主返回 null */
export function ownerNote(owner: RelatedItem['owner']): string | null {
    if (owner.base && owner.dlc) return '正主';
    if (owner.base) return `正主·${EDITIONS.base.shortName}`;
    if (owner.dlc) return `正主·${EDITIONS.dlc.shortName}`;
    return null;
}
