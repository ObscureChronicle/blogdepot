import { getCollection } from 'astro:content';

// 首页「随机百科条目」「随机日志」按钮的路径池，构建时输出为 /random-paths.json。
// 首页点击按钮时才加载，不再把上千条路径内联进首页 HTML。
export type RandomPaths = { projects: string[]; blog: string[] };

export async function GET() {
    const [projects, blog] = await Promise.all([getCollection('projects'), getCollection('blog')]);
    const paths: RandomPaths = {
        projects: projects.map(({ id }) => `/projects/${id}/`),
        blog: blog.map(({ id }) => `/blog/${id}/`)
    };
    return new Response(JSON.stringify(paths), { headers: { 'Content-Type': 'application/json' } });
}
