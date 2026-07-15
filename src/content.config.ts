import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, pagesSchema, projectsSchema } from './content-schemas';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
    schema: blogSchema
});

const pages = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
    schema: pagesSchema
});

const projects = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: projectsSchema
});

export const collections = { blog, pages, projects };
