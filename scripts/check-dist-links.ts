// 扫描构建产物（dist/）里的站内链接：
// - 站内链接（绝对路径和相对路径都算）解析后必须带结尾斜杠（错误）：不带斜杠时线上每次点击都要多一次 301 跳转，
//   本地 dev（trailingSlash: 'always'）则会显示提醒页
// - 链接指向的页面或文件不存在（警告）：覆盖组件生成的链接，内容正文里的链接另由 check:content 检查
// 需要先运行 npm run build。
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
if (!fs.existsSync(DIST)) {
    console.error('找不到 dist/，请先运行 npm run build');
    process.exit(1);
}

const files = fs.globSync('**/*.html', { cwd: DIST });
const exists = (urlPath: string) => {
    const target = path.join(DIST, decodeURIComponent(urlPath));
    return fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
};

const errors = new Map<string, Set<string>>();
const warnings = new Map<string, Set<string>>();
const add = (bucket: Map<string, Set<string>>, message: string, page: string) => {
    if (!bucket.has(message)) bucket.set(message, new Set());
    bucket.get(message)!.add(page);
};

for (const file of files) {
    const page = '/' + file.replace(/\\/g, '/').replace(/index\.html$/, '');
    const html = fs.readFileSync(path.join(DIST, file), 'utf8');
    for (const [, href] of html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)) {
        if (!href || /^([a-z]+:|\/\/|#)/i.test(href)) continue;
        const url = new URL(href, `https://site.invalid${page}`);
        const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
        if (!isFile && !url.pathname.endsWith('/')) {
            const resolved = href.startsWith('/') ? '' : `（解析为 ${url.pathname}）`;
            add(errors, `站内链接缺少结尾斜杠：${href}${resolved}`, page);
        }
        if (!exists(url.pathname)) add(warnings, `链接目标不存在：${href} → ${url.pathname}`, page);
    }
}

const report = (bucket: Map<string, Set<string>>, prefix: string) => {
    for (const [message, pages] of bucket) {
        const list = [...pages];
        console.log(`${prefix}  ${message}\n   出现在 ${list.length} 个页面，如 ${list.slice(0, 3).join('、')}`);
    }
};
report(errors, '\x1b[31m✖ 错误\x1b[0m');
report(warnings, '\x1b[33m⚠ 警告\x1b[0m');
console.log(`\n共扫描 ${files.length} 个页面，发现 ${errors.size} 类错误、${warnings.size} 类警告。`);

if (errors.size > 0) {
    process.exit(1);
}
