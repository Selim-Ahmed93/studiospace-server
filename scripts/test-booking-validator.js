import { createBookingSchema } from "../src/validators/booking.validator.js";

const validBooking = {
  body: {
    studioId: "507f1f77bcf86cd799439011",
    bookingDate: "2026-12-15",
    startTime: "10:00",
    endTime: "12:00",
  },
};

const testCases = [
  {
    name: "Valid Booking",
    data: validBooking,
    expected: true,
  },
  {
    name: "Invalid Studio ID",
    data: {
      body: { ...validBooking.body, studioId: "invalid-id" },
    },
    expected: false,
  },
  {
    name: "Invalid Date",
    data: {
      body: { ...validBooking.body, bookingDate: "2026-02-30" },
    },
    expected: false,
  },
  {
    name: "Invalid Time Format",
    data: {
      body: { ...validBooking.body, startTime: "25:00" },
    },
    expected: false,
  },
  {
    name: "Less Than One Hour",
    data: {
      body: { ...validBooking.body, startTime: "10:00", endTime: "10:30" },
    },
    expected: false,
  },
];

let passed = 0;

for (const test of testCases) {
  const result = createBookingSchema.safeParse(test.data);
  const success = result.success === test.expected;

  console.log(`${success ? "PASS" : "FAIL"}: ${test.name}`);

  if (success) passed++;
}

console.log(`\nResult: ${passed}/${testCases.length} tests passed`);

if (passed !== testCases.length) {
  process.exitCode = 1;
}