/**
 * 几组数据之间的切换按钮（如人物页本传各形态「奋武将军 / 魏武挥鞭」）。
 * 样式是 global.css 的 .corner-mark（「」角标），选中态由 aria-pressed 驱动：
 * - 选中：反色实底 + 外扩的实色角标，亮暗两色自动适配
 * - 未选中：透明底 + 淡角标 + 次要文字色
 * 选中角标外扩 5px，所以按钮间距用 gap-3（12px），上下用 py-[5px] 留出角标的位置。
 *
 * @param {{ options: { value: string, label: string }[], value: string, onChange: (value: string) => void, className?: string }} props
 */
export default function DataToggle({ options, value, onChange, className = '' }) {
    return (
        <div role="group" className={`flex justify-end gap-3 py-[5px] ${className}`}>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        className="corner-mark cursor-pointer px-[11px] py-1 text-sm transition-colors"
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
