import mongoose from "mongoose";

const studioSchema = new mongoose.Schema(
  {
    // Studio Information
    title: {
      type: String,
      required: [true, "Studio title is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Studio category is required"],
      enum: [
        "Photography Studio",
        "Sound Stage",
        "Podcast Room",
        "Music Studio",
        "Art Workshop",
      ],
    },

    // Pricing Information
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Hourly rate cannot be negative"],
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },

    maxCapacity: {
      type: Number,
      required: [true, "Maximum capacity is required"],
      min: [1, "Capacity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Maximum capacity must be a whole number",
      },
    },

    // Location Information
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "Bangladesh",
      },
    },

    // Images
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (images) => images.length > 0,
        message: "At least one studio image is required",
      },
    },

    // Studio Facilities
    amenities: {
      type: [String],
      default: [],
    },

    // Studio Description
    overview: {
      type: String,
      required: [true, "Studio overview is required"],
      trim: true,
    },

    // Studio Owner Information
    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Rating
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Export Studio Model
const Studio = mongoose.model("Studio", studioSchema);

export default Studio;