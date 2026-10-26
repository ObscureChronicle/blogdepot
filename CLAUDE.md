# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

基于 Dante Astro 主题的个人博客 + 《后汉稽异录》游戏百科站。Astro 7 + MDX + React islands + Tailwind CSS 4，纯静态输出。绝大部分 commit 是内容（百科词条）变更，代码改动相对少。

## 常用命令

```bash
npm run dev              # 本地开发
npm run build            # 静态构建到 dist/
npm run typecheck        # astro check
npm test                 # 纯逻辑单测：Node 内置 test runner，跑 tests/*.test.ts
npm run test:components  # Vitest + Astro Container API，只跑 tests/components/**
npm run test:e2e         # Playwright：先 build 再用 astro preview（端口 4324）测真实产物
npm run check:content    # 内容校验：frontmatter + 正文站内链接（scripts/validate-content.ts）
npm run check:links      # 扫描 dist/ 的站内链接（需先 build）：缺结尾斜杠报错、目标不存在警告
```

- 单个文件：`node --test tests/sort-by-pinyin.test.ts`、`npx vitest run tests/components/pagination.test.ts`、`npx playwright test tests/e2e/smoke.spec.ts`
- 更新组件快照：`npx vitest run -u`
- Node 24 直接运行 `.ts`（type stripping），因此 `tests/*.test.ts` 和 `scripts/validate-content.ts` 不需要编译；导入本地 TS 文件时要写 `.ts` 后缀。
- CI（`.github/workflows/ci.yml`）阻塞项：typecheck、`npm test` + `test:components`、`check:content`、build + `check:links`；e2e 为非阻塞。提交前至少跑这几项。
- 站内地址统一带结尾斜杠（`astro.config.mjs` 设了 `trailingSlash: 'always'`）：代码里生成的链接要写成 `/projects/bio/caocao/` 这样；本地 dev 打开不带斜杠的地址会显示提醒页而不是自动跳转。

## 架构要点

### 内容集合

`src/content.config.ts` 定义三个集合：`blog`、`pages`、`projects`。schema 统一放在 `src/content-schemas.ts`，并且**必须从 `astro/zod` 导入 `z`**（不能用 `astro:content` 或裸 `zod`）：这份 schema 同时给 Astro 构建和纯 Node 的 `scripts/validate-content.ts` 使用，虚拟模块在 Node 下无法解析，裸 zod v3 又会和 Astro 内部的 zod v4 冲突。

### `projects` = 游戏百科

`src/content/projects/<类别>/` 下有约 1000 个 `.mdx` 词条：`bio`（人物）、`trait`（特性）、`treasure`（宝物）、`class`（兵种）、`stage`（关卡）、`equipment`（装备）、`wiki`（杂项）。

- 每个词条的 MDX 正文基本只是导入一个布局组件并传入大量 props，例如 `bio/*.mdx` → `BiographyLayout.astro`（少数用 `BiographyLayout2.astro`），其余类别 → `Layout_*.astro` 系列。修改词条展示时要改组件，不是逐个改 MDX。
- tags 约定：一个分类标签（如 `biography`）+ 一个 `wiki-<拼音首字母>` 标签。`src/pages/projects/[...id].astro` 用"第一个非 `wiki-` 标签"分组，组内按标题拼音（`pinyin-pro`，`src/utils/sort-by-pinyin.ts`）排序，生成上一篇/下一篇。
- 标签显示名与 slug 的映射在 `src/utils/data-utils.ts` 的 `TAG_SLUG_MAP`；未登记的标签会被 `check:content` 报 warning。新增分类标签时要同步这里。

### 名称 → 链接映射（构建时生成）

布局组件用 `src/utils/wiki-links.ts` 的 `getWikiLink(kind, name)` 把人物、物品、兵种名自动变成词条链接。映射在构建时由 `import.meta.glob` 扫描 `bio/`、`treasure/`、`equipment/`、`class/` 的 frontmatter title 生成（规则在 `wiki-link-parser.ts`），新增或改名词条无需手动运行脚本。

- 人物标题写成「本名（别名）」时两个名字都能链接；物品的别名要在 `ITEM_ALIASES` 里登记（物品括号里可能是注者等，不自动拆）。
- `wiki-links.ts` 只能在服务端渲染的组件里导入；被 `client:*` 水合的组件导入会把全部词条原文打进浏览器 JS。

### 数据批处理脚本

`scripts/*.cjs` 是批量改写词条 MDX 的 CommonJS 脚本，**会直接覆盖文件**，运行前先确认不会冲掉手工编辑的内容：

- `update-class-owners.cjs`：把人物的 `baseclass/dlcclass` 汇总后写进兵种词条的 `baseOwner/dlcOwner`（与持有人表格共用 `wiki-owners-parser.ts`）
- `find-regional-owners.cjs` → `regional-owners.json` → `update-regional-traits.cjs`：重写地域特性词条
- `add-class-links.cjs`：给兵种描述里的兵种名加链接

### 测试分层

- `tests/*.test.ts`：纯函数（utils），零依赖 `node:test`。
- `tests/components/`：用 `experimental_AstroContainer` 渲染组件。整页渲染因 Container API 的 `Astro.site` 局限无法使用，所以只给关键组件做快照；快照里机器相关的绝对路径会先被 normalize。
- `tests/e2e/`：针对 `dist/` 的预览服务，覆盖 desktop 和 mobile（Pixel 5）两个 project。

### 其他

- 站点配置（导航、Hero 等）在 `src/data/site-config.ts`。
- 评论使用 Waline（`WalineComments.tsx`）；GA4、Algolia、Waline 的配置都是硬编码的公开客户端配置，项目不依赖 `.env`。

## 约定

- Commit message 用中文 Conventional Commits：内容变更用 `docs:`，组件/脚本用 `feat:` / `refactor:` 等，可带 scope（如 `refactor(bio):`）。
- Prettier：4 空格缩进、单引号、printWidth 160、无尾逗号；`md`/`mdx`/`yaml` 为 2 空格。
