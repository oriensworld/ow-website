import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "Architecture",
      "Game Dev",
      "Software",
      "Web",
      "Graphics",
      "Photography",
    ]),
    context: z
      .enum(["Client Work", "Internal", "Collaborative", "R&D", "Academic", "Individual"])
      .optional(),
    icon: z.string().default("◇"),
    coverImage: z.string().optional(),
    coverImageGif: z.string().optional(),
    images: z.array(z.string()).default([]),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    liveUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z
      .enum(["Engineering", "Design", "Tutorial", "Industry", "Announcements"])
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
