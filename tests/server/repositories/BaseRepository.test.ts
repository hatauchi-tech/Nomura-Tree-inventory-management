/**
 * BaseRepository のテスト
 */

import { BaseRepository, RepositoryConfig } from '../../../src/server/repositories/BaseRepository';
import { SpreadsheetAppMock, MockSheetData } from '../../mocks/SpreadsheetAppMock';

// テスト用のエンティティ型
interface TestEntity {
  id: string;
  name: string;
  value: number;
  createdAt: Date;
}

// テスト用のリポジトリ
class TestRepository extends BaseRepository<TestEntity> {
  protected rowToEntity(row: unknown[]): TestEntity {
    return {
      id: String(row[0] ?? ''),
      name: String(row[1] ?? ''),
      value: Number(row[2]) || 0,
      createdAt: row[3] instanceof Date ? row[3] : new Date(row[3] as string || Date.now()),
    };
  }

  protected entityToRow(entity: TestEntity): unknown[] {
    return [entity.id, entity.name, entity.value, entity.createdAt];
  }

  protected getIdColumnIndex(): number {
    return 0;
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  const testSheetName = 'テストシート';
  const testSpreadsheetId = 'test-spreadsheet-id';

  const testHeaders = ['ID', '名前', '値', '作成日時'];
  const testData: unknown[][] = [
    testHeaders,
    ['T-001', 'テスト1', 100, new Date('2025-01-01')],
    ['T-002', 'テスト2', 200, new Date('2025-01-02')],
    ['T-003', 'テスト3', 300, new Date('2025-01-03')],
  ];

  beforeEach(() => {
    SpreadsheetAppMock.reset();
    const sheetData: MockSheetData[] = [
      { name: testSheetName, data: JSON.parse(JSON.stringify(testData)) },
    ];
    SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, 'テストシート', sheetData);

    const config: RepositoryConfig = {
      spreadsheetId: testSpreadsheetId,
      sheetName: testSheetName,
      headers: testHeaders,
    };
    repository = new TestRepository(config);
  });

  describe('findAll', () => {
    it('should return all entities', () => {
      const result = repository.findAll();
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('T-001');
      expect(result[1].id).toBe('T-002');
      expect(result[2].id).toBe('T-003');
    });

    it('should return empty array for empty sheet', () => {
      const emptySheetData: MockSheetData[] = [
        { name: testSheetName, data: [testHeaders] },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, 'テストシート', emptySheetData);

      const result = repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find entity by ID', () => {
      const result = repository.findById('T-002');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('T-002');
      expect(result?.name).toBe('テスト2');
      expect(result?.value).toBe(200);
    });

    it('should return null for non-existent ID', () => {
      const result = repository.findById('T-999');
      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should find multiple entities by IDs', () => {
      const result = repository.findByIds(['T-001', 'T-003']);
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['T-001', 'T-003']);
    });

    it('should return empty array for non-existent IDs', () => {
      const result = repository.findByIds(['T-999', 'T-888']);
      expect(result).toHaveLength(0);
    });

    it('should return partial results for mixed IDs', () => {
      const result = repository.findByIds(['T-001', 'T-999']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('T-001');
    });
  });

  describe('create', () => {
    it('should create new entity', () => {
      const newEntity: TestEntity = {
        id: 'T-004',
        name: 'テスト4',
        value: 400,
        createdAt: new Date('2025-01-04'),
      };

      const result = repository.create(newEntity);

      expect(result.id).toBe('T-004');
      expect(result.name).toBe('テスト4');

      // 検証: 追加されたデータが取得できること
      const found = repository.findById('T-004');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('テスト4');
    });
  });

  describe('update', () => {
    it('should update existing entity', () => {
      const updated = repository.update('T-002', { name: '更新テスト2', value: 999 });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('更新テスト2');
      expect(updated?.value).toBe(999);

      // 検証: 更新されたデータが取得できること
      const found = repository.findById('T-002');
      expect(found?.name).toBe('更新テスト2');
      expect(found?.value).toBe(999);
    });

    it('should return null for non-existent ID', () => {
      const updated = repository.update('T-999', { name: 'test' });
      expect(updated).toBeNull();
    });

    it('should preserve unchanged fields', () => {
      const original = repository.findById('T-001');
      const updated = repository.update('T-001', { name: '新しい名前' });

      expect(updated?.name).toBe('新しい名前');
      expect(updated?.value).toBe(original?.value);
    });
  });

  describe('delete', () => {
    it('should delete existing entity', () => {
      const result = repository.delete('T-002');
      expect(result).toBe(true);

      // 検証: 削除されたデータが取得できないこと
      const found = repository.findById('T-002');
      expect(found).toBeNull();
    });

    it('should return false for non-existent ID', () => {
      const result = repository.delete('T-999');
      expect(result).toBe(false);
    });

    it('should not affect other entities', () => {
      repository.delete('T-002');

      expect(repository.findById('T-001')).not.toBeNull();
      expect(repository.findById('T-003')).not.toBeNull();
    });
  });

  describe('count', () => {
    it('should return correct count', () => {
      expect(repository.count()).toBe(3);
    });

    it('should return 0 for empty sheet', () => {
      const emptySheetData: MockSheetData[] = [
        { name: testSheetName, data: [testHeaders] },
      ];
      SpreadsheetAppMock.setupSpreadsheet(testSpreadsheetId, 'テストシート', emptySheetData);

      expect(repository.count()).toBe(0);
    });
  });

  describe('exists', () => {
    it('should return true for existing ID', () => {
      expect(repository.exists('T-001')).toBe(true);
    });

    it('should return false for non-existent ID', () => {
      expect(repository.exists('T-999')).toBe(false);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', () => {
      const result = repository.findWithPagination({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });

    it('should return second page', () => {
      const result = repository.findWithPagination({ page: 2, limit: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(2);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it('should return empty for page beyond data', () => {
      const result = repository.findWithPagination({ page: 10, limit: 2 });

      expect(result.data).toHaveLength(0);
      expect(result.hasNext).toBe(false);
    });
  });
});
