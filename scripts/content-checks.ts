// 内容校验的检查逻辑（纯函数），由 validate-content.ts 调用，可直接用 node:test 测试
import type { ZodObject } from 'astro/zod';
import type { CollectionName } from '../src/content-schemas.ts';
import { resolveTag } from '../src/utils/data-utils.ts';

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
