export default function EquipmentStats({ equipment, linkedValues = {} }) {
    const { base, damageBonus, damageReduction } = equipment;

    // 带状态链接的文本片段；没有命中时按原字符串输出
    const renderValue = (value) => {
        const parts = linkedValues[String(value)];
        if (!parts) return value;
        return parts.map((part, index) =>
            part.href ? (
                <a key={index} href={part.href} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {part.text}
                </a>
            ) : (
                part.text
            )
        );
    };

    const formatValue = (value) => {
        const display = value > 0 ? `+${value}%` : `${value}%`;
        const colorClass = value < 0 ? 'text-stat-neg' : 'text-stat-pos';
        return { display, colorClass };
    };

    // 效果 可能是数组：多行合并单元格渲染，其他字段保持原样
    const renderRows = (entries, isPercent) => {
        const rows = [];
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            if (key === '效果' && Array.isArray(value) && value.length > 0) {
                // 第一行的 <th> 带 rowspan，后续效果行不再渲染 <th>
                const first = value[0];
                rows.push(
                    <tr key={`${key}-0`}>
                        <th scope="row" className="w-28" rowSpan={value.length}>
                            {key}
                        </th>
                        <td className="text-right">{renderValue(first)}</td>
                    </tr>
                );
                for (let j = 1; j < value.length; j++) {
                    rows.push(
                        <tr key={`${key}-${j}`}>
                            <td className="text-right">{renderValue(value[j])}</td>
                        </tr>
                    );
                }
            } else if (isPercent) {
                const { display, colorClass } = formatValue(value);
                rows.push(
                    <tr key={key}>
                        <th scope="row" className="w-28">
                            {key}
                        </th>
                        <td className={`text-right font-semibold ${colorClass}`}>{display}</td>
                    </tr>
                );
            } else {
                rows.push(
                    <tr key={key}>
                        <th scope="row" className="w-28">
                            {key}
                        </th>
                        <td className="text-right">{renderValue(String(value))}</td>
                    </tr>
                );
            }
        }
        return rows;
    };

    const groups = [
        { title: '基础属性', data: base, isPercent: false },
        { title: '伤害强化', data: damageBonus, isPercent: true },
        { title: '伤害减免', data: damageReduction, isPercent: true }
    ].filter(({ data }) => data && Object.keys(data).length > 0);

    return (
        <table className="wiki-table wiki-table--hover not-prose mt-2 max-w-[30rem]">
            {groups.map(({ title, data, isPercent }) => (
                <tbody key={title}>
                    <tr>
                        <th scope="rowgroup" colSpan={2}>
                            {title}
                        </th>
                    </tr>
                    {renderRows(Object.entries(data), isPercent)}
                </tbody>
            ))}
        </table>
    );
}
