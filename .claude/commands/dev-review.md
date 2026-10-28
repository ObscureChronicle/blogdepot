---
description: 用 coder + reviewer 两个 subagent 完成一次代码改动（计划 → 实现 → 审查 → 修复，最多 3 轮）
argument-hint: <需求描述>
---

需求：$ARGUMENTS

按下面的流程编排 `coder` 和 `reviewer` 两个 subagent。你（主会话）只负责编排和转述，不直接改代码。

最大审查轮数 MAX_ROUNDS = 3。

## 1. 计划

阅读相关代码，给出简短方案：改哪些文件、怎么改、需要补哪些测试、风险点。**停下来等我确认**，确认前不要调用 coder。需求属于百科 MDX 内容变更时，告诉我它不在本流程范围内。

## 2. 实现

确认后，把方案完整交给 `@coder`（它看不到我们的对话，要把必要背景写进去）。

## 3. 审查

coder 完成后调用 `@reviewer`，告诉它：需求是什么、本轮 coder 报告的改动文件列表、当前是第几轮。开始前已存在的未提交改动（用 `git status` 记录基线）要明确告知 reviewer 不在审查范围内。

## 4. 转述

每轮结束后，在你自己的回复里**原样写出**：

```
第 N 轮
VERDICT: <reviewer 的结论>
检查命令：typecheck=…, npm test=…, test:components=…
```

（`/goal` 的评估器只读对话，不读子 agent 内部输出，所以这一行必须出现在主会话里。）

## 5. 循环

- `CHANGES_REQUESTED` 且轮数 < MAX_ROUNDS：把 reviewer 的 blocker / major 发现原样交回 `@coder` 修复，然后回到第 3 步。
- `CHANGES_REQUESTED` 且已达 MAX_ROUNDS：停止，向我汇报未解决的发现以及 coder 与 reviewer 的分歧点，由我决定。
- coder 认为某条发现不该修并给出理由时，不要强行再跑一轮；把分歧交给我判断。

## 6. 收尾

`APPROVE` 后汇报：改动文件、做了什么、reviewer 列出的 minor 项、检查命令结果，并给出一条中文 Conventional Commits 格式的 commit message 建议。**不要自动 commit 或 push。**
