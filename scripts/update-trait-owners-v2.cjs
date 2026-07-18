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
            const typeMatch = match.match(/traits(Base|Post|DLC)/);
            const arrayMatch = match.match(/\[.*?\]/);
            
            if (typeMatch && arrayMatch) {
                try {
                    const type = typeMatch[1];
                    let jsonStr = arrayMatch[0].replace(/'/g, '"');
                    const traits = JSON.parse(jsonStr);
                    
                    const ownerType = type === 'DLC' ? 'dlc' : 'base';
                    
                    traits.forEach(trait => {
                        if (!traitOwners[trait]) {
                            traitOwners[trait] = { base: [], dlc: [] };
                        }
                        const ownerList = traitOwners[trait][ownerType];
                        if (!ownerList.includes(characterName)) {
                            ownerList.push(characterName);
                        }
                    });
                } catch (e) {
                    console.log(`Error parsing traits in ${file}:`, e);
                }
            }
        });
    }
});

console.log('Trait owners mapping (separated by version):');
console.log('--------------------------------------------');
Object.keys(traitOwners).sort().forEach(trait => {
    const base = traitOwners[trait].base.length > 0 ? traitOwners[trait].base.join(', ') : '(none)';
    const dlc = traitOwners[trait].dlc.length > 0 ? traitOwners[trait].dlc.join(', ') : '(none)';
    console.log(`${trait} - 本传: ${base} | 星命诀: ${dlc}`);
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
        const baseOwnerLine = `baseOwner={[${owners.base.map(o => `'${o}'`).join(', ')}]}`;
        const dlcOwnerLine = `dlcOwner={[${owners.dlc.map(o => `'${o}'`).join(', ')}]}`;
        
        content = content.replace(/owner=\{.*?\}/, `${baseOwnerLine}\n  ${dlcOwnerLine}`);
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`Updated: ${traitName}`);
    }
});

console.log(`\nUpdated ${updatedCount} trait files`);