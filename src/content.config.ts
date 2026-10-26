import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, COLLECTION_BASES, CONTENT_PATTERN, pagesSchema, projectsSchema } from './content-schemas';

const blog = defineCollection({
    loader: glob({ pattern: CONTENT_PATTERN, base: COLLECTION_BASES.blog }),
    schema: blogSchema
});

const pages = defineCollection({
    loader: glob({ pattern: CONTENT_PATTERN, base: COLLECTION_BASES.pages }),
    schema: pagesSchema
});

const projects = defineCollection({
    loader: glob({ pattern: CONTENT_PATTERN, base: COLLECTION_BASES.projects }),
    schema: projectsSchema
});

export const collections = { blog, pages, projects };
