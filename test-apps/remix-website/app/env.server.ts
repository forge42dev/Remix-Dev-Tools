import { z } from "zod";

const requiredInProduction: z.RefinementEffect<
  string | undefined
>["refinement"] = (value, ctx) => {
  if (process.env.NODE_ENV === "production" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable" + ctx.path.join("."),
    });
  }
};

const requiredInDevelopment: z.RefinementEffect<
  string | undefined
>["refinement"] = (value, ctx) => {
  if (process.env.NODE_ENV === "development" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable" + ctx.path.join("."),
    });
  }
};

const envSchema = z.object({
  // Get from https://app.convertkit.com/account_settings/advanced_settings
  CONVERTKIT_KEY: z.string().optional().superRefine(requiredInProduction),

  // A token to increase the rate limiting from 60/hr to 1000/hr
  GITHUB_TOKEN: z.string().optional().superRefine(requiredInProduction),

  // GitHub repo to pull docs from
  SOURCE_REPO: z.string(),

  // Package from which to base docs version
  RELEASE_PACKAGE: z.string(),

  // For development, reading the docs from a local repo
  LOCAL_REPO_RELATIVE_PATH: z
    .string()
    .optional()
    .superRefine(requiredInDevelopment),

  NO_CACHE: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
