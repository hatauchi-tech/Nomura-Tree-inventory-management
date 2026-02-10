/**
 * ProcessingCostRepository のテスト
 */

import { ProcessingCostRepository } from '../../../src/server/repositories/ProcessingCostRepository';
import {
  ProcessingCost,
  PROCESSING_COST_HEADERS,
  processingCostToRow,
} from '../../../src/server/types/processingCost';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import { sampleProcessingCosts } from '../../mocks/testData';

describe('ProcessingCostRepository', () => {
  let repository: ProcessingCostRepository;
  const testSpreadsheetId = 'test-spreadsheet-id';

  const convertToSheetData = (costs: ProcessingCost[]): unknown[][] => {
    return [PROCESSING_COST_HEADERS, ...costs.map((c) => processingCostToRow(c))];
  };

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      {
        name: SHEET_NAMES.PROCESSING_COSTS,
        data: convertToSheetData(sampleProcessingCosts),
      },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
    repository = new ProcessingCostRepository(testSpreadsheetId);
  });

  describe('findAll', () => {
    it('should return all processing costs', () => {
      const result = repository.findAll();
      expect(result.length).toBe(sampleProcessingCosts.length);
    });
  });

  describe('findById', () => {
    it('should find processing cost by ID', () => {
      const result = repository.findById('COST-000001');
      expect(result).not.toBeNull();
      expect(result?.processingCostId).toBe('COST-000001');
      expect(result?.productId).toBe('ITA-0001');
      expect(result?.processingType).toBe('木材加工');
    });

    it('should return null for non-existent ID', () => {
      const result = repository.findById('COST-999999');
      expect(result).toBeNull();
    });
  });

  describe('findByProductId', () => {
    it('should find processing costs by product ID', () => {
      const result = repository.findByProductId('ITA-0001');
      expect(result.length).toBe(2); // ITA-0001 has 2 processing costs
      expect(result.every((c) => c.productId === 'ITA-0001')).toBe(true);
    });

    it('should find all processing costs for product with multiple entries', () => {
      const result = repository.findByProductId('ITA-0003');
      expect(result.length).toBe(3); // ITA-0003 has 3 processing costs
    });

    it('should return empty array for product with no processing costs', () => {
      const result = repository.findByProductId('ITA-9999');
      expect(result.length).toBe(0);
    });
  });

  describe('getTotalByProductId', () => {
    it('should return total amount for product ID', () => {
      // ITA-0001: 25000 + 15000 = 40000
      const result = repository.getTotalByProductId('ITA-0001');
      expect(result).toBe(40000);
    });

    it('should return total for product with multiple costs', () => {
      // ITA-0003: 18000 + 12000 + 25000 = 55000
      const result = repository.getTotalByProductId('ITA-0003');
      expect(result).toBe(55000);
    });

    it('should return 0 for product with no processing costs', () => {
      const result = repository.getTotalByProductId('ITA-9999');
      expect(result).toBe(0);
    });
  });

  describe('getProductSummary', () => {
    it('should return summary for product', () => {
      const result = repository.getProductSummary('ITA-0001');

      expect(result.productId).toBe('ITA-0001');
      expect(result.totalAmount).toBe(40000);
      expect(result.items.length).toBe(2);
      expect(result.itemCount).toBe(2);
    });

    it('should return empty summary for product with no costs', () => {
      const result = repository.getProductSummary('ITA-9999');

      expect(result.productId).toBe('ITA-9999');
      expect(result.totalAmount).toBe(0);
      expect(result.items.length).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('createFromDto', () => {
    it('should create new processing cost from DTO with auto-generated ID', () => {
      const dto = {
        productId: 'ITA-0005',
        processingType: '木材加工' as const,
        processorId: 'PROC-001',
        processingContent: 'テスト加工内容',
        amount: 50000,
      };

      const result = repository.createFromDto(dto);

      expect(result).not.toBeNull();
      expect(result.processingCostId).toMatch(/^COST-\d{6}$/);
      expect(result.productId).toBe('ITA-0005');
      expect(result.processingType).toBe('木材加工');
      expect(result.processorId).toBe('PROC-001');
      expect(result.processingContent).toBe('テスト加工内容');
      expect(result.amount).toBe(50000);
      expect(result.createdAt).toBeDefined();
    });

    it('should handle optional processing content', () => {
      const dto = {
        productId: 'ITA-0005',
        processingType: '塗装' as const,
        processorId: 'PROC-002',
        amount: 20000,
      };

      const result = repository.createFromDto(dto);

      expect(result.processingContent).toBeUndefined();
    });
  });

  describe('deleteByProductId', () => {
    it('should delete all processing costs for product', () => {
      const beforeCount = repository.findByProductId('ITA-0001').length;
      expect(beforeCount).toBe(2);

      const deletedCount = repository.deleteByProductId('ITA-0001');
      expect(deletedCount).toBe(2);

      const afterCount = repository.findByProductId('ITA-0001').length;
      expect(afterCount).toBe(0);
    });

    it('should return 0 when product has no processing costs', () => {
      const deletedCount = repository.deleteByProductId('ITA-9999');
      expect(deletedCount).toBe(0);
    });

    it('should not affect other products', () => {
      repository.deleteByProductId('ITA-0001');

      // ITA-0002 should still have its costs
      const otherCosts = repository.findByProductId('ITA-0002');
      expect(otherCosts.length).toBe(2);
    });
  });

  describe('findByProcessorId', () => {
    it('should find processing costs by processor ID', () => {
      const result = repository.findByProcessorId('PROC-001');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => c.processorId === 'PROC-001')).toBe(true);
    });

    it('should return empty array for non-existent processor', () => {
      const result = repository.findByProcessorId('PROC-999');
      expect(result.length).toBe(0);
    });
  });

  describe('findByProcessingType', () => {
    it('should find processing costs by processing type', () => {
      const result = repository.findByProcessingType('木材加工');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => c.processingType === '木材加工')).toBe(true);
    });

    it('should find painting processing costs', () => {
      const result = repository.findByProcessingType('塗装');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => c.processingType === '塗装')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = repository.findByProcessingType('存在しない種別');
      expect(result.length).toBe(0);
    });
  });

  describe('getProductSummaries', () => {
    it('should return summaries for multiple products', () => {
      const productIds = ['ITA-0001', 'ITA-0002', 'ITA-0003'];
      const result = repository.getProductSummaries(productIds);

      expect(result.size).toBe(3);

      // ITA-0001: 40000
      expect(result.get('ITA-0001')?.totalAmount).toBe(40000);
      expect(result.get('ITA-0001')?.itemCount).toBe(2);

      // ITA-0002: 35000 + 20000 = 55000
      expect(result.get('ITA-0002')?.totalAmount).toBe(55000);
      expect(result.get('ITA-0002')?.itemCount).toBe(2);

      // ITA-0003: 55000
      expect(result.get('ITA-0003')?.totalAmount).toBe(55000);
      expect(result.get('ITA-0003')?.itemCount).toBe(3);
    });

    it('should return zero summary for products without costs', () => {
      const productIds = ['ITA-9999'];
      const result = repository.getProductSummaries(productIds);

      expect(result.size).toBe(1);
      expect(result.get('ITA-9999')?.totalAmount).toBe(0);
      expect(result.get('ITA-9999')?.itemCount).toBe(0);
    });

    it('should handle mix of products with and without costs', () => {
      const productIds = ['ITA-0001', 'ITA-9999'];
      const result = repository.getProductSummaries(productIds);

      expect(result.size).toBe(2);
      expect(result.get('ITA-0001')?.totalAmount).toBe(40000);
      expect(result.get('ITA-9999')?.totalAmount).toBe(0);
    });
  });

  describe('update', () => {
    it('should update processing cost amount', () => {
      const result = repository.update('COST-000001', { amount: 30000 });

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(30000);
    });

    it('should update processing content', () => {
      const result = repository.update('COST-000001', {
        processingContent: '更新後の加工内容',
      });

      expect(result).not.toBeNull();
      expect(result?.processingContent).toBe('更新後の加工内容');
    });

    it('should return null for non-existent ID', () => {
      const result = repository.update('COST-999999', { amount: 30000 });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete processing cost by ID', () => {
      const result = repository.delete('COST-000001');
      expect(result).toBe(true);

      const found = repository.findById('COST-000001');
      expect(found).toBeNull();
    });

    it('should return false for non-existent ID', () => {
      const result = repository.delete('COST-999999');
      expect(result).toBe(false);
    });
  });
});
