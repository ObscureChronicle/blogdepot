const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');
const outputFile = path.join(__dirname, '../src/components/characterMap.js');

const files = fs.readdirSync(bioDir).filter(f => f.endsWith('.mdx'));

const characterMap = {};

files.forEach(file => {
    const filePath = path.join(bioDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/title:\s*(.+)/);
    if (match) {
        const title = match[1].trim();
        const slug = file.replace('.mdx', '');
        const link = `/projects/bio/${slug}`;

        characterMap[title] = link;

        const aliasMatch = title.match(/（(.+)）/);
        if (aliasMatch) {
            characterMap[aliasMatch[1]] = link;
        }

        const simpleName = title.replace(/（.+）/, '');
        if (simpleName !== title) {
            characterMap[simpleName] = link;
        }
    }
});

const outputContent = `export const CHARACTER_MAP = ${JSON.stringify(characterMap, null, 2)};`;

fs.writeFileSync(outputFile, outputContent);

console.log(`Generated character map with ${Object.keys(characterMap).length} entries`);