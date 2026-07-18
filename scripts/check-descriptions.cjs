const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../src/components/后汉稽异录-特质表.xlsx');
const wb = XLSX.readFile(excelPath);

console.log('Sheet names:', wb.SheetNames);

const baseSheet = wb.Sheets[wb.SheetNames[0]];
const baseData = XLSX.utils.sheet_to_json(baseSheet);
console.log('\n本传工作表结构:', Object.keys(baseData[0] || {}));

const dlcSheet = wb.Sheets[wb.SheetNames[1]];
const dlcData = XLSX.utils.sheet_to_json(dlcSheet);
console.log('星命诀工作表结构:', Object.keys(dlcData[0] || {}));

console.log('\n--- 对比同名特质描述 ---');
const traitMap = {};
baseData.forEach(row => {
    const name = row['名称'];
    if (name) traitMap[name] = { base: row['说明'] || '', dlc: '' };
});
dlcData.forEach(row => {
    const name = row['名称'];
    if (name && traitMap[name]) {
        traitMap[name].dlc = row['说明'] || '';
    }
});

let diffCount = 0;
for (const [name, desc] of Object.entries(traitMap)) {
    if (desc.base !== desc.dlc && (desc.base || desc.dlc)) {
        console.log(name + ':');
        console.log('  本传: \'' + desc.base + '\'');
        console.log('  星命诀: \'' + desc.dlc + '\'');
        diffCount++;
    }
}
console.log('\n共有 ' + diffCount + ' 个特质描述不同');
