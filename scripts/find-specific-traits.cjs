const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../src/components/后汉稽异录-特质表.xlsx');
const wb = XLSX.readFile(excelPath);
const baseSheet = wb.Sheets[wb.SheetNames[0]];
const dlcSheet = wb.Sheets[wb.SheetNames[1]];
const baseData = XLSX.utils.sheet_to_json(baseSheet);
const dlcData = XLSX.utils.sheet_to_json(dlcSheet);

const findTrait = (name) => {
    const base = baseData.find(r => r['名称'] === name);
    const dlc = dlcData.find(r => r['名称'] === name);
    return {
        base: base ? base['说明'] || '' : null,
        dlc: dlc ? dlc['说明'] || '' : null
    };
};

console.log('=== 查找特质 ===');
console.log('铜臭:', findTrait('铜臭'));
console.log('同雠:', findTrait('同雠'));
