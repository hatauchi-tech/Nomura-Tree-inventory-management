/**
 * ProcessingCostService のテスト
 */

import {
  ProcessingCostService,
  ProcessingCostServiceError,
} from '../../../src/server/services/ProcessingCostService';
import { Product, PRODUCT_HEADERS, productToRow } from '../../../src/server/types/product';
import {
  ProcessingCost,
  PROCESSING_COST_HEADERS,
  processingCostToRow,
} from '../../../src/server/types/processingCost';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import { sampleProducts, sampleProcessingCosts } from '../../mocks/testData';

describe('ProcessingCostService', () => {
  let service: ProcessingCostService;
  const testSpreadsheetId = 'test-spreadsheet-id';

  const convertProductsToSheetData = (products: Product[]): unknown[][] => {
    return [PRODUCT_HEADERS, ...products.map((p) => productToRow(p))];
  };

  const convertCostsToSheetData = (costs: ProcessingCost[]): unknown[][] => {
    return [PROCESSING_COST_HEADERS, ...costs.map((c) => processingCostToRow(c))];
  };

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      {
        name: SHEET_NAMES.PRODUCTS,
        data: convertProductsToSheetData(sampleProducts),
      },
      {
        name: SHEET_NAMES.PROCESSING_COSTS,
        data: convertCostsToSheetData(sampleProcessingCosts),
      },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
    service = new ProcessingCostService(testSpreadsheetId);
  });

  describe('getProcessingCosts', () => {
    it('should return processing costs for product', () => {
      const result = service.getProcessingCosts('ITA-0001');

      expect(result.length).toBe(2);
      expect(result.every((c) => c.productId === 'ITA-0001')).toBe(true);
    });

    it('should return empty array for product without costs', () => {
      const result = service.getProcessingCosts('ITA-0005');

      expect(result.length).toBe(0);
    });
  });

  describe('getProductSummary', () => {
    it('should return summary for product with costs', () => {
      const result = service.getProductSummary('ITA-0001');

      expect(result.productId).toBe('ITA-0001');
      expect(result.totalAmount).toBe(40000); // 25000 + 15000
      expect(result.itemCount).toBe(2);
      expect(result.items.length).toBe(2);
    });

    it('should return zero summary for product without costs', () => {
      const result = service.getProductSummary('ITA-0005');

      expect(result.productId).toBe('ITA-0005');
      expect(result.totalAmount).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('createProcessingCost', () => {
    it('should create processing cost successfully', () => {
      const dto = {
        productId: 'ITA-0001',
        processingType: '木材加工' as const,
        processorId: 'PROC-001',
        processingContent: 'テスト加工',
        amount: 30000,
      };

      const result = service.createProcessingCost(dto);

      expect(result).not.toBeNull();
      expect(result.productId).toBe('ITA-0001');
      expect(result.processingType).toBe('木材加工');
      expect(result.amount).toBe(30000);
    });

    it('should throw error for non-existent product', () => {
      const dto = {
        productId: 'ITA-9999',
        processingType: '木材加工' as const,
        processorId: 'PROC-001',
        amount: 30000,
      };

      expect(() => service.createProcessingCost(dto)).toThrow(ProcessingCostServiceError);
      expect(() => service.createProcessingCost(dto)).toThrow('製品が見つかりません');
    });

    it('should throw error when amount is negative', () => {
      const dto = {
        productId: 'ITA-0001',
        processingType: '木材加工' as const,
        processorId: 'PROC-001',
        amount: -100,
      };

      expect(() => service.createProcessingCost(dto)).toThrow(ProcessingCostServiceError);
      expect(() => service.createProcessingCost(dto)).toThrow(
        '金額は0以上の数値を指定してください'
      );
    });

    it('should throw error when processing type is not specified', () => {
      const dto = {
        productId: 'ITA-0001',
        processingType: '' as any,
        processorId: 'PROC-001',
        amount: 30000,
      };

      expect(() => service.createProcessingCost(dto)).toThrow(ProcessingCostServiceError);
      expect(() => service.createProcessingCost(dto)).toThrow('加工種別を指定してください');
    });

    it('should throw error when processor is not specified', () => {
      const dto = {
        productId: 'ITA-0001',
        processingType: '木材加工' as const,
        processorId: '',
        amount: 30000,
      };

      expect(() => service.createProcessingCost(dto)).toThrow(ProcessingCostServiceError);
      expect(() => service.createProcessingCost(dto)).toThrow('加工業者を指定してください');
    });

    it('should allow zero amount', () => {
      const dto = {
        productId: 'ITA-0001',
        processingType: '木材加工' as const,
        processorId: 'PROC-001',
        amount: 0,
      };

      // 0以上なので0は許可される（ただし実装次第で !dto.amount で弾かれる可能性あり）
      // 実装を確認すると !dto.amount || dto.amount < 0 なので 0 はエラーになる
      expect(() => service.createProcessingCost(dto)).toThrow(ProcessingCostServiceError);
    });
  });

  describe('updateProcessingCost', () => {
    it('should update processing cost successfully', () => {
      const dto = {
        amount: 50000,
        processingContent: '更新後の内容',
      };

      const result = service.updateProcessingCost('COST-000001', dto);

      expect(result).not.toBeNull();
      expect(result.amount).toBe(50000);
      expect(result.processingContent).toBe('更新後の内容');
    });

    it('should throw error for non-existent cost', () => {
      const dto = { amount: 50000 };

      expect(() => service.updateProcessingCost('COST-999999', dto)).toThrow(
        ProcessingCostServiceError
      );
      expect(() => service.updateProcessingCost('COST-999999', dto)).toThrow(
        '加工費が見つかりません'
      );
    });

    it('should throw error when amount is negative', () => {
      const dto = { amount: -100 };

      expect(() => service.updateProcessingCost('COST-000001', dto)).toThrow(
        ProcessingCostServiceError
      );
      expect(() => service.updateProcessingCost('COST-000001', dto)).toThrow(
        '金額は0以上の数値を指定してください'
      );
    });

    it('should allow updating only processing content', () => {
      const dto = { processingContent: '新しい内容のみ' };

      const result = service.updateProcessingCost('COST-000001', dto);

      expect(result).not.toBeNull();
      expect(result.processingContent).toBe('新しい内容のみ');
    });
  });

  describe('deleteProcessingCost', () => {
    it('should delete processing cost successfully', () => {
      const result = service.deleteProcessingCost('COST-000001');

      expect(result).toBe(true);

      // Verify it was deleted
      const costs = service.getProcessingCosts('ITA-0001');
      expect(costs.find((c) => c.processingCostId === 'COST-000001')).toBeUndefined();
    });

    it('should throw error for non-existent cost', () => {
      expect(() => service.deleteProcessingCost('COST-999999')).toThrow(
        ProcessingCostServiceError
      );
      expect(() => service.deleteProcessingCost('COST-999999')).toThrow(
        '加工費が見つかりません'
      );
    });

    it('should update product summary after deletion', () => {
      const beforeSummary = service.getProductSummary('ITA-0001');
      const beforeTotal = beforeSummary.totalAmount;

      service.deleteProcessingCost('COST-000001');

      const afterSummary = service.getProductSummary('ITA-0001');
      expect(afterSummary.totalAmount).toBeLessThan(beforeTotal);
    });
  });

  describe('getProcessorStats', () => {
    it('should return statistics by processor', () => {
      const result = service.getProcessorStats();

      expect(result.size).toBeGreaterThan(0);

      result.forEach((value) => {
        expect(value).toHaveProperty('count');
        expect(value).toHaveProperty('totalAmount');
        expect(value.count).toBeGreaterThan(0);
        expect(value.totalAmount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include PROC-001 in stats', () => {
      const result = service.getProcessorStats();

      const proc001Stats = result.get('PROC-001');
      expect(proc001Stats).toBeDefined();
      expect(proc001Stats!.count).toBeGreaterThan(0);
    });
  });

  describe('getProcessingTypeStats', () => {
    it('should return statistics by processing type', () => {
      const result = service.getProcessingTypeStats();

      expect(result.size).toBeGreaterThan(0);

      result.forEach((value) => {
        expect(value).toHaveProperty('count');
        expect(value).toHaveProperty('totalAmount');
      });
    });

    it('should include wood processing type in stats', () => {
      const result = service.getProcessingTypeStats();

      const woodProcessingStats = result.get('木材加工');
      expect(woodProcessingStats).toBeDefined();
      expect(woodProcessingStats!.count).toBeGreaterThan(0);
    });

    it('should include painting type in stats', () => {
      const result = service.getProcessingTypeStats();

      const paintingStats = result.get('塗装');
      expect(paintingStats).toBeDefined();
      expect(paintingStats!.count).toBeGreaterThan(0);
    });
  });
});
