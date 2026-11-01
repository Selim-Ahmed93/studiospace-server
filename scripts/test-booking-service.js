import mongoose from "mongoose";
import { connectDB, mongoClient } from "../src/config/db.js";

import Studio from "../src/models/studio.model.js";
import Booking from "../src/models/booking.model.js";

import {
  createBooking,
  confirmBooking,
} from "../src/services/booking.service.js";

const testUserId = `test-user-${Date.now()}`;
const testStudioOwnerId = `test-owner-${Date.now()}`;

let testStudioId;

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
};

const runTests = async () => {
  try {
    await connectDB();

    // Create Temporary Test Studio
    const studio = await Studio.create({
      title: "Temporary Booking Test Studio",
      category: "Photography Studio",
      hourlyRate: 100,
      securityDeposit: 0,
      maxCapacity: 5,
      location: {
        address: "Test Address",
        city: "Dhaka",
        country: "Bangladesh",
      },
      images: ["https://example.com/test-studio.jpg"],
      amenities: [],
      overview: "Temporary studio for booking service testing.",
      ownerId: testStudioOwnerId,
      ownerEmail: "test-owner@example.com",
      ownerName: "Test Owner",
    });

    testStudioId = studio._id;

    console.log("\n--- Booking Service Tests ---\n");

    // Test 1: Create Booking
    const booking = await createBooking(
      {
        studioId: testStudioId.toString(),
        bookingDate: "2099-01-15",
        startTime: "10:00",
        endTime: "12:00",
      },
      testUserId
    );

    assert(
      booking.status === "Pending",
      "Booking created with Pending status"
    );

    // Test 2: Server-side Price Calculation
    assert(
      booking.totalAmount === 200,
      "Server calculates booking price correctly"
    );

    // Test 3: Confirm Booking
    const confirmedBooking = await confirmBooking(
      booking._id.toString(),
      testStudioOwnerId
    );

    assert(
      confirmedBooking.status === "Confirmed",
      "Host can confirm a Pending booking"
    );

    // Test 4: Prevent Double Booking
    let conflictDetected = false;

    try {
      await createBooking(
        {
          studioId: testStudioId.toString(),
          bookingDate: "2099-01-15",
          startTime: "11:00",
          endTime: "13:00",
        },
        `another-user-${Date.now()}`
      );
    } catch (error) {
      conflictDetected = error.statusCode === 409;
    }

    assert(
      conflictDetected,
      "Confirmed booking prevents overlapping booking"
    );

    console.log("\nAll Booking Service Tests Passed!");
  } catch (error) {
    console.error("\nTEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    // Clean Up Temporary Test Data
    if (testStudioId) {
      await Booking.deleteMany({ studioId: testStudioId });
      await Studio.deleteOne({ _id: testStudioId });
      console.log("\nTemporary test data cleaned up.");
    }

    await mongoose.disconnect();
    await mongoClient.close();
  }
};

runTests();