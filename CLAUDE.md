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
npm run check:content    # 内容 frontmatter 校验（scripts/validate-content.ts）
```

- 单个文件：`node --test tests/sort-by-pinyin.test.ts`、`npx vitest run tests/components/pagination.test.ts`、`npx playwright test tests/e2e/smoke.spec.ts`
- 更新组件快照：`npx vitest run -u`
- Node 24 直接运行 `.ts`（type stripping），因此 `tests/*.test.ts` 和 `scripts/validate-content.ts` 不需要编译；导入本地 TS 文件时要写 `.ts` 后缀。
- CI（`.github/workflows/ci.yml`）阻塞项：typecheck、`npm test` + `test:components`、`check:content`、build；e2e 为非阻塞。提交前至少跑这四项。

## 架构要点

### 内容集合

`src/content.config.ts` 定义三个集合：`blog`、`pages`、`projects`。schema 统一放在 `src/content-schemas.ts`，并且**必须从 `astro/zod` 导入 `z`**（不能用 `astro:content` 或裸 `zod`）：这份 schema 同时给 Astro 构建和纯 Node 的 `scripts/validate-content.ts` 使用，虚拟模块在 Node 下无法解析，裸 zod v3 又会和 Astro 内部的 zod v4 冲突。

### `projects` = 游戏百科

`src/content/projects/<类别>/` 下有约 1000 个 `.mdx` 词条：`bio`（人物）、`trait`（特性）、`treasure`（宝物）、`class`（兵种）、`stage`（关卡）、`equipment`（装备）、`wiki`（杂项）。

- 每个词条的 MDX 正文基本只是导入一个布局组件并传入大量 props，例如 `bio/*.mdx` → `BiographyLayout.astro`（少数用 `BiographyLayout2.astro`），其余类别 → `Layout_*.astro` 系列。修改词条展示时要改组件，不是逐个改 MDX。
- tags 约定：一个分类标签（如 `biography`）+ 一个 `wiki-<拼音首字母>` 标签。`src/pages/projects/[...id].astro` 用"第一个非 `wiki-` 标签"分组，组内按标题拼音（`pinyin-pro`，`src/utils/sort-by-pinyin.ts`）排序，生成上一篇/下一篇。
- 标签显示名与 slug 的映射在 `src/utils/data-utils.ts` 的 `TAG_SLUG_MAP`；未登记的标签会被 `check:content` 报 warning。新增分类标签时要同步这里。

### 名称 → 链接映射表（生成文件）

`src/components/characterMap.js`、`itemMap.js`、`classMap.jsx` 把中文名映射到词条 URL，供布局组件自动生成交叉链接。前两者由脚本生成：

- `node scripts/generate-character-map.cjs`（扫描 `bio/`）
- `node scripts/generate-item-map.cjs`（扫描 `treasure/` + `equipment/`）

新增、重命名或改 slug 后需要重新运行对应脚本，否则链接会退化成纯文本。

### 数据批处理脚本

`scripts/*.cjs` 是一次性/批量维护内容的 CommonJS 脚本（生成宝物、装备、特性、兵种页面，更新所属者等），数据源是 `src/components/` 下的游戏导出文本（`item.txt`、`item - dlc.txt`、`bingzhuang.txt`、`class.xlsx` 等）以及 `scripts/*.json`。部分生成脚本带有 `SKIP` 列表，用来保护手写内容不被覆盖；运行前先确认不会覆盖已手工编辑的词条。

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
