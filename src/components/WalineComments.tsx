// src/components/WalineComments.tsx
import { useEffect } from 'react';

export default function WalineComments() {
    useEffect(() => {
        const el = document.getElementById('waline');
        if (el) {
            el.innerHTML = ''; // 清空旧内容
        }

        // 动态引入 Waline 模块
        // @ts-ignore
        import('https://unpkg.com/@waline/client@v3/dist/waline.js').then(({ init }) => {
            init({
                el: '#waline',
                serverURL: 'https://ocod-commemts.netlify.app/.netlify/functions/comment'
            });
        });
    }, []);

    return <div id="waline" />;
}
