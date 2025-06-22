import { useEffect, useRef, useState } from 'react';

export default function RadarChart_DLC({ data, attributefigure }) {
    const canvasRef = useRef(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [hoverLabelIndex, setHoverLabelIndex] = useState(null);
    const maxValues = [100, 100, 100, 100, 100];
    const labels = ['统御', '运势', '武勇', '智略', '魅力']

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const RADIUS = 80;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const total = data.length;
        const layers = 5;

        const points = [];
        const labelPositions = [];

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

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
                ctx.strokeStyle = '#ccc';
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
                ctx.strokeStyle = '#ccc';
                ctx.stroke();

                // 文字标签
                if (labels?.[i]) {
                    ctx.font = '16px sans-serif';
                    ctx.fillStyle = '#333';
                    if (attributefigure?.[i] > 0) {
                        ctx.fillStyle = '#1ba784';
                    }
                    else if (attributefigure?.[i] < 0) {
                        ctx.fillStyle = '#de1c31';
                    }
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const labelX = centerX + (RADIUS + 20) * Math.sin(angle);
                    const labelY = centerY - (RADIUS + 20) * Math.cos(angle);
                    ctx.fillText(labels[i], labelX, labelY);

                    const labelWidth = ctx.measureText(labels[i]).width;
                    const labelHeight = 16;
                    labelPositions.push({
                        index: i,
                        x: labelX - labelWidth / 2,
                        y: labelY - labelHeight / 2,
                        width: labelWidth,
                        height: labelHeight,
                        cx: labelX,
                        cy: labelY,
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
            ctx.fillStyle = 'rgba(242, 206, 43, 0.4)';
            ctx.strokeStyle = '#ffd111';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            // 小圆点
            ctx.fillStyle = '#ffd111';
            points.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // hover 显示气泡
            if (hoverIndex !== null) {
                const p = points[hoverIndex];
                ctx.save(); // 保存当前绘图状态
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#ffd111';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(p.x + 10, p.y - 20, 40, 20, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffd111';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${p.value}`, p.x + 30, p.y - 10);

                ctx.restore(); // 恢复上一次的 strokeStyle/lineWidth 设置
            }

            if (hoverLabelIndex !== null && attributefigure?.[hoverLabelIndex] !== undefined) {
                const labelPos = labelPositions.find(p => p.index === hoverLabelIndex);
                if (labelPos && attributefigure[hoverLabelIndex] !== 0) {
                    ctx.save();
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = '#ffd111';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(labelPos.cx + 10, labelPos.cy - 30, 80, 40, 6);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#333';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const addValue = attributefigure[hoverLabelIndex];
                    ctx.fillText(labels[hoverLabelIndex] + '上限' + (addValue < 0 ? '' : '+') + (3 * addValue), labelPos.cx + 50, labelPos.cy - 18);
                    ctx.fillText('加点消耗' + (addValue > 0 ? '' : '+') + (-1 * addValue), labelPos.cx + 50, labelPos.cy - 4);

                    ctx.restore();
                }
            }
        };

        render();

        // 鼠标事件监听
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

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
                if (
                    mx >= pos.x &&
                    mx <= pos.x + pos.width &&
                    my >= pos.y &&
                    my <= pos.y + pos.height
                ) {
                    labelFound = pos.index;
                }
            });

            if (found !== hoverIndex || labelFound !== hoverLabelIndex) {
                setHoverIndex(found);
                setHoverLabelIndex(labelFound);
                render(); // 重新渲染
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', () => {
            setHoverIndex(null);
            setHoverLabelIndex(null);
            render();
        });

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [data, maxValues, labels, hoverIndex, hoverLabelIndex, attributefigure]);

    return <canvas ref={canvasRef} width={400} height={300} className='mx-auto' style={{ display: 'block' }} />;
}
