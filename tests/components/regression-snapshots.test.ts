import { experimental_AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PostPreview from '../../src/components/PostPreview.astro';
import ProjectPreview from '../../src/components/ProjectPreview.astro';
import Pagination from '../../src/components/Pagination.astro';

// 全量渲染带 BaseLayout 的完整页面（首页/列表页/详情页）目前在 Container API
// 下会因为 Astro.site 没有正确注入而报错（BaseHead.astro 里 new URL(image.src,
// Astro.site) 拿到的 Astro.site 是 undefined），即使显式传了
// `astroConfig: { site: ... }` 给 container.create() 也没能解决——这是
// Container API 目前（experimental_ 前缀）的已知局限，不是这个项目代码的问题。
// 所以这里改成给"关键内容展示组件"的渲染结果建快照基线，而不是整页快照。

// Container API（在 Vitest 的 dev-like Vite 环境下）渲染出的 HTML 会带上
// data-astro-source-file/data-astro-source-loc 这类开发期调试属性，值是
// 当前机器上的绝对文件路径——换一台机器（比如 CI）跑，路径不一样，快照就会
// 假性回归失败。这两个属性对回归测试的目的毫无意义，比对前统一剥掉。
function stripDevAttrs(html: string): string {
    return html.replace(/\s*data-astro-source-(file|loc)="[^"]*"/g, '');
}

describe('回归快照基线', () => {
    it('PostPreview.astro（博客列表项）渲染结果', async () => {
        const container = await experimental_AstroContainer.create();
        const post = {
            id: 'sample-post',
            collection: 'blog' as const,
            data: {
                title: '示例文章标题',
                excerpt: '这是一段示例摘要，用来固定渲染结构的快照基线。',
                publishDate: new Date('2024-05-01T00:00:00Z'),
                updatedDate: undefined,
                isFeatured: false,
                tags: ['diary']
            }
        };
        const html = await container.renderToString(PostPreview, { props: { post } });
        expect(stripDevAttrs(html)).toMatchSnapshot();
    });

    it('ProjectPreview.astro（百科条目列表项）渲染结果', async () => {
        const container = await experimental_AstroContainer.create();
        const project = {
            id: 'sample-project',
            collection: 'projects' as const,
            data: {
                title: '示例百科条目',
                description: '这是一段示例描述，用来固定渲染结构的快照基线。',
                isFeatured: false,
                tags: ['biography']
            }
        };
        const html = await container.renderToString(ProjectPreview, { props: { project } });
        expect(stripDevAttrs(html)).toMatchSnapshot();
    });

    it('Pagination.astro（跨阈值多页状态）渲染结果', async () => {
        const container = await experimental_AstroContainer.create();
        const page = {
            data: [],
            start: 0,
            end: 0,
            size: 4,
            total: 120,
            currentPage: 10,
            lastPage: 30,
            url: {
                current: '/blog/10',
                prev: '/blog/9',
                next: '/blog/11',
                first: '/blog',
                last: '/blog/30'
            }
        };
        const html = await container.renderToString(Pagination, {
            props: { page, basePath: '/blog' }
        });
        expect(stripDevAttrs(html)).toMatchSnapshot();
    });
});
