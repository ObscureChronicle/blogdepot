const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');

const traits = ['铜臭', '同雠'];
const results = {};
traits.forEach(t => results[t] = { base: [], dlc: [] });

const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));

bioFiles.forEach(file => {
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

    traits.forEach(trait => {
        if (allBaseTraits.includes(trait) && !results[trait].base.includes(characterName)) {
            results[trait].base.push(characterName);
        }
        if (dlcTraits.includes(trait) && !results[trait].dlc.includes(characterName)) {
            results[trait].dlc.push(characterName);
        }
    });
});

console.log('=== 特质持有人 ===');
traits.forEach(trait => {
    console.log(trait + ':');
    console.log('  本传 (' + results[trait].base.length + ' 人): ' + results[trait].base.join('、'));
    console.log('  星命诀 (' + results[trait].dlc.length + ' 人): ' + results[trait].dlc.join('、'));
});

fs.writeFileSync(path.join(__dirname, 'specific-trait-owners.json'), JSON.stringify(results, null, 2));
