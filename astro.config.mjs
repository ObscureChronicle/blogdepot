import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';

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
    integrations: [mdx(), sitemap(), react()]
});