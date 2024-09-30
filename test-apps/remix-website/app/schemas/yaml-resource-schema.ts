import { z } from "zod";

export const yamlResourceSchema = z.array(
  z.object({
    title: z.string().min(1),
    imgSrc: z.string().url(),
    repoUrl: z.string().url(),
    initCommand: z.string().min(1),
    category: z.union([z.literal("templates"), z.literal("libraries")]),
    featured: z.boolean().optional(),
  }),
);
export type ResourceYamlData = z.infer<typeof yamlResourceSchema>[0];
