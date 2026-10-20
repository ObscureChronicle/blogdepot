export default function EquipmentStats({ equipment }) {
    const { base, damageBonus, damageReduction } = equipment;

    // 通用格式化函数：根据数值返回显示文本和颜色类名
    const formatValue = (value) => {
        const display = value > 0 ? `+${value}%` : `${value}%`;
        const colorClass = value < 0 ? 'text-stat-neg' : 'text-stat-pos';
        return { display, colorClass };
    };

    // 三个分组按顺序显示，没有属性的分组不渲染；isPercent 决定数值是否按百分比格式化并着色
    const groups = [
        { title: '基础属性', data: base, isPercent: false },
        { title: '伤害强化', data: damageBonus, isPercent: true },
        { title: '伤害减免', data: damageReduction, isPercent: true }
    ].filter(({ data }) => data && Object.keys(data).length > 0);

    // 样式见 global.css 的 .wiki-table；每组一个 <tbody>，组名用 <th scope="rowgroup">
    return (
        <table className="wiki-table wiki-table--hover not-prose mt-2 max-w-[30rem]">
            {groups.map(({ title, data, isPercent }) => (
                <tbody key={title}>
                    <tr>
                        <th scope="rowgroup" colSpan={2}>
                            {title}
                        </th>
                    </tr>
                    {Object.entries(data).map(([key, value]) => {
                        if (!isPercent) {
                            return (
                                <tr key={key}>
                                    <th scope="row" className="w-28">
                                        {key}
                                    </th>
                                    <td className="text-right">{value}</td>
                                </tr>
                            );
                        }
                        const { display, colorClass } = formatValue(value);
                        return (
                            <tr key={key}>
                                <th scope="row" className="w-28">
                                    {key}
                                </th>
                                <td className={`text-right font-semibold ${colorClass}`}>{display}</td>
                            </tr>
                        );
                    })}
                </tbody>
            ))}
        </table>
    );
}
