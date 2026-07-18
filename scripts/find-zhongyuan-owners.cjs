const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');
const traitName = '中原';

const baseOwners = [];
const dlcOwners = [];

const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));

bioFiles.forEach(file => {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/);
    const characterName = titleMatch ? titleMatch[1].trim() : file.replace('.mdx', '');

    // traitsBase 和 traitsPost 都算本传
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

    // 检查是否包含中原特质（去除变体后缀）
    const hasTrait = (traits) => traits.some(t => {
        const cleanTrait = t.replace(/\*$/, '');
        return cleanTrait === traitName;
    });

    if (hasTrait(allBaseTraits) && !baseOwners.includes(characterName)) {
        baseOwners.push(characterName);
    }
    if (hasTrait(dlcTraits) && !dlcOwners.includes(characterName)) {
        dlcOwners.push(characterName);
    }
});

console.log('=== 中原特质持有人 ===');
console.log('本传 (' + baseOwners.length + ' 人):', baseOwners.join('、'));
console.log('星命诀 (' + dlcOwners.length + ' 人):', dlcOwners.join('、'));
