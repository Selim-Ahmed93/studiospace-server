import "dotenv/config";
import { z } from "zod";

// Optional values pasted into a hosting dashboard often keep a trailing
// newline or surrounding spaces. Trim them and treat blank values as missing
// so a provider is never half-configured by accident.
const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

// Environment variables validation schema
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().trim().min(1, "MongoDB URI is required"),
  MONGODB_DB: z.string().trim().min(1).default("studiospace"),

  CLIENT_URL: z.string().trim().url("Invalid client URL"),

  // Comma-separated extra origins (for example a Vercel preview URL)
  ADDITIONAL_CLIENT_URLS: optionalString,

  BETTER_AUTH_SECRET: z
    .string()
    .trim()
    .min(32, "Better Auth secret must be at least 32 characters"),

  BETTER_AUTH_URL: z.string().trim().url("Invalid Better Auth URL"),

  // Optional Google OAuth credentials. Google login is enabled only when
  // both values are provided.
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
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

// A browser Origin never includes a path or a trailing slash. Normalizing here
// keeps CORS and Better Auth trusted-origin checks in sync when a dashboard
// value is entered as `https://example.com/`.
const normalizeOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
};

const clientUrls = Array.from(
  new Set([result.data.CLIENT_URL, ...additionalClientUrls].map(normalizeOrigin))
);

// Export validated environment variables
export const env = {
  ...result.data,
  CLIENT_URLS: clientUrls,
};
