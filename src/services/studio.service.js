import mongoose from "mongoose";
import Studio from "../models/studio.model.js";
import Booking from "../models/booking.model.js";

// Helper: Create HTTP Error
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// 1. Create New Studio
export const createStudio = async (studioData) => {
  const studio = await Studio.create(studioData);

  return studio;
};

// 2. Get All Studios
export const getStudios = async (query = {}) => {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 12,
  } = query;

  const filters = {};

  // Category Filter
  if (category) {
    filters.category = category;
  }

  // City Filter
  if (city) {
    filters["location.city"] = {
      $regex: city,
      $options: "i",
    };
  }

  // Price Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.hourlyRate = {};

    if (minPrice !== undefined) {
      filters.hourlyRate.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filters.hourlyRate.$lte = Number(maxPrice);
    }
  }

  // Search Filter
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { overview: { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } },
    ];
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const currentLimit = Math.min(
    50,
    Math.max(1, Number(limit) || 12)
  );

  const skip = (currentPage - 1) * currentLimit;

  const [studios, totalStudios] = await Promise.all([
    Studio.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Studio.countDocuments(filters),
  ]);

  return {
    studios,
    pagination: {
      totalStudios,
      currentPage,
      totalPages: Math.ceil(totalStudios / currentLimit),
      limit: currentLimit,
    },
  };
};

// 3. Get Single Studio
export const getStudioById = async (studioId) => {
  if (!mongoose.Types.ObjectId.isValid(studioId)) {
    throw createError("Invalid studio ID", 400);
  }

  const studio = await Studio.findById(studioId).lean();

  if (!studio) {
    throw createError("Studio not found", 404);
  }

  return studio;
};

// 4. Update Studio
export const updateStudio = async (studioId, ownerId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(studioId)) {
    throw createError("Invalid studio ID", 400);
  }

  const studio = await Studio.findOne({ _id: studioId, ownerId });

  if (!studio) {
    throw createError("Studio not found or access denied", 404);
  }

  // Only allow editable fields
  const allowedFields = [
    "title",
    "category",
    "hourlyRate",
    "securityDeposit",
    "maxCapacity",
    "location",
    "images",
    "amenities",
    "overview",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      studio[field] = updateData[field];
    }
  });

  await studio.save();

  return studio;
};

// 5. Delete Studio
export const deleteStudio = async (studioId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(studioId)) {
    throw createError("Invalid studio ID", 400);
  }

  const studio = await Studio.findOne({ _id: studioId, ownerId });

  if (!studio) {
    throw createError("Studio not found or access denied", 404);
  }

  // Check active bookings
  const activeBookings = await Booking.countDocuments({
    studioId,
    status: { $in: ["Pending", "Confirmed"] },
  });

  if (activeBookings > 0) {
    throw createError(
      "Cannot delete studio with pending or confirmed bookings",
      409
    );
  }

  await Studio.deleteOne({ _id: studioId });

  return studio;
};