import express from "express";

import {
  createBookingController,
  getUserBookingsController,
  getHostBookingsController,
  getBookingByIdController,
  confirmBookingController,
  cancelBookingController,
} from "../controllers/booking.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema } from "../validators/booking.validator.js";

const router = express.Router();

// All Booking Routes Require Authentication
router.use(authenticate);

// Creator Routes
router.post("/", validate(createBookingSchema), createBookingController);
router.get("/my-bookings", getUserBookingsController);

// Host Routes
router.get("/host-bookings", getHostBookingsController);
router.patch("/:id/confirm", confirmBookingController);

// Shared Routes
router.get("/:id", getBookingByIdController);
router.patch("/:id/cancel", cancelBookingController);

export default router;