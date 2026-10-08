const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');

const results = {};

const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));

bioFiles.forEach(file => {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/);
    const characterName = titleMatch ? titleMatch[1].trim() : file.replace('.mdx', '');

    const baseMatch = content.match(/baseclass=\{(\[.*?\])\}/);
    const dlcMatch = content.match(/dlcclass=\{(\[.*?\])\}/);

    const parseClasses = (match) => {
        if (!match) return [];
        try {
            const jsonStr = match[1].replace(/'/g, '"');
            return JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    };

    const baseClasses = parseClasses(baseMatch);
    const dlcClasses = parseClasses(dlcMatch);

    baseClasses.forEach(cls => {
        if (!results[cls]) results[cls] = { base: [], dlc: [] };
        if (!results[cls].base.includes(characterName)) {
            results[cls].base.push(characterName);
        }
    });

    dlcClasses.forEach(cls => {
        if (!results[cls]) results[cls] = { base: [], dlc: [] };
        if (!results[cls].dlc.includes(characterName)) {
            results[cls].dlc.push(characterName);
        }
    });
});

const sortedClasses = Object.keys(results).sort((a, b) => a.localeCompare(b, 'zh-Hans'));

console.log('=== 兵种持有人 ===');
sortedClasses.forEach(cls => {
    console.log(cls + ':');
    console.log('  本传 (' + results[cls].base.length + ' 人): ' + results[cls].base.join('、'));
    console.log('  星命诀 (' + results[cls].dlc.length + ' 人): ' + results[cls].dlc.join('、'));
});

fs.writeFileSync(path.join(__dirname, 'class-owners.json'), JSON.stringify(results, null, 2));
console.log('\n结果已写入 scripts/class-owners.json');
