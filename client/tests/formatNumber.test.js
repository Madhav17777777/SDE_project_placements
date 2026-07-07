import { describe, it, expect } from 'vitest';
import { formatNumber } from '../src/utils/formatNumber.js';

describe('formatNumber', () => {
  it('returns small numbers as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with a K suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1200)).toBe('1.2K');
    expect(formatNumber(15000)).toBe('15K');
  });

  it('formats millions with an M suffix', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });

  it('treats non-numeric input as zero', () => {
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber('not a number')).toBe('0');
  });
});
