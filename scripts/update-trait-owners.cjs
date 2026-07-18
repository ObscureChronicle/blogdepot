const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');
const traitDir = path.join(__dirname, '../src/content/projects/trait');

const traitOwners = {};

const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));

bioFiles.forEach(file => {
    const filePath = path.join(bioDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const titleMatch = content.match(/title:\s*(.+)/);
    const characterName = titleMatch ? titleMatch[1].trim() : file.replace('.mdx', '');

    const traitsMatches = content.match(/traits(Base|Post|DLC)=\{(\[.*?\])\}/g);
    if (traitsMatches) {
        traitsMatches.forEach(match => {
            const arrayMatch = match.match(/\[.*?\]/);
            if (arrayMatch) {
                try {
                    let jsonStr = arrayMatch[0].replace(/'/g, '"');
                    const traits = JSON.parse(jsonStr);
                    traits.forEach(trait => {
                        if (!traitOwners[trait]) {
                            traitOwners[trait] = [];
                        }
                        if (!traitOwners[trait].includes(characterName)) {
                            traitOwners[trait].push(characterName);
                        }
                    });
                } catch (e) {
                    console.log(`Error parsing traits in ${file}:`, e);
                }
            }
        });
    }
});

console.log('Trait owners mapping:');
console.log('---------------------');
Object.keys(traitOwners).sort().forEach(trait => {
    console.log(`${trait}: ${traitOwners[trait].join(', ')}`);
});

console.log('\nUpdating trait files...');
let updatedCount = 0;

const traitFiles = fs.readdirSync(traitDir).filter(file => file.endsWith('.mdx'));

traitFiles.forEach(file => {
    const filePath = path.join(traitDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    const titleMatch = content.match(/title:\s*(.+)/);
    const traitName = titleMatch ? titleMatch[1].trim() : '';

    if (traitName && traitOwners[traitName]) {
        const owners = traitOwners[traitName];
        const newOwnerLine = `  owner={[${owners.map(o => `'${o}'`).join(', ')}]}`;

        const ownerMatch = content.match(/owner=\{.*?\}/);
        if (ownerMatch) {
            content = content.replace(/owner=\{.*?\}/, newOwnerLine);
            fs.writeFileSync(filePath, content);
            updatedCount++;
            console.log(`Updated: ${traitName} -> ${owners.join(', ')}`);
        }
    }
});

console.log(`\nUpdated ${updatedCount} trait files`);