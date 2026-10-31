import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`🚀 StudioSpace Server running on port ${env.PORT}`);
      console.log(`🌐 API URL: http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Initialize server
startServer();