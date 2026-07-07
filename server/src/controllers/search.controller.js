import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as searchService from '../services/search.service.js';

export const search = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const result = await searchService.search(q, type, req.query);
  new ApiResponse(200, result, 'Search results fetched').send(res);
});
