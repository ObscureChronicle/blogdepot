import { CLASS_MAP } from './classMap.jsx';

// 链接映射配置（示例，实际使用时可以作为prop传入或外部导入）
const CAMPAIGN_LINKS = {
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
};

const FACTION_LINKS = {
    '敌军': '',
    '盟军': ''
};

const NOTE_LINKS = {
    '主将': '',
};

export default function DLCStageStringTable({ data }) {
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
                return CAMPAIGN_LINKS[value] || null;
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

    // 获取单元格颜色（根据列类型），颜色变量定义在 global.css
    const getCellColor = (value, colIndex) => {
        if (colIndex === 1) {
            if (value === '助战军' || value === '我军') return 'var(--side-red)'; // 星命诀：我军 - 红色
            if (value === '盟军') return 'var(--side-yellow)'; // 星命诀：盟军 - 黄色
            if (value === '敌军') return 'var(--side-blue)'; // 星命诀：敌军 - 蓝色
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
