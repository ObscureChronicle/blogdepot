const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');

// 所有地域特质（用于匹配）
const regionalTraitNames = [
    '中原', '关中', '关陇', '河北', '青徐', '荆扬', '荆楚',
    '幽并', '巴蜀', '雍凉', '西凉', '淮泗', '吴越'
];

// 地域特质映射：特质名 -> {fileName, baseName, dlcName}
const traitMap = {
    '中原': { fileName: 'trait_zhongyuan.mdx', baseName: '中原', dlcName: '中原' },
    '关中': { fileName: 'trait_guanzhong.mdx', baseName: '关中', dlcName: '关陇' },
    '关陇': { fileName: 'trait_guanzhong.mdx', baseName: '关中', dlcName: '关陇' },
    '河北': { fileName: 'trait_hebei.mdx', baseName: '河北', dlcName: '河北' },
    '青徐': { fileName: 'trait_qingxu.mdx', baseName: '青徐', dlcName: '青徐' },
    '荆扬': { fileName: 'trait_jingyang.mdx', baseName: '荆扬', dlcName: '荆楚' },
    '荆楚': { fileName: 'trait_jingyang.mdx', baseName: '荆扬', dlcName: '荆楚' },
    '幽并': { fileName: 'trait_youbing.mdx', baseName: '幽并', dlcName: '幽并' },
    '巴蜀': { fileName: 'trait_bashu.mdx', baseName: '巴蜀', dlcName: '巴蜀' },
    '雍凉': { fileName: 'trait_yongliang.mdx', baseName: '雍凉', dlcName: '西凉' },
    '西凉': { fileName: 'trait_yongliang.mdx', baseName: '雍凉', dlcName: '西凉' },
    '淮泗': { fileName: 'trait_huaisi.mdx', baseName: null, dlcName: '淮泗' },
    '吴越': { fileName: 'trait_wuyue.mdx', baseName: null, dlcName: '吴越' },
};

// 按文件分组的持有人
const owners = {};
Object.keys(traitMap).forEach(name => {
    const file = traitMap[name].fileName;
    if (!owners[file]) owners[file] = { base: [], dlc: [] };
});

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

    // 本传 = traitsBase + traitsPost
    const allBaseTraits = [...new Set([...baseTraits, ...postTraits])];

    allBaseTraits.forEach(trait => {
        const cleanTrait = trait.replace(/\*$/, '');
        if (regionalTraitNames.includes(cleanTrait) && traitMap[cleanTrait]) {
            const fileKey = traitMap[cleanTrait].fileName;
            if (!owners[fileKey].base.includes(characterName)) {
                owners[fileKey].base.push(characterName);
            }
        }
    });

    dlcTraits.forEach(trait => {
        const cleanTrait = trait.replace(/\*$/, '');
        if (regionalTraitNames.includes(cleanTrait) && traitMap[cleanTrait]) {
            const fileKey = traitMap[cleanTrait].fileName;
            if (!owners[fileKey].dlc.includes(characterName)) {
                owners[fileKey].dlc.push(characterName);
            }
        }
    });
});

console.log('=== 地域特质持有人统计 ===\n');
Object.keys(owners).forEach(file => {
    const o = owners[file];
    console.log(file + ':');
    console.log('  本传 (' + o.base.length + ' 人)');
    console.log('  星命诀 (' + o.dlc.length + ' 人)');
    console.log('');
});

fs.writeFileSync(path.join(__dirname, 'regional-owners.json'), JSON.stringify(owners, null, 2));
console.log('结果已保存到 scripts/regional-owners.json');
