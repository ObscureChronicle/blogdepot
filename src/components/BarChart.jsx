// 胆识 / 冷静界格：取值为 0–10 的整数，以「十格为满、填几格即几」的刻本界格表示，数值写成汉字。
// 纯 JSX + CSS（样式在 global.css 的 .stat-grid），服务端直接渲染，文字继承页面字体。
const MAX = 10;
const HAN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const STATS = [
    { label: '胆识', color: 'var(--chart-dan)' },
    { label: '冷静', color: 'var(--chart-leng)' }
];

/** 0–10 的整数写成汉字，其他值（数据异常时）保留原样 */
const toHan = (value) => (Number.isInteger(value) && value >= 0 && value <= MAX ? HAN[value] : String(value));

export default function BarChart({ data }) {
    if (!data) return null;
    const label = STATS.map((s, i) => `${s.label} ${data[i]}／${MAX}`).join('，');

    return (
        <div className="stat-grid" role="img" aria-label={label}>
            <div className="stat-grid__inner">
                {STATS.map((stat, i) => {
                    const value = data[i];
                    const filled = Math.max(0, Math.min(MAX, Math.round(Number(value) || 0)));
                    return (
                        <div key={stat.label} className="stat-grid__row" style={{ '--stat-color': stat.color }}>
                            <span className="stat-grid__label">{stat.label}</span>
                            <span className="stat-grid__cells">
                                {Array.from({ length: MAX }, (_, k) => (
                                    <span key={k} className={k < filled ? 'stat-grid__cell is-filled' : 'stat-grid__cell'} />
                                ))}
                            </span>
                            <span className="stat-grid__value">{toHan(value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
