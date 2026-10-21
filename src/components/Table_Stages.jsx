import { CLASS_MAP } from './classMap.jsx';

// 关卡名 → 关卡页链接，按 variant 区分本传（base）与星命诀（dlc）
const CAMPAIGN_LINKS = {
    base: {
        '蓼城之战': '/projects/stage/stage_01',
        '荥阳之战': '/projects/stage/stage_02',
        '濮阳之战（一）': '/projects/stage/stage_03',
        '黑山之战': '/projects/stage/stage_04',
        '寿张之战': '/projects/stage/stage_05',
        '鄄城守卫战': '/projects/stage/stage_06',
        '濮阳之战（二）': '/projects/stage/stage_07',
        '平阳之战': '/projects/stage/stage_08',
        '小沛之战': '/projects/stage/stage_09',
        '下邳之战': '/projects/stage/stage_10',
        '北海之战': '/projects/stage/stage_11',
        '蓼城之战（二）': '/projects/stage/stage_12',
        '官渡之战': '/projects/stage/stage_13',
        '邯郸之战': '/projects/stage/stage_14',
        '邺城之战': '/projects/stage/stage_15',
        '南皮之战': '/projects/stage/stage_16',
        '白狼山之战': '/projects/stage/stage_17',
        '襄阳突袭战': '/projects/stage/stage_18',
        '长坂坡之战': '/projects/stage/stage_19',
        '赤壁救援战': '/projects/stage/stage_20',
        '汉中之战（一）': '/projects/stage/stage_21',
        '潼关之战（上）': '/projects/stage/stage_22',
        '潼关之战（下）': '/projects/stage/stage_23',
        '武功之战': '/projects/stage/stage_24',
        '冀城争夺战': '/projects/stage/stage_25',
        '汉中之战（二）': '/projects/stage/stage_26',
        '定军山之战': '/projects/stage/stage_27',
        '玉门关之战': '/projects/stage/stage_28',
        '天水之战（一）': '/projects/stage/stage_29',
        '天水之战（二）': '/projects/stage/stage_30',
        '汉中之战（三）': '/projects/stage/stage_31',
        '西平平叛战': '/projects/stage/stage_31ex',
        '南郑守卫战': '/projects/stage/stage_32',
        '阴平之战': '/projects/stage/stage_33',
        '阳平关之战': '/projects/stage/stage_34',
        '绵竹关之战': '/projects/stage/stage_35',
        '成都攻略战': '/projects/stage/stage_36',
        '夷陵之战': '/projects/stage/stage_37',
        '骆谷之役': '/projects/stage/stage_38',
        '襄阳潜袭战': '/projects/stage/stage_39',
        '骆谷解围战': '/projects/stage/stage_39ex',
        '襄阳驰援战': '/projects/stage/stage_40',
        '武功之战（二）': '/projects/stage/stage_41',
        '陈仓之战': '/projects/stage/stage_42',
        '天水之战（三）': '/projects/stage/stage_43',
        '成都平叛战': '/projects/stage/stage_44',
        '秭归救援战': '/projects/stage/stage_44ex',
        '洛阳之变': '/projects/stage/stage_45',
        '淮南之乱': '/projects/stage/stage_45ex',
        '武威决死战': '/projects/stage/stage_46',
    },
    dlc: {
        '官渡之战': '/projects/stage/stage_DLC_13',
        '南匈奴反击战': '/projects/stage/stage_DLC_02',
        '内黄之战': '/projects/stage/stage_DLC_03',
        '濮阳之战': '/projects/stage/stage_DLC_04',
        '界桥之战': '/projects/stage/stage_DLC_05',
        '常山追殛战': '/projects/stage/stage_DLC_06',
        '易京攻防战·上': '/projects/stage/stage_DLC_08',
        '易京攻防战·下': '/projects/stage/stage_DLC_09',
        '星命之夜': '/projects/stage/stage_DLC_10',
        '白马之战': '/projects/stage/stage_DLC_11',
        '延津之战': '/projects/stage/stage_DLC_12'
    },
};

// 阵营 → 颜色，颜色变量定义在 global.css；助战军按我军处理
const SIDE_COLORS = {
    base: { '我军': 'var(--side-blue)', '盟军': 'var(--side-green)', '敌军': 'var(--side-red)' }, // 本传：我军蓝、盟军绿、敌军红
    dlc: { '我军': 'var(--side-red)', '盟军': 'var(--side-yellow)', '敌军': 'var(--side-blue)' }, // 星命诀：我军红、盟军黄、敌军蓝
};

const FACTION_LINKS = {
    '敌军': '',
    '盟军': ''
};

const NOTE_LINKS = {
    '主将': '',
};

// variant: 'base'（本传，默认）| 'dlc'（星命诀），决定关卡链接与阵营色
export default function StageStringTable({ data, variant = 'base' }) {
    // 处理不同维度的输入数据
    const normalizeData = (inputData) => {
        if (!Array.isArray(inputData)) return [];

        return inputData.map(row => {
            // 确保每行都是数组
            const rowArray = Array.isArray(row) ? [...row] : [row];

            // 补全到四个元素
            while (rowArray.length < 4) {
                rowArray.push('');
            }

            // 只取前四个元素
            return rowArray.slice(0, 4);
        });
    };

    // 规范化数据
    const tableData = normalizeData(data);

    // 固定标题行
    const headers = ['关卡', '阵营', '兵种', '说明'];

    // 获取单元格链接（根据列类型）
    const getCellLink = (value, colIndex) => {
        switch (colIndex) {
            case 0: // 关卡列
                return CAMPAIGN_LINKS[variant][value] || null;
            case 1: // 阵营列
                return FACTION_LINKS[value] || null;
            case 2: // 兵种列
                return CLASS_MAP[value] || null;
            case 3: // 说明列
                return NOTE_LINKS[value] || null;
            default:
                return null;
        }
    };

    // 获取单元格颜色（根据列类型）
    const getCellColor = (value, colIndex) => {
        if (colIndex === 1) {
            const side = value === '助战军' ? '我军' : value;
            if (SIDE_COLORS[variant][side]) return SIDE_COLORS[variant][side];
        }
        return 'inherit'; // 默认沿用正文颜色
    };

    // 样式见 global.css 的 .wiki-table；悬停高亮由 CSS 实现，不需要 React 状态
    return (
        <div className="mt-2 w-full max-w-xl overflow-x-auto">
            <table className="wiki-table wiki-table--matrix wiki-table--hover not-prose">
                {/* 固定列宽比例，让本传与星命诀两张表上下对齐 */}
                <colgroup>
                    <col className="w-[38%]" />
                    <col className="w-[14%]" />
                    <col className="w-[22%]" />
                    <col className="w-[26%]" />
                </colgroup>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} scope="col">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                                const cellValue = cell || '-';
                                const hasLink = getCellLink(cell, cellIndex);
                                const cellColor = getCellColor(cell, cellIndex);

                                return (
                                    <td
                                        key={cellIndex}
                                        className={cellIndex <= 1 ? 'font-medium' : ''}
                                    >
                                        {hasLink ? (
                                            <a href={hasLink} className="hover:underline" style={{ color: cellColor }}>
                                                {cellValue}
                                            </a>
                                        ) : (
                                            <span style={{ color: cellColor }}>{cellValue}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 无数据提示 */}
            {tableData.length === 0 && (
                <div className="px-2 py-4 text-center italic opacity-60">
                    暂无关卡数据
                </div>
            )}
        </div>
    );
}
