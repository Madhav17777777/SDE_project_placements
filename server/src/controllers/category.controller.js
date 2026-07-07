import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as categoryService from '../services/category.service.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  new ApiResponse(200, { categories }, 'Categories fetched').send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  new ApiResponse(200, { category }, 'Category fetched').send(res);
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  new ApiResponse(201, { category }, 'Category created').send(res);
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
  new ApiResponse(200, { category }, 'Category updated').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  new ApiResponse(200, null, 'Category deleted').send(res);
});
