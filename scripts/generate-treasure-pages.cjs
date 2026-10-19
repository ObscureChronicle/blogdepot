const fs = require('fs');
const path = require('path');

const baseTxt = path.join(__dirname, '../src/components/item.txt');
const dlcTxt = path.join(__dirname, '../src/components/item - dlc.txt');
const outDir = path.join(__dirname, '../src/content/projects/treasure');

// 已有页面，跳过（含手写内容，勿覆盖）
const SKIP = new Set(['赮虹']);

// 名称 → 文件 slug
const SLUG = {
    倚天: 'yitian', 青釭: 'qinggang', 偃月: 'yanyue', 丈八蛇矛: 'zhangbamao', 龙胆: 'longdan',
    白羽扇: 'baiyushan', 鹤氅: 'hechang', 纶巾: 'guanjin', 碧落: 'biluo', 穷奇: 'qiongqi',
    履霜: 'lvshuang', 典韦: 'dianwei', 陈到: 'chendao', 夏侯和: 'xiahouhe', 长命缕: 'changminglv',
    '长命缕·断': 'changminglv-duan', 凤仪: 'fengyi', 天义: 'tianyi', 流采: 'liucai',
    青冥: 'qingming', 流星: 'liuxing', 紫电: 'zidian', 百里: 'baili', 白虹: 'baihong',
    辟邪: 'bixie', 子衿: 'zijin', 方天: 'fangtian', 双股: 'shuanggu', 思召: 'sizhao',
    丹心: 'danxin', 心月: 'xinyue', 有怀: 'youhuai', 开山: 'kaishan',
    破军: 'pojun', 梼杌: 'taowu', 浑沌: 'hundun', 饕餮: 'taotie',
    玉汝: 'yuru', 五火神焰扇: 'wuhuoshenyanshan', 九节良师杖: 'jiujieliangshizhang',
    '碧落·断': 'biluo-duan', 绛天: 'jiangtian', 七星: 'qixing', 凄然: 'qiran', 朏明: 'feiming',
    景星: 'jingxing', 大夏龙雀: 'daxialongque', 追锋车: 'zhuifengche', '赮虹·改': 'xiahong-gai',
    燕云: 'yanyun', 桃夭: 'taoyao', 燚华: 'yihua', 后扈: 'houhu', '倚天·改': 'yitian-gai',
    '心月·改': 'xinyue-gai', '丹心·改': 'danxin-gai', '大夏龙雀·改': 'daxialongque-gai',
    '履霜·改': 'lvshuang-gai', 离: 'li', 洛川雪: 'luochuanxue', 引秋: 'yinqiu', 绿沉: 'lvchen',
    逐龙: 'zhulong', 涯角: 'yajiao', '偃月·改': 'yanyue-gai', 水月: 'shuiyue', 霜月: 'shuangyue',
    北林: 'beilin', '倚天·极': 'yitian-ji', '赮虹·极': 'xiahong-ji', 后汉稽异录: 'houhanjiyilu',
    '稽异录残卷·监军篇': 'jiyilucanjuan-jianjun', '稽异录残卷·王佐篇': 'jiyilucanjuan-wangzuo',
    '稽异录残卷·宿将篇': 'jiyilucanjuan-sujiang', '稽异录残卷·霸者篇': 'jiyilucanjuan-bazhe',
    屯田要略: 'tuntianyaolue', 济河论: 'jihelun', 四本论: 'sibenlun', 孔子家语: 'kongzijiayu',
    竹书纪年: 'zhushujinian', 平羌指归: 'pingqiangzhigui', 老子想尔注: 'laozixiangerzhu',
    太平清领书: 'taipingqinglingshu', 伤寒杂病论: 'shanghanzabinglun', 治论: 'zhilun',
    周易注: 'zhouyizhu', 周易章句: 'zhouyizhangju', 论语集解: 'lunyujijie', 周易集解: 'zhouyijijie',
    正始溯源记: 'zhengshisuyuanji', 与荀彧书: 'yuxunyushu', 飞石车图纸: 'feishichetuzhi',
    连弩图纸: 'liannutuzhi', 多弓床弩图纸: 'duogongchuangnutuzhi', 逐龙谱: 'zhulongpu',
    大将军印: 'dajiangjunyin', 安乐公印: 'anlegongyin', 素弦: 'suxian', 天师道袍: 'tianshidaopao',
    传国玉玺: 'chuanguoyuxi',
    // DLC 独有或主要在 DLC
    蛇矛: 'shemao', 大梁: 'daliang', 玄枵: 'xuanxiao', 距黍: 'jushu', 玉衡: 'yuheng',
    流光: 'liuguang', 清商: 'qingshang', 贪狼: 'tanlang', 司命: 'siming', 银汉: 'yinhan',
    大黄: 'dahuang', 吴钩: 'wugou', 西陆: 'xilu', 明夷: 'mingyi', 易难记: 'yinanji',
    尚书章句: 'shangshuzhangju', 毛诗笺: 'maoshijian', 礼传: 'lizhuan', 春秋左氏传: 'chunqiuzuoshizhuan',
    冀州牧印: 'jizhoumuyin', 金顶车盖: 'jindingchegai'
};

// 列: 0 ID, 1 名称, 2 说明（诗句/短说明）, 3 说明（长说明）, 4 分类, 5 买价, 6 耐久, 7 重量,
//      8 种类, 9 使用效果, 10 范围设定, 11 效果, 12 专用数据, 13 免疫状态, 14 有效对手, 15 参数补正, 16 成长值奖金
const parseTxt = (file) => {
    const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
    const groups = {}; // strippedName -> { field: { val, rank } }
    let section = 'block0';

    const getRank = (sec) => {
        if (sec === 'famous' || sec === 'treasure' || sec === 'block0') return 0;
        if (sec === 'smelt') return 1;
        if (sec === 'display') return 2;
        return 3;
    };

    for (const line of lines) {
        if (!line.trim()) continue;
        const cols = line.split(',');
        const rawName = cols[1] ? cols[1].trim() : '';
        if (!rawName || rawName === '名称') continue;

        // 分隔符行
        if (rawName.includes('------')) {
            if (rawName.includes('展示')) section = 'display';
            else if (rawName.includes('冶炼')) section = 'smelt';
            else if (rawName.includes('名武器')) section = 'famous';
            else if (rawName.includes('宝物')) section = 'treasure';
            continue;
        }

        const name = rawName.replace(/（[^）]*）/g, '').trim();
        const rank = getRank(section);
        if (!groups[name]) groups[name] = {};
        const g = groups[name];

        const fields = {
            desc: (cols[3] || cols[2] || '').trim(),
            price: (cols[5] || '').trim(),
            effect: (cols[11] || '').trim(),
            exclusive: (cols[12] || '').trim(),
            immunity: (cols[13] || '').trim(),
            params: (cols[15] || '').trim(),
            growth: (cols[16] || '').trim()
        };

        for (const [k, v] of Object.entries(fields)) {
            if (!v) continue;
            if (!g[k] || rank < g[k].rank) {
                g[k] = { val: v, rank };
            }
        }
    }

    // 展平
    const rows = {};
    for (const [name, g] of Object.entries(groups)) {
        rows[name] = {};
        for (const k of Object.keys(g)) rows[name][k] = g[k].val;
    }
    return rows;
};

const baseRows = parseTxt(baseTxt);
const dlcRows = parseTxt(dlcTxt);

// 参数补正: "魔防力+2 机动-1" → [['魔防力','+2'],['机动','-1']]
const parseParams = (str) => {
    if (!str) return [];
    return str
        .split(/\s+/)
        .map((s) => s.match(/^(.+?)([+-]\d+)$/))
        .filter(Boolean)
        .map((m) => [m[1], m[2]]);
};

// 去重空格分隔的令牌
const dedupTokens = (str) => {
    if (!str) return '';
    const seen = new Set();
    const out = [];
    for (const p of str.split(/\s+/)) {
        if (p && !seen.has(p)) {
            seen.add(p);
            out.push(p);
        }
    }
    return out.join('、');
};

const esc = (s) => (s || '').replace(/'/g, "\\'");

const buildEquipment = (row) => {
    if (!row) return '{}';
    const entries = [];
    if (row.price && row.price !== '0') entries.push(`      价格: ${row.price}`);
    for (const [k, v] of parseParams(row.params)) entries.push(`      ${esc(k)}: '${esc(v)}'`);
    if (row.effect) entries.push(`      效果: '${esc(row.effect)}'`);
    const exc = dedupTokens(row.exclusive);
    if (exc) entries.push(`      适用: '${esc(exc)}'`);
    if (row.immunity) entries.push(`      免疫: '${esc(row.immunity)}'`);
    if (row.growth) entries.push(`      成长: '${esc(row.growth)}'`);
    if (entries.length === 0) return '{}';
    return `{\n    base: {\n${entries.join(',\n')}\n    }\n  }`;
};

// 合并：同名条目归入同一页面
const allNames = [...new Set([...Object.keys(baseRows), ...Object.keys(dlcRows)])];
let created = 0;
let skipped = 0;

for (const name of allNames) {
    if (SKIP.has(name)) {
        skipped++;
        continue;
    }
    const slug = SLUG[name];
    if (!slug) {
        console.log('!! 缺 slug: ' + name);
        continue;
    }
    const b = baseRows[name];
    const d = dlcRows[name];

    let intro;
    if (b && d) {
        intro = `${name}是后汉稽异录与星命诀中的一项配饰类<a href="../treasure-type">宝物</a>。`;
    } else if (b) {
        intro = `${name}是《后汉稽异录》中的一种<a href="../treasure-type">宝物</a>。`;
    } else {
        intro = `${name}是《后汉稽异录外传：星命诀》中的一种<a href="../treasure-type">配饰</a>。`;
    }

    const wikiTag = 'wiki-' + slug.charAt(0);
    const mdx = `---
title: ${name}
tags:
  - equipment
  - ${wikiTag}
isFeatured: true
publishDate: 
excerpt: 
seo:
  image:
    src: '/post-13.jpg'
    alt: Abstract snow

---

import EquipmentWiki from '../../../components/Layout_Equipments.astro';

${intro}

<EquipmentWiki
  baseDescription={'${b ? esc(b.desc) : ''}'}
  dlcDescription={'${d ? esc(d.desc) : ''}'}
  baseEquipment={${buildEquipment(b)}}
  dlcEquipment={${buildEquipment(d)}}
/>
`;

    fs.writeFileSync(path.join(outDir, `treasure-${slug}.mdx`), mdx);
    created++;
}

console.log(`新建 ${created} 个页面, 跳过已存在 ${skipped} 个`);
