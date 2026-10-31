import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check authentication
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Attach user and session to request
    req.user = session.user;
    req.session = session.session;

    // Continue to next middleware or controller
    next();
  } catch (error) {
    next(error);
  }
};