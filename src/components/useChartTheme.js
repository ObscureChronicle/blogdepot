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

/**
 * canvas 不继承 CSS 字体，且网页字体按 unicode-range 分片、只在用到时才下载：
 * 画布上的字如果页面里还没出现过，首次绘制会落到回退字体。
 * 这里主动加载 text 所需的分片，加载完成后调用 onReady 重画；返回的函数用于在 effect 清理时取消回调。
 */
export function whenChartFontReady(font, text, onReady) {
    if (typeof document === 'undefined' || !document.fonts?.load) return () => {};
    let active = true;
    document.fonts.load(font, text).then(
        () => active && onReady(),
        () => {}
    );
    return () => {
        active = false;
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
