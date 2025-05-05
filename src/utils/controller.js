const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createResponse = (res, statusCode, data) => {
  if (statusCode === 204) {
    return res.status(204).end();
  }
  return res.status(statusCode).json(data);
};

const notFound = (res, resource = 'Resource') => 
  createResponse(res, 404, { message: `${resource} not found` });

module.exports = {
  asyncHandler,
  createResponse,
  notFound
};
