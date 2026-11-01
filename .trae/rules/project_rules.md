---
alwaysApply: true
---

# 项目规则

**修改代码前，先读取仓库根目录的 `AGENTS.md`**：项目结构、常用命令、架构要点和团队约定都写在那里，以它为准。本文件只列最容易出错的几条，作为兜底。

- 站内链接一律带结尾斜杠，如 `/projects/bio/caocao/`（`trailingSlash: 'always'`）。
- `src/content-schemas.ts` 里的 `z` 必须从 `astro/zod` 导入，不能用 `astro:content` 或裸 `zod`。
- `src/utils/wiki-links.ts` 只能在服务端渲染的组件里导入，不能被 `client:*` 水合的组件导入。
- 修改百科词条的展示要改布局组件，不要逐个改 `src/content/projects/` 下的 MDX。
- 不要随手运行 `scripts/*.cjs`：它们会直接覆盖词条文件。
- 不擅自引入新依赖。
- 提交前跑：`npm run typecheck`、`npm test`、`npm run test:components`、`npm run check:content`、`npm run build && npm run check:links`。
- 代码注释、commit message 使用简体中文。
