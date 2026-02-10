/**
 * InventoryRepository のテスト
 */

import {
  InventorySessionRepository,
  InventoryDetailRepository,
} from '../../../src/server/repositories/InventoryRepository';
import {
  InventorySession,
  InventoryDetail,
  INVENTORY_SESSION_HEADERS,
  INVENTORY_DETAIL_HEADERS,
  inventorySessionToRow,
  inventoryDetailToRow,
} from '../../../src/server/types/inventory';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import {
  sampleInventorySessions,
  sampleInventoryDetails,
  additionalInventorySessions,
  additionalInventoryDetails,
} from '../../mocks/testData';

describe('InventoryRepository', () => {
  const testSpreadsheetId = 'test-spreadsheet-id';

  // ==================== InventorySessionRepository ====================

  describe('InventorySessionRepository', () => {
    let repository: InventorySessionRepository;

    const convertSessionsToSheetData = (sessions: InventorySession[]): unknown[][] => {
      return [INVENTORY_SESSION_HEADERS, ...sessions.map((s) => inventorySessionToRow(s))];
    };

    const allSessions = [...sampleInventorySessions, ...additionalInventorySessions];

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.INVENTORY_SESSIONS,
          data: convertSessionsToSheetData(allSessions),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new InventorySessionRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all inventory sessions', () => {
        const result = repository.findAll();
        expect(result.length).toBe(allSessions.length);
      });
    });

    describe('findById', () => {
      it('should find session by ID', () => {
        const result = repository.findById('INV-20250115-001');
        expect(result).not.toBeNull();
        expect(result?.sessionId).toBe('INV-20250115-001');
        expect(result?.storageLocationId).toBe('LOC-001');
        expect(result?.status).toBe('完了');
      });

      it('should return null for non-existent ID', () => {
        const result = repository.findById('INV-99999999-001');
        expect(result).toBeNull();
      });
    });

    describe('findByStorageLocationId', () => {
      it('should find sessions by storage location ID', () => {
        const result = repository.findByStorageLocationId('LOC-001');
        expect(result.length).toBe(1);
        expect(result.every((s) => s.storageLocationId === 'LOC-001')).toBe(true);
      });

      it('should return empty array for location with no sessions', () => {
        const result = repository.findByStorageLocationId('LOC-999');
        expect(result.length).toBe(0);
      });
    });

    describe('findByStatus', () => {
      it('should find sessions by status - completed', () => {
        const result = repository.findByStatus('完了');
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((s) => s.status === '完了')).toBe(true);
      });

      it('should find sessions by status - in progress', () => {
        const result = repository.findByStatus('進行中');
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((s) => s.status === '進行中')).toBe(true);
      });

      it('should find sessions by status - paused', () => {
        const result = repository.findByStatus('中断中');
        expect(result.length).toBe(1);
        expect(result[0].status).toBe('中断中');
      });
    });

    describe('findActiveSessions', () => {
      it('should return only in-progress sessions', () => {
        const result = repository.findActiveSessions();
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((s) => s.status === '進行中')).toBe(true);
      });
    });

    describe('findLatestByStorageLocationId', () => {
      it('should return latest session for location', () => {
        const result = repository.findLatestByStorageLocationId('LOC-001');
        expect(result).not.toBeNull();
        expect(result?.storageLocationId).toBe('LOC-001');
      });

      it('should return null for location with no sessions', () => {
        const result = repository.findLatestByStorageLocationId('LOC-999');
        expect(result).toBeNull();
      });
    });

    describe('createSession', () => {
      it('should create new session with auto-generated ID', () => {
        const dto = {
          storageLocationId: 'LOC-004',
          startedBy: 'test@example.com',
        };

        const result = repository.createSession(dto, 10);

        expect(result).not.toBeNull();
        expect(result.sessionId).toMatch(/^INV-\d{8}-\d{3}$/);
        expect(result.storageLocationId).toBe('LOC-004');
        expect(result.startedBy).toBe('test@example.com');
        expect(result.status).toBe('進行中');
        expect(result.targetCount).toBe(10);
        expect(result.confirmedCount).toBe(0);
        expect(result.discrepancyCount).toBe(0);
      });
    });

    describe('completeSession', () => {
      it('should complete session', () => {
        const result = repository.completeSession('INV-20250120-001', 'completer@example.com');

        expect(result).not.toBeNull();
        expect(result?.status).toBe('完了');
        expect(result?.completedBy).toBe('completer@example.com');
        expect(result?.completedAt).toBeDefined();
      });

      it('should return null for non-existent session', () => {
        const result = repository.completeSession('INV-99999999-001', 'test@example.com');
        expect(result).toBeNull();
      });
    });

    describe('pauseSession', () => {
      it('should pause session', () => {
        const result = repository.pauseSession('INV-20250120-001');

        expect(result).not.toBeNull();
        expect(result?.status).toBe('中断中');
      });
    });

    describe('resumeSession', () => {
      it('should resume paused session', () => {
        const result = repository.resumeSession('INV-20250110-001');

        expect(result).not.toBeNull();
        expect(result?.status).toBe('進行中');
      });
    });

    describe('updateConfirmedCount', () => {
      it('should update confirmed count', () => {
        const result = repository.updateConfirmedCount('INV-20250120-001', 5);

        expect(result).not.toBeNull();
        expect(result?.confirmedCount).toBe(5);
      });
    });

    describe('updateDiscrepancyCount', () => {
      it('should update discrepancy count', () => {
        const result = repository.updateDiscrepancyCount('INV-20250120-001', 2);

        expect(result).not.toBeNull();
        expect(result?.discrepancyCount).toBe(2);
      });
    });

    describe('updateCounts', () => {
      it('should update both counts at once', () => {
        const result = repository.updateCounts('INV-20250120-001', 8, 3);

        expect(result).not.toBeNull();
        expect(result?.confirmedCount).toBe(8);
        expect(result?.discrepancyCount).toBe(3);
      });
    });
  });

  // ==================== InventoryDetailRepository ====================

  describe('InventoryDetailRepository', () => {
    let repository: InventoryDetailRepository;

    const convertDetailsToSheetData = (details: InventoryDetail[]): unknown[][] => {
      return [INVENTORY_DETAIL_HEADERS, ...details.map((d) => inventoryDetailToRow(d))];
    };

    const allDetails = [...sampleInventoryDetails, ...additionalInventoryDetails];

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.INVENTORY_DETAILS,
          data: convertDetailsToSheetData(allDetails),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new InventoryDetailRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all inventory details', () => {
        const result = repository.findAll();
        expect(result.length).toBe(allDetails.length);
      });
    });

    describe('findById', () => {
      it('should find detail by ID', () => {
        const result = repository.findById('INVD-001');
        expect(result).not.toBeNull();
        expect(result?.detailId).toBe('INVD-001');
        expect(result?.sessionId).toBe('INV-20250120-001');
      });
    });

    describe('findBySessionId', () => {
      it('should find details by session ID', () => {
        const result = repository.findBySessionId('INV-20250120-001');
        expect(result.length).toBe(3);
        expect(result.every((d) => d.sessionId === 'INV-20250120-001')).toBe(true);
      });

      it('should return empty array for session with no details', () => {
        const result = repository.findBySessionId('INV-99999999-001');
        expect(result.length).toBe(0);
      });
    });

    describe('findByProductId', () => {
      it('should find details by product ID', () => {
        const result = repository.findByProductId('ITA-0002');
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((d) => d.productId === 'ITA-0002')).toBe(true);
      });
    });

    describe('findBySessionAndProductId', () => {
      it('should find detail by session and product ID', () => {
        const result = repository.findBySessionAndProductId('INV-20250120-001', 'ITA-0002');
        expect(result).not.toBeNull();
        expect(result?.sessionId).toBe('INV-20250120-001');
        expect(result?.productId).toBe('ITA-0002');
      });

      it('should return null for non-existent combination', () => {
        const result = repository.findBySessionAndProductId('INV-20250120-001', 'ITA-9999');
        expect(result).toBeNull();
      });
    });

    describe('findUnconfirmedBySessionId', () => {
      it('should find unconfirmed details', () => {
        const result = repository.findUnconfirmedBySessionId('INV-20250120-001');
        expect(result.length).toBe(2);
        expect(result.every((d) => d.confirmationStatus === '未確認')).toBe(true);
      });
    });

    describe('findConfirmedBySessionId', () => {
      it('should find confirmed details', () => {
        const result = repository.findConfirmedBySessionId('INV-20250120-001');
        expect(result.length).toBe(1);
        expect(result.every((d) => d.confirmationStatus === '確認済み')).toBe(true);
      });
    });

    describe('findDiscrepancyBySessionId', () => {
      it('should find details with discrepancy', () => {
        // First create a discrepancy
        repository.adjustDiscrepancy({
          detailId: 'INVD-001',
          discrepancyType: '紛失',
          discrepancyReason: 'テスト紛失',
        });

        const result = repository.findDiscrepancyBySessionId('INV-20250120-001');
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((d) => d.confirmationStatus === '差異あり')).toBe(true);
      });
    });

    describe('createDetails', () => {
      it('should create multiple details at once', () => {
        const productIds = ['ITA-0001', 'ITA-0002', 'ITA-0003'];
        const result = repository.createDetails('INV-NEW-001', productIds);

        expect(result.length).toBe(3);
        expect(result.every((d) => d.sessionId === 'INV-NEW-001')).toBe(true);
        expect(result.every((d) => d.confirmationStatus === '未確認')).toBe(true);
        expect(result.map((d) => d.productId)).toEqual(productIds);
      });

      it('should generate sequential detail IDs', () => {
        const productIds = ['ITA-0001', 'ITA-0002'];
        const result = repository.createDetails('INV-NEW-002', productIds);

        expect(result[0].detailId).toBe('INV-NEW-002-0001');
        expect(result[1].detailId).toBe('INV-NEW-002-0002');
      });
    });

    describe('confirmProduct', () => {
      it('should confirm product', () => {
        const dto = {
          sessionId: 'INV-20250120-001',
          productId: 'ITA-0002',
          confirmationMethod: 'QRスキャン' as const,
          confirmedBy: 'confirmer@example.com',
        };

        const result = repository.confirmProduct(dto);

        expect(result).not.toBeNull();
        expect(result?.confirmationStatus).toBe('確認済み');
        expect(result?.confirmationMethod).toBe('QRスキャン');
        expect(result?.confirmedBy).toBe('confirmer@example.com');
        expect(result?.confirmedAt).toBeDefined();
      });

      it('should return null for non-existent combination', () => {
        const dto = {
          sessionId: 'INV-20250120-001',
          productId: 'ITA-9999',
          confirmationMethod: 'QRスキャン' as const,
          confirmedBy: 'test@example.com',
        };

        const result = repository.confirmProduct(dto);
        expect(result).toBeNull();
      });
    });

    describe('adjustDiscrepancy', () => {
      it('should adjust discrepancy', () => {
        const dto = {
          detailId: 'INVD-001',
          discrepancyType: '紛失' as const,
          discrepancyReason: '製品が見つからない',
          actionTaken: '捜索中',
        };

        const result = repository.adjustDiscrepancy(dto);

        expect(result).not.toBeNull();
        expect(result?.confirmationStatus).toBe('差異あり');
        expect(result?.discrepancyType).toBe('紛失');
        expect(result?.discrepancyReason).toBe('製品が見つからない');
        expect(result?.actionTaken).toBe('捜索中');
      });

      it('should handle location discrepancy', () => {
        const dto = {
          detailId: 'INVD-001',
          discrepancyType: '場所違い' as const,
          discrepancyReason: '別の倉庫で発見',
        };

        const result = repository.adjustDiscrepancy(dto);

        expect(result?.discrepancyType).toBe('場所違い');
      });
    });

    describe('countConfirmedBySessionId', () => {
      it('should count confirmed items', () => {
        const result = repository.countConfirmedBySessionId('INV-20250120-001');
        expect(result).toBe(1);
      });
    });

    describe('countDiscrepancyBySessionId', () => {
      it('should count discrepancy items', () => {
        // Initially no discrepancies
        const initialCount = repository.countDiscrepancyBySessionId('INV-20250120-001');
        expect(initialCount).toBe(0);

        // Add discrepancy
        repository.adjustDiscrepancy({
          detailId: 'INVD-001',
          discrepancyType: '紛失',
          discrepancyReason: 'テスト',
        });

        const afterCount = repository.countDiscrepancyBySessionId('INV-20250120-001');
        expect(afterCount).toBe(1);
      });
    });

    describe('deleteBySessionId', () => {
      it('should delete all details for session', () => {
        const beforeCount = repository.findBySessionId('INV-20250120-001').length;
        expect(beforeCount).toBe(3);

        const deletedCount = repository.deleteBySessionId('INV-20250120-001');
        expect(deletedCount).toBe(3);

        const afterCount = repository.findBySessionId('INV-20250120-001').length;
        expect(afterCount).toBe(0);
      });

      it('should return 0 when session has no details', () => {
        const deletedCount = repository.deleteBySessionId('INV-99999999-001');
        expect(deletedCount).toBe(0);
      });

      it('should not affect other sessions', () => {
        repository.deleteBySessionId('INV-20250120-001');

        const otherDetails = repository.findBySessionId('INV-20250110-001');
        expect(otherDetails.length).toBe(2);
      });
    });
  });
});
