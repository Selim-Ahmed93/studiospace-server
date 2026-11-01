
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`🚀 StudioSpace Server running on port ${env.PORT}`);
      console.log(`🌐 Server is listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Initialize server
startServer();

