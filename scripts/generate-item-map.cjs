const fs = require('fs');
const path = require('path');

const dirs = [
    { dir: path.join(__dirname, '../src/content/projects/treasure'), prefix: '/projects/treasure/' },
    { dir: path.join(__dirname, '../src/content/projects/equipment'), prefix: '/projects/equipment/' }
];

const map = {};
for (const { dir, prefix } of dirs) {
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.mdx')) continue;
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const m = content.match(/^---\n[\s\S]*?title:\s*(.+?)\n/);
        if (!m) continue;
        const title = m[1].trim();
        const slug = file.replace(/\.mdx$/, '');
        map[title] = prefix + slug;
    }
}

const entries = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([k, v]) => `  "${k}": "${v}"`)
    .join(',\n');

const out = `export const ITEM_MAP = {\n${entries}\n};\n`;
fs.writeFileSync(path.join(__dirname, '../src/components/itemMap.js'), out);
console.log(`生成 ${Object.keys(map).length} 个物品映射`);
