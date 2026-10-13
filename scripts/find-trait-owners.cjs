const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');

const results = {};

const bioFiles = fs.readdirSync(bioDir).filter((file) => file.endsWith('.mdx'));

bioFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/);
    const characterName = titleMatch ? titleMatch[1].trim() : file.replace('.mdx', '');

    const baseMatch = content.match(/traitsBase=\{(\[.*?\])\}/);
    const postMatch = content.match(/traitsPost=\{(\[.*?\])\}/);
    const dlcMatch = content.match(/traitsDLC=\{(\[.*?\])\}/);

    const parseTraits = (match) => {
        if (!match) return [];
        try {
            const jsonStr = match[1].replace(/'/g, '"');
            return JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    };

    const baseTraits = parseTraits(baseMatch);
    const postTraits = parseTraits(postMatch);
    const dlcTraits = parseTraits(dlcMatch);
    const allBaseTraits = [...new Set([...baseTraits, ...postTraits])];

    allBaseTraits.forEach((trait) => {
        if (!results[trait]) results[trait] = { base: [], dlc: [] };
        if (!results[trait].base.includes(characterName)) results[trait].base.push(characterName);
    });

    dlcTraits.forEach((trait) => {
        if (!results[trait]) results[trait] = { base: [], dlc: [] };
        if (!results[trait].dlc.includes(characterName)) results[trait].dlc.push(characterName);
    });
});

const traitNames = Object.keys(results).sort((a, b) => a.localeCompare(b, 'zh-Hans'));

console.log('=== 全部特质持有人 ===');
traitNames.forEach((trait) => {
    console.log(trait + ': 本传 ' + results[trait].base.length + ' 人, 星命诀 ' + results[trait].dlc.length + ' 人');
});
console.log('共 ' + traitNames.length + ' 个特质');

fs.writeFileSync(path.join(__dirname, 'trait-owners.json'), JSON.stringify(results, null, 2));
