import { z } from "zod";

const bookingSchema = z.object({
  studioId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid studio ID"),

  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((date) => {
      const parsedDate = new Date(`${date}T00:00:00.000Z`);

      return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
      );
    }, "Invalid booking date"),

  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time"),

  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time"),
}).refine((data) => {
  const [startHour, startMinute] = data.startTime.split(":").map(Number);
  const [endHour, endMinute] = data.endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return end - start >= 60;
}, {
  message: "Minimum booking duration is 1 hour",
  path: ["endTime"],
});

export const createBookingSchema = z.object({
  body: bookingSchema,
});