const fs = require('fs');
const path = require('path');

const owners = JSON.parse(fs.readFileSync(path.join(__dirname, 'class-owners.json'), 'utf-8'));
const classDir = path.join(__dirname, '../src/content/projects/class');

const classFiles = fs.readdirSync(classDir).filter(f => f.endsWith('.mdx'));

let updated = 0;
let skipped = 0;

classFiles.forEach(file => {
    const filePath = path.join(classDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract title
    const titleMatch = content.match(/title:\s*(.+)/);
    if (!titleMatch) { skipped++; return; }
    const title = titleMatch[1].trim();

    const ownerData = owners[title];

    // Determine if file uses ClassWiki or ClassWikiPlus
    const isPlus = content.includes('ClassWikiPlus');

    // Remove existing baseOwner and dlcOwner lines
    content = content.replace(/\n\s*baseOwner=\{[^}]*\}/g, '');
    content = content.replace(/\n\s*dlcOwner=\{[^}]*\}/g, '');

    // If no owner data, save (owners removed) and continue
    if (!ownerData || (ownerData.base.length === 0 && ownerData.dlc.length === 0)) {
        fs.writeFileSync(filePath, content, 'utf-8');
        skipped++;
        return;
    }

    // Format arrays
    const formatArr = (arr) => arr.length === 0 ? '[]' : "['" + arr.join("', '") + "']";
    const baseOwnerLine = `  baseOwner={${formatArr(ownerData.base)}}`;
    const dlcOwnerLine = `  dlcOwner={${formatArr(ownerData.dlc)}}`;

    // Find the closing `/>` of the component tag
    // It should be the last `/>` in the file
    const lastClosingIdx = content.lastIndexOf('/>');
    if (lastClosingIdx === -1) { skipped++; return; }

    // Insert owner props before the closing `/>`
    const before = content.slice(0, lastClosingIdx);
    const after = content.slice(lastClosingIdx);

    const newContent = before + baseOwnerLine + '\n' + dlcOwnerLine + '\n' + after;

    fs.writeFileSync(filePath, newContent, 'utf-8');
    updated++;
});

console.log(`已更新 ${updated} 个文件，跳过 ${skipped} 个文件`);
