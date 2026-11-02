// JSON response for unknown routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler so clients always receive JSON instead of an HTML page
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number(err.statusCode || err.status || 500);

  // Keep internal errors private, but preserve useful 4xx messages
  const message =
    statusCode >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  if (statusCode >= 500) {
    console.error("Unhandled API error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
