/**
 * ProductRepository のテスト
 */

import { ProductRepository } from '../../../src/server/repositories/ProductRepository';
import { Product, PRODUCT_HEADERS, productToRow } from '../../../src/server/types/product';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import { sampleProducts } from '../../mocks/testData';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  const testSpreadsheetId = 'test-spreadsheet-id';

  // テストデータをシートデータ形式に変換
  const convertToSheetData = (products: Product[]): unknown[][] => {
    return [
      PRODUCT_HEADERS,
      ...products.map((p) => productToRow(p)),
    ];
  };

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      {
        name: SHEET_NAMES.PRODUCTS,
        data: convertToSheetData(sampleProducts),
      },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
    repository = new ProductRepository(testSpreadsheetId);
  });

  describe('findAll', () => {
    it('should return all products', () => {
      const result = repository.findAll();
      expect(result.length).toBe(sampleProducts.length);
    });
  });

  describe('findById', () => {
    it('should find product by ID', () => {
      const result = repository.findById('ITA-0001');
      expect(result).not.toBeNull();
      expect(result?.productId).toBe('ITA-0001');
      expect(result?.productName).toBe('ウォルナット一枚板テーブル');
    });

    it('should return null for non-existent ID', () => {
      const result = repository.findById('ITA-9999');
      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should find products by status', () => {
      const result = repository.findByStatus('販売中');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.status === '販売中')).toBe(true);
    });

    it('should find sold products', () => {
      const result = repository.findByStatus('販売済み');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.status === '販売済み')).toBe(true);
    });
  });

  describe('findByStorageLocation', () => {
    it('should find products by storage location', () => {
      const result = repository.findByStorageLocation('LOC-001');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.storageLocationId === 'LOC-001')).toBe(true);
    });
  });

  describe('findByWoodType', () => {
    it('should find products by wood type', () => {
      const result = repository.findByWoodType('ウォルナット');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.woodType === 'ウォルナット')).toBe(true);
    });
  });

  describe('findAvailable', () => {
    it('should return only available products', () => {
      const result = repository.findAvailable();
      expect(result.every((p) => p.status === '販売中')).toBe(true);
    });
  });

  describe('findActive', () => {
    it('should return products excluding deleted', () => {
      const result = repository.findActive();
      expect(result.every((p) => p.status !== '削除済み')).toBe(true);
    });
  });

  describe('search', () => {
    it('should search by keyword', () => {
      const result = repository.search({ keyword: 'ウォルナット' });
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((p) =>
          p.productName.toLowerCase().includes('ウォルナット'.toLowerCase())
        )
      ).toBe(true);
    });

    it('should search by major category', () => {
      const result = repository.search({ majorCategories: ['テーブル'] });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.majorCategory === 'テーブル')).toBe(true);
    });

    it('should search by multiple wood types', () => {
      const result = repository.search({
        woodTypes: ['ウォルナット', '杉'],
      });
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (p) => p.woodType === 'ウォルナット' || p.woodType === '杉'
        )
      ).toBe(true);
    });

    it('should exclude deleted products by default', () => {
      const result = repository.search({});
      expect(result.every((p) => p.status !== '削除済み')).toBe(true);
    });

    it('should include deleted products when explicitly requested', () => {
      const result = repository.search({ statuses: ['削除済み'] });
      expect(result.every((p) => p.status === '削除済み')).toBe(true);
    });

    it('should search by purchase price range', () => {
      const result = repository.search({
        purchasePriceRange: { min: 100000, max: 200000 },
      });
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (p) => p.purchasePrice >= 100000 && p.purchasePrice <= 200000
        )
      ).toBe(true);
    });

    it('should sort by purchase date descending', () => {
      const result = repository.search({
        sortBy: 'purchaseDate',
        sortOrder: 'desc',
      });
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].purchaseDate.getTime()).toBeGreaterThanOrEqual(
          result[i].purchaseDate.getTime()
        );
      }
    });

    it('should sort by product name ascending', () => {
      const result = repository.search({
        sortBy: 'productName',
        sortOrder: 'asc',
      });
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].productName <= result[i].productName).toBe(true);
      }
    });
  });

  describe('searchWithPagination', () => {
    it('should return paginated results', () => {
      const result = repository.searchWithPagination(
        {},
        { page: 1, limit: 3 }
      );
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('create', () => {
    it('should create new product', () => {
      const newProduct: Product = {
        productId: 'ITA-0100',
        majorCategory: 'テーブル',
        productName: '新規テスト製品',
        woodType: 'ウォルナット',
        supplierId: 'SUP-001',
        purchaseDate: new Date('2025-01-25'),
        purchasePrice: 100000,
        storageLocationId: 'LOC-001',
        status: '販売中',
        createdAt: new Date(),
      };

      const result = repository.create(newProduct);
      expect(result.productId).toBe('ITA-0100');

      const found = repository.findById('ITA-0100');
      expect(found).not.toBeNull();
      expect(found?.productName).toBe('新規テスト製品');
    });
  });

  describe('updateStatus', () => {
    it('should update product status', () => {
      const result = repository.updateStatus('ITA-0001', '棚卸し中');
      expect(result).not.toBeNull();
      expect(result?.status).toBe('棚卸し中');

      const found = repository.findById('ITA-0001');
      expect(found?.status).toBe('棚卸し中');
    });
  });

  describe('softDelete', () => {
    it('should soft delete product', () => {
      const result = repository.softDelete('ITA-0001', '登録ミス');
      expect(result).not.toBeNull();
      expect(result?.status).toBe('削除済み');
      expect(result?.deleteReason).toBe('登録ミス');

      const found = repository.findById('ITA-0001');
      expect(found?.status).toBe('削除済み');
    });
  });

  describe('restore', () => {
    it('should restore deleted product', () => {
      // ITA-0010 is already deleted in test data
      const result = repository.restore('ITA-0010');
      expect(result).not.toBeNull();
      expect(result?.status).toBe('販売中');
    });
  });

  describe('markAsSold', () => {
    it('should mark product as sold', () => {
      const result = repository.markAsSold(
        'ITA-0001',
        '山田様',
        new Date('2025-01-25'),
        600000,
        'お買い上げありがとうございます'
      );

      expect(result).not.toBeNull();
      expect(result?.status).toBe('販売済み');
      expect(result?.salesDestination).toBe('山田様');
      expect(result?.actualSalesPrice).toBe(600000);
    });
  });

  describe('cancelSale', () => {
    it('should cancel sale and revert to available', () => {
      // ITA-0003 is already sold in test data
      const result = repository.cancelSale('ITA-0003');
      expect(result).not.toBeNull();
      expect(result?.status).toBe('販売中');
      expect(result?.salesDestination).toBeUndefined();
    });
  });

  describe('changeStorageLocation', () => {
    it('should change storage location', () => {
      const result = repository.changeStorageLocation('ITA-0001', 'LOC-002');
      expect(result).not.toBeNull();
      expect(result?.storageLocationId).toBe('LOC-002');
    });
  });
});
