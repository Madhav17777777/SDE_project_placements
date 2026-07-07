// Configures and exports the Express app WITHOUT starting an HTTP listener.
// Keeping this separate from server.js is what lets Jest/Supertest import
// `app` directly and fire requests at it in-process, with no real port and
// no Socket.io server needed for pure HTTP route tests.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';

import passport from './config/passport.js';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import ApiResponse from './utils/ApiResponse.js';
import routes from './routes/index.js';

const app = express();

// --- Security ---
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(mongoSanitize()); // strips $ and . operators from req.body/query/params
app.use(hpp()); // guards against HTTP parameter pollution on query strings

// --- Core middleware ---
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(compression());
app.use(requestLogger);
app.use(passport.initialize()); // stateless — no passport.session()

// --- Rate limiting (applied to all /api routes; auth routes add authLimiter on top) ---
app.use('/api', apiLimiter);

// --- Health check (used by Render + uptime monitors) ---
app.get('/health', (req, res) => {
  new ApiResponse(200, { uptime: process.uptime() }, 'StreamVerse API is healthy').send(res);
});

// --- API routes ---
app.use('/api/v1', routes);

// --- 404 + centralized error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
