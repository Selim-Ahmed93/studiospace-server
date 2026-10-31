import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { authenticate } from "./middlewares/auth.middleware.js";

import { env } from "./config/env.js";
import { auth } from "./config/auth.js";

// Initialize Express application
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Better Auth handler
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudioSpace API is running successfully!",
  });
});

// Protected test API
app.get("/api/protected", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// Export Express application
export default app;