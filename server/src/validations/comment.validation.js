import { body } from 'express-validator';

export const commentContentValidation = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
];
