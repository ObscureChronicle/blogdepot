import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { blogSchema, COLLECTION_BASES, CONTENT_PATTERN, pagesSchema, projectsSchema, type CollectionName } from '../src/content-schemas.ts';
import {
    checkDisambiguation,
    checkEditionSectionTitles,
    checkFrontmatter,
    checkInternalLinks,
    checkLegacyTermHeadings,
    contentRoute,
    type Finding
} from './content-checks.ts';

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

const parsed = entries.map((entry) => {
    const raw = fs.readFileSync(entry.file, 'utf8');
    return { ...entry, raw, data: matter(raw).data };
});

const perFileIssues: Issue[] = parsed.flatMap(({ collection, file, id, raw, data }) => {
    const findings = [
        ...checkFrontmatter(collection, SCHEMAS[collection], data),
        ...checkEditionSectionTitles(raw),
        ...(collection === 'projects' && id.startsWith('class/') ? checkLegacyTermHeadings(raw) : []),
        ...checkInternalLinks(raw, contentRoute(collection, id), knownRoutes)
    ];
    return findings.map((f) => ({ ...f, file }));
});

// 跨文件检查：重名词条的消歧义约定
const projectEntries = parsed.filter((e) => e.collection === 'projects');
const fileById = new Map(projectEntries.map((e) => [e.id, e.file]));
const disambiguationIssues: Issue[] = checkDisambiguation(projectEntries.map(({ id, data }) => ({ id, title: data.title, tags: data.tags }))).map(
    ({ id, ...finding }) => ({ ...finding, file: fileById.get(id) ?? id })
);

const allIssues: Issue[] = [...perFileIssues, ...disambiguationIssues];

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
