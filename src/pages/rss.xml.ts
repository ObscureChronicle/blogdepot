import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import siteConfig from '../data/site-config.ts';
import { getSortedBlogPosts } from '../utils/content-utils.ts';

export async function GET(context: APIContext) {
    const posts = await getSortedBlogPosts();
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site ?? siteConfig.website,
        items: posts.map((item) => {
            // 复制一份再归零小时：直接调用 setUTCHours 会原地改写集合里共享的 Date 对象
            const pubDate = new Date(item.data.publishDate);
            pubDate.setUTCHours(0);
            return {
                title: item.data.title,
                description: item.data.excerpt,
                link: `/blog/${item.id}/`,
                pubDate
            };
        })
    });
}
