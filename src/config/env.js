import "dotenv/config";
import { z } from "zod";

// Environment variables validation schema
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  MONGODB_DB: z.string().min(1).default("studiospace"),

  CLIENT_URL: z.string().url("Invalid client URL"),

  // Comma-separated extra origins (for example a Vercel preview URL)
  ADDITIONAL_CLIENT_URLS: z.string().optional(),

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "Better Auth secret must be at least 32 characters"),

  BETTER_AUTH_URL: z.string().url("Invalid Better Auth URL"),

  // Optional Google OAuth credentials. Google login is enabled only when
  // both values are provided.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Validate environment variables
const result = envSchema.safeParse(process.env);

// Handle validation errors
if (!result.success) {
  console.error("❌ Invalid environment variables:");

  result.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  });

  process.exit(1);
}

// Build the list of trusted frontend origins from CLIENT_URL and any extras
const additionalClientUrls = (result.data.ADDITIONAL_CLIENT_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const invalidAdditionalUrls = additionalClientUrls.filter(
  (url) => !z.string().url().safeParse(url).success
);

if (invalidAdditionalUrls.length > 0) {
  console.error(
    `❌ Invalid ADDITIONAL_CLIENT_URLS value(s): ${invalidAdditionalUrls.join(", ")}`
  );
  process.exit(1);
}

const clientUrls = Array.from(
  new Set([result.data.CLIENT_URL, ...additionalClientUrls])
);

// Export validated environment variables
export const env = {
  ...result.data,
  CLIENT_URLS: clientUrls,
};
