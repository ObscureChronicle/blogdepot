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

const baseTraits = new Set();
baseData.forEach(row => {
    if (row['名称']) baseTraits.add(row['名称']);
});

const dlcOnlyTraits = [];
dlcData.forEach(row => {
    const name = row['名称'];
    if (name && !baseTraits.has(name)) {
        dlcOnlyTraits.push({ name, description: row['说明'] || '' });
    }
});

console.log('=== 星命诀独有的特质 ===');
dlcOnlyTraits.forEach(t => {
    console.log(t.name + ': ' + t.description);
});
console.log('\n共 ' + dlcOnlyTraits.length + ' 个星命诀独有特质');

// 检查哪些已经存在
const existingFiles = fs.readdirSync(traitDir).filter(f => f.endsWith('.mdx'));
const existingTraits = new Set();
existingFiles.forEach(file => {
    const content = fs.readFileSync(path.join(traitDir, file), 'utf-8');
    const match = content.match(/title:\s*(.+)/);
    if (match) existingTraits.add(match[1].trim());
});

console.log('\n=== 已存在的特质 ===');
const missing = dlcOnlyTraits.filter(t => !existingTraits.has(t.name));
const existing = dlcOnlyTraits.filter(t => existingTraits.has(t.name));
console.log('已存在: ' + existing.length + ' 个');
existing.forEach(t => console.log('  - ' + t.name));
console.log('\n缺失: ' + missing.length + ' 个');
missing.forEach(t => console.log('  - ' + t.name + ': ' + t.description));
