import { cn } from '../../utils/cn.js';

// Shimmering placeholder block used everywhere data is still loading --
// stream cards, video cards, profile headers.
const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

export const StreamCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-video w-full rounded-2xl" />
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

export default Skeleton;
