const fs = require('fs');
const path = require('path');

const baseTxt = path.join(__dirname, '../src/components/bingzhuang.txt');
const dlcTxt = path.join(__dirname, '../src/components/bingzhang-dlc.txt');
const outDir = path.join(__dirname, '../src/content/projects/equipment');

// 已有页面，跳过（含手写数值，勿覆盖）
const SKIP = new Set(['革盾', '木盾', '有方', '铁制有方', '钢制有方']);

// 名称 → 文件 slug
const SLUG = {
    革盾: 'gedun', 木盾: 'mudun', 铁盾: 'tiedun', 有方: 'youfang', 钢盾: 'gangdun',
    钩镶: 'gouxiang', 藤牌: 'tengpai', 藤甲: 'tengjia', 革甲: 'gejia', 札甲: 'zhajia',
    鱼鳞甲: 'yulinjia', 两当铠: 'liangdangkai', 筒袖铠: 'tongxiukai', 明光铠: 'mingguangkai',
    黑光铠: 'heiguangkai', 环锁铠: 'huansuokai', 毒箭: 'dujian', 火箭: 'huojian',
    三翼箭: 'sanyijian', 马上鞍垫: 'mashangandian', 革制马鞍: 'gezhimaan', 高桥马鞍: 'gaoqiaomaan',
    象鞍: 'xiangan', 象轿: 'xiangjiao', 当胸: 'dangxiong', 马铠: 'makai',
    具装马铠: 'juzhuangmakai', 象铠: 'xiangkai', 单侧马镫: 'dancemadeng', 双侧马镫: 'shuangcemadeng',
    榆毂轮: 'yugulun', 铁车轮: 'tiechelun', 木牛流马: 'muniuliuma', 偏箱车: 'pianxiangche',
    西凉马: 'xiliangma', 大宛马: 'dayuanma', 汗血马: 'hanxuema',
    木制圆盾: 'yuandun-wood', 革制圆盾: 'yuandun-leather', 木制长牌: 'changpai-wood', 革制长牌: 'changpai-leather',
    铁制有方: 'youfang-iron', 钢制有方: 'youfang-steel', 铁制钩镶: 'gouxiang-iron', 钢制钩镶: 'gouxiang-steel',
    敝衣: 'biyi', 胡服: 'hufu', 犀甲: 'xijia', 盆领铠: 'penlinkai', 鱼鳞铠: 'yulinkai',
    死尸: 'sishi', 兵车轮: 'bingchelun', 畋车轮: 'tianchelun', 蒲轮: 'pulun',
    幽州马: 'youzhouma', 匈奴马: 'xiongnvma', 果下马: 'guoxiama', 乌孙马: 'wusunma',
    橐驼: 'tuotuo', 驯象: 'xunxiang'
};

// 列: 0 ID, 1 名称, 2 说明, 5 买价, 7 重量, 11 添加技能, 12 有效对手, 15 参数补正
const parseTxt = (file) => {
    const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/).slice(1);
    const rows = {};
    for (const line of lines) {
        if (!line.trim()) continue;
        const cols = line.split(',');
        const name = cols[1].trim();
        rows[name] = {
            desc: (cols[2] || '').trim(),
            price: (cols[5] || '').trim(),
            weight: (cols[7] || '').trim(),
            skill: (cols[11] || '').trim(),
            opponents: (cols[12] || '').trim(),
            params: (cols[15] || '').trim()
        };
    }
    return rows;
};

const baseRows = parseTxt(baseTxt);
const dlcRows = parseTxt(dlcTxt);

// 装备类别：取 添加技能 中首个【X系】
const getCategory = (row) => {
    const m = row && row.skill.match(/【(.+?)系】/);
    return m ? m[1] : null;
};

// 参数补正: "魔防力+2 机动-1" → [['魔防力','+2'],['机动','-1']]
const parseParams = (str) => {
    if (!str) return [];
    return str
        .split(/\s+/)
        .map((s) => s.match(/^(.+?)([+-]\d+)$/))
        .filter(Boolean)
        .map((m) => [m[1], m[2]]);
};

// 有效对手去重: "刀兵 刀兵" → "刀兵"
const dedupOpponents = (str) => {
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

const buildEquipment = (row) => {
    if (!row) return '{}';
    const entries = [];
    if (row.price) entries.push(`      价格: ${row.price}`);
    for (const [k, v] of parseParams(row.params)) entries.push(`      ${k}: '${v}'`);
    if (row.weight) entries.push(`      重量: ${row.weight}`);
    if (row.skill) entries.push(`      效果: '${row.skill}'`);
    const opp = dedupOpponents(row.opponents);
    if (opp) entries.push(`      适用: '${opp}'`);
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
    const cat = getCategory(b) || getCategory(d) || '宝物';

    let intro;
    if (b && d) {
        intro = `${name}是《后汉稽异录》与《后汉稽异录外传：星命诀》中的一种${cat}系<a href="../equipment-type">兵装</a>。`;
    } else if (b) {
        intro = `${name}是《后汉稽异录》中的一种${cat}系<a href="../equipment-type">兵装</a>。`;
    } else {
        intro = `${name}是《后汉稽异录外传：星命诀》中的一种${cat}系<a href="../equipment-type">兵装</a>。`;
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
  baseDescription={'${b ? b.desc : ''}'}
  dlcDescription={'${d ? d.desc : ''}'}
  baseEquipment={${buildEquipment(b)}}
  dlcEquipment={${buildEquipment(d)}}
/>
`;

    fs.writeFileSync(path.join(outDir, `equipment-${slug}.mdx`), mdx);
    created++;
}

console.log(`新建 ${created} 个页面, 跳过已存在 ${skipped} 个`);
