
import { z } from "zod";

const categories = [
  "Photography Studio",
  "Sound Stage",
  "Podcast Room",
  "Music Studio",
  "Art Workshop",
];

const locationSchema = z.object({
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const createStudioSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    category: z.enum(categories),

    hourlyRate: z.coerce.number().min(0, "Hourly rate cannot be negative"),

    securityDeposit: z.coerce
      .number()
      .min(0, "Security deposit cannot be negative")
      .default(0),

    maxCapacity: z.coerce
      .number()
      .int()
      .min(1, "Maximum capacity must be at least 1"),

    location: locationSchema,

    images: z.array(z.string().url()).min(1, "At least one image is required"),

    amenities: z.array(z.string().trim()).default([]),

    overview: z.string().trim().min(10, "Overview must be at least 10 characters"),
  }),
});

export const updateStudioSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).optional(),
    category: z.enum(categories).optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    securityDeposit: z.coerce.number().min(0).optional(),
    maxCapacity: z.coerce.number().int().min(1).optional(),
    location: locationSchema.optional(),
    images: z.array(z.string().url()).min(1).optional(),
    amenities: z.array(z.string().trim()).optional(),
    overview: z.string().trim().min(10).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
  ),
});

export const studioQuerySchema = z.object({
  query: z.object({
    category: z.enum(categories).optional(),
    city: z.string().trim().optional(),
    search: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  }).refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    "Minimum price cannot be greater than maximum price"
  ),
});
