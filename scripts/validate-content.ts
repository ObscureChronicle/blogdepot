import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ZodTypeAny } from 'astro/zod';
import { blogSchema, pagesSchema, projectsSchema } from '../src/content-schemas.ts';
import { resolveTag } from '../src/utils/data-utils.ts';

type CollectionConfig = { name: string; base: string; schema: ZodTypeAny };

const COLLECTIONS: CollectionConfig[] = [
    { name: 'blog', base: 'src/content/blog', schema: blogSchema },
    { name: 'pages', base: 'src/content/pages', schema: pagesSchema },
    { name: 'projects', base: 'src/content/projects', schema: projectsSchema }
];

type Issue = { file: string; level: 'error' | 'warning'; message: string };

function checkFile(collectionName: string, schema: ZodTypeAny, filePath: string): Issue[] {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    const relPath = path.relative(process.cwd(), filePath);
    const issues: Issue[] = [];

    // A. 用真实 schema 校验（跟 Astro 构建时用的是同一份 schema 对象）
    const result = schema.safeParse(data);
    if (!result.success) {
        for (const issue of result.error.issues) {
            issues.push({
                file: relPath,
                level: 'error',
                message: `[schema] ${issue.path.join('.') || '(root)'}: ${issue.message}`
            });
        }
    }

    // B-1. 遗留的单数 tag: 字段（schema 没开 strict，这种 typo 会被静默忽略）
    if ('tag' in data) {
        issues.push({
            file: relPath,
            level: 'error',
            message: '发现遗留字段 "tag:"，应改为 "tags:"（数组）'
        });
    }

    // B-2 / B-3. tags 数组内容检查
    if (Array.isArray(data.tags)) {
        data.tags.forEach((tag: unknown, index: number) => {
            if (typeof tag !== 'string' || tag.trim() === '') {
                issues.push({
                    file: relPath,
                    level: 'error',
                    message: `tags[${index}] 是空字符串或非法值`
                });
                return;
            }
            const { id } = resolveTag(tag);
            if (id === 'unknown') {
                issues.push({
                    file: relPath,
                    level: 'warning',
                    message: `tags[${index}] "${tag}" 无法识别（既不是已知中文标签名，也不是已知英文 slug），会被归入 "unknown"`
                });
            }
        });
    }

    // C-1. schema 里没定义的多余字段
    const knownKeys = new Set(Object.keys((schema as any).shape ?? {}));
    for (const key of Object.keys(data)) {
        if (!knownKeys.has(key) && key !== 'tag') {
            issues.push({
                file: relPath,
                level: 'warning',
                message: `字段 "${key}" 不在 ${collectionName} schema 定义里，可能是拼写错误或已过时`
            });
        }
    }

    return issues;
}

const allIssues: Issue[] = [];
let scannedFiles = 0;

for (const { name, base, schema } of COLLECTIONS) {
    const files = fs.globSync('**/*.{md,mdx}', { cwd: base });
    for (const file of files) {
        scannedFiles += 1;
        allIssues.push(...checkFile(name, schema, path.join(base, file)));
    }
}

const errors = allIssues.filter((i) => i.level === 'error');
const warnings = allIssues.filter((i) => i.level === 'warning');

for (const issue of allIssues) {
    const prefix = issue.level === 'error' ? '\x1b[31m✖ 错误\x1b[0m' : '\x1b[33m⚠ 警告\x1b[0m';
    console.log(`${prefix}  ${issue.file}\n   ${issue.message}`);
}

console.log(`\n共扫描 ${scannedFiles} 个内容文件，发现 ${errors.length} 个错误、${warnings.length} 个警告。`);

if (errors.length > 0) {
    process.exit(1);
}
