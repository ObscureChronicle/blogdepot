/**
 * 几组数据之间的切换按钮（如人物页本传各形态「奋武将军 / 魏武挥鞭」）。
 * 颜色全部取自主题变量，亮暗两色自动适配：
 * - 选中：主文字色实底 + 背景色文字（反色），一眼可辨
 * - 未选中：透明底 + 主文字色 + 淡边框
 *
 * @param {{ options: { value: string, label: string }[], value: string, onChange: (value: string) => void, className?: string }} props
 */
export default function DataToggle({ options, value, onChange, className = '' }) {
    return (
        <div role="group" className={`flex justify-end gap-2 ${className}`}>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        className={`cursor-pointer px-2 py-1 rounded text-sm border transition-colors ${
                            active ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-main' : 'bg-transparent text-main border-main/40 hover:bg-muted'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
