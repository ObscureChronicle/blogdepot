import { TRAIT_MAP, TraitColor, traitColorFromLevel } from '../data/trait-meta';

export default function FiveStringTable({ data = [], traitLevels = {} }) {
    // 确保数据最多包含五个元素，并过滤掉空值
    const tableData = [...data]
        .filter(val => val !== undefined && val !== null && val !== '')
        .slice(0, 5);

    // 行标题（可自定义）
    const TableTitle = '特质';
    const rowTitles = ['地域', '个人', '个人', '个人', '个人'];

    // 添加地域特质的链接
    const regionTraitLink = '/projects/trait/00_regional/';
    const personalTraitLink = '/projects/trait/00_personal/';

    // 获取特质颜色：强化别名（带 *）用 TRAIT_MAP 登记的配色，其余按词条 level 派生；普通特质沿用正文颜色
    const getTraitColor = (trait) => {
        return TRAIT_MAP[trait]?.color ?? traitColorFromLevel(traitLevels[trait]) ?? 'inherit';
    };

    // 获取特质链接（如果存在）
    const getTraitLink = (trait) => {
        return TRAIT_MAP[trait]?.link || null;
    };

    // 样式见 global.css 的 .wiki-table；悬停高亮由 CSS 实现，不需要 React 状态
    return (
        <div className="mt-2 w-full min-w-[280px] max-w-md">
            <table className="wiki-table wiki-table--hover not-prose">
                <tbody>
                    <tr>
                        <th scope="rowgroup" colSpan={2}>
                            {TableTitle}
                        </th>
                    </tr>
                    {tableData.map((value, index) => {
                        const hasLink = getTraitLink(value);
                        const traitColor = getTraitColor(value);

                        // 顶级（level 1）带发光；强化别名不是顶级，不会触发
                        const isGlow = traitColor === TraitColor.Ordinary;
                        const glowStyle = isGlow
                            ? { textShadow: `0 0 8px ${traitColor}, 0 0 12px ${traitColor}` }
                            : {};

                        // 合并文字颜色与发光样式
                        const textStyle = { color: traitColor, ...glowStyle };

                        return (
                            <tr key={index}>
                                <th scope="row" className="w-1/3">
                                    {/* 为第一行的标题添加链接 */}
                                    {index === 0 ? (
                                        <a href={regionTraitLink}>
                                            {rowTitles[index]}
                                        </a>
                                    ) : (
                                        <a href={personalTraitLink}>
                                            {rowTitles[index]}
                                        </a>
                                    )}
                                </th>
                                <td className="font-medium">
                                    {hasLink ? (
                                        <a href={hasLink} className="hover:underline" style={textStyle}>
                                            {value}
                                        </a>
                                    ) : (
                                        <span style={textStyle}>{value}</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* 无数据提示 */}
            {tableData.length === 0 && (
                <div className="px-2 py-4 text-center italic opacity-60">
                    暂无特质数据
                </div>
            )}
        </div>
    );
}
