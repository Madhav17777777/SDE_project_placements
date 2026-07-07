import { body } from 'express-validator';

export const createChannelValidation = [
  body('channelName')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Channel name must be 3-30 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

export const editChannelValidation = [
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('socials').optional().isObject().withMessage('Socials must be an object'),
];
