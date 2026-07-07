import { body } from 'express-validator';
import { VIDEO_VISIBILITY } from '../utils/constants.js';

export const uploadVideoValidation = [
  body('title').trim().isLength({ min: 1, max: 140 }).withMessage('Title is required (max 140 chars)'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Description too long'),
  body('category').optional().isMongoId().withMessage('Invalid category id'),
  body('tags').optional(),
  body('visibility').optional().isIn(Object.values(VIDEO_VISIBILITY)).withMessage('Invalid visibility'),
];

export const editVideoValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 140 }).withMessage('Title must be 1-140 chars'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Description too long'),
  body('category').optional().isMongoId().withMessage('Invalid category id'),
  body('visibility').optional().isIn(Object.values(VIDEO_VISIBILITY)).withMessage('Invalid visibility'),
];
