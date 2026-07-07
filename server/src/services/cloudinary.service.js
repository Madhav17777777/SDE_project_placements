// Streams an in-memory Multer buffer straight to Cloudinary (no temp file on
// disk — important since Render's filesystem is ephemeral). Used by avatar/
// banner uploads now, and by thumbnail/video uploads from Phase 5 onward.

import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

export const uploadBuffer = (buffer, { folder, resourceType = 'image' }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(ApiError.internal(`Cloudinary upload failed: ${error.message}`));
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });

export const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
