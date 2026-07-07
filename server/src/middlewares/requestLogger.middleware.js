// Morgan writes HTTP access logs through Winston's stream instead of
// straight to stdout, so app logs and access logs share one format and one
// set of file transports (see config/logger.js).

import morgan from 'morgan';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

const format = env.isProd ? 'combined' : 'dev';

export const requestLogger = morgan(format, {
  stream: env.isProd ? logger.stream : undefined, // in dev, let morgan print directly (colorized)
  skip: () => env.isTest,
});
