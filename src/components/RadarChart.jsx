import { useEffect, useRef, useState } from 'react';
import drawTooltipBox from './drawTooltipBox';
import useChartTheme from './useChartTheme';

// 放在组件外：若在组件内每次渲染都新建数组，放进 effect 依赖后会导致每次渲染都重跑 effect
const maxValues = [100, 100, 100, 100, 100];

// 本传与星命诀雷达图的差异：主题色、第 2 项属性名（气运 / 运势）、上限提示的倍数
const VARIANTS = {
    base: { color: '#1ba784', fill: 'rgba(27, 167, 132, 0.4)', labels: ['统御', '气运', '武勇', '智略', '魅力'], capMultiplier: 1 },
    dlc: { color: '#ffd111', fill: 'rgba(242, 206, 43, 0.4)', labels: ['统御', '运势', '武勇', '智略', '魅力'], capMultiplier: 3 }
};

/**
 * 多形态之间的切换由调用方（CharacterAbilitySection）负责，这里只画传入的一组数据。
 * @param {{ data: number[], attributefigure?: number[], variant?: 'base' | 'dlc' }} props
 */
export default function RadarChart({ data, attributefigure, variant = 'base' }) {
    const theme = VARIANTS[variant];
    const colors = useChartTheme();
    const canvasRef = useRef(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [hoverLabelIndex, setHoverLabelIndex] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const RADIUS = 80;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const total = data.length;
        const layers = 5;
        // canvas 不继承 CSS 字体，气泡文字取正文字体（思源宋体），与页面一致
        const tooltipFont = getComputedStyle(canvas).fontFamily || 'serif';

        const points = [];
        const labelPositions = [];

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            labelPositions.length = 0;

            // 分层背景
            for (let layer = layers; layer >= 1; layer--) {
                const radius = (RADIUS * layer) / layers;
                ctx.beginPath();
                for (let i = 0; i < total; i++) {
                    const angle = (Math.PI * 2 * i) / total;
                    const x = centerX + radius * Math.sin(angle);
                    const y = centerY - radius * Math.cos(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = colors.grid;
                ctx.stroke();
            }

            // 坐标轴 + 标签
            for (let i = 0; i < total; i++) {
                const angle = (Math.PI * 2 * i) / total;
                const x = centerX + RADIUS * Math.sin(angle);
                const y = centerY - RADIUS * Math.cos(angle);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = colors.grid;
                ctx.stroke();

                // 文字标签
                if (theme.labels?.[i]) {
                    ctx.font = '16px sans-serif';
                    ctx.fillStyle = colors.text;
                    if (attributefigure?.[i] > 0) {
                        ctx.fillStyle = colors.pos;
                    } else if (attributefigure?.[i] < 0) {
                        ctx.fillStyle = colors.neg;
                    }
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const labelX = centerX + (RADIUS + 20) * Math.sin(angle);
                    const labelY = centerY - (RADIUS + 20) * Math.cos(angle);
                    ctx.fillText(theme.labels[i], labelX, labelY);

                    const labelWidth = ctx.measureText(theme.labels[i]).width;
                    const labelHeight = 16;
                    labelPositions.push({
                        index: i,
                        x: labelX - labelWidth / 2,
                        y: labelY - labelHeight / 2,
                        width: labelWidth,
                        height: labelHeight,
                        cx: labelX,
                        cy: labelY
                    });
                }
            }

            // 雷达图路径
            ctx.beginPath();
            points.length = 0;
            data.forEach((val, i) => {
                const angle = (Math.PI * 2 * i) / total;
                const rate = val / maxValues[i];
                const x = centerX + RADIUS * rate * Math.sin(angle);
                const y = centerY - RADIUS * rate * Math.cos(angle);
                points.push({ x, y, value: val });

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = theme.fill;
            ctx.strokeStyle = theme.color;
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            // 小圆点
            ctx.fillStyle = theme.color;
            points.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // hover 显示气泡
            if (hoverIndex !== null) {
                const p = points[hoverIndex];
                ctx.save(); // 保存当前绘图状态
                drawTooltipBox(ctx, p.x + 10, p.y - 20, 40, 20, theme.color, colors.tooltipBg);

                ctx.fillStyle = theme.color;
                ctx.font = `12px ${tooltipFont}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${p.value}`, p.x + 30, p.y - 10);

                ctx.restore(); // 恢复上一次的 strokeStyle/lineWidth 设置
            }

            if (hoverLabelIndex !== null && attributefigure?.[hoverLabelIndex] !== undefined) {
                const labelPos = labelPositions.find((p) => p.index === hoverLabelIndex);
                if (labelPos && attributefigure[hoverLabelIndex] !== 0) {
                    ctx.save();
                    drawTooltipBox(ctx, labelPos.cx + 10, labelPos.cy - 30, 80, 40, theme.color, colors.tooltipBg);

                    ctx.fillStyle = colors.text;
                    ctx.font = `12px ${tooltipFont}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const addValue = attributefigure[hoverLabelIndex];
                    ctx.fillText(theme.labels[hoverLabelIndex] + '上限' + (addValue < 0 ? '' : '+') + theme.capMultiplier * addValue, labelPos.cx + 50, labelPos.cy - 18);
                    // 第二行是附带说明，用次要文字色拉开层次
                    ctx.fillStyle = colors.textMuted;
                    ctx.fillText('加点消耗' + (addValue > 0 ? '' : '+') + -1 * addValue, labelPos.cx + 50, labelPos.cy - 4);

                    ctx.restore();
                }
            }
        };

        render();

        // 鼠标事件监听
        const handleMouseMove = (e) => {
            // 画布在窄屏上会按容器宽度缩小显示，鼠标坐标要换算回画布自身的坐标
            const rect = canvas.getBoundingClientRect();
            const scale = canvas.width / rect.width;
            const mx = (e.clientX - rect.left) * scale;
            const my = (e.clientY - rect.top) * scale;

            let found = null;
            points.forEach((p, i) => {
                const dx = mx - p.x;
                const dy = my - p.y;
                if (Math.sqrt(dx * dx + dy * dy) < 15) {
                    found = i;
                }
            });

            let labelFound = null;
            labelPositions.forEach((pos) => {
                if (mx >= pos.x && mx <= pos.x + pos.width && my >= pos.y && my <= pos.y + pos.height) {
                    labelFound = pos.index;
                }
            });

            if (found !== hoverIndex || labelFound !== hoverLabelIndex) {
                setHoverIndex(found);
                setHoverLabelIndex(labelFound);
                render(); // 重新渲染
            }
        };

        const handleMouseLeave = () => {
            setHoverIndex(null);
            setHoverLabelIndex(null);
            render();
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [data, hoverIndex, hoverLabelIndex, attributefigure, theme, colors]);

    return (
        // 固定绘图尺寸，显示时不超过容器宽度（手机内容区只有 343px）
        <canvas ref={canvasRef} width={375} height={270} className="mx-auto" style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
    );
}
