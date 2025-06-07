import { useEffect, useRef, useState } from 'react';

export default function BarChart({ data }) {
    const canvasRef = useRef(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const labels = ['胆识', '冷静'];
    const maxValue = 10;
    const colors = ['#de1c31', '#2775b6']; // 胆识(红)和冷静(蓝绿)的颜色

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 图表绘制区域参数
        const margin = { top: 50, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // 柱状图参数
        const barCount = 2;
        const barWidth = 20;
        const barSpacing = (chartWidth - barWidth * barCount) / (barCount + 1);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // 绘制坐标轴
            ctx.beginPath();
            ctx.moveTo(margin.left, margin.top);
            ctx.lineTo(margin.left, margin.top + chartHeight);
            ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 绘制网格线和刻度
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 0.5;
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#333';

            // Y轴刻度和网格线
            const ySteps = 5;
            for (let i = 0; i <= ySteps; i++) {
                const y = margin.top + chartHeight - (i * chartHeight / ySteps);
                ctx.beginPath();
                ctx.moveTo(margin.left, y);
                ctx.lineTo(margin.left + chartWidth, y);
                ctx.stroke();

                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText((i * maxValue / ySteps).toString(), margin.left - 5, y);
            }

            // 绘制柱子
            data.forEach((value, i) => {
                const x = margin.left + barSpacing + i * (barWidth + barSpacing);
                const barHeight = (value / maxValue) * chartHeight;
                const y = margin.top + chartHeight - barHeight;

                // 柱子主体
                ctx.fillStyle = hoverIndex === i ? `${colors[i]}CC` : colors[i];
                ctx.fillRect(x, y, barWidth, barHeight);

                // 柱子边框
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, barWidth, barHeight);

                // 柱子标签
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.font = '14px sans-serif';
                ctx.fillText(labels[i], x + barWidth / 2, margin.top + chartHeight + 10);

                // 显示数值（在柱子顶部）
                if (hoverIndex !== i || hoverIndex === null) {
                    ctx.fillStyle = hoverIndex === i ? '#333' : '#666';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(value, x + barWidth / 2, y - 5);
                }
            });

            // 悬停提示框
            if (hoverIndex !== null) {
                const value = data[hoverIndex];
                const x = margin.left + barSpacing + hoverIndex * (barWidth + barSpacing);
                const barHeight = (value / maxValue) * chartHeight;
                const y = margin.top + chartHeight - barHeight;

                // 绘制提示框
                ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                ctx.strokeStyle = colors[hoverIndex];
                ctx.lineWidth = 2;
                ctx.beginPath();
                const tooltipWidth = 40;
                const tooltipHeight = 20;
                const tooltipX = x + barWidth / 2 - tooltipWidth / 2;
                const tooltipY = y - tooltipHeight - 10;
                ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
                ctx.fill();
                ctx.stroke();

                // 提示框文字
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'sans-serif';
                ctx.fillText(`${value}`, x + barWidth / 2, tooltipY + tooltipHeight / 2);
            }
        };

        render();

        // 鼠标事件处理
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            let found = null;
            data.forEach((_, i) => {
                const x = margin.left + barSpacing + i * (barWidth + barSpacing);
                const barHeight = (data[i] / maxValue) * chartHeight;
                const y = margin.top + chartHeight - barHeight;

                if (mx >= x && mx <= x + barWidth &&
                    my >= y && my <= margin.top + chartHeight) {
                    found = i;
                }
            });

            if (found !== hoverIndex) {
                setHoverIndex(found);
                render();
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', () => {
            setHoverIndex(null);
            render();
        });

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [data, hoverIndex]);

    return (
        <div className="bar-chart-container">
            <canvas
                ref={canvasRef}
                width={300}
                height={250}
                className="mx-auto"
                style={{ display: 'block' }}
            />
        </div>
    );
}