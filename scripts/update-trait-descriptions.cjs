const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../src/components/后汉稽异录-特质表.xlsx');
const traitDir = path.join(__dirname, '../src/content/projects/trait');

const wb = XLSX.readFile(excelPath);
const baseSheet = wb.Sheets[wb.SheetNames[0]];
const dlcSheet = wb.Sheets[wb.SheetNames[1]];

const baseData = XLSX.utils.sheet_to_json(baseSheet);
const dlcData = XLSX.utils.sheet_to_json(dlcSheet);

const traitDescriptions = {};
baseData.forEach(row => {
    const name = row['名称'];
    if (name) traitDescriptions[name] = { base: row['说明'] || '', dlc: '' };
});
dlcData.forEach(row => {
    const name = row['名称'];
    if (name && traitDescriptions[name]) {
        traitDescriptions[name].dlc = row['说明'] || '';
    }
});

const traitFiles = fs.readdirSync(traitDir).filter(file => file.endsWith('.mdx'));
let updatedCount = 0;

traitFiles.forEach(file => {
    const filePath = path.join(traitDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    const titleMatch = content.match(/title:\s*(.+)/);
    const traitName = titleMatch ? titleMatch[1].trim() : '';

    if (traitName && traitDescriptions[traitName]) {
        const desc = traitDescriptions[traitName];
        const baseDescLine = desc.base ? `baseDescription={'${desc.base}'}` : '';
        const dlcDescLine = desc.dlc ? `dlcDescription={'${desc.dlc}'}` : '';

        const lines = [];
        if (baseDescLine) lines.push(baseDescLine);
        if (dlcDescLine) lines.push(dlcDescLine);

        content = content.replace(/description=\{'.*?'\}/, lines.join('\n  '));
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log('Updated: ' + traitName);
    }
});

console.log('\nUpdated ' + updatedCount + ' trait files');
