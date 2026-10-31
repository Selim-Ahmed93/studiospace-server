import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { env } from "./env.js";
import { mongoClient, mongoDb } from "./db.js";

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

  // Trusted frontend origin
  trustedOrigins: [env.CLIENT_URL],

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
});