/**
 * Middleware to add Socket.IO instance to request object
 * This allows controllers to easily access the Socket.IO server
 */
export const socketMiddleware = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

/**
 * Helper function to get Socket.IO instance from Express app
 * @param {Object} app Express application instance
 * @returns {Object} Socket.IO server instance
 */
export const getSocketIO = (app) => {
  return app.get('io');
};
