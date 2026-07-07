// Polymorphic like/dislike record shared by Videos (Phase 6) and Comments
// (Phase 6). Introduced now because "liked videos" is a Phase 4 user
// feature; the like/dislike controller that writes to this collection lands
// in Phase 6.

import mongoose from 'mongoose';
import { TARGET_TYPES, REACTION_TYPES } from '../utils/constants.js';

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: Object.values(TARGET_TYPES), required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    type: { type: String, enum: Object.values(REACTION_TYPES), required: true },
  },
  { timestamps: true }
);

// One reaction per user per target; also the upsert key used when toggling.
likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
