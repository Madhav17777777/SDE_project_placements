import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, select: false },
    // Denormalized aggregate, refreshed whenever a stream in this category
    // goes live/ends (see stream.service.js) rather than computed on every read.
    viewerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ name: 'text' });

const Category = mongoose.model('Category', categorySchema);

export default Category;
