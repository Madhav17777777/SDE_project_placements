// 1234 -> "1.2K", 1200000 -> "1.2M". Used for viewer counts, follower
// counts, and video view counts throughout the app.
export const formatNumber = (value) => {
  const num = Number(value) || 0;
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0)}K`;
  return `${(num / 1_000_000).toFixed(1)}M`;
};
