// 内容校验的检查逻辑（纯函数），由 validate-content.ts 调用，可直接用 node:test 测试
import type { ZodObject } from 'astro/zod';
import type { CollectionName } from '../src/content-schemas.ts';
import { isPinyinIndexTag, resolveTag } from '../src/utils/data-utils.ts';

export type Finding = { level: 'error' | 'warning'; message: string };

/** frontmatter 检查：schema 校验、遗留的 tag 字段、tags 内容、schema 外的多余字段 */
export function checkFrontmatter(collection: CollectionName, schema: ZodObject, data: Record<string, unknown>): Finding[] {
    const findings: Finding[] = [];

    // A. 用真实 schema 校验（跟 Astro 构建时用的是同一份 schema 对象）
    const result = schema.safeParse(data);
    if (!result.success) {
        for (const issue of result.error.issues) {
            findings.push({ level: 'error', message: `[schema] ${issue.path.join('.') || '(root)'}: ${issue.message}` });
        }
    }

    // B-1. 遗留的单数 tag: 字段（schema 没开 strict，这种 typo 会被静默忽略）
    if ('tag' in data) {
        findings.push({ level: 'error', message: '发现遗留字段 "tag:"，应改为 "tags:"（数组）' });
    }

    // B-2 / B-3. tags 数组内容检查
    if (Array.isArray(data.tags)) {
        data.tags.forEach((tag: unknown, index: number) => {
            if (typeof tag !== 'string' || tag.trim() === '') {
                findings.push({ level: 'error', message: `tags[${index}] 是空字符串或非法值` });
                return;
            }
            if (resolveTag(tag).id === 'unknown') {
                findings.push({
                    level: 'warning',
                    message: `tags[${index}] "${tag}" 无法识别（既不是已知中文标签名，也不是已知英文 slug），会被归入 "unknown"`
                });
            }
        });
    }

    // C. schema 里没定义的多余字段
    const knownKeys = new Set(Object.keys(schema.shape));
    for (const key of Object.keys(data)) {
        if (!knownKeys.has(key) && key !== 'tag') {
            findings.push({ level: 'warning', message: `字段 "${key}" 不在 ${collection} schema 定义里，可能是拼写错误或已过时` });
        }
    }

    return findings;
}

/** 内容条目对应的页面路径（带结尾斜杠；Astro 生成的 id 是小写的） */
export function contentRoute(collection: CollectionName, id: string): string {
    const slug = id.toLowerCase();
    return collection === 'pages' ? `/${slug}/` : `/${collection}/${slug}/`;
}

/** 版本分区标题：星命诀必须带 section-title--dlc，本传必须带 section-title--base */
export function checkEditionSectionTitles(raw: string): Finding[] {
    const findings: Finding[] = [];
    for (const [, classList, inner] of raw.matchAll(/<h2\b[^>]*\bclass\s*=\s*['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/h2>/g)) {
        const classes = classList.split(/\s+/).filter(Boolean);
        if (!classes.includes('section-title')) continue;
        const text = inner.replace(/<[^>]*>/g, '').trim();
        if (text.includes('星命诀') && !classes.includes('section-title--dlc')) {
            findings.push({ level: 'error', message: `标题「${text}」缺少 section-title--dlc` });
        }
        if (text.includes('本传') && !classes.includes('section-title--base')) {
            findings.push({ level: 'error', message: `标题「${text}」缺少 section-title--base` });
        }
    }
    return findings;
}

/**
 * 兵种词条不再用「术语（本传）」「术语（星命诀）」h2 分区：
 * 术语性说明应写进兵种条目的 terms 字段，由布局组件渲染在「说明」摘要之后。
 */
export function checkLegacyTermHeadings(raw: string): Finding[] {
    const findings: Finding[] = [];
    const banned = ['术语（本传）', '术语（星命诀）'];
    for (const [, inner] of raw.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)) {
        const text = inner.replace(/<[^>]*>/g, '').trim();
        if (banned.includes(text)) {
            findings.push({ level: 'error', message: `不再使用 h2「${text}」分区，请写入兵种条目的 terms 字段` });
        }
    }
    // 同时拦截 Markdown 写法的二级标题
    for (const [, text] of raw.matchAll(/^##\s+(.+?)\s*$/gm)) {
        if (banned.includes(text)) {
            findings.push({ level: 'error', message: `不再使用 h2「${text}」分区，请写入兵种条目的 terms 字段` });
        }
    }
    return findings;
}

/**
 * 正文里指向百科 / 日志页面的站内链接，目标页面必须存在。
 * 相对链接按带结尾斜杠的页面地址解析；比较时不区分大小写（线上会把大写地址重定向到小写）。
 * @param knownRoutes 全部内容页面的路径（contentRoute 的结果）
 */
export function checkInternalLinks(raw: string, pageRoute: string, knownRoutes: Set<string>): Finding[] {
    const findings: Finding[] = [];
    const base = new URL(pageRoute, 'https://site.invalid');
    // 同时匹配 MDX 里 JSX 属性字符串中转义的引号，如 introHtml={'<a href=\"../x\">'}
    for (const [, href] of raw.matchAll(/href=\\?["']([^"'\\{}]+)\\?["']/g)) {
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const path = decodeURIComponent(new URL(href, base).pathname);
        if (!/^\/(projects|blog)\//.test(path)) continue;
        const route = path.toLowerCase().replace(/\/?$/, '/');
        if (!knownRoutes.has(route)) findings.push({ level: 'warning', message: `链接 "${href}" 指向的页面 ${route} 不存在` });
    }
    return findings;
}

export type ProjectSummary = { id: string; title: unknown; tags: unknown };

/**
 * 重名词条的消歧义约定（只针对 projects）：
 * - 多个词条同名时，必须有一个 disambiguation/ 下的同名消歧义页
 * - 被消歧义的原词条不再带 wiki-X 音序标签，音序索引里只列消歧义页，避免出现几个一模一样的标题
 * - 消歧义页本身要带 disambiguation 分类标签
 * 返回的 finding 带上词条 id，由调用方映射回文件路径。
 */
export function checkDisambiguation(projects: ProjectSummary[]): Array<Finding & { id: string }> {
    const findings: Array<Finding & { id: string }> = [];
    const tagsOf = (p: ProjectSummary): string[] => (Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : []);
    const isDisambiguation = (p: ProjectSummary) => p.id.startsWith('disambiguation/');

    const disambiguationTitles = new Set<string>();
    for (const p of projects.filter(isDisambiguation)) {
        if (typeof p.title === 'string') disambiguationTitles.add(p.title);
        if (!tagsOf(p).includes('disambiguation')) {
            findings.push({ id: p.id, level: 'warning', message: '消歧义页缺少分类标签 "disambiguation"' });
        }
    }

    const byTitle = new Map<string, ProjectSummary[]>();
    for (const p of projects) {
        if (isDisambiguation(p) || typeof p.title !== 'string') continue;
        byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), p]);
    }

    for (const [title, group] of byTitle) {
        if (group.length < 2) continue;
        const ids = group.map((p) => p.id).join('、');
        for (const p of group) {
            if (!disambiguationTitles.has(title)) {
                findings.push({
                    id: p.id,
                    level: 'warning',
                    message: `标题「${title}」有多个同名词条（${ids}），需要在 disambiguation/ 下新建同名消歧义页`
                });
            }
            if (tagsOf(p).some(isPinyinIndexTag)) {
                findings.push({ id: p.id, level: 'warning', message: `重名词条「${title}」不应带 wiki-X 音序标签，音序索引只列消歧义页` });
            }
        }
    }
    return findings;
}
