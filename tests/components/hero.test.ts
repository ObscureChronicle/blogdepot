import { experimental_AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import siteConfig from '../../src/data/site-config';

// Hero 不接收 props，直接读 siteConfig.hero；单张的边界情况用 vi.doMock 换掉 site-config，
// 所以每个用例都在 resetModules 之后动态 import 组件，避免拿到缓存的旧模块。
async function renderHero() {
    const { default: Hero } = await import('../../src/components/Hero.astro');
    const container = await experimental_AstroContainer.create();
    return container.renderToString(Hero);
}

// 取出某类元素的开始标签（只用来检查属性，不需要完整解析 HTML）
function openingTags(html: string, pattern: RegExp): string[] {
    return html.match(pattern) ?? [];
}

afterEach(() => {
    vi.doUnmock('../../src/data/site-config');
    vi.resetModules();
});

describe('Hero.astro 轮播（真实 site-config）', () => {
    it('渲染轮播容器及其无障碍角色', async () => {
        const html = await renderHero();
        expect(html).toContain('data-hero-carousel');
        expect(html).toContain('aria-roledescription="carousel"');
    });

    it('初始只有第 1 张处于激活状态，其余隐藏且不可交互', async () => {
        const html = await renderHero();
        const images = openingTags(html, /<figure data-hero-slide[^>]*>/g);
        const panels = openingTags(html, /<div data-hero-slide[^>]*>/g);
        expect(images).toHaveLength(2);
        expect(panels).toHaveLength(2);

        expect(images[0]).toContain('data-active="true"');
        expect(images[1]).toContain('data-active="false"');
        expect(images[1]).toContain('aria-hidden="true"');

        expect(panels[0]).toContain('data-active="true"');
        expect(panels[0]).not.toMatch(/\sinert[\s>]/);
        expect(panels[1]).toContain('aria-hidden="true"');
        expect(panels[1]).toMatch(/\sinert[\s>]/);
    });

    it('只有第 1 个 Steam widget 直接加载，后续的只留 data-src 等首次切换', async () => {
        const html = await renderHero();
        const iframes = openingTags(html, /<iframe[^>]*>/g);
        expect(iframes).toHaveLength(2);
        expect(iframes[0]).toContain(' src="https://store.steampowered.com/widget/2010900/"');
        expect(iframes[1]).not.toContain(' src=');
        expect(iframes[1]).toContain('data-src="https://store.steampowered.com/widget/2694320/"');
    });

    it('多张时渲染左右箭头、进度线和暂停按钮', async () => {
        const html = await renderHero();
        expect(html).toContain('aria-label="上一个"');
        expect(html).toContain('aria-label="下一个"');
        expect(html).toContain('data-hero-progress');
        expect(openingTags(html, /<button[^>]*data-hero-pause[^>]*>/g)[0]).toContain('aria-label="暂停自动播放"');
    });
});

describe('Hero.astro 轮播（只有一张）', () => {
    it('不渲染箭头、进度线和暂停按钮', async () => {
        vi.resetModules();
        vi.doMock('../../src/data/site-config', () => ({
            default: { ...siteConfig, hero: { slides: [siteConfig.hero!.slides[0]] } }
        }));
        const html = await renderHero();
        expect(openingTags(html, /<div data-hero-slide[^>]*>/g)).toHaveLength(1);
        expect(html).not.toContain('data-hero-prev');
        expect(html).not.toContain('data-hero-next');
        expect(html).not.toContain('data-hero-progress');
        expect(html).not.toContain('data-hero-pause');
    });
});
