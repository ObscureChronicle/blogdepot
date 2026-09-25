const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '../src/components/class.xlsx');
const classDir = path.join(__dirname, '../src/content/projects/class');

// 兵种名称 → 拼音 slug 映射
const NAME_SLUG = {
    '刀兵': 'daobing',
    '重装刀兵': 'zhongzhuangdaobing',
    '近卫刀兵': 'jinweidaobing',
    '长牌刀兵': 'changpaidaobing',
    '突袭刀兵': 'tuxidaobing',
    '免铠刀兵': 'miankaidaobing',
    '亲卫队': 'qinweidui',
    '施令刀兵': 'shilingdaobing',
    '死士': 'sishi',
    '矛兵': 'maobing',
    '重装矛兵': 'zhongzhuangmaobing',
    '荷剑矛兵': 'hejianmaobing',
    '征召矛兵': 'zhengzhaomaobing',
    '结阵矛兵': 'jiezhenmaobing',
    '戟兵': 'jibing',
    '掷矛兵': 'zhimabing',
    '义从矛兵': 'yicongmaobing',
    '方阵矛兵': 'fangzhenmaobing',
    '重装戟兵': 'zhongzhuangjibing',
    '长戟兵': 'changjibing',
    '宿卫队': 'suweidui',
    '弓兵': 'gongbing',
    '重装弓兵': 'zhongzhuanggongbing',
    '强弓兵': 'qianggongbing',
    '弩兵': 'nubing',
    '游侠弓兵': 'youxiagongbing',
    '负盾弓兵': 'fudungongbing',
    '禁卫队': 'jinweidui',
    '施令弓兵': 'shilinggongbing',
    '重装弩兵': 'zhongzhuangnubing',
    '施令弩兵': 'shilingnubing',
    '施令射楼': 'shilingshelou',
    '刀骑兵': 'daoqibing',
    '斥候刀骑': 'chihoudaoqi',
    '驿传刀骑': 'yichuandaoqi',
    '重甲刀骑': 'zhongjiadaoqi',
    '精锐刀骑': 'jingruidaoqi',
    '斧骑兵': 'fuqibing',
    '矛骑兵': 'maoqibing',
    '重甲矛骑': 'zhongjiamaoqi',
    '阵战矛骑': 'zhenzhanmaoqi',
    '长矛骑': 'changmaoqi',
    '先锋矛骑': 'xianfengmaoqi',
    '敢死矛骑': 'gansimaoqi',
    '弓骑兵': 'gongqibing',
    '重甲弓骑': 'zhongjiagongqi',
    '强弓骑': 'qianggongqi',
    '游袭弓骑': 'youxigongqi',
    '弩骑兵': 'nuqibing',
    '马上重弩兵': 'mashangzhongnubing',
    '骠骑兵': 'biaoqibing',
    '骁骑兵': 'xiaoqibing',
    '突骑兵': 'tuqibing',
    '胡服骑兵': 'hufuqibing',
    '劫掠刀骑': 'jieluedaoqi',
    '玄甲斧骑': 'xuanjiafuqi',
    '虎豹骑': 'hubaoqi',
    '决死矛骑': 'juesimaoqi',
    '长矛铁骑': 'changmaotieqi',
    '具装突骑': 'juzhuangtuqi',
    '精锐突骑': 'jingruituqi',
    '象兵': 'xiangbing',
    '西羌弓骑': 'xiqiangongqi',
    '西域弓骑': 'xiyugongqi',
    '浮图弩骑': 'futunuqi',
    '发石车': 'fashiche',
    '床弩': 'chuangnu',
    '井阑': 'jinglan',
    '民兵': 'minbing',
    '贼兵': 'zeibing',
    '辎重队': 'zizhongdui',
    '虎兵': 'hubing',
    '车兵': 'chebing',
    '平民': 'pingmin',
    '城门': 'chengmen',
    '长虫': 'changchong',
    '剑兵': 'jianbing',
    '谋士': 'moushi',
    '军令队': 'junlingdui',
};

// 参数换算：基础数值
const BASE = { troopFix: 0, mobility: 6, troopGrowth: 30, spGrowth: 4 };

const round1 = (n) => Math.round(n * 10) / 10;

function calcParams(paramFix, growthFix) {
    let troopFix = BASE.troopFix;
    let mobility = BASE.mobility;
    let troopGrowth = BASE.troopGrowth;
    let spGrowth = BASE.spGrowth;

    const m1 = paramFix.match(/兵力([+-]\d+)/);
    if (m1) troopFix += parseInt(m1[1], 10);
    const m2 = paramFix.match(/机动([+-]\d+)/);
    if (m2) mobility += parseInt(m2[1], 10);

    const g1 = growthFix.match(/兵力\+(\d+)%/);
    if (g1) troopGrowth = round1(troopGrowth + parseInt(g1[1], 10) / 100);
    const g2 = growthFix.match(/技能点\+(\d+)%/);
    if (g2) spGrowth = round1(spGrowth + parseInt(g2[1], 10) / 100);

    return { troopFix, mobility, troopGrowth, spGrowth };
}

const fmtList = (s) => {
    const items = (s || '').split(/\s+/).filter(Boolean);
    return items.map(i => `'${i}'`).join(', ');
};

const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets['class'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const usedSlugs = new Set();
let count = 0;

rows.forEach((row, idx) => {
    if (idx === 0) return;
    const [name, description, tier, , weapons, classType, skills, paramFix, growthFix] = row;

    let slug = NAME_SLUG[name];
    if (!slug) throw new Error(`缺少 slug 映射: ${name}`);
    if (usedSlugs.has(slug)) slug = slug + '2';
    usedSlugs.add(slug);

    const p = calcParams(paramFix || '', growthFix || '');
    const wikiTag = 'wiki-' + slug[0];

    const content = `---
title: ${name}
tags:
  - class
  - ${wikiTag}
isFeatured: true
publishDate: 
excerpt: 
seo:
  image:
    src: '/post-13.jpg'
    alt: Abstract snow

---

import ClassWiki from "../../../components/Layout_Classes.astro";

${name}是《后汉稽异录》中的一种<a href="">${tier}</a>。

<ClassWiki
  description={'${description || ''}'}
  weapons={[${fmtList(weapons)}]}
  classType={'${classType || ''}'}
  skills={[${fmtList(skills)}]}
  params={[
    { label: '兵力补正', value: ${p.troopFix} },
    { label: '机动', value: ${p.mobility} },
    { label: '兵力成长', value: ${p.troopGrowth} },
    { label: '技能点成长', value: ${p.spGrowth} },
  ]}
/>
`;

    fs.writeFileSync(path.join(classDir, `${slug}.mdx`), content);
    count++;
});

console.log(`Generated ${count} class files.`);
