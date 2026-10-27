#!/usr/bin/env node
/* ==========================================================================
 * ⚠️  DO NOT DELETE THIS SCRIPT — KEEP IT INDEFINITELY
 * ⚠️  本脚本会在未来持续使用，请勿删除。
 *
 * 用途：为 src/content/projects/bio/ 目录下所有 MDX 人物词条的 biography 字段，
 *      自动扫描其中出现的其他人物姓名，并替换为指向其对应页面的
 *      <a href="../slug/">姓名</a> 超链接。
 *
 * 为什么需要保留：
 *   - bio/ 目录下的人物 MDX 会持续新增、修改，新的 biography 文本中会包含新的
 *     人物引用，每次写完人物词条后都需要用本脚本重新跑一遍，把散落的人名批量
 *     变成可点击的内部链接。
 *   - 这是目前唯一能自动完成该工作的脚本，没有替代方案。
 *
 * 使用方式：
 *   node scripts/link-biography-names.cjs            # dry-run 预览，不改文件
 *   node scripts/link-biography-names.cjs --apply     # 实际写入文件
 * ========================================================================== */

/**
 * link-biography-names.cjs — 详细说明
 *
 * 为 bio 目录下所有 MDX 人物词条的 biography 字段，自动将其中出现的其他人物名
 * 替换为指向其对应页面的 <a href="../slug/"> 超链接。
 *
 * 特性：
 *   - 从每个文件的 nameTableData.name.simplified + 文件名 slug 构建全量映射
 *   - biography 支持单行（反引号在同一行）和跨行（含脚注换行）两种格式
 *   - 名字按长度降序匹配，避免短名截断长名（如「诸葛亮」先于「诸葛」）
 *   - 不替换自身名字的出现
 *   - 已有的 <a>...</a> 标签完整保留，不会重复包装
 *   - 默认 dry-run，加 --apply 参数才实际写入
 *   - 输出详细统计：修改文件数、新增链接数、零链接文件列表
 *
 * 用法：
 *   node scripts/link-biography-names.cjs            # dry-run 预览
 *   node scripts/link-biography-names.cjs --apply     # 实际写入文件
 */

const fs = require('fs');
const path = require('path');

const bioDir = path.join(__dirname, '../src/content/projects/bio');
const backtick = '`';

// ---------- 1. 构建 名字 → slug 映射 ----------
const files = fs.readdirSync(bioDir).filter(f => f.endsWith('.mdx'));
const nameToSlug = {};

const nameRegexInMDX = /nameTableData\s*=\s*\{\{[\s\S]*?name\s*:\s*\{[\s\S]*?simplified\s*:\s*['"]([^'"\r\n]+)['"]/;

for (const file of files) {
    const content = fs.readFileSync(path.join(bioDir, file), 'utf-8');
    const slug = file.replace(/\.mdx$/, '');
    const m = content.match(nameRegexInMDX);
    if (m && m[1]) {
        // 重复名字只保留第一个（通常是主页 slug，不带数字后缀）
        if (!(m[1] in nameToSlug)) {
            nameToSlug[m[1]] = slug;
        }
    }
}

// 名字按长度降序，避免短名先匹配导致长名被截断
const sortedNames = Object.keys(nameToSlug).sort((a, b) => b.length - a.length);

console.log(`Loaded ${files.length} MDX files, ${Object.keys(nameToSlug).length} unique name→slug mappings\n`);

// ---------- 2. 处理每个文件 ----------
let modifiedCount = 0;
let totalLinksAdded = 0;
const noBioFiles = [];
const zeroLinkFiles = [];

// 用于拆分 <a> 标签片段的正则
const anchorSplitRegex = /(<a\s[^>]*>.*?<\/a>)/;

for (const file of files) {
    const filePath = path.join(bioDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const slug = file.replace(/\.mdx$/, '');

    // 自身名字
    const selfMatch = content.match(nameRegexInMDX);
    if (!selfMatch) { noBioFiles.push(file); continue; }
    const selfName = selfMatch[1];

    // 定位 biography= 后的两个反引号（无论跨行与否）
    const bioMarker = 'biography=';
    const markerIdx = content.indexOf(bioMarker);
    if (markerIdx < 0) { noBioFiles.push(file); continue; }

    const firstBt = content.indexOf(backtick, markerIdx);
    const secondBt = content.indexOf(backtick, firstBt + 1);
    if (firstBt < 0 || secondBt < 0) { noBioFiles.push(file); continue; }

    const prefix = content.substring(0, firstBt + 1);
    let bioText = content.substring(firstBt + 1, secondBt - firstBt - 1);
    const suffix = content.substring(secondBt);

    const existingLinks = (bioText.match(/<a\s/g) || []).length;

    // 按 <a> 标签拆分，只在非链接片段里做替换
    const segments = bioText.split(anchorSplitRegex);
    const newSegments = [];

    for (const seg of segments) {
        if (/^<a\s/.test(seg)) {
            // 已有超链接，原样保留
            newSegments.push(seg);
        } else {
            let result = seg;
            for (const name of sortedNames) {
                if (name === selfName) continue;
                const targetSlug = nameToSlug[name];
                if (!targetSlug) continue;
                result = result.split(name).join(`<a href="../${targetSlug}/">${name}</a>`);
            }
            newSegments.push(result);
        }
    }

    const newBioText = newSegments.join('');
    const newLinks = (newBioText.match(/<a\s/g) || []).length;
    const added = newLinks - existingLinks;

    if (added > 0) {
        const newContent = prefix + newBioText + suffix;
        if (process.argv.includes('--apply')) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
        }
        modifiedCount++;
        totalLinksAdded += added;
        console.log(`  ${file} (${selfName}): +${added} links (was ${existingLinks}, now ${newLinks})`);
    } else if (bioText.length > 20) {
        zeroLinkFiles.push(`${file} (${selfName})`);
    }
}

// ---------- 3. 输出汇总 ----------
console.log('\n=== SUMMARY ===');
console.log(`Mode: ${process.argv.includes('--apply') ? 'APPLIED (files written)' : 'DRY-RUN (no changes)'}`);
console.log(`Files modified: ${modifiedCount} / ${files.length}`);
console.log(`Total new links added: ${totalLinksAdded}`);

if (zeroLinkFiles.length > 0) {
    console.log(`\nFiles with biography but zero internal links (${zeroLinkFiles.length}):`);
    zeroLinkFiles.forEach(f => console.log(`  ${f}`));
}

if (noBioFiles.length > 0) {
    console.log(`\nFiles without biography field (${noBioFiles.length}):`);
    noBioFiles.forEach(f => console.log(`  ${f}`));
}

// ---------- 4. 安全检查 ----------
if (process.argv.includes('--apply')) {
    console.log('\n=== SAFETY CHECK ===');
    let selfLinks = 0;
    let doubleWraps = 0;
    for (const file of files) {
        const c = fs.readFileSync(path.join(bioDir, file), 'utf-8');
        const sm = c.match(nameRegexInMDX);
        if (sm && c.includes(`<a href="../${sm[1]}/">${sm[1]}</a>`)) selfLinks++;
        if (/<a\s[^>]*>[^<]*<a\s/.test(c)) doubleWraps++;
    }
    console.log(`Self-links found: ${selfLinks} (should be 0)`);
    console.log(`Double-wrapped <a> tags: ${doubleWraps} (should be 0)`);
}
