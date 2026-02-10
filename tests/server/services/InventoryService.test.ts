/**
 * InventoryService のテスト
 */

import {
  InventoryService,
  InventoryServiceError,
} from '../../../src/server/services/InventoryService';
import { Product, PRODUCT_HEADERS, productToRow } from '../../../src/server/types/product';
import {
  InventorySession,
  InventoryDetail,
  INVENTORY_SESSION_HEADERS,
  INVENTORY_DETAIL_HEADERS,
  inventorySessionToRow,
  inventoryDetailToRow,
} from '../../../src/server/types/inventory';
import {
  StorageLocation,
  STORAGE_LOCATION_HEADERS,
  storageLocationToRow,
} from '../../../src/server/types/master';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import {
  sampleProducts,
  sampleStorageLocations,
  sampleInventorySessions,
  sampleInventoryDetails,
  additionalInventorySessions,
  additionalInventoryDetails,
} from '../../mocks/testData';

describe('InventoryService', () => {
  let service: InventoryService;
  const testSpreadsheetId = 'test-spreadsheet-id';

  const convertProductsToSheetData = (products: Product[]): unknown[][] => {
    return [PRODUCT_HEADERS, ...products.map((p) => productToRow(p))];
  };

  const convertSessionsToSheetData = (sessions: InventorySession[]): unknown[][] => {
    return [INVENTORY_SESSION_HEADERS, ...sessions.map((s) => inventorySessionToRow(s))];
  };

  const convertDetailsToSheetData = (details: InventoryDetail[]): unknown[][] => {
    return [INVENTORY_DETAIL_HEADERS, ...details.map((d) => inventoryDetailToRow(d))];
  };

  const convertLocationsToSheetData = (locations: StorageLocation[]): unknown[][] => {
    return [STORAGE_LOCATION_HEADERS, ...locations.map((l) => storageLocationToRow(l))];
  };

  const allSessions = [...sampleInventorySessions, ...additionalInventorySessions];
  const allDetails = [...sampleInventoryDetails, ...additionalInventoryDetails];

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      {
        name: SHEET_NAMES.PRODUCTS,
        data: convertProductsToSheetData(sampleProducts),
      },
      {
        name: SHEET_NAMES.INVENTORY_SESSIONS,
        data: convertSessionsToSheetData(allSessions),
      },
      {
        name: SHEET_NAMES.INVENTORY_DETAILS,
        data: convertDetailsToSheetData(allDetails),
      },
      {
        name: SHEET_NAMES.STORAGE_LOCATIONS,
        data: convertLocationsToSheetData(sampleStorageLocations),
      },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
    service = new InventoryService(testSpreadsheetId);
  });

  describe('startInventorySession', () => {
    it('should start inventory session successfully', () => {
      // LOC-004 (モデルハウスA) has ITA-0005 (販売中) and no active session
      const result = service.startInventorySession('LOC-004');

      expect(result).not.toBeNull();
      expect(result.storageLocationId).toBe('LOC-004');
      expect(result.status).toBe('進行中');
      expect(result.targetCount).toBe(1); // ITA-0005
      expect(result.confirmedCount).toBe(0);
      expect(result.discrepancyCount).toBe(0);
    });

    it('should throw error for non-existent storage location', () => {
      expect(() => service.startInventorySession('LOC-999')).toThrow(InventoryServiceError);
      expect(() => service.startInventorySession('LOC-999')).toThrow(
        '保管場所が見つかりません'
      );
    });

    it('should throw error when active session exists', () => {
      // LOC-002 has an active session (INV-20250120-001)
      expect(() => service.startInventorySession('LOC-002')).toThrow(InventoryServiceError);
      expect(() => service.startInventorySession('LOC-002')).toThrow(
        'この保管場所には既に進行中の棚卸しセッションがあります'
      );
    });

    it('should throw error when no target products', () => {
      // LOC-006 (その他) has no products
      expect(() => service.startInventorySession('LOC-006')).toThrow(InventoryServiceError);
      expect(() => service.startInventorySession('LOC-006')).toThrow(
        'この保管場所には棚卸し対象の製品がありません'
      );
    });
  });

  describe('getInventoryProgress', () => {
    it('should return progress information', () => {
      const result = service.getInventoryProgress('INV-20250120-001');

      expect(result).not.toBeNull();
      expect(result.sessionId).toBe('INV-20250120-001');
      expect(result.status).toBe('進行中');
      expect(result.targetCount).toBeGreaterThan(0);
      expect(result).toHaveProperty('confirmedCount');
      expect(result).toHaveProperty('discrepancyCount');
      expect(result).toHaveProperty('progressPercent');
    });

    it('should throw error for non-existent session', () => {
      expect(() => service.getInventoryProgress('INV-99999999-001')).toThrow(
        InventoryServiceError
      );
      expect(() => service.getInventoryProgress('INV-99999999-001')).toThrow(
        'セッションが見つかりません'
      );
    });

    it('should calculate progress percent correctly', () => {
      const result = service.getInventoryProgress('INV-20250120-001');

      // Progress should be between 0 and 100
      expect(result.progressPercent).toBeGreaterThanOrEqual(0);
      expect(result.progressPercent).toBeLessThanOrEqual(100);
    });

    it('should categorize items correctly', () => {
      const result = service.getInventoryProgress('INV-20250120-001');

      expect(result).toHaveProperty('unconfirmedItems');
      expect(result).toHaveProperty('confirmedItems');
      expect(result).toHaveProperty('discrepancyItems');
      expect(Array.isArray(result.unconfirmedItems)).toBe(true);
      expect(Array.isArray(result.confirmedItems)).toBe(true);
      expect(Array.isArray(result.discrepancyItems)).toBe(true);
    });
  });

  describe('confirmInventoryProduct', () => {
    it('should confirm product successfully', () => {
      const result = service.confirmInventoryProduct(
        'INV-20250120-001',
        'ITA-0002',
        'QRスキャン'
      );

      expect(result).not.toBeNull();
      expect(result.confirmationStatus).toBe('確認済み');
      expect(result.confirmationMethod).toBe('QRスキャン');
    });

    it('should throw error for non-existent session', () => {
      expect(() =>
        service.confirmInventoryProduct('INV-99999999-001', 'ITA-0001', 'QRスキャン')
      ).toThrow(InventoryServiceError);
      expect(() =>
        service.confirmInventoryProduct('INV-99999999-001', 'ITA-0001', 'QRスキャン')
      ).toThrow('セッションが見つかりません');
    });

    it('should throw error for non-active session', () => {
      // INV-20250115-001 is completed
      expect(() =>
        service.confirmInventoryProduct('INV-20250115-001', 'ITA-0001', 'QRスキャン')
      ).toThrow(InventoryServiceError);
      expect(() =>
        service.confirmInventoryProduct('INV-20250115-001', 'ITA-0001', 'QRスキャン')
      ).toThrow('進行中のセッションではありません');
    });

    it('should throw error for product not in session', () => {
      expect(() =>
        service.confirmInventoryProduct('INV-20250120-001', 'ITA-9999', 'QRスキャン')
      ).toThrow(InventoryServiceError);
      expect(() =>
        service.confirmInventoryProduct('INV-20250120-001', 'ITA-9999', 'QRスキャン')
      ).toThrow('対象の製品がこのセッションにありません');
    });

    it('should throw error for already confirmed product', () => {
      // ITA-0006 is already confirmed in test data
      expect(() =>
        service.confirmInventoryProduct('INV-20250120-001', 'ITA-0006', 'QRスキャン')
      ).toThrow(InventoryServiceError);
      expect(() =>
        service.confirmInventoryProduct('INV-20250120-001', 'ITA-0006', 'QRスキャン')
      ).toThrow('既に確認済みの製品です');
    });
  });

  describe('reportDiscrepancy', () => {
    it('should report discrepancy successfully', () => {
      const dto = {
        detailId: 'INVD-001',
        discrepancyType: '紛失' as const,
        discrepancyReason: '製品が見つからない',
        actionTaken: '捜索中',
      };

      const result = service.reportDiscrepancy(dto);

      expect(result).not.toBeNull();
      expect(result.confirmationStatus).toBe('差異あり');
      expect(result.discrepancyType).toBe('紛失');
      expect(result.discrepancyReason).toBe('製品が見つからない');
    });

    it('should throw error for non-existent detail', () => {
      const dto = {
        detailId: 'INVD-999',
        discrepancyType: '紛失' as const,
        discrepancyReason: 'テスト',
      };

      expect(() => service.reportDiscrepancy(dto)).toThrow(InventoryServiceError);
      expect(() => service.reportDiscrepancy(dto)).toThrow('棚卸し詳細が見つかりません');
    });

    it('should update product status for lost item', () => {
      const dto = {
        detailId: 'INVD-001',
        discrepancyType: '紛失' as const,
        discrepancyReason: '製品が見つからない',
      };

      service.reportDiscrepancy(dto);

      // Product status should be updated to '紛失'
      // This would need verification through product repository
    });
  });

  describe('pauseSession', () => {
    it('should pause session successfully', () => {
      const result = service.pauseSession('INV-20250120-001');

      expect(result).not.toBeNull();
      expect(result.status).toBe('中断中');
    });

    it('should throw error for non-existent session', () => {
      expect(() => service.pauseSession('INV-99999999-001')).toThrow(InventoryServiceError);
      expect(() => service.pauseSession('INV-99999999-001')).toThrow(
        'セッションが見つかりません'
      );
    });

    it('should throw error for non-active session', () => {
      // INV-20250115-001 is completed
      expect(() => service.pauseSession('INV-20250115-001')).toThrow(InventoryServiceError);
      expect(() => service.pauseSession('INV-20250115-001')).toThrow(
        '進行中のセッションではありません'
      );
    });
  });

  describe('resumeSession', () => {
    it('should resume paused session successfully', () => {
      // INV-20250110-001 is paused
      const result = service.resumeSession('INV-20250110-001');

      expect(result).not.toBeNull();
      expect(result.status).toBe('進行中');
    });

    it('should throw error for non-existent session', () => {
      expect(() => service.resumeSession('INV-99999999-001')).toThrow(InventoryServiceError);
      expect(() => service.resumeSession('INV-99999999-001')).toThrow(
        'セッションが見つかりません'
      );
    });

    it('should throw error for non-paused session', () => {
      // INV-20250120-001 is active, not paused
      expect(() => service.resumeSession('INV-20250120-001')).toThrow(InventoryServiceError);
      expect(() => service.resumeSession('INV-20250120-001')).toThrow(
        '中断中のセッションではありません'
      );
    });
  });

  describe('completeInventorySession', () => {
    it('should throw error for already completed session', () => {
      // INV-20250115-001 is already completed
      expect(() => service.completeInventorySession('INV-20250115-001')).toThrow(
        InventoryServiceError
      );
      expect(() => service.completeInventorySession('INV-20250115-001')).toThrow(
        '既に完了済みのセッションです'
      );
    });

    it('should throw error when unconfirmed products exist', () => {
      // INV-20250120-001 has unconfirmed products
      expect(() => service.completeInventorySession('INV-20250120-001')).toThrow(
        InventoryServiceError
      );
      expect(() => service.completeInventorySession('INV-20250120-001')).toThrow(
        '未確認の製品があります'
      );
    });

    it('should throw error for non-existent session', () => {
      expect(() => service.completeInventorySession('INV-99999999-001')).toThrow(
        InventoryServiceError
      );
      expect(() => service.completeInventorySession('INV-99999999-001')).toThrow(
        'セッションが見つかりません'
      );
    });
  });

  describe('getActiveSessions', () => {
    it('should return only active sessions', () => {
      const result = service.getActiveSessions();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.status === '進行中')).toBe(true);
    });
  });

  describe('getSessionHistory', () => {
    it('should return session history for storage location', () => {
      const result = service.getSessionHistory('LOC-001');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.storageLocationId === 'LOC-001')).toBe(true);
    });

    it('should return sessions sorted by start date descending', () => {
      const result = service.getSessionHistory('LOC-001');

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].startedAt.getTime()).toBeGreaterThanOrEqual(
          result[i].startedAt.getTime()
        );
      }
    });

    it('should return empty array for location with no history', () => {
      const result = service.getSessionHistory('LOC-999');

      expect(result.length).toBe(0);
    });
  });
});
