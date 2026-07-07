// Wraps an IntersectionObserver around a sentinel <div ref={sentinelRef} />
// placed at the bottom of a list, calling `onIntersect` (typically
// useInfiniteQuery's `fetchNextPage`) whenever it scrolls into view.
import { useEffect, useRef } from 'react';

export const useInfiniteScroll = (onIntersect, { enabled = true } = {}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
};
