import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { blogSchema, COLLECTION_BASES, CONTENT_PATTERN, pagesSchema, projectsSchema, type CollectionName } from '../src/content-schemas.ts';
import { checkFrontmatter, checkInternalLinks, contentRoute, type Finding } from './content-checks.ts';

const SCHEMAS = { blog: blogSchema, pages: pagesSchema, projects: projectsSchema };

type Entry = { collection: CollectionName; file: string; id: string };
type Issue = Finding & { file: string };

const entries: Entry[] = (Object.keys(COLLECTION_BASES) as CollectionName[]).flatMap((collection) => {
    const base = COLLECTION_BASES[collection];
    return fs.globSync(CONTENT_PATTERN, { cwd: base }).map((f) => ({
        collection,
        file: path.join(base, f),
        id: f.replace(/\\/g, '/').replace(/\.mdx?$/, '')
    }));
});
const knownRoutes = new Set(entries.map((e) => contentRoute(e.collection, e.id)));

const allIssues: Issue[] = entries.flatMap(({ collection, file, id }) => {
    const raw = fs.readFileSync(file, 'utf8');
    const findings = [
        ...checkFrontmatter(collection, SCHEMAS[collection], matter(raw).data),
        ...checkInternalLinks(raw, contentRoute(collection, id), knownRoutes)
    ];
    return findings.map((f) => ({ ...f, file }));
});

const errors = allIssues.filter((i) => i.level === 'error');
const warnings = allIssues.filter((i) => i.level === 'warning');

for (const issue of allIssues) {
    const prefix = issue.level === 'error' ? '\x1b[31m✖ 错误\x1b[0m' : '\x1b[33m⚠ 警告\x1b[0m';
    console.log(`${prefix}  ${issue.file}\n   ${issue.message}`);
}

console.log(`\n共扫描 ${entries.length} 个内容文件，发现 ${errors.length} 个错误、${warnings.length} 个警告。`);

if (errors.length > 0) {
    process.exit(1);
}
