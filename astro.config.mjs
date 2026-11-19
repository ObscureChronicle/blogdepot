import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';

import { satteri } from '@astrojs/markdown-satteri'; // 关键导入
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    // 站内地址统一带结尾斜杠：线上 Netlify 会把不带斜杠的地址重定向过去，
    // 本地 dev 设为 always 后遇到不带斜杠的地址会显示提醒页，便于发现漏改的链接
    trailingSlash: 'always',
    vite: {
        plugins: [tailwindcss()]
    },
    markdown: {
        // 关键：使用 satteri 处理器并开启 math 特性
        processor: satteri({
            features: {
                math: true,
            },
        }),
    },
    integrations: [
        mdx(),
        // 标签列表页（src/pages/tags/[id]/ 生成的 /tags/<id>/ 及分页）设了 noindex，不放进 sitemap，
        // 避免「noindex 却在 sitemap 里」的矛盾信号。/tags/ 百科首页和 wiki-index-by-* 两个检索页是独立页面，保留。
        sitemap({ filter: (page) => !/^\/tags\/(?!wiki-index-by-)[^/]+\//.test(new URL(page).pathname) }),
        react()
    ]
});