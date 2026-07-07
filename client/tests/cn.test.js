import { describe, it, expect } from 'vitest';
import { cn } from '../src/utils/cn.js';

describe('cn', () => {
  it('joins truthy class names with a space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values (false, undefined, null, empty string)', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b');
  });

  it('returns an empty string when everything is falsy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});
