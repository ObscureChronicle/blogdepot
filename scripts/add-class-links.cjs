const fs = require('fs');
const path = require('path');

const classDir = path.join(__dirname, '../src/content/projects/class');

// 1. 扫描所有 mdx，构建 名称 → 主 slug 映射（重复名称优先无数字后缀的主页）
const files = fs.readdirSync(classDir).filter(f => f.endsWith('.mdx'));
const nameToSlug = {};

files.forEach(file => {
    const content = fs.readFileSync(path.join(classDir, file), 'utf-8');
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    if (!titleMatch) return;
    const title = titleMatch[1].trim();
    const slug = file.replace('.mdx', '');
    const isDup = /\d$/.test(slug); // 如 daobing2
    if (!(title in nameToSlug) || (!isDup && /\d$/.test(nameToSlug[title]))) {
        nameToSlug[title] = slug;
    }
});

// 2. 名称按长度降序，防止短名截断长名（如“刀兵”截断“重装刀兵”）
const names = Object.keys(nameToSlug).sort((a, b) => b.length - a.length);
const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nameRegex = new RegExp(names.map(escapeReg).join('|'), 'g');

let fileCount = 0;
let linkCount = 0;
const warnings = [];

files.forEach(file => {
    const filePath = path.join(classDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const selfTitle = (content.match(/^title:\s*(.+)$/m) || [])[1]?.trim();

    const descMatch = content.match(/description=\{'(.*?)'\}/);
    if (!descMatch) return;
    const oldDesc = descMatch[1];
    if (!oldDesc) return;
    if (oldDesc.includes("'")) warnings.push(`${file}: 描述含单引号，需人工检查`);

    let hits = 0;
    const newDesc = oldDesc.replace(nameRegex, (m) => {
        if (m === selfTitle) return m; // 不链接自身
        hits++;
        return `<a href="../${nameToSlug[m]}">${m}</a>`;
    });

    if (hits > 0) {
        content = content.replace(/description=\{'.*?'\}/, `description={'${newDesc}'}`);
        fs.writeFileSync(filePath, content);
        fileCount++;
        linkCount += hits;
        console.log(`${file}: +${hits} 个链接`);
    }
});

console.log(`\n共更新 ${fileCount} 个文件，添加 ${linkCount} 个超链接。`);
warnings.forEach(w => console.log('警告:', w));
