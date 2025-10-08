export const handleError = (res, error, status = 500, message) => {
  console.log(error);
  return res.json({
    status,
    message: message || error.message || "An error occurred",
  });
};