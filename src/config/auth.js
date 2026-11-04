import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { env } from "./env.js";
import { mongoClient, mongoDb } from "./db.js";

// Google is only enabled when both credentials are present. Trimmed env
// loading in config/env.js turns blank dashboard values into undefined.
export const googleAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
);

const googleProvider = googleAuthEnabled
  ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }
  : {};

// The browser reaches this API through the frontend's same-origin /api/*
// proxy, so auth cookies are first-party even in browsers that block
// third-party cookies. HTTPS deployments still use SameSite=None; Secure for
// compatibility with direct cross-site callers, while local HTTP development
// keeps the browser-friendly SameSite=Lax default.
const isHttps = env.BETTER_AUTH_URL.startsWith("https://");

// Better Auth configuration
export const auth = betterAuth({
  // MongoDB adapter
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),

  // Application URL
  baseURL: env.BETTER_AUTH_URL,

  // Authentication secret
  secret: env.BETTER_AUTH_SECRET,

  // Trusted frontend origins (production URL plus local/preview URLs)
  trustedOrigins: env.CLIENT_URLS,

  // Google social login (enabled only when credentials are configured)
  socialProviders: googleProvider,

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  advanced: {
    useSecureCookies: isHttps,
    defaultCookieAttributes: isHttps
      ? {
          sameSite: "none",
          secure: true,
        }
      : {
          sameSite: "lax",
          secure: false,
        },
  },
});
