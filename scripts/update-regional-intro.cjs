const fs = require('fs');
const path = require('path');

const traitDir = path.join(__dirname, '../src/content/projects/trait');
const files = fs.readdirSync(traitDir).filter(f => f.endsWith('.mdx'));

const regionalTraitFiles = [
    'trait_bashu.mdx',
    'trait_guanzhong.mdx',
    'trait_hebei.mdx',
    'trait_huaisi.mdx',
    'trait_jingyang.mdx',
    'trait_qingxu.mdx',
    'trait_wuyue.mdx',
    'trait_yongliang.mdx',
    'trait_youbing.mdx',
    'trait_zhongyuan.mdx'
];

let count = 0;
regionalTraitFiles.forEach(file => {
    const filePath = path.join(traitDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        const oldPattern = /introHtml=\{['"].*?地域特性.*?['"]\}/;
        if (oldPattern.test(content)) {
            content = content.replace(oldPattern, `introHtml={'<a href="../trait_00_regional">地域特性</a>'}`);
            fs.writeFileSync(filePath, content);
            count++;
            console.log(`Updated: ${file}`);
        }
    }
});

console.log(`Total updated: ${count} files`);