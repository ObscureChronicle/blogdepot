// public/initWaline.js
import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

function mountWaline() {
    const el = document.getElementById('waline');
    if (el) {
        el.innerHTML = ''; // 防止重复挂载
        init({
            el: '#waline',
            serverURL: 'https://ocod-commemts.netlify.app/.netlify/functions/comment'
        });
    }
}

// 初始挂载 + 监听 Astro 页面切换
mountWaline();
window.addEventListener('astro:page-load', () => {
    mountWaline();
});
