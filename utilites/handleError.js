export const handleError = (res, error, status = 500, message) => {
  console.error(error);
  return res.status(status).json({
    status,
    message: message || error.message || "An error occurred",
  });
};