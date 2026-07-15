import { z } from 'astro/zod';

// content.config.ts 原本直接从 astro:content 导入 z 来定义这些 schema，
// 但 astro:content 是虚拟模块，纯 Node 脚本（比如内容完整性校验脚本）
// 解析不了。改用 astro/zod——它是 astro 包的一个真实子路径导出（不是
// astro: 虚拟模块），纯 Node/Vitest 下能正常解析，跟 astro/container、
// astro/loaders 是同一类东西；同时它就是 Astro 内部实际使用的 Zod
// 实例（Astro 6 起是 Zod v4）。之前这里直接导入裸的 zod 包（锁定
// v3），基础的 safeParse 校验能跑，但 Astro 内部生成 JSON schema 时
// 会因为 v3/v4 对象结构不一致报错（.def 在 v3 是 ._def）。content.config.ts
// 和校验脚本共用这一份 schema 对象，不会出现两边各写一套、以后跑偏
// 的问题。

export const seoSchema = z.object({
    title: z.string().min(5).max(120).optional(),
    description: z.string().min(15).max(160).optional(),
    image: z
        .object({
            src: z.string(),
            alt: z.string().optional()
        })
        .optional(),
    pageType: z.enum(['website', 'article']).default('website')
});

export const blogSchema = z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    seo: seoSchema.optional()
});

export const pagesSchema = z.object({
    title: z.string(),
    seo: seoSchema.optional()
});

export const projectsSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().nullish(),
    publishDate: z.coerce.date().optional(),
    isFeatured: z.boolean().default(false),
    seo: seoSchema.optional(),
    tags: z.array(z.string()).default([])
});
