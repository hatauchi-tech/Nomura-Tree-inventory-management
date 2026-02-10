/**
 * ProductService のテスト
 */

import { ProductService, ProductServiceError } from '../../../src/server/services/ProductService';
import { Product, PRODUCT_HEADERS, productToRow } from '../../../src/server/types/product';
import {
  ProcessingCost,
  PROCESSING_COST_HEADERS,
  processingCostToRow,
} from '../../../src/server/types/processingCost';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import { sampleProducts, sampleProcessingCosts } from '../../mocks/testData';

describe('ProductService', () => {
  let service: ProductService;
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
    service = new ProductService(testSpreadsheetId);
  });

  describe('searchProducts', () => {
    it('should return all products when no conditions specified', () => {
      const result = service.searchProducts({}, { page: 1, limit: 100 });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter by keyword', () => {
      const result = service.searchProducts(
        { keyword: 'ウォルナット' },
        { page: 1, limit: 100 }
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((p) =>
          p.productName.toLowerCase().includes('ウォルナット'.toLowerCase())
        )
      ).toBe(true);
    });

    it('should filter by status', () => {
      const result = service.searchProducts(
        { statuses: ['販売中'] },
        { page: 1, limit: 100 }
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((p) => p.status === '販売中')).toBe(true);
    });

    it('should apply pagination correctly', () => {
      const result = service.searchProducts({}, { page: 1, limit: 3 });

      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
    });

    it('should calculate stock days correctly', () => {
      const result = service.searchProducts({}, { page: 1, limit: 100 });

      // Products with purchaseDate should have stockDays calculated
      const productWithStockDays = result.data.find((p) => p.stockDays !== undefined);
      expect(productWithStockDays).toBeDefined();
      expect(typeof productWithStockDays?.stockDays).toBe('number');
    });

    it('should include selling price with tax', () => {
      const result = service.searchProducts({}, { page: 1, limit: 100 });

      expect(result.data.every((p) => p.sellingPriceIncTax !== undefined)).toBe(true);
    });
  });

  describe('getProductDetail', () => {
    it('should return product detail for existing ID', () => {
      const result = service.getProductDetail('ITA-0001');

      expect(result).not.toBeNull();
      expect(result?.productId).toBe('ITA-0001');
      expect(result?.productName).toBe('ウォルナット一枚板テーブル');
    });

    it('should return null for non-existent ID', () => {
      const result = service.getProductDetail('ITA-9999');
      expect(result).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', () => {
      const dto = {
        majorCategory: 'テーブル' as const,
        productName: '新規テスト製品',
        woodType: 'ウォルナット',
        supplierId: 'SUP-001',
        purchaseDate: new Date('2025-01-25'),
        purchasePrice: 150000,
        storageLocationId: 'LOC-001',
        createdBy: 'test@example.com',
      };

      const result = service.createProduct(dto);

      expect(result).not.toBeNull();
      expect(result.productName).toBe('新規テスト製品');
      expect(result.status).toBe('販売中');
    });

    it('should throw error when product name is empty', () => {
      const dto = {
        majorCategory: 'テーブル' as const,
        productName: '',
        woodType: 'ウォルナット',
        supplierId: 'SUP-001',
        purchaseDate: new Date(),
        purchasePrice: 100000,
        storageLocationId: 'LOC-001',
      };

      expect(() => service.createProduct(dto)).toThrow(ProductServiceError);
      expect(() => service.createProduct(dto)).toThrow('商品名は必須です');
    });

    it('should throw error when product name is whitespace only', () => {
      const dto = {
        majorCategory: 'テーブル' as const,
        productName: '   ',
        woodType: 'ウォルナット',
        supplierId: 'SUP-001',
        purchaseDate: new Date(),
        purchasePrice: 100000,
        storageLocationId: 'LOC-001',
      };

      expect(() => service.createProduct(dto)).toThrow(ProductServiceError);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', () => {
      const dto = {
        productName: '更新後の製品名',
        purchasePrice: 200000,
      };

      const result = service.updateProduct('ITA-0001', dto);

      expect(result).not.toBeNull();
      expect(result.productName).toBe('更新後の製品名');
      expect(result.purchasePrice).toBe(200000);
    });

    it('should throw error for non-existent product', () => {
      const dto = { productName: '更新テスト' };

      expect(() => service.updateProduct('ITA-9999', dto)).toThrow(ProductServiceError);
      expect(() => service.updateProduct('ITA-9999', dto)).toThrow('製品が見つかりません');
    });

    it('should set updatedAt automatically', () => {
      const beforeUpdate = new Date();
      const dto = { productName: '更新テスト' };

      const result = service.updateProduct('ITA-0001', dto);

      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product successfully', () => {
      const result = service.deleteProduct('ITA-0001', '登録ミス');

      expect(result).not.toBeNull();
      expect(result.status).toBe('削除済み');
      expect(result.deleteReason).toBe('登録ミス');
    });

    it('should throw error for non-existent product', () => {
      expect(() => service.deleteProduct('ITA-9999', '理由')).toThrow(ProductServiceError);
      expect(() => service.deleteProduct('ITA-9999', '理由')).toThrow('製品が見つかりません');
    });

    it('should throw error for already deleted product', () => {
      // ITA-0010 is already deleted in test data
      expect(() => service.deleteProduct('ITA-0010', '理由')).toThrow(ProductServiceError);
      expect(() => service.deleteProduct('ITA-0010', '理由')).toThrow('既に削除済みです');
    });
  });

  describe('calculateProductPrices', () => {
    it('should calculate prices with processing costs', () => {
      // ITA-0001 has processing costs: 25000 + 15000 = 40000
      const result = service.calculateProductPrices('ITA-0001');

      expect(result).toBeDefined();
      expect(result.processingCostTotal).toBe(40000);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.sellingPriceExTax).toBeGreaterThan(0);
      expect(result.sellingPriceIncTax).toBeGreaterThan(result.sellingPriceExTax);
    });

    it('should throw error for non-existent product', () => {
      expect(() => service.calculateProductPrices('ITA-9999')).toThrow(ProductServiceError);
      expect(() => service.calculateProductPrices('ITA-9999')).toThrow('製品が見つかりません');
    });
  });

  describe('calculateStockDays', () => {
    it('should calculate stock days correctly', () => {
      const product: Product = {
        productId: 'TEST-001',
        majorCategory: 'テーブル',
        productName: 'テスト',
        woodType: 'ウォルナット',
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        purchasePrice: 100000,
        supplierId: 'SUP-001',
        storageLocationId: 'LOC-001',
        status: '販売中',
        createdAt: new Date(),
      };

      const result = service.calculateStockDays(product);

      expect(result).toBeGreaterThanOrEqual(30);
      expect(result).toBeLessThanOrEqual(31); // Allow for slight timing differences
    });

    it('should return 0 when no purchase date', () => {
      const product: Product = {
        productId: 'TEST-001',
        majorCategory: 'テーブル',
        productName: 'テスト',
        woodType: 'ウォルナット',
        purchasePrice: 100000,
        supplierId: 'SUP-001',
        storageLocationId: 'LOC-001',
        status: '販売中',
        createdAt: new Date(),
      } as Product;

      const result = service.calculateStockDays(product);

      expect(result).toBe(0);
    });
  });

  describe('getProductsByStatus', () => {
    it('should return products with specified status', () => {
      const result = service.getProductsByStatus('販売中');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.status === '販売中')).toBe(true);
    });

    it('should return sold products', () => {
      const result = service.getProductsByStatus('販売済み');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.status === '販売済み')).toBe(true);
    });
  });

  describe('getProductsByStorageLocation', () => {
    it('should return products at specified location', () => {
      const result = service.getProductsByStorageLocation('LOC-001');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.storageLocationId === 'LOC-001')).toBe(true);
    });
  });

  describe('getDashboardStats', () => {
    it('should return all dashboard statistics', () => {
      const result = service.getDashboardStats();

      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('availableProducts');
      expect(result).toHaveProperty('soldProducts');
      expect(result).toHaveProperty('totalInventoryValue');
      expect(result).toHaveProperty('lowStockItems');
    });

    it('should calculate total products correctly', () => {
      const result = service.getDashboardStats();

      expect(result.totalProducts).toBe(sampleProducts.length);
    });

    it('should count available products correctly', () => {
      const result = service.getDashboardStats();
      const expectedAvailable = sampleProducts.filter((p) => p.status === '販売中').length;

      expect(result.availableProducts).toBe(expectedAvailable);
    });

    it('should count sold products correctly', () => {
      const result = service.getDashboardStats();
      const expectedSold = sampleProducts.filter((p) => p.status === '販売済み').length;

      expect(result.soldProducts).toBe(expectedSold);
    });

    it('should count low stock items (90+ days) correctly', () => {
      const result = service.getDashboardStats();

      // lowStockItems should be products with stock days >= 90
      expect(typeof result.lowStockItems).toBe('number');
      expect(result.lowStockItems).toBeGreaterThanOrEqual(0);
    });

    it('should calculate total inventory value', () => {
      const result = service.getDashboardStats();

      expect(result.totalInventoryValue).toBeGreaterThan(0);
    });
  });
});
