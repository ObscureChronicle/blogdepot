// 游戏版本：本传、星命诀（DLC）、联动。各组件里的版本名与标签配色统一从这里取。
export type Edition = 'base' | 'dlc' | 'collab';

export const EDITIONS = {
    base: {
        name: '《后汉稽异录》',
        shortName: '本传',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    dlc: {
        name: '《后汉稽异录外传：星命诀》',
        shortName: '星命诀',
        badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    },
    collab: {
        shortName: '联动',
        badgeColor: 'bg-pink-100 text-red-800 dark:bg-pink-900 dark:text-red-300'
    }
} as const;

/** 版本小标签的 class（EditionBadge 与 React 组件共用） */
export function editionBadgeClass(edition: Edition): string {
    return `inline-block ${EDITIONS[edition].badgeColor} text-base font-medium px-1.5 pt-1 rounded-sm`;
}
