import { useEffect, useState } from 'react';

/**
 * canvas 图表无法直接使用 CSS 变量，这里在客户端读取 global.css 里的主题色，
 * 并监听 <html> 的 class（ThemeToggle 切换 .dark）变化，主题切换后返回新对象以触发重画。
 * ClientRouter 换页时 <html> 节点保持不变，监听持续有效。
 */

// 首次水合前（以及读取失败时）使用的亮色兜底值，与 global.css 的 :root 保持一致
const FALLBACK = {
    text: '#171717',
    textMuted: '#555555',
    grid: '#cccccc',
    tooltipBg: '#f2f1ec',
    pos: '#047857',
    neg: '#b91c1c'
};

function readTheme() {
    if (typeof document === 'undefined') return FALLBACK;
    const style = getComputedStyle(document.documentElement);
    const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
        text: read('--chart-text', FALLBACK.text),
        textMuted: read('--chart-text-muted', FALLBACK.textMuted),
        grid: read('--chart-grid', FALLBACK.grid),
        tooltipBg: read('--chart-tooltip-bg', FALLBACK.tooltipBg),
        pos: read('--stat-pos', FALLBACK.pos),
        neg: read('--stat-neg', FALLBACK.neg)
    };
}

export default function useChartTheme() {
    const [theme, setTheme] = useState(readTheme);

    useEffect(() => {
        const update = () => setTheme(readTheme());
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return theme;
}
