export function successResponse(res, data = {}, message = "", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
    error: null,
  });
}

export function errorResponse(res, message = "Internal server error", status = 500, error = null) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error: error || message,
  });
}



