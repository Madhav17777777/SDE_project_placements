// Fallback category tiles shown before the real /api/v1/categories list
// loads (or if it's empty on a fresh database) -- keeps the Home page's
// "Popular Categories" row from ever rendering blank.
export const FALLBACK_CATEGORIES = [
  { name: 'Just Chatting', slug: 'just-chatting' },
  { name: 'Software Development', slug: 'software-development' },
  { name: 'Music', slug: 'music' },
  { name: 'Art', slug: 'art' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Sports', slug: 'sports' },
];
