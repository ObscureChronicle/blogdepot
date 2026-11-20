/**
 * canvas 图表（RadarChart / BarChart）的 hover 气泡：直角双框，外框实色、主框 60% 透明度（外框离主框 2px），
 * 与全站直角古籍风一致。坐标取整后偏移 0.5px，让 1px 线正好落在像素格上，不发虚。
 * 外框比气泡四周各多出 3px，调用方定位时要留出来。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x 气泡左上角 x
 * @param {number} y 气泡左上角 y
 * @param {number} w 气泡宽（整数）
 * @param {number} h 气泡高（整数）
 * @param {string} color 框线颜色
 * @param {string} bg 底色
 */
export default function drawTooltipBox(ctx, x, y, w, h, color, bg) {
    const left = Math.round(x);
    const top = Math.round(y);
    ctx.save();
    ctx.fillStyle = bg;
    ctx.fillRect(left, top, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(left - 2.5, top - 2.5, w + 5, h + 5);
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(left + 0.5, top + 0.5, w - 1, h - 1);
    ctx.restore();
}
