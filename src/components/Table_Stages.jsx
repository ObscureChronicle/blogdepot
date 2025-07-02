import { useState } from 'react';

// 链接映射配置（示例，实际使用时可以作为prop传入或外部导入）
const CAMPAIGN_LINKS = {
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
};

const FACTION_LINKS = {
    '敌军': '',
    '盟军': ''
};

const CLASS_LINKS = {
    '刀兵': '',
};

const NOTE_LINKS = {
    '主将': '',
};

export default function StageStringTable({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeCell, setActiveCell] = useState({ row: null, col: null });

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
                return CLASS_LINKS[value] || null;
            case 3: // 说明列
                return NOTE_LINKS[value] || null;
            default:
                return null;
        }
    };

    // 处理单元格点击事件
    const handleCellClick = (rowIndex, colIndex, value, event) => {
        const link = getCellLink(value, colIndex);
        if (link) {
            setActiveCell({ row: rowIndex, col: colIndex });
        }
    };

    // 获取单元格颜色（根据列类型）
    const getCellColor = (value, colIndex) => {
        //if (colIndex === 0) return '#2775b6'; // 关卡列 - 蓝色
        if (colIndex === 1) {
            if (value === '助战军' || value === '我军') return '#2775b6'; // 阵营列 - 绿色
            if (value === '盟军') return '#5bae23'; // 阵营列 - 绿色
            if (value === '敌军') return '#de1c31'; // 阵营列 - 红色
        }
        return '#4a5568'; // 默认灰色
    };

    // 判断单元格是否激活
    const isCellActive = (rowIndex, colIndex) => {
        return activeCell.row === rowIndex && activeCell.col === colIndex;
    };

    return (
        <div className="mx-auto min-w-[320px] max-w-2xl overflow-hidden rounded-lg relative">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-blue-300 text-white">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={`px-4 py-3 font-bold text-center border-b border-white
                                    ${index === 0 ? 'rounded-tl-lg' : ''}
                                    ${index === headers.length - 1 ? 'rounded-tr-lg' : ''}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`transition-all duration-200 ${hoveredIndex === rowIndex
                                ? 'bg-blue-50 transform scale-[1.01]'
                                : 'bg-white'
                                }`}
                            onMouseEnter={() => setHoveredIndex(rowIndex)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {row.map((cell, cellIndex) => {
                                const cellValue = cell || '-';
                                const hasLink = getCellLink(cell, cellIndex);
                                const cellColor = getCellColor(cell, cellIndex);

                                return (
                                    <td
                                        key={cellIndex}
                                        className={`px-4 py-3 text-center border-b border-gray-200
                                            ${cellIndex === 0 ? 'font-medium' : ''}
                                            ${hoveredIndex === rowIndex ? 'text-green-700' : 'text-gray-700'}`}
                                    >
                                        {hasLink ? (
                                            <a
                                                href={hasLink}
                                                onClick={(e) => handleCellClick(rowIndex, cellIndex, cell, e)}
                                                className={`cursor-pointer hover:underline ${isCellActive(rowIndex, cellIndex)
                                                    ? 'ring-2 ring-offset-1 ring-blue-500 rounded'
                                                    : ''
                                                    }`}
                                                style={{ color: cellColor }}
                                            >
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
                <div className="px-4 py-6 text-center text-gray-500 italic">
                    暂无关卡数据
                </div>
            )}
        </div>
    );
}