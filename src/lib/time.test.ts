import { describe, expect, it } from 'vitest';
import { formatTime } from './time';

describe('formatTime', () => {
  it('trả giờ HH:mm:ss theo giờ Việt Nam', () => {
    expect(formatTime(new Date('2026-11-05T01:02:03Z'))).toBe('08:02:03');
  });
});
