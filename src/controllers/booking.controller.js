
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBookingById,
  confirmBooking,
  cancelBooking,
} from "../services/booking.service.js";

// Create Booking
export const createBookingController = async (req, res, next) => {
  try {
    const booking = await createBooking(
      req.validatedData.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Bookings
export const getUserBookingsController = async (req, res, next) => {
  try {
    const bookings = await getUserBookings(req.user.id);

    res.status(200).json({
      success: true,
      message: "User bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get Host Bookings
export const getHostBookingsController = async (req, res, next) => {
  try {
    const bookings = await getHostBookings(req.user.id);

    res.status(200).json({
      success: true,
      message: "Host bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get Booking By ID
export const getBookingByIdController = async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm Booking
export const confirmBookingController = async (req, res, next) => {
  try {
    const booking = await confirmBooking(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Booking
export const cancelBookingController = async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
