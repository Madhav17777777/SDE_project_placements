// Cloudinary SDK configuration. Upload/delete helper functions live in
// services/cloudinary.service.js (Phase 4) — this file only configures the
// singleton SDK instance so it's ready wherever it's imported.

import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
