import { experimental_AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Nav from '../../src/components/Nav.astro';

// 吸顶导航栏是纯 CSS 实现的，这里只断言关键 class 与内容还在，
// 防止后续改动把 sticky / 层级 / 主题切换按钮弄丢。
async function render(sitePath = '/') {
    const container = await experimental_AstroContainer.create();
    return container.renderToString(Nav, {
        request: new Request(`https://example.com${sitePath}`)
    });
}

describe('Nav.astro', () => {
    it('导航栏使用 sticky 吸顶并带有高于内容的层级', async () => {
        const html = await render();
        const navTag = html.match(/<nav[^>]*>/)?.[0] ?? '';
        expect(navTag).toContain('nav-bar');
        expect(navTag).toContain('sticky');
        expect(navTag).toContain('top-0');
        expect(navTag).toContain('z-30');
    });

    it('保留三个导航入口与深浅色切换按钮', async () => {
        const html = await render();
        expect(html).toContain('href="/"');
        expect(html).toContain('href="/tags/"');
        expect(html).toContain('href="/blog/"');
        expect(html).toContain('☯');
    });
});
