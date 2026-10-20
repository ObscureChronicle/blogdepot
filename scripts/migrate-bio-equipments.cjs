const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');
const files = fs.readdirSync(bioDir).filter((f) => f.endsWith('.mdx'));

let updated = 0;
let skipped = 0;

for (const file of files) {
    const filePath = path.join(bioDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match equipments={[...]} or equipments={ [ ... ] } with various whitespace
    const regex = /equipments\s*=\s*\{\s*\[([\s\S]*?)\]\s*\}/;
    const match = content.match(regex);
    if (!match) {
        skipped++;
        continue;
    }

    const inner = match[1];
    // Extract label values from { label: '...', href: '...' } or {label: "...", href: ""}
    const labelRegex = /label\s*:\s*['"]([^'"]+)['"]/g;
    const labels = [];
    let m;
    while ((m = labelRegex.exec(inner)) !== null) {
        labels.push(m[1]);
    }

    if (labels.length === 0) {
        skipped++;
        continue;
    }

    // Build new equipments prop
    const items = labels.map((l) => `'${l}'`).join(', ');
    const replacement = `equipments={[${items}]}`;

    const newContent = content.replace(regex, replacement);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    updated++;
    console.log(`更新 ${file}: [${items}]`);
}

console.log(`\n完成: 更新 ${updated} 个文件, 跳过 ${skipped} 个文件`);
