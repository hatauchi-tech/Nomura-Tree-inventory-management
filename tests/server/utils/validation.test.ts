/**
 * バリデーションユーティリティのテスト
 */

import {
  validateRequired,
  validateStringLength,
  validateNumberRange,
  validateDate,
  validateProductName,
  validateSize,
  validatePrice,
  validateProfitMargin,
  validatePriceAdjustment,
  validateRemarks,
  validateVendorName,
  validateProduct,
  validateProcessingCost,
  validateSalesRegistration,
} from '../../../src/server/utils/validation';
import { CreateProductDto } from '../../../src/server/types/product';
import { CreateProcessingCostDto } from '../../../src/server/types/processingCost';

describe('Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should return valid for non-empty string', () => {
      const result = validateRequired('test', 'field');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for empty string', () => {
      const result = validateRequired('', 'field');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED');
    });

    it('should return invalid for null', () => {
      const result = validateRequired(null, 'field');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for undefined', () => {
      const result = validateRequired(undefined, 'field');
      expect(result.isValid).toBe(false);
    });

    it('should return valid for number 0', () => {
      const result = validateRequired(0, 'field');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStringLength', () => {
    it('should return valid for string within length range', () => {
      const result = validateStringLength('test', 'field', 1, 10);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for string too short', () => {
      const result = validateStringLength('', 'field', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('STRING_TOO_SHORT');
    });

    it('should return invalid for string too long', () => {
      const result = validateStringLength('a'.repeat(101), 'field', 1, 100);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('STRING_TOO_LONG');
    });

    it('should return valid for exact minimum length', () => {
      const result = validateStringLength('a', 'field', 1, 10);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for exact maximum length', () => {
      const result = validateStringLength('a'.repeat(100), 'field', 1, 100);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNumberRange', () => {
    it('should return valid for number within range', () => {
      const result = validateNumberRange(50, 'field', 1, 100);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for number below minimum', () => {
      const result = validateNumberRange(0, 'field', 1, 100);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('NUMBER_OUT_OF_RANGE');
    });

    it('should return invalid for number above maximum', () => {
      const result = validateNumberRange(101, 'field', 1, 100);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('NUMBER_OUT_OF_RANGE');
    });

    it('should return valid for exact minimum', () => {
      const result = validateNumberRange(1, 'field', 1, 100);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for exact maximum', () => {
      const result = validateNumberRange(100, 'field', 1, 100);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for non-integer when integer required', () => {
      const result = validateNumberRange(50.5, 'field', 1, 100, true);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('NOT_INTEGER');
    });

    it('should return valid for integer when integer required', () => {
      const result = validateNumberRange(50, 'field', 1, 100, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDate', () => {
    it('should return valid for valid date', () => {
      const result = validateDate(new Date(), 'field');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for invalid date', () => {
      const result = validateDate(new Date('invalid'), 'field');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_DATE');
    });

    it('should return invalid for future date when not allowed', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = validateDate(futureDate, 'field', { allowFuture: false });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('FUTURE_DATE_NOT_ALLOWED');
    });

    it('should return valid for future date when allowed', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const result = validateDate(futureDate, 'field', {
        allowFuture: true,
        maxFutureDays: 7,
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for date too far in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = validateDate(futureDate, 'field', {
        allowFuture: true,
        maxFutureDays: 7,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('DATE_TOO_FAR_FUTURE');
    });

    it('should return invalid for date before minDate', () => {
      const pastDate = new Date('2020-01-01');
      const minDate = new Date('2024-01-01');
      const result = validateDate(pastDate, 'field', { minDate });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('DATE_BEFORE_MIN');
    });
  });

  describe('validateProductName', () => {
    it('should return valid for valid product name', () => {
      const result = validateProductName('ウォルナット一枚板テーブル');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty product name', () => {
      const result = validateProductName('');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for product name exceeding 100 characters', () => {
      const result = validateProductName('あ'.repeat(101));
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSize', () => {
    it('should return valid for valid size', () => {
      const result = validateSize(1500, 'length');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for size below 1', () => {
      const result = validateSize(0, 'length');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for size above 99999', () => {
      const result = validateSize(100000, 'length');
      expect(result.isValid).toBe(false);
    });

    it('should return valid for undefined when optional', () => {
      const result = validateSize(undefined, 'length');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePrice', () => {
    it('should return valid for valid price', () => {
      const result = validatePrice(150000, 'purchasePrice');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for negative price', () => {
      const result = validatePrice(-1, 'purchasePrice');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for price above maximum', () => {
      const result = validatePrice(100000000, 'purchasePrice');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for non-integer price', () => {
      const result = validatePrice(150000.5, 'purchasePrice');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateProfitMargin', () => {
    it('should return valid for valid profit margin', () => {
      const result = validateProfitMargin(60);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for profit margin below 0', () => {
      const result = validateProfitMargin(-1);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for profit margin above 99', () => {
      const result = validateProfitMargin(100);
      expect(result.isValid).toBe(false);
    });

    it('should return valid for profit margin with one decimal', () => {
      const result = validateProfitMargin(55.5);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for profit margin with more than one decimal', () => {
      const result = validateProfitMargin(55.55);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePriceAdjustment', () => {
    it('should return valid for positive adjustment', () => {
      const result = validatePriceAdjustment(10000);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for negative adjustment', () => {
      const result = validatePriceAdjustment(-5000);
      expect(result.isValid).toBe(true);
    });

    it('should return valid for zero adjustment', () => {
      const result = validatePriceAdjustment(0);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for adjustment below minimum', () => {
      const result = validatePriceAdjustment(-10000000);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for adjustment above maximum', () => {
      const result = validatePriceAdjustment(10000000);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRemarks', () => {
    it('should return valid for empty remarks', () => {
      const result = validateRemarks('');
      expect(result.isValid).toBe(true);
    });

    it('should return valid for remarks within limit', () => {
      const result = validateRemarks('これは備考です。');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for remarks exceeding 500 characters', () => {
      const result = validateRemarks('あ'.repeat(501));
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateVendorName', () => {
    it('should return valid for valid vendor name', () => {
      const result = validateVendorName('木材商会A');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty vendor name', () => {
      const result = validateVendorName('');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for vendor name exceeding 50 characters', () => {
      const result = validateVendorName('あ'.repeat(51));
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateProduct', () => {
    const validProduct: CreateProductDto = {
      majorCategory: 'テーブル',
      productName: 'ウォルナット一枚板テーブル',
      woodType: 'ウォルナット',
      supplierId: 'SUP-001',
      purchaseDate: new Date('2025-01-15'),
      purchasePrice: 150000,
      storageLocationId: 'LOC-001',
    };

    it('should return valid for valid product', () => {
      const result = validateProduct(validProduct);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing required fields', () => {
      const invalidProduct = { ...validProduct, productName: '' };
      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === '商品名')).toBe(true);
    });

    it('should return invalid for invalid size', () => {
      const invalidProduct = {
        ...validProduct,
        rawSize: { length: 100000, width: 800, thickness: 60 },
      };
      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for future purchase date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const invalidProduct = { ...validProduct, purchaseDate: futureDate };
      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
    });

    it('should return all validation errors', () => {
      const invalidProduct = {
        majorCategory: 'テーブル' as const,
        productName: '',
        woodType: '',
        supplierId: '',
        purchaseDate: new Date('invalid'),
        purchasePrice: -1,
        storageLocationId: '',
      };
      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateProcessingCost', () => {
    const validCost: CreateProcessingCostDto = {
      productId: 'ITA-0001',
      processingType: '木材加工',
      processorId: 'PROC-001',
      amount: 25000,
    };

    it('should return valid for valid processing cost', () => {
      const result = validateProcessingCost(validCost);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for missing productId', () => {
      const invalidCost = { ...validCost, productId: '' };
      const result = validateProcessingCost(invalidCost);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for negative amount', () => {
      const invalidCost = { ...validCost, amount: -1 };
      const result = validateProcessingCost(invalidCost);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for amount above maximum', () => {
      const invalidCost = { ...validCost, amount: 100000000 };
      const result = validateProcessingCost(invalidCost);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSalesRegistration', () => {
    it('should return valid for valid sales registration', () => {
      const result = validateSalesRegistration({
        salesDestination: '田中様',
        salesDate: new Date(),
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty sales destination', () => {
      const result = validateSalesRegistration({
        salesDestination: '',
        salesDate: new Date(),
      });
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for sales date too far in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = validateSalesRegistration({
        salesDestination: '田中様',
        salesDate: futureDate,
      });
      expect(result.isValid).toBe(false);
    });

    it('should return valid for sales date within 7 days in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const result = validateSalesRegistration({
        salesDestination: '田中様',
        salesDate: futureDate,
      });
      expect(result.isValid).toBe(true);
    });
  });
});
