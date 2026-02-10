/**
 * 日付ユーティリティのテスト
 */

import {
  formatDateJP,
  formatDateTimeJP,
  formatDateISO,
  parseDate,
  getStockDays,
  isBusinessDay,
  addDays,
  isSameDay,
  isBeforeDate,
  isAfterDate,
  getStartOfDay,
  getEndOfDay,
  getDaysDifference,
  isWithinDays,
} from '../../../src/server/utils/dateUtils';

describe('Date Utilities', () => {
  describe('formatDateJP', () => {
    it('should format date in yyyy/MM/dd format', () => {
      const date = new Date('2025-01-15T10:30:00');
      expect(formatDateJP(date)).toBe('2025/01/15');
    });

    it('should handle single digit month and day', () => {
      const date = new Date('2025-03-05T10:30:00');
      expect(formatDateJP(date)).toBe('2025/03/05');
    });

    it('should handle end of year', () => {
      const date = new Date('2025-12-31T23:59:59');
      expect(formatDateJP(date)).toBe('2025/12/31');
    });
  });

  describe('formatDateTimeJP', () => {
    it('should format datetime in yyyy/MM/dd HH:mm format', () => {
      const date = new Date('2025-01-15T10:30:00');
      expect(formatDateTimeJP(date)).toBe('2025/01/15 10:30');
    });

    it('should handle midnight', () => {
      const date = new Date('2025-01-15T00:00:00');
      expect(formatDateTimeJP(date)).toBe('2025/01/15 00:00');
    });

    it('should handle noon', () => {
      const date = new Date('2025-01-15T12:00:00');
      expect(formatDateTimeJP(date)).toBe('2025/01/15 12:00');
    });
  });

  describe('formatDateISO', () => {
    it('should format date in YYYY-MM-DD format', () => {
      const date = new Date('2025-01-15T10:30:00');
      expect(formatDateISO(date)).toBe('2025-01-15');
    });
  });

  describe('parseDate', () => {
    it('should parse yyyy/MM/dd format', () => {
      const result = parseDate('2025/01/15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(0); // January is 0
      expect(result?.getDate()).toBe(15);
    });

    it('should parse yyyy-MM-dd format', () => {
      const result = parseDate('2025-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
    });

    it('should return null for invalid date string', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('should handle Date object input', () => {
      const date = new Date('2025-01-15');
      const result = parseDate(date);
      expect(result).toEqual(date);
    });
  });

  describe('getStockDays', () => {
    it('should calculate days since purchase', () => {
      const purchaseDate = new Date();
      purchaseDate.setDate(purchaseDate.getDate() - 30);
      const days = getStockDays(purchaseDate);
      expect(days).toBe(30);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      const days = getStockDays(today);
      expect(days).toBe(0);
    });

    it('should return negative for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const days = getStockDays(futureDate);
      expect(days).toBe(-10);
    });

    it('should calculate from specific reference date', () => {
      const purchaseDate = new Date('2025-01-01');
      const referenceDate = new Date('2025-01-31');
      const days = getStockDays(purchaseDate, referenceDate);
      expect(days).toBe(30);
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for weekday', () => {
      // Monday, January 13, 2025
      const monday = new Date('2025-01-13');
      expect(isBusinessDay(monday)).toBe(true);
    });

    it('should return false for Saturday', () => {
      // Saturday, January 11, 2025
      const saturday = new Date('2025-01-11');
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it('should return false for Sunday', () => {
      // Sunday, January 12, 2025
      const sunday = new Date('2025-01-12');
      expect(isBusinessDay(sunday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, 10);
      expect(result.getDate()).toBe(25);
    });

    it('should subtract days with negative number', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should handle month boundary', () => {
      const date = new Date('2025-01-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should handle year boundary', () => {
      const date = new Date('2025-12-30');
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should not modify original date', () => {
      const date = new Date('2025-01-15');
      const originalDate = date.getDate();
      addDays(date, 10);
      expect(date.getDate()).toBe(originalDate);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-15T23:59:59');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different months', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-02-15');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different years', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2026-01-15');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isBeforeDate', () => {
    it('should return true if date1 is before date2', () => {
      const date1 = new Date('2025-01-10');
      const date2 = new Date('2025-01-15');
      expect(isBeforeDate(date1, date2)).toBe(true);
    });

    it('should return false if date1 is after date2', () => {
      const date1 = new Date('2025-01-20');
      const date2 = new Date('2025-01-15');
      expect(isBeforeDate(date1, date2)).toBe(false);
    });

    it('should return false if dates are same', () => {
      const date1 = new Date('2025-01-15T00:00:00');
      const date2 = new Date('2025-01-15T23:59:59');
      expect(isBeforeDate(date1, date2)).toBe(false);
    });
  });

  describe('isAfterDate', () => {
    it('should return true if date1 is after date2', () => {
      const date1 = new Date('2025-01-20');
      const date2 = new Date('2025-01-15');
      expect(isAfterDate(date1, date2)).toBe(true);
    });

    it('should return false if date1 is before date2', () => {
      const date1 = new Date('2025-01-10');
      const date2 = new Date('2025-01-15');
      expect(isAfterDate(date1, date2)).toBe(false);
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day (00:00:00)', () => {
      const date = new Date('2025-01-15T15:30:45');
      const result = getStartOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day (23:59:59.999)', () => {
      const date = new Date('2025-01-15T10:30:45');
      const result = getEndOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getDaysDifference', () => {
    it('should return positive difference when date1 is before date2', () => {
      const date1 = new Date('2025-01-10');
      const date2 = new Date('2025-01-15');
      expect(getDaysDifference(date1, date2)).toBe(5);
    });

    it('should return negative difference when date1 is after date2', () => {
      const date1 = new Date('2025-01-20');
      const date2 = new Date('2025-01-15');
      expect(getDaysDifference(date1, date2)).toBe(-5);
    });

    it('should return 0 for same day', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-15T23:00:00');
      expect(getDaysDifference(date1, date2)).toBe(0);
    });
  });

  describe('isWithinDays', () => {
    it('should return true if within range', () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      expect(isWithinDays(date, 7)).toBe(true);
    });

    it('should return false if outside range', () => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      expect(isWithinDays(date, 7)).toBe(false);
    });

    it('should return true for today', () => {
      const today = new Date();
      expect(isWithinDays(today, 7)).toBe(true);
    });

    it('should return true for exact boundary', () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      expect(isWithinDays(date, 7)).toBe(true);
    });
  });
});
