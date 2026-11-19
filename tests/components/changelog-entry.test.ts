import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import ChangelogEntry from '../../src/components/ChangelogEntry.astro';

// 同 regression-snapshots.test.ts：去掉机器相关的调试属性
function stripDevAttrs(html: string): string {
    return html.replace(/\s*data-astro-source-(file|loc)="[^"]*"/g, '').replace(/src="[^"]*\.astro\?astro[^"]*"/g, 'src="[dev-script-src]"');
}

const ITEMS = [
    '*对之前的版本号做了一些调整。',
    '【平衡】\t大调了弓兵系职业。',
    '新增了全部兵种的转职。',
    '【修正】【本地化】修正了日语版部分汉字字形。',
    '\t*日语旧字体→日语新字体/许容字体。'
];

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

function render(props: Record<string, unknown> = {}) {
    return container.renderToString(ChangelogEntry, { props: { version: 'E1.34', date: '2026/08/29', items: ITEMS, ...props } });
}

describe('ChangelogEntry.astro', () => {
    it('writes the data attributes the toolbar script relies on', async () => {
        const html = await render();
        expect(html).toContain('id="E1.34"');
        expect(html).toContain('data-year="2026"');
        expect(html).toContain('datetime="2026-08-29"');
        expect(html).toContain('data-tags="修正 本地化"');
        // 版本说明没有标签，选了类别时会被筛掉
        expect(html).toMatch(/class="changelog-remark"[^>]*data-tags=""/);
        expect(html).not.toMatch(/<details[^>]*\bopen\b/);
    });

    it('counts items by first tag in the summary', async () => {
        const html = await render();
        expect(html).toContain('2 项');
        expect(html).toContain('平衡 1');
        expect(html).toContain('修正 1');
    });

    it('honours initiallyOpen', async () => {
        expect(await render({ initiallyOpen: true })).toMatch(/<details[^>]*\bopen\b/);
    });

    it('matches the snapshot', async () => {
        expect(stripDevAttrs(await render())).toMatchSnapshot();
    });
});
