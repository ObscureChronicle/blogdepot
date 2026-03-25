export default function EquipmentStats({ equipment }) {
    const { base, damageBonus, damageReduction } = equipment;

    // 通用格式化函数：根据数值返回显示文本和颜色类名
    const formatValue = (value) => {
        const isNegative = value < 0;
        const display = value > 0 ? `+${value}%` : `${value}%`;
        const colorClass = isNegative ? 'text-red-600' : 'text-emerald-600';
        return { display, colorClass };
    };

    // 检查 base 对象是否非空（至少有一个属性），决定是否显示基础属性表头
    const hasBaseAttributes = base && Object.keys(base).length > 0;

    return (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
                {/* 基础属性 - 仅当存在属性时才渲染 */}
                {hasBaseAttributes && (
                    <>
                        <thead className="bg-gray-100">
                            <tr>
                                <th colSpan="2" className="px-4 py-3 text-center font-semibold text-gray-800">
                                    基础属性
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(base).map(([key, value]) => (
                                <tr key={key} className="border-b border-gray-200 hover:bg-gray-50 even:bg-gray-50">
                                    <th className="px-4 py-2 font-medium text-gray-600">{key}</th>
                                    <td className="px-4 py-2 font-medium text-gray-900">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                )}

                {/* 伤害强化 */}
                {damageBonus && Object.keys(damageBonus).length > 0 && (
                    <>
                        <thead className="bg-gray-100">
                            <tr>
                                <th colSpan="2" className="px-4 py-3 text-center font-semibold text-gray-800">
                                    伤害强化
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(damageBonus).map(([key, value]) => {
                                const { display, colorClass } = formatValue(value);
                                return (
                                    <tr key={key} className="border-b border-gray-200 hover:bg-gray-50 even:bg-gray-50">
                                        <th className="px-4 py-2 font-medium text-gray-600">{key}</th>
                                        <td className={`px-4 py-2 font-semibold ${colorClass}`}>
                                            {display}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </>
                )}

                {/* 伤害减免 */}
                {damageReduction && Object.keys(damageReduction).length > 0 && (
                    <>
                        <thead className="bg-gray-100">
                            <tr>
                                <th colSpan="2" className="px-4 py-3 text-center font-semibold text-gray-800">
                                    伤害减免
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(damageReduction).map(([key, value]) => {
                                const { display, colorClass } = formatValue(value);
                                return (
                                    <tr key={key} className="border-b border-gray-200 hover:bg-gray-50 even:bg-gray-50">
                                        <th className="px-4 py-2 font-medium text-gray-600">{key}</th>
                                        <td className={`px-4 py-2 font-semibold ${colorClass}`}>
                                            {display}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </>
                )}
            </table>
        </div>
    );
}