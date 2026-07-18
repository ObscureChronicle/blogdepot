const fs = require('fs');
const path = require('path');

const traitsDir = path.join(__dirname, '../src/content/projects/trait');

const charToPinyin = {
    '冰': 'b', '长': 'c', '褫': 'c', '赤': 'c', '冲': 'c', '处': 'c',
    '雏': 'c', '摧': 'c', '当': 'd', '大': 'd', '毒': 'd', '反': 'f',
    '飞': 'f', '冯': 'f', '富': 'f', '辅': 'f', '刚': 'g', '高': 'g',
    '贯': 'g', '鬼': 'g', '诡': 'g', '国': 'g', '悍': 'h', '豪': 'h',
    '号': 'h', '桓': 'h', '后': 'h', '荒': 'h', '皇': 'h', '虎': 'h',
    '回': 'h', '惑': 'h', '将': 'j', '矫': 'j', '机': 'j', '掎': 'j',
    '桀': 'j', '稽': 'j', '矜': 'j', '景': 'j', '精': 'j', '九': 'j',
    '急': 'j', '倨': 'j', '抗': 'k', '堪': 'k', '狼': 'l', '裂': 'l',
    '戾': 'l', '凌': 'l', '凛': 'l', '勠': 'l', '庙': 'm', '明': 'm',
    '名': 'm', '募': 'm', '内': 'n', '能': 'n', '逆': 'n', '貔': 'p',
    '披': 'p', '强': 'q', '羌': 'q', '巧': 'q', '奇': 'q', '侵': 'q',
    '穷': 'q', '齐': 'q', '气': 'q', '饶': 'r', '仁': 'r', '若': 'r',
    '神': 's', '绳': 's', '审': 's', '识': 's', '世': 's', '帅': 's',
    '率': 's', '书': 's', '水': 's', '纾': 's', '顺': 's', '夙': 's',
    '输': 's', '宿': 's', '天': 't', '素': 's', '铁': 't', '同': 't',
    '通': 't', '卧': 'w', '武': 'w', '心': 'x', '悬': 'x', '玄': 'x',
    '雅': 'y', '严': 'y', '曜': 'y', '仰': 'y', '英': 'y', '因': 'y',
    '一': 'y', '勇': 'y', '御': 'y', '章': 'z', '针': 'z', '镇': 'z',
    '跖': 'z', '知': 'z', '中': 'z', '忠': 'z', '准': 'z', '柱': 'z',
    '止': 'z', '智': 'z', '自': 'z', '恣': 'z',
    '统': 't', '先': 'x', '陷': 'x', '侠': 'x', '骁': 'x', '兴': 'x'
};

const files = fs.readdirSync(traitsDir).filter(f => f.endsWith('.mdx'));
let changedCount = 0;

files.forEach(file => {
    const filePath = path.join(traitsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    Object.keys(charToPinyin).forEach(char => {
        const oldTag = `wiki-${char}`;
        const newTag = `wiki-${charToPinyin[char]}`;
        if (content.includes(oldTag)) {
            content = content.replace(new RegExp(oldTag, 'g'), newTag);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        changedCount++;
    }
});

console.log(`Fixed ${changedCount} files`);