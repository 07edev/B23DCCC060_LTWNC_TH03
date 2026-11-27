import { describe, expect, it } from 'vitest';
import { formatDate, formatTime } from './format';

describe('format', () => {
  it('formatDate đổi YYYY-MM-DD thành dd/mm/yyyy', () => {
    expect(formatDate('2026-11-05')).toBe('05/11/2026');
  });

  it('formatTime trả giờ HH:mm:ss theo giờ Việt Nam', () => {
    expect(formatTime(new Date('2026-11-05T01:02:03Z'))).toBe('08:02:03');
  });
});
