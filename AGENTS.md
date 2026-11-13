# AGENTS.md

本文件是给 AI 编程助手（Claude Code、Trae、Cursor、Codex 等）的项目说明，也是团队约定的唯一来源。修改约定时只改这里；`CLAUDE.md` 和 `.trae/rules/` 只是指向本文件的入口。

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
- frontmatter 只需要 `title` 和 `tags`（百科词条没有发布日期、摘要；`isFeatured`、`publishDate`、`excerpt` 已从 schema 删除，写了会被 `check:content` 提示为多余字段）。
- tags 约定：一个分类标签（如 `biography`）+ 一个 `wiki-<拼音首字母>` 标签。`src/pages/projects/[...id].astro` 用"第一个非 `wiki-` 标签"分组，组内按标题拼音（`pinyin-pro`，`src/utils/sort-by-pinyin.ts`）排序，生成上一篇/下一篇。
- 标签显示名与 slug 的映射在 `src/utils/data-utils.ts` 的 `TAG_SLUG_MAP`；未登记的标签会被 `check:content` 报 warning。新增分类标签时要同步这里。
- 重名词条（如人物「陈到」与同名特殊护卫）：在 `disambiguation/` 下建同名消歧义页（tags 为 `disambiguation` + `wiki-<首字母>`），正文链接到各个词条；被消歧义的原词条去掉 `wiki-` 音序标签，只保留分类标签，音序索引里只列消歧义页。`check:content` 会对缺消歧义页、原词条残留音序标签报 warning。

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
- 共用 helper：`tests/helpers/fixtures.ts`（`blogEntry` / `projectEntry` 构造带类型的条目）；组件测试的 `setupFiles` 统一把 `astro:content` 的 `getCollection` mock 成读磁盘（Vitest 下真实的 getCollection 在全新 checkout 会静默返回空数组）；`tests/e2e/helpers.ts` 提供 `onlyOn(project, reason)` 和 `expectNoNavigation(page, action)`，后者用来断言"不应跳转"，不要再用 `waitForTimeout`。

### 其他

- 站点配置（导航、Hero 等）在 `src/data/site-config.ts`。
- GA4、Algolia、Waline 的 ID 和地址集中在 `site-config.ts` 的具名导出 `thirdParty`（都是公开的客户端配置，项目不依赖 `.env`）。客户端 `<script>` 只导入 `thirdParty`，不要导入默认的 `siteConfig`，否则整份站点配置会被打进浏览器 JS。
- 评论（`WalineComments.astro`）、搜索框（`AlgoliaSearch.astro`，只在 `/tags/` 使用）、回到顶部按钮都是普通 Astro `<script>`，在 `astro:page-load` 里初始化以兼容 ClientRouter 换页；React 只用于人物页和 blog 里的图表。
- Waline 的 JS 和样式来自 npm 包 `@waline/client`（版本由 package-lock 锁定），只在有评论区的页面加载；本站对官方样式的覆盖在 `src/styles/waline.css`，升级 Waline 后要确认这几条覆盖的选择器仍然存在。

## 约定

- Commit message 用中文 Conventional Commits：内容变更用 `docs:`，组件/脚本用 `feat:` / `refactor:` 等，可带 scope（如 `refactor(bio):`）。
- 版本分区标题统一用语义变体类：本传写 `<h2 class="section-title section-title--base">本传</h2>`，星命诀写 `<h2 class="section-title section-title--dlc">星命诀</h2>`；组件内用 `<SectionTitle tone="base">` / `<SectionTitle tone="dlc">`。配色与 `src/data/editions.ts` 保持一致，不要另写 Tailwind 字号、字重或颜色。
- 兵种词条的术语性说明写进对应版本的 `terms` 字段（`ClassData.terms`，字符串数组，逐段渲染在 `description` 摘要之后），不要再单开「术语（本传）」「术语（星命诀）」h2 分区；`check:content` 会拦截这类回流。
- Prettier：4 空格缩进、单引号、printWidth 160、无尾逗号；`md`/`mdx`/`yaml` 为 2 空格。

## 改动守则

- 修改词条展示时改布局组件，不要逐个改 `src/content/` 下的 MDX。
- 新代码用 TypeScript，避免 `any`；确需使用时注释说明原因。
- 不擅自引入新依赖；确实需要时先说明理由和替代方案，与团队确认后再装。
- 不要随手运行 `scripts/*.cjs`（见上文"数据批处理脚本"）。
- 只改与任务相关的文件，不顺手格式化或"统一"无关代码。
- 纯函数改动补 `tests/*.test.ts`；关键组件改动在 `tests/components/` 补测试或更新快照（并说明快照为什么变化）。
- 提交前至少跑一遍 CI 阻塞项：`npm run typecheck`、`npm test`、`npm run test:components`、`npm run check:content`、`npm run build && npm run check:links`。
