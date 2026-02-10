/**
 * ID採番ユーティリティのテスト
 */

import {
  generateProductId,
  generateProcessingCostId,
  generateInventorySessionId,
  generateLogId,
  parseProductIdNumber,
  getNextSequenceNumber,
  formatSequenceNumber,
} from '../../../src/server/utils/idGenerator';

describe('ID Generator Utilities', () => {
  describe('generateProductId', () => {
    it('should generate product ID in ITA-0001 format', () => {
      const id = generateProductId(1);
      expect(id).toBe('ITA-0001');
    });

    it('should generate product ID with correct padding', () => {
      expect(generateProductId(1)).toBe('ITA-0001');
      expect(generateProductId(10)).toBe('ITA-0010');
      expect(generateProductId(100)).toBe('ITA-0100');
      expect(generateProductId(1000)).toBe('ITA-1000');
      expect(generateProductId(9999)).toBe('ITA-9999');
    });

    it('should handle numbers above 4 digits', () => {
      expect(generateProductId(10000)).toBe('ITA-10000');
      expect(generateProductId(99999)).toBe('ITA-99999');
    });

    it('should throw error for zero or negative numbers', () => {
      expect(() => generateProductId(0)).toThrow();
      expect(() => generateProductId(-1)).toThrow();
    });
  });

  describe('generateProcessingCostId', () => {
    it('should generate processing cost ID in COST-000001 format', () => {
      const id = generateProcessingCostId(1);
      expect(id).toBe('COST-000001');
    });

    it('should generate processing cost ID with correct padding', () => {
      expect(generateProcessingCostId(1)).toBe('COST-000001');
      expect(generateProcessingCostId(10)).toBe('COST-000010');
      expect(generateProcessingCostId(100)).toBe('COST-000100');
      expect(generateProcessingCostId(1000)).toBe('COST-001000');
      expect(generateProcessingCostId(999999)).toBe('COST-999999');
    });

    it('should handle numbers above 6 digits', () => {
      expect(generateProcessingCostId(1000000)).toBe('COST-1000000');
    });

    it('should throw error for zero or negative numbers', () => {
      expect(() => generateProcessingCostId(0)).toThrow();
      expect(() => generateProcessingCostId(-1)).toThrow();
    });
  });

  describe('generateInventorySessionId', () => {
    it('should generate inventory session ID in INV-YYYYMMDD-001 format', () => {
      const date = new Date('2026-01-16');
      const id = generateInventorySessionId(date, 1);
      expect(id).toBe('INV-20260116-001');
    });

    it('should generate inventory session ID with correct date format', () => {
      const date1 = new Date('2025-03-05');
      expect(generateInventorySessionId(date1, 1)).toBe('INV-20250305-001');

      const date2 = new Date('2025-12-31');
      expect(generateInventorySessionId(date2, 10)).toBe('INV-20251231-010');
    });

    it('should handle sequence numbers correctly', () => {
      const date = new Date('2026-01-16');
      expect(generateInventorySessionId(date, 1)).toBe('INV-20260116-001');
      expect(generateInventorySessionId(date, 99)).toBe('INV-20260116-099');
      expect(generateInventorySessionId(date, 100)).toBe('INV-20260116-100');
      expect(generateInventorySessionId(date, 999)).toBe('INV-20260116-999');
    });

    it('should throw error for invalid sequence number', () => {
      const date = new Date('2026-01-16');
      expect(() => generateInventorySessionId(date, 0)).toThrow();
      expect(() => generateInventorySessionId(date, -1)).toThrow();
    });
  });

  describe('generateLogId', () => {
    it('should generate log ID in LOG-000000001 format', () => {
      const id = generateLogId(1);
      expect(id).toBe('LOG-000000001');
    });

    it('should generate log ID with correct padding', () => {
      expect(generateLogId(1)).toBe('LOG-000000001');
      expect(generateLogId(100)).toBe('LOG-000000100');
      expect(generateLogId(1000000)).toBe('LOG-001000000');
      expect(generateLogId(999999999)).toBe('LOG-999999999');
    });

    it('should throw error for zero or negative numbers', () => {
      expect(() => generateLogId(0)).toThrow();
      expect(() => generateLogId(-1)).toThrow();
    });
  });

  describe('parseProductIdNumber', () => {
    it('should parse number from product ID', () => {
      expect(parseProductIdNumber('ITA-0001')).toBe(1);
      expect(parseProductIdNumber('ITA-0123')).toBe(123);
      expect(parseProductIdNumber('ITA-9999')).toBe(9999);
      expect(parseProductIdNumber('ITA-12345')).toBe(12345);
    });

    it('should return null for invalid product ID format', () => {
      expect(parseProductIdNumber('INVALID')).toBeNull();
      expect(parseProductIdNumber('ITA-')).toBeNull();
      expect(parseProductIdNumber('ITA-abcd')).toBeNull();
      expect(parseProductIdNumber('')).toBeNull();
    });
  });

  describe('getNextSequenceNumber', () => {
    it('should return next sequence number', () => {
      const currentIds = ['ITA-0001', 'ITA-0002', 'ITA-0003'];
      const next = getNextSequenceNumber(currentIds, 'ITA');
      expect(next).toBe(4);
    });

    it('should return 1 for empty array', () => {
      const next = getNextSequenceNumber([], 'ITA');
      expect(next).toBe(1);
    });

    it('should handle gaps in sequence', () => {
      const currentIds = ['ITA-0001', 'ITA-0005', 'ITA-0003'];
      const next = getNextSequenceNumber(currentIds, 'ITA');
      expect(next).toBe(6);
    });

    it('should work with different prefixes', () => {
      const costIds = ['COST-000001', 'COST-000002'];
      expect(getNextSequenceNumber(costIds, 'COST')).toBe(3);
    });
  });

  describe('formatSequenceNumber', () => {
    it('should format number with correct padding', () => {
      expect(formatSequenceNumber(1, 4)).toBe('0001');
      expect(formatSequenceNumber(10, 4)).toBe('0010');
      expect(formatSequenceNumber(100, 4)).toBe('0100');
      expect(formatSequenceNumber(1000, 4)).toBe('1000');
    });

    it('should handle different digit lengths', () => {
      expect(formatSequenceNumber(1, 6)).toBe('000001');
      expect(formatSequenceNumber(1, 9)).toBe('000000001');
    });

    it('should not truncate numbers larger than padding', () => {
      expect(formatSequenceNumber(12345, 4)).toBe('12345');
    });
  });
});
