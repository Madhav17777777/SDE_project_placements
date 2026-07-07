import slugify from 'slugify';
import Category from '../models/category.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadBuffer, deleteAsset } from './cloudinary.service.js';

export const listCategories = () => Category.find().sort({ viewerCount: -1, name: 1 });

export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

export const createCategory = async ({ name }, file) => {
  const existing = await Category.findOne({ name });
  if (existing) throw ApiError.conflict('Category already exists');

  const slug = slugify(name, { lower: true, strict: true });
  let thumbnail = '';
  let thumbnailPublicId;

  if (file) {
    const result = await uploadBuffer(file.buffer, { folder: 'streamverse/categories' });
    thumbnail = result.secure_url;
    thumbnailPublicId = result.public_id;
  }

  return Category.create({ name, slug, thumbnail, thumbnailPublicId });
};

export const updateCategory = async (id, { name }, file) => {
  const category = await Category.findById(id).select('+thumbnailPublicId');
  if (!category) throw ApiError.notFound('Category not found');

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }

  if (file) {
    const result = await uploadBuffer(file.buffer, { folder: 'streamverse/categories' });
    if (category.thumbnailPublicId) await deleteAsset(category.thumbnailPublicId);
    category.thumbnail = result.secure_url;
    category.thumbnailPublicId = result.public_id;
  }

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Category not found');
};
