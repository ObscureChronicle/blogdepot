const fs = require('fs');
const path = require('path');

const traitDir = path.join(__dirname, '../src/content/projects/trait');
const tableTraitsPath = path.join(__dirname, '../src/components/Table_Traits.jsx');

// 读取所有 trait 文件
const traitFiles = fs.readdirSync(traitDir).filter(f => f.endsWith('.mdx') && f !== 'trait_00_regional.mdx');

// 从每个文件提取 title 和 link
const traitList = [];
traitFiles.forEach(file => {
    const content = fs.readFileSync(path.join(traitDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/);
    if (titleMatch) {
        const title = titleMatch[1].trim();
        const link = '/projects/trait/' + file.replace('.mdx', '');
        traitList.push({ title, link, file });
    }
});

console.log('共找到 ' + traitList.length + ' 个特质文件\n');

// 读取当前的 Table_Traits.jsx
const tableContent = fs.readFileSync(tableTraitsPath, 'utf-8');

// 提取 TRAIT_MAP 对象内容
const traitMapMatch = tableContent.match(/const TRAIT_MAP = \{([\s\S]*?)\};/);
if (!traitMapMatch) {
    console.log('ERROR: 无法找到 TRAIT_MAP');
    process.exit(1);
}

// 解析现有 trait map
const existingMap = {};
const mapLines = traitMapMatch[1].split('\n');
mapLines.forEach(line => {
    // 匹配: '特质名': { color: ..., link: ... }
    const match = line.match(/'([^']+)':\s*\{([^}]*)\}/);
    if (match) {
        const name = match[1];
        const props = match[2];
        existingMap[name] = {};

        const colorMatch = props.match(/color:\s*(TraitColor\.\w+)/);
        if (colorMatch) existingMap[name].color = colorMatch[1];

        const linkMatch = props.match(/link:\s*'([^']*)'/);
        if (linkMatch) existingMap[name].link = linkMatch[1];
    }
});

console.log('现有 TRAIT_MAP 包含 ' + Object.keys(existingMap).length + ' 个特质\n');

// 合并数据：为所有特质添加 link，保留现有 color
const updatedMap = {};

// 先添加所有已有特质（保留 color）
Object.keys(existingMap).forEach(name => {
    updatedMap[name] = { ...existingMap[name] };
});

// 再添加所有新找到的特质（更新 link）
traitList.forEach(({ title, link }) => {
    // 处理标题中可能有括号的情况（如 "关中（关陇）"）
    const mainName = title.replace(/（.*?）/g, '').trim();

    if (!updatedMap[title]) {
        updatedMap[title] = {};
    }
    updatedMap[title].link = link;

    // 也为主名添加 link
    if (mainName !== title && !updatedMap[mainName]) {
        updatedMap[mainName] = { link };
    }
});

console.log('更新后共 ' + Object.keys(updatedMap).length + ' 个特质');

// 按类别分组排序生成新的 TRAIT_MAP
const ordinary = [];
const superTraits = [];
const bad = [];
const other = [];

Object.keys(updatedMap).forEach(name => {
    const info = updatedMap[name];
    if (info.color === 'TraitColor.Oridinary') {
        ordinary.push({ name, ...info });
    } else if (info.color === 'TraitColor.Super') {
        superTraits.push({ name, ...info });
    } else if (info.color === 'TraitColor.Bad') {
        bad.push({ name, ...info });
    } else {
        other.push({ name, ...info });
    }
});

// 排序
ordinary.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
superTraits.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
bad.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
other.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

// 生成新的 TRAIT_MAP 字符串
let newMapStr = 'const TRAIT_MAP = {\n';

// 地域特质（other 中）
const regionalNames = ['中原', '关中', '关陇', '河北', '青徐', '荆扬', '荆楚', '幽并', '巴蜀', '雍凉', '西凉', '淮泗', '吴越'];
const regionalTraits = other.filter(t => regionalNames.includes(t.name));
const otherTraits = other.filter(t => !regionalNames.includes(t.name));

// Ordinary
ordinary.forEach(t => {
    newMapStr += `    '${t.name}': { color: TraitColor.Oridinary, link: '${t.link || ''}' },\n`;
});

newMapStr += '\n';

// Super
superTraits.forEach(t => {
    newMapStr += `    '${t.name}': { color: TraitColor.Super, link: '${t.link || ''}' },\n`;
});

newMapStr += '\n';

// Bad
bad.forEach(t => {
    newMapStr += `    '${t.name}': { color: TraitColor.Bad, link: '${t.link || ''}' },\n`;
});

newMapStr += '\n';

// 地域特质
regionalTraits.forEach(t => {
    newMapStr += `    '${t.name}': { link: '${t.link || ''}' },\n`;
});

// 其他特质
if (otherTraits.length > 0) {
    newMapStr += '\n';
    otherTraits.forEach(t => {
        newMapStr += `    '${t.name}': { link: '${t.link || ''}' },\n`;
    });
}

newMapStr += '};';

// 替换原文件中的 TRAIT_MAP
const newTableContent = tableContent.replace(/const TRAIT_MAP = \{[\s\S]*?\};/, newMapStr);

fs.writeFileSync(tableTraitsPath, newTableContent);
console.log('\nTable_Traits.jsx 已更新！');
