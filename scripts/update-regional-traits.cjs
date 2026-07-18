const fs = require('fs');
const path = require('path');

const traitDir = path.join(__dirname, '../src/content/projects/trait');
const ownersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'regional-owners.json'), 'utf-8'));

// 每个地域特质的配置
const traits = [
    {
        fileName: 'trait_bashu.mdx',
        title: '巴蜀',
        wikiTag: 'wiki-b',
        baseName: '巴蜀',
        dlcName: '巴蜀',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉益州者将获得此<a href="../trait_00_regional">地域特性</a>。</p>
<p>在星命诀中，武都郡、阴平郡被纳入此地域。</p>`,
    },
    {
        fileName: 'trait_guanzhong.mdx',
        title: '关中（关陇）',
        wikiTag: 'wiki-g',
        baseName: '关中',
        dlcName: '关陇',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉三辅，即京兆尹、左冯翊、右扶风，及北地郡者将获得此<a href="../trait_00_regional">地域特性</a>。</p>
<p>在星命诀中，河东郡、凉州南部被纳入此地域，并更改此<a href="../trait_00_regional">地域特性</a>名为<a href="../trait_guanzhong">关陇</a>。</p>`,
    },
    {
        fileName: 'trait_hebei.mdx',
        title: '河北',
        wikiTag: 'wiki-h',
        baseName: '河北',
        dlcName: '河北',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉冀州、兖州东郡北部诸县（即曹魏阳平郡、魏郡）或青州平原郡，即位于黄河以北，幽州以南，并州以东的大部分地区者将获得此<a href="../trait_00_regional">地域特性</a>。</p>`,
    },
    {
        fileName: 'trait_qingxu.mdx',
        title: '青徐',
        wikiTag: 'wiki-q',
        baseName: '青徐',
        dlcName: '青徐',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉青州、徐州（除广陵郡），或兖州泰山郡，即战国时齐国的大部分地区者将获得此<a href="../trait_00_regional">地域特性</a>。</p>
<h3 class="text-xl font-bold mt-4 mb-2">关于泰山郡之问题：</h3>
<p>臧霸为田余庆先生所提出「青徐豪霸」概念之核心人物，而臧霸为泰山华县人，晋代华县划归徐州琅琊国，可证泰山郡与青州、徐州关系密切。</p>
<h3 class="text-xl font-bold mt-4 mb-2">关于广陵郡之问题：</h3>
<p>待补</p>`,
    },
    {
        fileName: 'trait_jingyang.mdx',
        title: '荆扬（荆楚）',
        wikiTag: 'wiki-j',
        baseName: '荆扬',
        dlcName: '荆楚',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉扬州、荆州（除南阳郡）者将获得此<a href="../trait_00_regional">地域特性</a>。</p>
<p>在星命诀中，扬州部分地区被划分为新的<a href="../trait_00_regional">地域特性</a><a href="../trait_huaisi">淮泗</a>与<a href="../trait_wuyue">吴越</a>，此<a href="../trait_00_regional">地域特性</a>改名为<a href="../trait_jingyang">荆楚</a>。</p>`,
    },
    {
        fileName: 'trait_youbing.mdx',
        title: '幽并',
        wikiTag: 'wiki-y',
        baseName: '幽并',
        dlcName: '幽并',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉幽州或并州（朔方），即先秦战国时位于燕国、赵国范围内者将获得此<a href="../trait_00_regional">地域特性</a>。</p>`,
    },
    {
        fileName: 'trait_yongliang.mdx',
        title: '雍凉（西凉）',
        wikiTag: 'wiki-x',
        baseName: '雍凉',
        dlcName: '西凉',
        hasBase: true,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉雍州（除三辅外）、凉州者将获得此<a href="../trait_00_regional">地域特性</a>。</p>
<p>在星命诀中，武都郡、阴平郡被划分为<a href="../trait_bashu">巴蜀</a>，凉州南部及雍州被划分为<a href="../trait_guanzhong">关陇</a>，此<a href="../trait_00_regional">地域特性</a>改名为<a href="../trait_yongliang">西凉</a>。</p>`,
    },
    {
        fileName: 'trait_huaisi.mdx',
        title: '淮泗',
        wikiTag: 'wiki-h',
        baseName: null,
        dlcName: '淮泗',
        hasBase: false,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉扬州庐江郡、九江郡，或豫州汝南郡、沛国，荆州南阳郡，徐州广陵郡南部、彭城郡，即位于淮水、泗水流域，长江以北的大部分地区者，将获得此<a href="../trait_00_regional">地域特性</a>。</p>`,
    },
    {
        fileName: 'trait_wuyue.mdx',
        title: '吴越',
        wikiTag: 'wiki-w',
        baseName: null,
        dlcName: '吴越',
        hasBase: false,
        hasDlc: true,
        noteHtml: `<p>郡望为两汉扬州（除庐江、九江郡）者将获得此<a href="../trait_00_regional">地域特性</a>。</p>`,
    },
];

function formatOwnerArray(owners) {
    if (!owners || owners.length === 0) return '[]';
    return "['" + owners.join("', '") + "']";
}

traits.forEach(trait => {
    const owners = ownersData[trait.fileName] || { base: [], dlc: [] };
    const baseOwnerStr = formatOwnerArray(owners.base);
    const dlcOwnerStr = formatOwnerArray(owners.dlc);

    // introHtml
    let introHtml;
    if (trait.hasBase && trait.hasDlc) {
        introHtml = '后汉稽异录与星命诀中的<a href="../trait_00_regional">地域特性</a>。';
    } else if (trait.hasBase) {
        introHtml = '后汉稽异录中的<a href="../trait_00_regional">地域特性</a>。';
    } else {
        introHtml = '星命诀中的<a href="../trait_00_regional">地域特性</a>。';
    }

    const content = `---
title: ${trait.title}
tags:
  - trait
  - ${trait.wikiTag}
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
  baseData={${trait.hasBase}}
  dlcData={${trait.hasDlc}}
  introHtml={'${introHtml}'}
  baseOwner={${baseOwnerStr}}
  dlcOwner={${dlcOwnerStr}}
  baseDescription={''}
  dlcDescription={''}
  effect={''}
  noteHtml={\`${trait.noteHtml}\`}
/>
`;

    const filePath = path.join(traitDir, trait.fileName);
    fs.writeFileSync(filePath, content);
    console.log('更新: ' + trait.fileName + ' (base=' + owners.base.length + ', dlc=' + owners.dlc.length + ')');
});

console.log('\n所有地域特质文件已更新！');
