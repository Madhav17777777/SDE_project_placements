// Wraps an async Express route handler so any thrown error (or rejected
// promise) is forwarded to next(err) automatically. Without this, every
// controller would need its own try/catch — this is the one place that
// boilerplate lives.
//
// Usage: router.post('/signup', asyncHandler(authController.signup))

const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};

export default asyncHandler;
