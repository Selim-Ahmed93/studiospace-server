import express from "express";

import {
  createStudioController,
  getStudiosController,
  getStudioByIdController,
  updateStudioController,
  deleteStudioController,
} from "../controllers/studio.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createStudioSchema,
  updateStudioSchema,
  studioQuerySchema,
} from "../validators/studio.validator.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", validate(studioQuerySchema), getStudiosController);
router.get("/:id", getStudioByIdController);

// Protected Routes
router.post(
  "/",
  authenticate,
  validate(createStudioSchema),
  createStudioController
);

router.patch(
  "/:id",
  authenticate,
  validate(updateStudioSchema),
  updateStudioController
);

router.delete("/:id", authenticate, deleteStudioController);

export default router;


