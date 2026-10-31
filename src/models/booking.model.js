import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Studio Reference
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: [true, "Studio ID is required"],
      index: true,
    },

    // Creator Information
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },

    // Studio Owner Information
    hostId: {
      type: String,
      required: [true, "Host ID is required"],
      index: true,
    },

    // Booking Date and Time
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    // Booking Duration
    totalHours: {
      type: Number,
      required: [true, "Total hours is required"],
      min: [1, "Booking must be at least 1 hour"],
    },

    // Pricing Snapshot
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Hourly rate cannot be negative"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    // Booking Status
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export Booking Model
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;