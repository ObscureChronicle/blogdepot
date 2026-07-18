const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { pinyin } = require('pinyin-pro');

const excelPath = path.join(__dirname, '../src/components/后汉稽异录-特质表.xlsx');
const tableTraitsPath = path.join(__dirname, '../src/components/Table_Traits.jsx');
const traitDir = path.join(__dirname, '../src/content/projects/trait');
const bioDir = path.join(__dirname, '../src/content/projects/bio');

// 读取Excel
const wb = XLSX.readFile(excelPath);
const baseSheet = wb.Sheets[wb.SheetNames[0]];
const dlcSheet = wb.Sheets[wb.SheetNames[1]];
const baseData = XLSX.utils.sheet_to_json(baseSheet);
const dlcData = XLSX.utils.sheet_to_json(dlcSheet);

const baseTraits = new Set();
baseData.forEach(row => { if (row['名称']) baseTraits.add(row['名称']); });

const dlcOnlyTraits = [];
dlcData.forEach(row => {
    const name = row['名称'];
    if (name && !baseTraits.has(name)) {
        dlcOnlyTraits.push({ name, description: row['说明'] || '' });
    }
});

// 解析Table_Traits.jsx获取level
const tableTraitsContent = fs.readFileSync(tableTraitsPath, 'utf-8');
const traitMapMatch = tableTraitsContent.match(/const TRAIT_MAP = \{([\s\S]*?)\};/);
const traitMapStr = traitMapMatch ? traitMapMatch[1] : '';

const traitLevelMap = {};
const traitMapLines = traitMapStr.split('\n');
traitMapLines.forEach(line => {
    const match = line.match(/'([^']+)': \{([^}]+)\}/);
    if (match) {
        const name = match[1];
        const props = match[2];
        let level = 0;
        if (props.includes('TraitColor.Oridinary')) {
            level = 1;
        } else if (props.includes('TraitColor.Super')) {
            level = 2;
        } else if (props.includes('TraitColor.Bad')) {
            level = 3;
        }
        traitLevelMap[name] = level;
    }
});

// 从bio文件中提取DLC持有人
const dlcOwners = {};
const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));
bioFiles.forEach(file => {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/);
    const characterName = titleMatch ? titleMatch[1].trim() : file.replace('.mdx', '');

    const traitsDLCMatch = content.match(/traitsDLC=\{(\[.*?\])\}/);
    if (traitsDLCMatch) {
        try {
            const jsonStr = traitsDLCMatch[1].replace(/'/g, '"');
            const traits = JSON.parse(jsonStr);
            traits.forEach(trait => {
                // 去除可能的变体后缀
                const cleanTrait = trait.replace(/\*$/, '');
                if (!dlcOwners[cleanTrait]) dlcOwners[cleanTrait] = [];
                if (!dlcOwners[cleanTrait].includes(characterName)) {
                    dlcOwners[cleanTrait].push(characterName);
                }
            });
        } catch (e) {
            console.log('Error parsing ' + file + ':', e.message);
        }
    }
});

// 生成拼音slug
const getPinyinSlug = (name) => {
    return pinyin(name, { toneType: 'none', type: 'array' }).join('');
};

// 检查已存在的文件
const existingFiles = fs.readdirSync(traitDir).filter(f => f.endsWith('.mdx'));

console.log('=== 生成星命诀独有特质 ===\n');
let createdCount = 0;

dlcOnlyTraits.forEach(({ name, description }) => {
    const slug = getPinyinSlug(name);
    const fileName = 'trait_' + slug + '.mdx';
    const filePath = path.join(traitDir, fileName);

    // 检查是否已存在
    if (existingFiles.includes(fileName)) {
        console.log('跳过(已存在): ' + name + ' -> ' + fileName);
        return;
    }

    const level = traitLevelMap[name] || 0;
    const owners = dlcOwners[name] || [];
    const wikiTag = 'wiki-' + pinyin(name.charAt(0), { toneType: 'none' }).charAt(0).toLowerCase();

    const levelLine = level > 0 ? '  level={' + level + '}\n' : '';
    const dlcOwnerLine = owners.length > 0
        ? '  dlcOwner={[ ' + owners.map(o => "'" + o + "'").join(', ') + ' ]}'
        : '  dlcOwner={[]}';

    const content = `---
title: ${name}
tags:
  - trait
  - ${wikiTag}
isFeatured: true
publishDate:
excerpt:
seo:
  image:
    src: '/post-13.jpg'
    alt: Abstract snow

---

import TraitWiki from "../../../components/Layout_Traits.astro";

<TraitWiki
  baseData={false}
  dlcData={true}
${levelLine}  baseOwner={[]}
${dlcOwnerLine}
  dlcDescription={'${description}'}
  effect={''}
/>`;

    fs.writeFileSync(filePath, content);
    createdCount++;
    console.log('创建: ' + name + ' -> ' + fileName + ' (level=' + level + ', owners=' + owners.length + ')');
});

console.log('\n共创建 ' + createdCount + ' 个特质文件');
