import mongoose from "mongoose";

import Booking from "../models/booking.model.js";
import Studio from "../models/studio.model.js";

// Custom Error
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate Booking Date
const parseBookingDate = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    throw createError("Invalid booking date format. Use YYYY-MM-DD", 400);
  }

  const bookingDate = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(bookingDate.getTime()) ||
    bookingDate.toISOString().slice(0, 10) !== dateString
  ) {
    throw createError("Invalid booking date", 400);
  }

  return bookingDate;
};

// Validate Booking Time
const calculateDuration = (startTime, endTime) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    throw createError("Invalid time format. Use HH:mm", 400);
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const durationMinutes = endMinutes - startMinutes;

  if (durationMinutes < 60) {
    throw createError("Minimum booking duration is 1 hour", 400);
  }

  return durationMinutes / 60;
};

// Create Booking
export const createBooking = async (bookingData, userId) => {
  const {
    studioId,
    bookingDate: dateString,
    startTime,
    endTime,
  } = bookingData;

  // Validate Studio ID
  if (!mongoose.isValidObjectId(studioId)) {
    throw createError("Invalid studio ID", 400);
  }

  // Find Studio
  const studio = await Studio.findById(studioId);

  if (!studio) {
    throw createError("Studio not found", 404);
  }

  // Prevent Owner from Booking Own Studio
  if (studio.ownerId === userId) {
    throw createError("You cannot book your own studio", 403);
  }

  // Validate Date and Time
  const bookingDate = parseBookingDate(dateString);

  const totalHours = calculateDuration(startTime, endTime);

  // Check Existing Confirmed Booking
  const conflictingBooking = await Booking.findOne({
    studioId,
    bookingDate,
    status: "Confirmed",
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  if (conflictingBooking) {
    throw createError(
      "This studio is already booked for the selected time",
      409
    );
  }

  // Calculate Price on Server
  const hourlyRate = studio.hourlyRate;
  const totalAmount = hourlyRate * totalHours;

  // Create Booking
  const booking = await Booking.create({
    studioId,
    userId,
    hostId: studio.ownerId,
    bookingDate,
    startTime,
    endTime,
    totalHours,
    hourlyRate,
    totalAmount,
    status: "Pending",
  });

  return booking;
};

// Get User Bookings
export const getUserBookings = async (userId) => {
  return await Booking.find({ userId })
    .populate("studioId", "title category location images")
    .sort({ bookingDate: -1, createdAt: -1 })
    .lean();
};

// Get Host Bookings
export const getHostBookings = async (hostId) => {
  return await Booking.find({ hostId })
    .populate("studioId", "title category location images")
    .sort({ bookingDate: -1, createdAt: -1 })
    .lean();
};

// Confirm Booking
export const confirmBooking = async (bookingId, hostId) => {
  // Validate Booking ID
  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID", 400);
  }

  // Find Pending Booking
  const booking = await Booking.findOne({
    _id: bookingId,
    hostId,
    status: "Pending",
  });

  if (!booking) {
    throw createError(
      "Pending booking not found or you are not authorized",
      404
    );
  }

  // Check Time Slot Conflict
  const conflictingBooking = await Booking.findOne({
    _id: { $ne: bookingId },
    studioId: booking.studioId,
    bookingDate: booking.bookingDate,
    status: "Confirmed",
    startTime: { $lt: booking.endTime },
    endTime: { $gt: booking.startTime },
  });

  if (conflictingBooking) {
    throw createError(
      "This time slot is already confirmed for another booking",
      409
    );
  }

  // Confirm Booking
  booking.status = "Confirmed";

  await booking.save();

  return booking;
};

// Cancel Booking
export const cancelBooking = async (bookingId, userId) => {
  // Validate Booking ID
  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID", 400);
  }

  // Find Booking
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ userId }, { hostId: userId }],
  });

  if (!booking) {
    throw createError("Booking not found or unauthorized", 404);
  }

  // Check Booking Status
  if (!["Pending", "Confirmed"].includes(booking.status)) {
    throw createError("This booking cannot be cancelled", 400);
  }

  // Cancel Booking
  booking.status = "Cancelled";

  await booking.save();

  return booking;
};

// Get Booking By ID
export const getBookingById = async (bookingId, userId) => {
  // Validate Booking ID
  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID", 400);
  }

  // Find Booking
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ userId }, { hostId: userId }],
  })
    .populate("studioId", "title category location images hourlyRate")
    .lean();

  if (!booking) {
    throw createError("Booking not found or unauthorized", 404);
  }

  return booking;
};