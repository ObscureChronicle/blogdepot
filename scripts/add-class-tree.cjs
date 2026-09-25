const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const root = path.join(__dirname, '..');
const excelPath = path.join(root, 'src/components/class.xlsx');
const stringTablePath = path.join(root, 'src/components/constants-stringtable.js');
const classDir = path.join(root, 'src/content/projects/class');
const classMapPath = path.join(root, 'src/components/classMap.js');

// ---------- 1. Excel：名称 / tier / 前置兵种 ----------
const wb = XLSX.readFile(excelPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['class'], { header: 1 }).slice(1).map(r => ({
    name: r[0],
    tier: r[2],
    parents: (r[3] || '').split(/\s+/).filter(Boolean),
}));

// ---------- 2. stringtable：注释中的兵种名 → 转职条件 ----------
const stContent = fs.readFileSync(stringTablePath, 'utf-8');
const conditionMap = {};
const condRegex = /Condition_\w+:\s*'((?:[^'\\]|\\.)*)'[^\n]*?\/\/\s*(\S.*?)\s*$/gm;
let cm;
while ((cm = condRegex.exec(stContent)) !== null) {
    const raw = cm[1];
    const className = cm[2].trim();
    const items = raw.split(/\\n\\n/).filter(s => s && s !== '转职条件：');
    conditionMap[className] = items;
}

// ---------- 3. 反向索引：前置 → 进阶（联动兵种行不参与树） ----------
const childrenMap = {};
rows.forEach(r => {
    if (r.tier === '联动兵种') return;
    r.parents.forEach(p => {
        (childrenMap[p] = childrenMap[p] || []).push(r.name);
    });
});

// ---------- 4. 扫描 class 目录，生成 classMap.js（兵种名 → 页面路径） ----------
const files = fs.readdirSync(classDir).filter(f => f.endsWith('.mdx'));
const titleToSlug = {};
files.forEach(file => {
    const content = fs.readFileSync(path.join(classDir, file), 'utf-8');
    const title = (content.match(/^title:\s*(.+)$/m) || [])[1]?.trim();
    if (!title) return;
    const slug = file.replace('.mdx', '');
    const isDup = /\d$/.test(slug);
    if (!(title in titleToSlug) || (!isDup && /\d$/.test(titleToSlug[title]))) {
        titleToSlug[title] = slug;
    }
});

const mapLines = Object.entries(titleToSlug)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([title, slug]) => `  ${JSON.stringify(title)}: "/projects/class/${slug}",`)
    .join('\n');
fs.writeFileSync(classMapPath, `// 此文件由 scripts/add-class-tree.cjs 自动生成\n\nexport const CLASS_MAP = {\n${mapLines}\n};\n`);
console.log(`classMap.js 生成 ${Object.keys(titleToSlug).length} 个兵种映射。`);

// ---------- 5. 为每个 Excel 行对应的 MDX 注入 parents/children/condition ----------
const fmtArr = arr => '[' + arr.map(s => `'${s}'`).join(', ') + ']';

const usedSlugs = new Set();
let updated = 0;
const problems = [];

rows.forEach(r => {
    const baseSlug = titleToSlug[r.name];
    if (!baseSlug) {
        problems.push(`找不到 slug: ${r.name}`);
        return;
    }
    let slug = baseSlug;
    if (usedSlugs.has(slug)) slug = slug + '2';
    usedSlugs.add(slug);

    const filePath = path.join(classDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
        problems.push(`文件不存在: ${slug}.mdx`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('parents=')) return; // 幂等

    const isLinkage = r.tier === '联动兵种';
    const parents = isLinkage ? [] : r.parents;
    const children = isLinkage ? [] : (childrenMap[r.name] || []);
    const condition = isLinkage ? [] : (conditionMap[r.name] || []);

    [...parents, ...children].forEach(n => {
        if (!(n in titleToSlug)) problems.push(`${slug}: 树中兵种“${n}”无页面映射`);
    });

    const inject = `  ]}\n  parents={${fmtArr(parents)}}\n  upgrades={${fmtArr(children)}}\n  condition={${fmtArr(condition)}}\n/>`;
    const next = content.replace(/  \]\}\n\/>/, inject);
    if (next === content) {
        problems.push(`${slug}.mdx: 未找到 ClassWiki 结尾，未注入`);
        return;
    }
    fs.writeFileSync(filePath, next);
    updated++;
});

console.log(`已更新 ${updated} 个 MDX 文件。`);
if (problems.length) {
    console.log('\n问题：');
    problems.forEach(p => console.log(' -', p));
}
