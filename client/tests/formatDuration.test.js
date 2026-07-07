import { describe, it, expect } from 'vitest';
import { formatDuration, timeAgo } from '../src/utils/formatDuration.js';

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hour-plus durations as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('handles zero and missing input', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(undefined)).toBe('0:00');
  });
});

describe('timeAgo', () => {
  it('reports "just now" for very recent timestamps', () => {
    expect(timeAgo(new Date())).toBe('just now');
  });

  it('reports minutes/hours/days ago for older timestamps', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe('5 minutes ago');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe('2 hours ago');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe('3 days ago');
  });
});
