// Winston logger: colorized/readable console output in development,
// structured JSON to rotating-by-run files in `logs/` always.
// Morgan is wired (in requestLogger.middleware.js) to pipe HTTP access logs
// through this same logger instead of writing straight to stdout, so every
// log line — app logs and access logs — ends up in one place with one format.

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', '..', 'logs');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `[${ts}] ${level}: ${stack || message}`)
);

export const logger = winston.createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
  ],
  exitOnError: false,
});

if (!env.isProd) {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

// Stream interface consumed by Morgan (`morgan('combined', { stream: logger.stream })`)
logger.stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};
