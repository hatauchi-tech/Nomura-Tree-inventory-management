/**
 * SalesService のテスト
 */

import { SalesService, SalesServiceError } from '../../../src/server/services/SalesService';
import { Product, PRODUCT_HEADERS, productToRow } from '../../../src/server/types/product';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import { sampleProducts, soldProductsForDateRange } from '../../mocks/testData';

describe('SalesService', () => {
  let service: SalesService;
  const testSpreadsheetId = 'test-spreadsheet-id';

  const convertProductsToSheetData = (products: Product[]): unknown[][] => {
    return [PRODUCT_HEADERS, ...products.map((p) => productToRow(p))];
  };

  // Extended test data with additional sold products
  const allProducts = [...sampleProducts, ...soldProductsForDateRange];

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      {
        name: SHEET_NAMES.PRODUCTS,
        data: convertProductsToSheetData(allProducts),
      },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
    service = new SalesService(testSpreadsheetId);
  });

  describe('sellProduct', () => {
    it('should sell product successfully', () => {
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldPrice: 500000,
        soldTo: '山田様',
      };

      const result = service.sellProduct('ITA-0001', salesData);

      expect(result).not.toBeNull();
      expect(result.status).toBe('販売済み');
      expect(result.salesDestination).toBe('山田様');
      expect(result.actualSalesPrice).toBe(500000);
    });

    it('should throw error for non-existent product', () => {
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldPrice: 500000,
      };

      expect(() => service.sellProduct('ITA-9999', salesData)).toThrow(SalesServiceError);
      expect(() => service.sellProduct('ITA-9999', salesData)).toThrow('製品が見つかりません');
    });

    it('should throw error when product is not available for sale', () => {
      // ITA-0003 is already sold
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldPrice: 500000,
      };

      expect(() => service.sellProduct('ITA-0003', salesData)).toThrow(SalesServiceError);
      expect(() => service.sellProduct('ITA-0003', salesData)).toThrow(
        '販売可能な状態ではありません'
      );
    });

    it('should throw error when sold date is not specified', () => {
      const salesData = {
        soldPrice: 500000,
      } as any;

      expect(() => service.sellProduct('ITA-0001', salesData)).toThrow(SalesServiceError);
      expect(() => service.sellProduct('ITA-0001', salesData)).toThrow(
        '販売日を指定してください'
      );
    });

    it('should throw error when sold price is zero', () => {
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldPrice: 0,
      };

      expect(() => service.sellProduct('ITA-0001', salesData)).toThrow(SalesServiceError);
      expect(() => service.sellProduct('ITA-0001', salesData)).toThrow(
        '販売価格は0より大きい値を指定してください'
      );
    });

    it('should throw error when sold price is negative', () => {
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldPrice: -100,
      };

      expect(() => service.sellProduct('ITA-0001', salesData)).toThrow(SalesServiceError);
    });
  });

  describe('sellProducts (bulk sale)', () => {
    it('should sell multiple products successfully', () => {
      const productIds = ['ITA-0001', 'ITA-0002'];
      const salesData = {
        soldDate: new Date('2025-01-25'),
        soldTo: '大口顧客様',
      };
      const soldPrices = new Map([
        ['ITA-0001', 500000],
        ['ITA-0002', 600000],
      ]);

      const result = service.sellProducts(productIds, salesData, soldPrices);

      expect(result.length).toBe(2);
      expect(result.every((p) => p.status === '販売済み')).toBe(true);
    });

    it('should process successful sales even when some fail', () => {
      const productIds = ['ITA-0001', 'ITA-9999']; // ITA-9999 doesn't exist
      const salesData = {
        soldDate: new Date('2025-01-25'),
      };
      const soldPrices = new Map([
        ['ITA-0001', 500000],
        ['ITA-9999', 300000],
      ]);

      const result = service.sellProducts(productIds, salesData, soldPrices);

      expect(result.length).toBe(1);
      expect(result[0].productId).toBe('ITA-0001');
    });

    it('should throw error when all sales fail', () => {
      const productIds = ['ITA-9998', 'ITA-9999'];
      const salesData = {
        soldDate: new Date('2025-01-25'),
      };
      const soldPrices = new Map([
        ['ITA-9998', 300000],
        ['ITA-9999', 400000],
      ]);

      expect(() => service.sellProducts(productIds, salesData, soldPrices)).toThrow(
        SalesServiceError
      );
      expect(() => service.sellProducts(productIds, salesData, soldPrices)).toThrow(
        '販売処理に全て失敗しました'
      );
    });

    it('should skip products without price', () => {
      const productIds = ['ITA-0001', 'ITA-0002'];
      const salesData = {
        soldDate: new Date('2025-01-25'),
      };
      const soldPrices = new Map([['ITA-0001', 500000]]); // Missing price for ITA-0002

      const result = service.sellProducts(productIds, salesData, soldPrices);

      expect(result.length).toBe(1);
      expect(result[0].productId).toBe('ITA-0001');
    });
  });

  describe('cancelSale', () => {
    it('should cancel sale within 7 days', () => {
      // First sell a product
      const salesData = {
        soldDate: new Date(),
        soldPrice: 500000,
        soldTo: '山田様',
      };
      service.sellProduct('ITA-0001', salesData);

      // Then cancel
      const result = service.cancelSale('ITA-0001', 'お客様都合');

      expect(result).not.toBeNull();
      expect(result.status).toBe('販売中');
    });

    it('should throw error for non-existent product', () => {
      expect(() => service.cancelSale('ITA-9999', '理由')).toThrow(SalesServiceError);
      expect(() => service.cancelSale('ITA-9999', '理由')).toThrow('製品が見つかりません');
    });

    it('should throw error for non-sold product', () => {
      // ITA-0001 is available, not sold
      expect(() => service.cancelSale('ITA-0001', '理由')).toThrow(SalesServiceError);
      expect(() => service.cancelSale('ITA-0001', '理由')).toThrow(
        '販売済みの状態ではありません'
      );
    });

    it('should throw error when cancel period expired', () => {
      // ITA-0003 was sold on 2025-01-20 in test data (more than 7 days ago in test context)
      // We need to use a product that was sold more than 7 days ago
      expect(() => service.cancelSale('ITA-0003', '理由')).toThrow(SalesServiceError);
    });

    it('should throw error when cancel reason is empty', () => {
      // First sell a product today
      const salesData = {
        soldDate: new Date(),
        soldPrice: 500000,
      };
      service.sellProduct('ITA-0001', salesData);

      expect(() => service.cancelSale('ITA-0001', '')).toThrow(SalesServiceError);
      expect(() => service.cancelSale('ITA-0001', '')).toThrow(
        'キャンセル理由を入力してください'
      );
    });

    it('should throw error when cancel reason is whitespace', () => {
      const salesData = {
        soldDate: new Date(),
        soldPrice: 500000,
      };
      service.sellProduct('ITA-0001', salesData);

      expect(() => service.cancelSale('ITA-0001', '   ')).toThrow(SalesServiceError);
    });
  });

  describe('getSoldProducts', () => {
    it('should return all sold products', () => {
      const result = service.getSoldProducts();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.status === '販売済み')).toBe(true);
    });
  });

  describe('getSoldProductsByDateRange', () => {
    it('should return products sold within date range', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = service.getSoldProductsByDateRange(startDate, endDate);

      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((p) => {
          const salesDate = new Date(p.salesDate!);
          return salesDate >= startDate && salesDate <= endDate;
        })
      ).toBe(true);
    });

    it('should exclude products outside date range', () => {
      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-02-28');

      const result = service.getSoldProductsByDateRange(startDate, endDate);

      // Most test data is from January, so February range should return fewer or no results
      result.forEach((p) => {
        const salesDate = new Date(p.salesDate!);
        expect(salesDate >= startDate && salesDate <= endDate).toBe(true);
      });
    });
  });

  describe('getSalesStats', () => {
    it('should return sales statistics', () => {
      const result = service.getSalesStats();

      expect(result).toHaveProperty('totalSales');
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('totalProfit');
      expect(result).toHaveProperty('averagePrice');
      expect(result).toHaveProperty('averageProfitMargin');
    });

    it('should calculate total sales correctly', () => {
      const result = service.getSalesStats();
      const soldProducts = allProducts.filter((p) => p.status === '販売済み');

      expect(result.totalSales).toBe(soldProducts.length);
    });

    it('should calculate statistics for date range', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = service.getSalesStats(startDate, endDate);

      expect(result.totalSales).toBeGreaterThanOrEqual(0);
    });

    it('should return zero values when no sales', () => {
      const startDate = new Date('2030-01-01');
      const endDate = new Date('2030-01-31');

      const result = service.getSalesStats(startDate, endDate);

      expect(result.totalSales).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalProfit).toBe(0);
      expect(result.averagePrice).toBe(0);
      expect(result.averageProfitMargin).toBe(0);
    });
  });

  describe('getMonthlySales', () => {
    it('should return monthly sales data for specified year', () => {
      const result = service.getMonthlySales(2025);

      expect(result.size).toBe(12);

      // Each month should have count and revenue
      for (let month = 1; month <= 12; month++) {
        const monthData = result.get(month);
        expect(monthData).toBeDefined();
        expect(monthData).toHaveProperty('count');
        expect(monthData).toHaveProperty('revenue');
      }
    });

    it('should correctly aggregate January sales', () => {
      const result = service.getMonthlySales(2025);
      const januaryData = result.get(1);

      expect(januaryData).toBeDefined();
      expect(januaryData!.count).toBeGreaterThan(0); // We have sales in January in test data
    });
  });

  describe('getSalesByWoodType', () => {
    it('should return sales aggregated by wood type', () => {
      const result = service.getSalesByWoodType();

      expect(result.size).toBeGreaterThan(0);

      // Each entry should have count and revenue
      result.forEach((value) => {
        expect(value).toHaveProperty('count');
        expect(value).toHaveProperty('revenue');
        expect(value.count).toBeGreaterThan(0);
      });
    });

    it('should include sold products wood types', () => {
      const result = service.getSalesByWoodType();

      // ITA-0003 (杉) is sold in test data
      // soldProductsForDateRange also has 杉 and ウォルナット
      const woodTypes = Array.from(result.keys());
      expect(woodTypes.length).toBeGreaterThan(0);
    });
  });
});
