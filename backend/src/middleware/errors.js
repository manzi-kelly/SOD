import { HttpError } from '../utils/httpError.js';

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const notFoundHandler = (req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  const message =
    status >= 500 ? 'Something went wrong while processing the request.' : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
};
