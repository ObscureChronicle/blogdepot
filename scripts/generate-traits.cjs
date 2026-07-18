const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../src/components/后汉稽异录-特质表.xlsx');
const traitsDir = path.join(__dirname, '../src/content/projects/trait');
const bioDir = path.join(__dirname, '../src/content/projects/bio');
const tableTraitsPath = path.join(__dirname, '../src/components/Table_Traits.jsx');

const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(ws);

const traitDescriptions = {};
excelData.forEach(row => {
    traitDescriptions[row['名称']] = row['说明'];
});

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

const traitOwners = {};
const bioFiles = fs.readdirSync(bioDir).filter(file => file.endsWith('.mdx'));
bioFiles.forEach(file => {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const match = content.match(/traitsBase=\{(\[.*?\])\}/);
    if (match) {
        try {
            const traits = JSON.parse(match[1]);
            const characterName = content.match(/title:\s*(.+)/)?.[1] || file.replace('.mdx', '');
            traits.forEach(trait => {
                if (!traitOwners[trait]) {
                    traitOwners[trait] = [];
                }
                if (!traitOwners[trait].includes(characterName)) {
                    traitOwners[trait].push(characterName);
                }
            });
        } catch (e) {
            console.log(`Error parsing ${file}:`, e);
        }
    }
});

const existingFiles = fs.readdirSync(traitsDir);
const existingTraits = existingFiles.map(f => {
    const match = f.match(/trait_(.+)\.mdx/);
    return match ? match[1] : '';
});

const pinyinMap = {
    '止水': 'zhishui', '水鉴': 'shuijian', '冰心': 'bingxin', '心涟': 'xinlian',
    '龙胆（危亡）': 'longdan-weiwang', '龙胆（履冰）': 'longdan-lvbing',
    '龙胆（信步）': 'longdan-xinbu', '龙胆（敉宁）': 'longdan-mining',
    '貔貅': 'pixiu', '飞将': 'feijiang', '国士': 'guoshi', '顺平': 'shunping',
    '御下': 'yuxia', '严毅': 'yanyi', '明候': 'minghou', '急行': 'jixing',
    '长驱': 'changqu', '镇心': 'zhenxin', '赤心': 'chixin', '一心': 'yixin',
    '处下': 'chuxia', '凛然': 'linran', '刚胆': 'gangdan', '雅量': 'yaliang',
    '审慎': 'shenshen', '骁勇': 'xiaoyong', '悍勇': 'hanyong', '忠志': 'zhongzhi',
    '狼顾': 'langgu', '矜高': 'jingao', '倨傲': 'juao', '和衷': 'hezhong',
    '雅望': 'yawang', '辅弼': 'fubi', '回天': 'huitian', '悬壶': 'xuanhu',
    '针砭': 'zhenbian', '勠力': 'luli', '齐心': 'qixin', '募兵': 'mobing',
    '荒悖': 'huangbei', '输送': 'shusong', '刚烈': 'ganglie', '富国': 'fuguo',
    '兴利': 'xingli', '饶用': 'raoyong', '奇才': 'qicai', '能吏': 'nengli',
    '毒士': 'dushi', '率然': 'shuairan', '反间': 'fanjian', '庙算': 'miaosuan',
    '气焰': 'qiyan', '抗音': 'kangyin', '桓武': 'hengwu', '卧龙': 'wolong',
    '雏凤': 'chufeng', '虎侯': 'huhou', '裂缯': 'liezeng', '虎卫': 'huwei',
    '陷阵': 'xianzhen', '摧破': 'cuipo', '矫然': 'jiaoran', '机鉴': 'jijian',
    '因势': 'yinshi', '掎角': 'jijiao', '先识': 'xianshi', '先发': 'xianfa',
    '后至': 'houzhi', '号令': 'haoling', '皇图': 'huangtu', '英杰': 'yingjie',
    '将才': 'jiangcai', '高义': 'gaoyi', '侠气': 'xiaqi', '当先': 'dangxian',
    '先登': 'xiandeng', '桓武（关羽用）': 'hengwu-guanyu', '贯午': 'guanwu',
    '神弓': 'shengong', '内圣': 'neisheng', '霸者': 'bazhe', '鬼谋': 'guimou',
    '仁王': 'renwang', '仁德': 'rende', '机心': 'jixin', '曜威': 'yaowei',
    '中孚': 'zhongfu', '天予': 'tianyu', '柱石': 'zhushi', '宿将': 'sujiang',
    '帅才': 'shuaicai', '玄音': 'xuanyin', '名士': 'mingshi', '世家': 'shijia',
    '大族': 'dazu', '天佑': 'tianyou', '强运': 'qiangyun', '羌战': 'qiangzhan',
    '精骑': 'jingqi', '景从': 'jingcong', '鬼道': 'guidao', '豪桀': 'haojie',
    '豪桀（廖豪用）': 'haojie-liaohao', '巧匠': 'qiaojiang', '神工': 'shengong2',
    '堪舆': 'kanyu', '准望': 'zhunwang', '披靡': 'pimi', '戾机': 'liji',
    '戾极': 'liji2', '摧锋': 'cuifeng', '诡道': 'guidao2', '惑众': 'huozhong',
    '跖道': 'zhidao', '褫夺': 'chidu', '侵攻': 'qinggong', '凌弱': 'lingruo',
    '心眼': 'xinyan', '识破': 'shipo', '桀犬': 'jiedian', '铁壁': 'tiebi',
    '若愚': 'ruoyu', '同雠': 'tongchou', '逆境': 'nijing', '穷经': 'qiongjing',
    '章句': 'zhangju', '书蠹': 'shudu', '稽考': 'jikao', '天启': 'tianqi',
    '夙慧': 'suhui', '通鉴': 'tongjian', '明悟': 'mingwu', '绳准': 'shengzhun',
    '神恙': 'shenyang', '武库': 'wuku', '武库（杜预用）': 'wuku-duyu',
    '统筹': 'tongchou', '九变': 'jiubian', '冯河': 'fenghe', '素心': 'suxin',
    '纾难': 'shunan', '冲粹': 'chongcui', '跋扈': 'bahuhu', '自矜': 'zijin',
    '铜臭': 'tongchou2', '功名': 'gongming', '狷狭': 'juanxia', '横暴': 'hengbao',
    '靡费': 'mifei', '骄惰': 'jiaoduo', '恣睢': 'zisui', '短虑': 'duanlv',
    '轻佻': 'qingtiao', '高慢': 'gaoman', '傲上': 'aoshang', '无谋': 'wumou',
    '愚鲁': 'yulu', '庸弱': 'yongruo', '粗疏': 'cushu', '怯懦': 'qienuo'
};

const createdFiles = [];
const skippedFiles = [];

Object.keys(traitDescriptions).forEach(name => {
    if (name.startsWith('龙胆（') || name.includes('（') || name.includes('*')) {
        skippedFiles.push(name);
        return;
    }
    
    const slug = pinyinMap[name] || name.toLowerCase().replace(/\s+/g, '-');
    const existingIndex = existingTraits.findIndex(t => t === slug || t.startsWith(slug));
    
    if (existingIndex >= 0) {
        skippedFiles.push(name);
        return;
    }
    
    const level = traitLevelMap[name] || 0;
    const owners = traitOwners[name] || [];
    const description = traitDescriptions[name] || '';
    
    const content = `---
title: ${name}
tags:
  - trait
  - wiki-${name.charAt(0).toLowerCase()}
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
  baseData={true}
  dlcData={true}
  ${level > 0 ? `level={${level}}` : ''}
  owner={[${owners.map(o => `'${o}'`).join(', ')}]}
  description={'${description}'}
  effect={''}
/>`;
    
    const filePath = path.join(traitsDir, `trait_${slug}.mdx`);
    fs.writeFileSync(filePath, content);
    createdFiles.push(name);
});

console.log('Created traits:', createdFiles);
console.log('Skipped traits (existing or special):', skippedFiles);
console.log(`Total created: ${createdFiles.length}`);