// 把汇文明朝、汇文正楷的原始 TTF 切成站内子集的 woff2 分片，输出到 src/assets/fonts/，由 global.css 导入。
// 一次性脚本：新增内容出现新字、或换字体时手动运行，产物提交进仓库，不接入构建流程：
//   npm run build && node scripts/split-fonts.ts && npm run build
// 原始 TTF 放在 fonts-src/（已 gitignore，体积太大不进仓库）。
//
// 为什么只取站内子集：汇文的字形很精细（woff2 平均每字约 1.2KB，约为思源宋体的 7 倍），
// 按整个字库切片时一页要下载 3–7MB。这里只保留站内用到的字，并按「多少个页面用到」排序后每 CHUNK 个字一片，
// 各页面共用的常用字集中在前几片，浏览器缓存后再翻页基本不用下载。子集之外的字回退到思源宋体。
//
// 生成的字体族：
// - 'Huiwen'：常规字重（100–599）用明朝，加粗（600–900）用正楷，因此加粗的文字自动换成楷体，不再合成粗体
// - 'Huiwen ZhengKai'：只有正楷，供文存版式（wenyan.css）使用；与上面共用同一批 woff2 文件，不会重复下载
import fs from 'node:fs';
import path from 'node:path';
import { fontSplit } from 'cn-font-split';

const SRC = 'fonts-src';
const OUT = 'src/assets/fonts';
const DIST = 'dist';
/** 每个分片的字数：越小每页多下载的无用字越少，请求数越多；30 字约 36KB */
const CHUNK = 30;

type FontJob = { input: string; dir: string; family: string; weight: string };

const jobs: FontJob[] = [
    { input: 'huiwen-mincho-gbk.ttf', dir: 'huiwen-mincho', family: 'Huiwen', weight: '100 599' },
    { input: 'huiwen-zhengkai.ttf', dir: 'huiwen-zhengkai', family: 'Huiwen', weight: '600 900' }
];

if (!fs.existsSync(DIST)) {
    console.error('找不到 dist/，请先运行 npm run build（字频按构建产物里的页面统计）');
    process.exit(1);
}

/** 页面里实际显示的文字：去掉 script/style 和标签，解开常见实体 */
function visibleText(html: string): string {
    return html
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
        .replace(/&(amp|lt|gt|quot|nbsp);/g, ' ');
}

// 统计每个字出现在多少个页面里
const pageCount = new Map<number, number>();
for (const file of fs.globSync('**/*.html', { cwd: DIST })) {
    const chars = new Set<number>();
    for (const ch of visibleText(fs.readFileSync(path.join(DIST, file), 'utf8'))) chars.add(ch.codePointAt(0)!);
    for (const cp of chars) pageCount.set(cp, (pageCount.get(cp) ?? 0) + 1);
}
// src 里出现但页面里没有的字（客户端渲染的文本等）排在最后
for (const file of fs.globSync('src/**/*.{md,mdx,astro,ts,tsx,js}')) {
    for (const ch of fs.readFileSync(file, 'utf8')) {
        const cp = ch.codePointAt(0)!;
        if (!pageCount.has(cp)) pageCount.set(cp, 0);
    }
}
const ordered = [...pageCount.entries()]
    .filter(([cp]) => cp >= 0x20)
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([cp]) => cp);

const subsets: number[][] = [];
for (let i = 0; i < ordered.length; i += CHUNK) subsets.push(ordered.slice(i, i + CHUNK));
console.log(`站内用字 ${ordered.length} 个，${subsets.length} 个分片`);

for (const job of jobs) {
    const input = path.join(SRC, job.input);
    if (!fs.existsSync(input)) {
        console.error(`找不到 ${input}，请先把原始字体放进 ${SRC}/`);
        process.exit(1);
    }
    const outDir = path.join(OUT, job.dir);
    fs.rmSync(outDir, { recursive: true, force: true });
    console.log(`切分 ${input} → ${outDir}`);
    await fontSplit({
        input: new Uint8Array(fs.readFileSync(input)),
        outDir,
        subsets,
        // 按上面的分片原样输出，不自动拆分或合并，也不输出子集之外的字
        autoSubset: false,
        reduceMins: false,
        subsetRemainChars: false,
        css: { fontFamily: job.family, fontWeight: job.weight, fontDisplay: 'swap', compress: false },
        testHtml: false,
        reporter: false,
        renameOutputFont: '[hash:6].[ext]',
        silent: true
    });
    // reporter: false 仍会输出 index.proto（分包报告），网页用不到
    fs.rmSync(path.join(outDir, 'index.proto'), { force: true });
    pruneRemainder(outDir);
}

/** 解析 unicode-range（如 `U+4e00-4e05,U+20`）为码点集合 */
function parseUnicodeRange(range: string): Set<number> {
    const cps = new Set<number>();
    for (const part of range.split(',')) {
        const [from, to = from] = part.trim().replace(/^U\+/i, '').split('-');
        for (let cp = parseInt(from, 16); cp <= parseInt(to, 16); cp++) cps.add(cp);
    }
    return cps;
}

/** cn-font-split 7.4 忽略 subsetRemainChars: false，仍会把子集之外的字另切成分片；
    这里删掉与站内用字没有交集的 @font-face 及其 woff2 文件 */
function pruneRemainder(outDir: string): void {
    const wanted = new Set(ordered);
    const cssPath = path.join(outDir, 'result.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    let removed = 0;
    const pruned = css.replace(/@font-face\s*\{[^}]*\}\s*/g, (rule) => {
        const range = /unicode-range:\s*([^;]+);/.exec(rule)?.[1];
        const url = /url\(["']?\.?\/?([^"')]+)["']?\)/.exec(rule)?.[1];
        if (!range || !url || [...parseUnicodeRange(range)].some((cp) => wanted.has(cp))) return rule;
        fs.rmSync(path.join(outDir, url), { force: true });
        removed++;
        return '';
    });
    fs.writeFileSync(cssPath, pruned);
    console.log(`  删除 ${removed} 个子集之外的分片`);
}

// 正楷另外以 'Huiwen ZhengKai' 常规字重登记一份，供文存使用
const kaiCss = path.join(OUT, 'huiwen-zhengkai', 'result.css');
const kaiOnly = fs
    .readFileSync(kaiCss, 'utf8')
    .replaceAll(/font-family:\s*["']?Huiwen["']?;/g, 'font-family: "Huiwen ZhengKai";')
    .replaceAll(/font-weight:\s*600 900;/g, 'font-weight: 100 900;');
fs.writeFileSync(path.join(OUT, 'huiwen-zhengkai', 'zhengkai-only.css'), kaiOnly);

const files = fs.globSync('**/*.woff2', { cwd: OUT });
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`完成：${files.length} 个 woff2，共 ${(bytes / 1024 / 1024).toFixed(1)} MB`);
