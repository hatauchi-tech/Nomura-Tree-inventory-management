/**
 * MasterRepository のテスト
 */

import {
  WoodTypeRepository,
  SupplierRepository,
  ProcessorRepository,
  StorageLocationRepository,
} from '../../../src/server/repositories/MasterRepository';
import {
  WoodType,
  Supplier,
  Processor,
  StorageLocation,
  WOOD_TYPE_HEADERS,
  SUPPLIER_HEADERS,
  PROCESSOR_HEADERS,
  STORAGE_LOCATION_HEADERS,
  woodTypeToRow,
  supplierToRow,
  processorToRow,
  storageLocationToRow,
} from '../../../src/server/types/master';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';
import { SHEET_NAMES } from '../../../src/server/types/common';
import {
  sampleWoodTypes,
  sampleSuppliers,
  sampleProcessors,
  sampleStorageLocations,
} from '../../mocks/testData';

describe('MasterRepository', () => {
  const testSpreadsheetId = 'test-spreadsheet-id';

  // ==================== WoodTypeRepository ====================

  describe('WoodTypeRepository', () => {
    let repository: WoodTypeRepository;

    const convertToSheetData = (woodTypes: WoodType[]): unknown[][] => {
      return [WOOD_TYPE_HEADERS, ...woodTypes.map((wt) => woodTypeToRow(wt))];
    };

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.WOOD_TYPES,
          data: convertToSheetData(sampleWoodTypes),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new WoodTypeRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all wood types', () => {
        const result = repository.findAll();
        expect(result.length).toBe(sampleWoodTypes.length);
      });
    });

    describe('findById', () => {
      it('should find wood type by ID', () => {
        const result = repository.findById('WT-001');
        expect(result).not.toBeNull();
        expect(result?.woodTypeId).toBe('WT-001');
        expect(result?.name).toBe('ウォルナット');
      });

      it('should return null for non-existent ID', () => {
        const result = repository.findById('WT-999');
        expect(result).toBeNull();
      });
    });

    describe('findByName', () => {
      it('should find wood type by name', () => {
        const result = repository.findByName('ウォルナット');
        expect(result).not.toBeNull();
        expect(result?.woodTypeId).toBe('WT-001');
        expect(result?.name).toBe('ウォルナット');
      });

      it('should return null for non-existent name', () => {
        const result = repository.findByName('存在しない樹種');
        expect(result).toBeNull();
      });
    });

    describe('findAllSorted', () => {
      it('should return wood types sorted by display order', () => {
        const result = repository.findAllSorted();
        expect(result.length).toBe(sampleWoodTypes.length);
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].displayOrder).toBeLessThanOrEqual(result[i].displayOrder);
        }
      });
    });

    describe('createFromDto', () => {
      it('should create new wood type from DTO with auto-generated ID', () => {
        const dto = { name: '新しい樹種', displayOrder: 10 };
        const result = repository.createFromDto(dto);

        expect(result).not.toBeNull();
        expect(result.woodTypeId).toMatch(/^WOOD-\d{4}$/);
        expect(result.name).toBe('新しい樹種');
        expect(result.displayOrder).toBe(10);

        // Verify it was persisted
        const found = repository.findByName('新しい樹種');
        expect(found).not.toBeNull();
      });

      it('should auto-set display order if not provided', () => {
        const dto = { name: '自動表示順樹種' };
        const result = repository.createFromDto(dto);

        expect(result.displayOrder).toBeGreaterThan(0);
      });
    });

    describe('isNameExists', () => {
      it('should return true for existing name', () => {
        const result = repository.isNameExists('ウォルナット');
        expect(result).toBe(true);
      });

      it('should return false for non-existent name', () => {
        const result = repository.isNameExists('存在しない樹種');
        expect(result).toBe(false);
      });

      it('should exclude specified ID from check', () => {
        const result = repository.isNameExists('ウォルナット', 'WT-001');
        expect(result).toBe(false);
      });

      it('should find duplicate when excludeId is different', () => {
        const result = repository.isNameExists('ウォルナット', 'WT-002');
        expect(result).toBe(true);
      });
    });

    describe('update', () => {
      it('should update existing wood type', () => {
        const result = repository.update('WT-001', { name: '更新後ウォルナット' });
        expect(result).not.toBeNull();
        expect(result?.name).toBe('更新後ウォルナット');
      });
    });

    describe('delete', () => {
      it('should delete existing wood type', () => {
        const result = repository.delete('WT-001');
        expect(result).toBe(true);
        expect(repository.findById('WT-001')).toBeNull();
      });
    });
  });

  // ==================== SupplierRepository ====================

  describe('SupplierRepository', () => {
    let repository: SupplierRepository;

    const convertToSheetData = (suppliers: Supplier[]): unknown[][] => {
      return [SUPPLIER_HEADERS, ...suppliers.map((s) => supplierToRow(s))];
    };

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.SUPPLIERS,
          data: convertToSheetData(sampleSuppliers),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new SupplierRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all suppliers', () => {
        const result = repository.findAll();
        expect(result.length).toBe(sampleSuppliers.length);
      });
    });

    describe('findById', () => {
      it('should find supplier by ID', () => {
        const result = repository.findById('SUP-001');
        expect(result).not.toBeNull();
        expect(result?.supplierId).toBe('SUP-001');
        expect(result?.name).toBe('木材商会A');
      });

      it('should return null for non-existent ID', () => {
        const result = repository.findById('SUP-999');
        expect(result).toBeNull();
      });
    });

    describe('findByName', () => {
      it('should find supplier by name', () => {
        const result = repository.findByName('木材商会A');
        expect(result).not.toBeNull();
        expect(result?.supplierId).toBe('SUP-001');
        expect(result?.name).toBe('木材商会A');
      });

      it('should return null for non-existent name', () => {
        const result = repository.findByName('存在しない仕入れ先');
        expect(result).toBeNull();
      });
    });

    describe('createFromDto', () => {
      it('should create new supplier from DTO with auto-generated ID', () => {
        const dto = {
          name: '新しい仕入れ先',
          contact: '000-1234-5678',
          address: '大阪府大阪市',
          remarks: 'テスト備考',
        };
        const result = repository.createFromDto(dto);

        expect(result).not.toBeNull();
        expect(result.supplierId).toMatch(/^SUP-\d{4}$/);
        expect(result.name).toBe('新しい仕入れ先');
        expect(result.contact).toBe('000-1234-5678');
        expect(result.address).toBe('大阪府大阪市');
        expect(result.remarks).toBe('テスト備考');
      });

      it('should handle optional fields', () => {
        const dto = { name: 'シンプル仕入れ先' };
        const result = repository.createFromDto(dto);

        expect(result.name).toBe('シンプル仕入れ先');
        expect(result.contact).toBeUndefined();
        expect(result.address).toBeUndefined();
      });
    });

    describe('isNameExists', () => {
      it('should return true for existing name', () => {
        const result = repository.isNameExists('木材商会A');
        expect(result).toBe(true);
      });

      it('should return false for non-existent name', () => {
        const result = repository.isNameExists('存在しない仕入れ先');
        expect(result).toBe(false);
      });

      it('should exclude specified ID from check', () => {
        const result = repository.isNameExists('木材商会A', 'SUP-001');
        expect(result).toBe(false);
      });
    });

    describe('update', () => {
      it('should update existing supplier', () => {
        const result = repository.update('SUP-001', {
          name: '更新後仕入れ先',
          contact: '新連絡先',
        });
        expect(result).not.toBeNull();
        expect(result?.name).toBe('更新後仕入れ先');
        expect(result?.contact).toBe('新連絡先');
      });
    });
  });

  // ==================== ProcessorRepository ====================

  describe('ProcessorRepository', () => {
    let repository: ProcessorRepository;

    const convertToSheetData = (processors: Processor[]): unknown[][] => {
      return [PROCESSOR_HEADERS, ...processors.map((p) => processorToRow(p))];
    };

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.PROCESSORS,
          data: convertToSheetData(sampleProcessors),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new ProcessorRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all processors', () => {
        const result = repository.findAll();
        expect(result.length).toBe(sampleProcessors.length);
      });
    });

    describe('findById', () => {
      it('should find processor by ID', () => {
        const result = repository.findById('PROC-001');
        expect(result).not.toBeNull();
        expect(result?.processorId).toBe('PROC-001');
        expect(result?.name).toBe('木工職人工房');
      });

      it('should return null for non-existent ID', () => {
        const result = repository.findById('PROC-999');
        expect(result).toBeNull();
      });
    });

    describe('findByName', () => {
      it('should find processor by name', () => {
        const result = repository.findByName('木工職人工房');
        expect(result).not.toBeNull();
        expect(result?.processorId).toBe('PROC-001');
      });

      it('should return null for non-existent name', () => {
        const result = repository.findByName('存在しない加工業者');
        expect(result).toBeNull();
      });
    });

    describe('findByProcessingType', () => {
      it('should find processors by processing type', () => {
        const result = repository.findByProcessingType('木材加工');
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((p) => p.processingTypes.includes('木材加工'))).toBe(true);
      });

      it('should find processors with multiple processing types', () => {
        const result = repository.findByProcessingType('塗装');
        expect(result.length).toBeGreaterThan(0);
        // PROC-002 (塗装工房) と PROC-004 (総合加工センター) が該当
      });

      it('should return empty array for non-existent processing type', () => {
        const result = repository.findByProcessingType('存在しない種別' as any);
        expect(result.length).toBe(0);
      });
    });

    describe('createFromDto', () => {
      it('should create new processor from DTO with auto-generated ID', () => {
        const dto = {
          name: '新しい加工業者',
          processingTypes: ['木材加工', '塗装'] as any,
          contact: '000-9999-9999',
          address: '大阪府堺市',
        };
        const result = repository.createFromDto(dto);

        expect(result).not.toBeNull();
        expect(result.processorId).toMatch(/^PROC-\d{4}$/);
        expect(result.name).toBe('新しい加工業者');
        expect(result.processingTypes).toEqual(['木材加工', '塗装']);
      });
    });

    describe('isNameExists', () => {
      it('should return true for existing name', () => {
        const result = repository.isNameExists('木工職人工房');
        expect(result).toBe(true);
      });

      it('should return false for non-existent name', () => {
        const result = repository.isNameExists('存在しない加工業者');
        expect(result).toBe(false);
      });

      it('should exclude specified ID from check', () => {
        const result = repository.isNameExists('木工職人工房', 'PROC-001');
        expect(result).toBe(false);
      });
    });
  });

  // ==================== StorageLocationRepository ====================

  describe('StorageLocationRepository', () => {
    let repository: StorageLocationRepository;

    const convertToSheetData = (locations: StorageLocation[]): unknown[][] => {
      return [STORAGE_LOCATION_HEADERS, ...locations.map((l) => storageLocationToRow(l))];
    };

    beforeEach(() => {
      SpreadsheetAppMock.reset();
      const sheetData: MockSheetData[] = [
        {
          name: SHEET_NAMES.STORAGE_LOCATIONS,
          data: convertToSheetData(sampleStorageLocations),
        },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, '木材在庫', sheetData);
      repository = new StorageLocationRepository(testSpreadsheetId);
    });

    describe('findAll', () => {
      it('should return all storage locations', () => {
        const result = repository.findAll();
        expect(result.length).toBe(sampleStorageLocations.length);
      });
    });

    describe('findById', () => {
      it('should find storage location by ID', () => {
        const result = repository.findById('LOC-001');
        expect(result).not.toBeNull();
        expect(result?.storageLocationId).toBe('LOC-001');
        expect(result?.name).toBe('ショールーム');
      });

      it('should return null for non-existent ID', () => {
        const result = repository.findById('LOC-999');
        expect(result).toBeNull();
      });
    });

    describe('findByName', () => {
      it('should find storage location by name', () => {
        const result = repository.findByName('ショールーム');
        expect(result).not.toBeNull();
        expect(result?.storageLocationId).toBe('LOC-001');
      });

      it('should return null for non-existent name', () => {
        const result = repository.findByName('存在しない保管場所');
        expect(result).toBeNull();
      });
    });

    describe('findAllSorted', () => {
      it('should return storage locations sorted by display order', () => {
        const result = repository.findAllSorted();
        expect(result.length).toBe(sampleStorageLocations.length);
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].displayOrder).toBeLessThanOrEqual(result[i].displayOrder);
        }
      });
    });

    describe('createFromDto', () => {
      it('should create new storage location from DTO with auto-generated ID', () => {
        const dto = { name: '新しい保管場所', displayOrder: 10 };
        const result = repository.createFromDto(dto);

        expect(result).not.toBeNull();
        expect(result.storageLocationId).toMatch(/^LOC-\d{4}$/);
        expect(result.name).toBe('新しい保管場所');
        expect(result.displayOrder).toBe(10);
      });

      it('should auto-set display order if not provided', () => {
        const dto = { name: '自動表示順場所' };
        const result = repository.createFromDto(dto);

        expect(result.displayOrder).toBeGreaterThan(0);
      });
    });

    describe('isNameExists', () => {
      it('should return true for existing name', () => {
        const result = repository.isNameExists('ショールーム');
        expect(result).toBe(true);
      });

      it('should return false for non-existent name', () => {
        const result = repository.isNameExists('存在しない保管場所');
        expect(result).toBe(false);
      });

      it('should exclude specified ID from check', () => {
        const result = repository.isNameExists('ショールーム', 'LOC-001');
        expect(result).toBe(false);
      });
    });

    describe('updateLastInventoryDate', () => {
      it('should update last inventory date', () => {
        const newDate = new Date('2025-01-25');
        const result = repository.updateLastInventoryDate('LOC-001', newDate);

        expect(result).not.toBeNull();
        expect(result?.lastInventoryDate).toEqual(newDate);
      });

      it('should return null for non-existent location', () => {
        const newDate = new Date('2025-01-25');
        const result = repository.updateLastInventoryDate('LOC-999', newDate);

        expect(result).toBeNull();
      });
    });
  });
});
