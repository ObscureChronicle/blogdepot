import { experimental_AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import ClassSection from '../../src/components/ClassSection.astro';

let container: Awaited<ReturnType<typeof experimental_AstroContainer.create>>;

beforeEach(async () => {
    container = await experimental_AstroContainer.create();
});

describe('ClassSection.astro', () => {
    it('renders the 说明 title and the description when only description is given', async () => {
        const html = await container.renderToString(ClassSection, {
            props: { data: { description: '摘要正文。' } }
        });
        expect(html).toContain('>说明</h2>');
        expect(html).toContain('<p class="text-base leading-relaxed">摘要正文。</p>');
    });

    it('renders terms paragraph by paragraph after the description', async () => {
        const html = await container.renderToString(ClassSection, {
            props: { data: { description: '摘要正文。', terms: ['第一段。', '第二段。'] } }
        });
        const descriptionAt = html.indexOf('摘要正文。');
        const firstTermAt = html.indexOf('第一段。');
        const secondTermAt = html.indexOf('第二段。');
        expect(descriptionAt).toBeGreaterThan(-1);
        expect(firstTermAt).toBeGreaterThan(descriptionAt);
        expect(secondTermAt).toBeGreaterThan(firstTermAt);
        expect(html.match(/<p class="text-base leading-relaxed">/g)).toHaveLength(3);
    });

    it('renders terms even without a description summary', async () => {
        const html = await container.renderToString(ClassSection, {
            props: { data: { terms: ['只有长文。'] } }
        });
        expect(html).toContain('>说明</h2>');
        expect(html).toContain('只有长文。');
    });

    it('hides the 说明 title when showDescriptionTitle is false, keeping the content', async () => {
        const html = await container.renderToString(ClassSection, {
            props: { data: { description: '摘要正文。' }, showDescriptionTitle: false }
        });
        expect(html).not.toContain('>说明</h2>');
        expect(html).toContain('摘要正文。');
    });

    it('tones the 说明 title in version sections', async () => {
        const html = await container.renderToString(ClassSection, {
            props: { data: { description: '摘要正文。' }, tone: 'dlc' }
        });
        expect(html).toContain('<h2 class="section-title section-title--dlc">说明</h2>');
    });
});
