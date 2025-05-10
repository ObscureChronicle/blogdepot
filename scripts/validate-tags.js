// scripts/validate-tags.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '../src/content/blog');

function validateFrontmatter(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);
    const tags = parsed.data.tags;
    const errors = [];

    if (parsed.data.tag && !tags) {
        errors.push(`❌ 使用了 tag: 而不是 tags:`);
    }

    if (tags === undefined) {
        errors.push(`⚠️ 未设置 tags 字段`);
    } else if (!Array.isArray(tags)) {
        errors.push(`❌ tags 应该是数组，但目前是：${typeof tags}`);
    } else {
        tags.forEach((tag, index) => {
            if (typeof tag !== 'string' || tag.trim() === '') {
                errors.push(`❌ tags[${index}] 非法值：${JSON.stringify(tag)}`);
            }
        });
    }

    if (errors.length > 0) {
        console.log(`\n📄 文件: ${filePath}`);
        errors.forEach((err) => console.log('   ' + err));
    }
}

function runValidation() {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));
    console.log(`🔍 正在检查 ${files.length} 篇文章的 tags...\n`);

    files.forEach((file) => {
        const fullPath = path.join(contentDir, file);
        validateFrontmatter(fullPath);
    });

    console.log(`\n✅ 检查完成！`);
}

runValidation();
