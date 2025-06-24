import { useState } from 'react';

// 特质数据表（示例格式，实际使用时可以作为prop传入）
const TraitColor = {
    Oridinary: '#5bae23',
    Super: '#2775b6',
    Bad: '#de1c31'
}

const TRAIT_MAP = {
    '霸者': { color: TraitColor.Oridinary, link: '/projects/trait/trait_bazhe' },
    '内圣': { color: TraitColor.Oridinary, link: '' },
    '仁王': { color: TraitColor.Oridinary, link: '/projects/trait/trait_renwang' },
    '仁德': { color: TraitColor.Oridinary, link: '' },
    '绝伦': { color: TraitColor.Oridinary, link: '' },
    '鬼谋': { color: TraitColor.Oridinary, link: '' },
    '机心': { color: TraitColor.Oridinary, link: '' },
    '曜威': { color: TraitColor.Oridinary, link: '' },
    '木秀': { color: TraitColor.Super, link: '' },
    '龙胆': { color: TraitColor.Super, link: '' },
    '飞将': { color: TraitColor.Super, link: '' },
    '国士': { color: TraitColor.Super, link: '' },
    '顺平': { color: TraitColor.Super, link: '' },
    '豪桀*': { color: TraitColor.Super, link: '' },
    '桓武*': { color: TraitColor.Super, link: '' },
    '武库*': { color: TraitColor.Super, link: '' },
    '柱石': { color: TraitColor.Super, link: '' },
    '准望': { color: TraitColor.Super, link: '' },
    '陷阵': { color: TraitColor.Super, link: '' },
    '摧破': { color: TraitColor.Super, link: '' },
    '中原': { link: '/projects/trait/trait_zhongyuan' },
    '河北': { link: '/projects/trait/trait_hebei' },
    '幽并': { link: '/projects/trait/trait_youbing' },
    '荆扬': { link: '/projects/trait/trait_jingyang' },
    '荆楚': { link: '/projects/trait/trait_jingyang' },
    '淮泗': { link: '/projects/trait/trait_huaisi' },
    '吴越': { link: '/projects/trait/trait_wuyue' },
    '巴蜀': { link: '/projects/trait/trait_bashu' },
    '青徐': { link: '/projects/trait/trait_qingxu' },
    '关中': { link: '/projects/trait/trait_guanzhong' },
    '关陇': { link: '/projects/trait/trait_guanzhong' },
    '雍凉': { link: '/projects/trait/trait_yongliang' },
    '西凉': { link: '/projects/trait/trait_yongliang' },
    '恣睢': { color: TraitColor.Bad, link: '' },
    '桀犬': { color: TraitColor.Bad, link: '' },
    '自矜': { color: TraitColor.Bad, link: '' },
    '傲上': { color: TraitColor.Bad, link: '' },
    '狷狭': { color: TraitColor.Bad, link: '' },
    '无谋': { color: TraitColor.Bad, link: '' },
    '功名': { color: TraitColor.Bad, link: '' },
    '短虑': { color: TraitColor.Bad, link: '' },
};

export default function FiveStringTable({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeTrait, setActiveTrait] = useState(null);

    // 确保数据最多包含五个元素，并过滤掉空值
    const tableData = [...data]
        .filter(val => val !== undefined && val !== null && val !== '')
        .slice(0, 5);

    // 行标题（可自定义）
    const TableTitle = '特质';
    const rowTitles = ['地域', '个人', '个人', '个人', '个人'];

    // 添加地域特质的链接
    const regionTraitLink = '/projects/trait/trait_00_regional';

    // 获取特质颜色（如果存在）
    const getTraitColor = (trait) => {
        return TRAIT_MAP[trait]?.color || '#4a5568'; // 默认灰色
    };

    // 获取特质加粗（如果存在）
    const getTraitBold = (trait) => {
        if (TRAIT_MAP[trait]?.color && TRAIT_MAP[trait].color == TraitColor.Oridinary) {
            return 'bold'; // 默认灰色
        }
        return 'normal'
    };

    // 获取特质链接（如果存在）
    const getTraitLink = (trait) => {
        return TRAIT_MAP[trait]?.link || null;
    };

    // 处理特质点击事件
    const handleTraitClick = (trait, event) => {
        const link = getTraitLink(trait);
        if (link) {
            setActiveTrait(trait);
        }
    };

    return (
        <div className="mx-auto min-w-[280px] max-w-md overflow-hidden rounded-lg relative">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th colSpan="2" className="px-4 py-2 text-center bg-gray-100 font-semibold text-gray-800">
                            {TableTitle}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((value, index) => {
                        const hasLink = getTraitLink(value);
                        const traitColor = getTraitColor(value);
                        const traitBold = getTraitBold(value);

                        return (
                            <tr
                                key={index}
                                className={`transition-all duration-200 ${hoveredIndex === index
                                    ? 'bg-green-50 transform scale-[1.02]'
                                    : 'bg-white'
                                    }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <td className="px-4 py-2 font-medium text-gray-700 border-b border-gray-200 w-1/3 text-center border-r">
                                    {/* 为第一行的标题添加链接 */}
                                    {index === 0 ? (
                                        <a
                                            href={regionTraitLink}
                                        //className="text-blue-600 hover:underline cursor-pointer"
                                        >
                                            {rowTitles[index]}
                                        </a>
                                    ) : (
                                        rowTitles[index] || '特质'
                                    )}
                                </td>
                                <td className={`text-center px-4 py-2 border-b border-gray-200 font-medium ${hoveredIndex === index ? 'text-green-700' : ''
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        {hasLink ? (
                                            <a
                                                href={getTraitLink(value)}
                                                onClick={(e) => handleTraitClick(value, e)}
                                                className={`font-medium cursor-pointer hover:underline ${activeTrait === value ? 'ring-2 ring-offset-1 ring-blue-500 rounded' : ''}`}
                                                style={{ color: traitColor }}
                                            >
                                                {value}
                                            </a>
                                        ) : (
                                            <span style={{ color: traitColor }}>{value}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* 无数据提示 */}
            {tableData.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 italic">
                    暂无特质数据
                </div>
            )}
        </div>
    );
}