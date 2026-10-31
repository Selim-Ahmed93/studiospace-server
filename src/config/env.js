import "dotenv/config";
import { z } from "zod";

// Environment variables validation schema
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  MONGODB_DB: z.string().min(1).default("studiospace"),

  CLIENT_URL: z.string().url("Invalid client URL"),

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "Better Auth secret must be at least 32 characters"),

  BETTER_AUTH_URL: z.string().url("Invalid Better Auth URL"),
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

// Export validated environment variables
export const env = result.data;