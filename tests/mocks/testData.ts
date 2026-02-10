/**
 * テストデータ
 */

import { Product, PRODUCT_STATUSES } from '../../src/server/types/product';
import { ProcessingCost } from '../../src/server/types/processingCost';
import {
  WoodType,
  Supplier,
  Processor,
  StorageLocation,
} from '../../src/server/types/master';
import {
  InventorySession,
  InventoryDetail,
} from '../../src/server/types/inventory';

/**
 * サンプル樹種データ
 */
export const sampleWoodTypes: WoodType[] = [
  { woodTypeId: 'WT-001', name: 'ウォルナット', displayOrder: 1 },
  { woodTypeId: 'WT-002', name: 'モンキーポッド', displayOrder: 2 },
  { woodTypeId: 'WT-003', name: '杉', displayOrder: 3 },
  { woodTypeId: 'WT-004', name: '欅', displayOrder: 4 },
  { woodTypeId: 'WT-005', name: 'ポプラ', displayOrder: 5 },
  { woodTypeId: 'WT-006', name: 'パイン', displayOrder: 6 },
  { woodTypeId: 'WT-007', name: 'その他', displayOrder: 7 },
];

/**
 * サンプル仕入れ先データ
 */
export const sampleSuppliers: Supplier[] = [
  {
    supplierId: 'SUP-001',
    name: '木材商会A',
    contact: '06-1234-5678',
    address: '大阪府大阪市北区',
    remarks: '主要仕入れ先',
  },
  {
    supplierId: 'SUP-002',
    name: '森林組合B',
    contact: '03-9876-5432',
    address: '東京都港区',
  },
  {
    supplierId: 'SUP-003',
    name: '輸入木材C',
    contact: '052-1111-2222',
    address: '愛知県名古屋市',
    remarks: '海外産木材',
  },
];

/**
 * サンプル加工業者データ
 */
export const sampleProcessors: Processor[] = [
  {
    processorId: 'PROC-001',
    name: '木工職人工房',
    processingTypes: ['木材加工'],
    contact: '06-1111-1111',
    address: '大阪府豊中市',
  },
  {
    processorId: 'PROC-002',
    name: '塗装工房',
    processingTypes: ['塗装'],
    contact: '06-2222-2222',
    address: '大阪府吹田市',
  },
  {
    processorId: 'PROC-003',
    name: '金属加工所',
    processingTypes: ['足'],
    contact: '06-3333-3333',
    address: '大阪府堺市',
  },
  {
    processorId: 'PROC-004',
    name: '総合加工センター',
    processingTypes: ['木材加工', '塗装', 'ガラス'],
    contact: '06-4444-4444',
    address: '大阪府東大阪市',
    remarks: '複合加工対応',
  },
];

/**
 * サンプル保管場所データ
 */
export const sampleStorageLocations: StorageLocation[] = [
  { storageLocationId: 'LOC-001', name: 'ショールーム', displayOrder: 1 },
  { storageLocationId: 'LOC-002', name: '豊中工場1階', displayOrder: 2 },
  { storageLocationId: 'LOC-003', name: '豊中工場2階', displayOrder: 3 },
  { storageLocationId: 'LOC-004', name: 'モデルハウスA', displayOrder: 4 },
  { storageLocationId: 'LOC-005', name: 'モデルハウスB', displayOrder: 5 },
  { storageLocationId: 'LOC-006', name: 'その他', displayOrder: 6 },
];

/**
 * サンプル製品データ
 */
export const sampleProducts: Product[] = [
  {
    productId: 'ITA-0001',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: 'ウォルナット一枚板テーブル',
    woodType: 'ウォルナット',
    rawSize: { length: 2000, width: 800, thickness: 60 },
    finishedSize: { length: 1800, width: 750, thickness: 50 },
    supplierId: 'SUP-001',
    purchaseDate: new Date('2025-01-15'),
    purchasePrice: 150000,
    storageLocationId: 'LOC-001',
    shippingCost: 15000,
    profitMargin: 60,
    priceAdjustment: 0,
    status: '販売中',
    createdAt: new Date('2025-01-15'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0002',
    majorCategory: 'カウンター',
    minorCategory: '家具',
    productName: 'モンキーポッドカウンター',
    woodType: 'モンキーポッド',
    rawSize: { length: 2500, width: 600, thickness: 50 },
    finishedSize: { length: 2400, width: 550, thickness: 45 },
    supplierId: 'SUP-002',
    purchaseDate: new Date('2025-02-01'),
    purchasePrice: 200000,
    storageLocationId: 'LOC-002',
    shippingCost: 20000,
    profitMargin: 60,
    priceAdjustment: 10000,
    status: '販売中',
    createdAt: new Date('2025-02-01'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0003',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: '杉一枚板ダイニングテーブル',
    woodType: '杉',
    rawSize: { length: 1800, width: 900, thickness: 70 },
    finishedSize: { length: 1700, width: 850, thickness: 60 },
    supplierId: 'SUP-001',
    purchaseDate: new Date('2024-12-01'),
    purchasePrice: 80000,
    storageLocationId: 'LOC-001',
    shippingCost: 10000,
    profitMargin: 55,
    priceAdjustment: -5000,
    status: '販売済み',
    salesDestination: '田中様',
    salesDate: new Date('2025-01-20'),
    actualSalesPrice: 220000,
    createdAt: new Date('2024-12-01'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0004',
    majorCategory: 'スツール',
    minorCategory: '家具',
    productName: '欅丸スツール',
    woodType: '欅',
    rawSize: { length: 400, width: 400, thickness: 50 },
    finishedSize: { length: 350, width: 350, thickness: 45 },
    supplierId: 'SUP-003',
    purchaseDate: new Date('2025-01-10'),
    purchasePrice: 30000,
    storageLocationId: 'LOC-003',
    shippingCost: 3000,
    profitMargin: 60,
    priceAdjustment: 0,
    status: '販売中',
    createdAt: new Date('2025-01-10'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0005',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: 'ポプラ一枚板テーブル',
    woodType: 'ポプラ',
    rawSize: { length: 1500, width: 700, thickness: 45 },
    supplierId: 'SUP-001',
    purchaseDate: new Date('2025-01-05'),
    purchasePrice: 60000,
    storageLocationId: 'LOC-004',
    status: '販売中',
    createdAt: new Date('2025-01-05'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0006',
    majorCategory: '足',
    minorCategory: '加工材料',
    productName: 'アイアン脚セット',
    woodType: 'その他',
    supplierId: 'SUP-003',
    purchaseDate: new Date('2025-01-08'),
    purchasePrice: 15000,
    storageLocationId: 'LOC-002',
    status: '販売中',
    createdAt: new Date('2025-01-08'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0007',
    majorCategory: 'カウンター',
    minorCategory: '家具',
    productName: 'パイン集成材カウンター',
    woodType: 'パイン',
    rawSize: { length: 3000, width: 500, thickness: 40 },
    finishedSize: { length: 2800, width: 480, thickness: 35 },
    supplierId: 'SUP-002',
    purchaseDate: new Date('2024-11-15'),
    purchasePrice: 45000,
    storageLocationId: 'LOC-005',
    shippingCost: 8000,
    profitMargin: 50,
    status: '販売中',
    createdAt: new Date('2024-11-15'),
    createdBy: 'user@example.com',
    remarks: '長期在庫品',
  },
  {
    productId: 'ITA-0008',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: 'ウォルナット座卓',
    woodType: 'ウォルナット',
    rawSize: { length: 1200, width: 600, thickness: 40 },
    finishedSize: { length: 1100, width: 550, thickness: 35 },
    supplierId: 'SUP-001',
    purchaseDate: new Date('2025-01-18'),
    purchasePrice: 90000,
    storageLocationId: 'LOC-001',
    shippingCost: 8000,
    profitMargin: 60,
    status: '棚卸し中',
    createdAt: new Date('2025-01-18'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0009',
    majorCategory: 'その他',
    minorCategory: '雑貨',
    productName: '杉まな板',
    woodType: '杉',
    rawSize: { length: 400, width: 250, thickness: 30 },
    finishedSize: { length: 380, width: 230, thickness: 25 },
    supplierId: 'SUP-001',
    purchaseDate: new Date('2025-01-20'),
    purchasePrice: 5000,
    storageLocationId: 'LOC-001',
    shippingCost: 1000,
    profitMargin: 70,
    status: '販売中',
    createdAt: new Date('2025-01-20'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0010',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: '欅一枚板テーブル（削除済み）',
    woodType: '欅',
    rawSize: { length: 1800, width: 800, thickness: 55 },
    supplierId: 'SUP-002',
    purchaseDate: new Date('2025-01-01'),
    purchasePrice: 120000,
    storageLocationId: 'LOC-002',
    status: '削除済み',
    deletedAt: new Date('2025-01-25'),
    deleteReason: '登録ミス',
    createdAt: new Date('2025-01-01'),
    createdBy: 'user@example.com',
  },
];

/**
 * サンプル加工費データ
 */
export const sampleProcessingCosts: ProcessingCost[] = [
  {
    processingCostId: 'COST-000001',
    productId: 'ITA-0001',
    processingType: '木材加工',
    processorId: 'PROC-001',
    processingContent: '表面研磨、エッジ加工',
    amount: 25000,
    createdAt: new Date('2025-01-16'),
  },
  {
    processingCostId: 'COST-000002',
    productId: 'ITA-0001',
    processingType: '塗装',
    processorId: 'PROC-002',
    processingContent: 'オイル仕上げ',
    amount: 15000,
    createdAt: new Date('2025-01-17'),
  },
  {
    processingCostId: 'COST-000003',
    productId: 'ITA-0002',
    processingType: '木材加工',
    processorId: 'PROC-004',
    processingContent: '全面加工',
    amount: 35000,
    createdAt: new Date('2025-02-02'),
  },
  {
    processingCostId: 'COST-000004',
    productId: 'ITA-0002',
    processingType: '塗装',
    processorId: 'PROC-004',
    processingContent: 'ウレタン塗装',
    amount: 20000,
    createdAt: new Date('2025-02-03'),
  },
  {
    processingCostId: 'COST-000005',
    productId: 'ITA-0003',
    processingType: '木材加工',
    processorId: 'PROC-001',
    processingContent: '基本加工',
    amount: 18000,
    createdAt: new Date('2024-12-05'),
  },
  {
    processingCostId: 'COST-000006',
    productId: 'ITA-0003',
    processingType: '塗装',
    processorId: 'PROC-002',
    processingContent: 'オイル仕上げ',
    amount: 12000,
    createdAt: new Date('2024-12-07'),
  },
  {
    processingCostId: 'COST-000007',
    productId: 'ITA-0003',
    processingType: '足',
    processorId: 'PROC-003',
    processingContent: 'アイアン脚取付',
    amount: 25000,
    createdAt: new Date('2024-12-10'),
  },
  {
    processingCostId: 'COST-000008',
    productId: 'ITA-0004',
    processingType: '木材加工',
    processorId: 'PROC-001',
    processingContent: '丸加工、座面研磨',
    amount: 8000,
    createdAt: new Date('2025-01-12'),
  },
  {
    processingCostId: 'COST-000009',
    productId: 'ITA-0004',
    processingType: '塗装',
    processorId: 'PROC-002',
    processingContent: 'オイル仕上げ',
    amount: 5000,
    createdAt: new Date('2025-01-13'),
  },
  {
    processingCostId: 'COST-000010',
    productId: 'ITA-0007',
    processingType: '木材加工',
    processorId: 'PROC-004',
    processingContent: 'エッジ加工のみ',
    amount: 10000,
    createdAt: new Date('2024-11-20'),
  },
];

/**
 * サンプル棚卸しセッションデータ
 */
export const sampleInventorySessions: InventorySession[] = [
  {
    sessionId: 'INV-20250115-001',
    storageLocationId: 'LOC-001',
    startedAt: new Date('2025-01-15T09:00:00'),
    startedBy: 'user@example.com',
    completedAt: new Date('2025-01-15T12:00:00'),
    completedBy: 'user@example.com',
    status: '完了',
    targetCount: 5,
    confirmedCount: 5,
    discrepancyCount: 0,
  },
  {
    sessionId: 'INV-20250120-001',
    storageLocationId: 'LOC-002',
    startedAt: new Date('2025-01-20T10:00:00'),
    startedBy: 'user@example.com',
    status: '進行中',
    targetCount: 3,
    confirmedCount: 1,
    discrepancyCount: 0,
  },
];

/**
 * サンプル棚卸し詳細データ
 */
export const sampleInventoryDetails: InventoryDetail[] = [
  {
    detailId: 'INVD-001',
    sessionId: 'INV-20250120-001',
    productId: 'ITA-0002',
    confirmationStatus: '未確認',
  },
  {
    detailId: 'INVD-002',
    sessionId: 'INV-20250120-001',
    productId: 'ITA-0006',
    confirmationStatus: '確認済み',
    confirmationMethod: 'QRスキャン',
    confirmedBy: 'user@example.com',
    confirmedAt: new Date('2025-01-20T10:30:00'),
  },
  {
    detailId: 'INVD-003',
    sessionId: 'INV-20250120-001',
    productId: 'ITA-0010',
    confirmationStatus: '未確認',
  },
];

/**
 * スプレッドシートモック用のシートデータ生成
 */
export function generateMockSheetData() {
  return {
    products: sampleProducts,
    processingCosts: sampleProcessingCosts,
    woodTypes: sampleWoodTypes,
    suppliers: sampleSuppliers,
    processors: sampleProcessors,
    storageLocations: sampleStorageLocations,
    inventorySessions: sampleInventorySessions,
    inventoryDetails: sampleInventoryDetails,
  };
}

/**
 * 製品のステータス別カウント
 */
export function getProductCountByStatus(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const status of PRODUCT_STATUSES) {
    counts[status] = sampleProducts.filter((p) => p.status === status).length;
  }
  return counts;
}

/**
 * 追加の棚卸しセッションデータ（テスト用）
 */
export const additionalInventorySessions: InventorySession[] = [
  {
    sessionId: 'INV-20250110-001',
    storageLocationId: 'LOC-003',
    startedAt: new Date('2025-01-10T09:00:00'),
    startedBy: 'user@example.com',
    status: '中断中',
    targetCount: 2,
    confirmedCount: 1,
    discrepancyCount: 0,
  },
];

/**
 * 追加の棚卸し詳細データ（テスト用）
 */
export const additionalInventoryDetails: InventoryDetail[] = [
  {
    detailId: 'INVD-010',
    sessionId: 'INV-20250110-001',
    productId: 'ITA-0004',
    confirmationStatus: '確認済み',
    confirmationMethod: '手入力',
    confirmedBy: 'user@example.com',
    confirmedAt: new Date('2025-01-10T10:00:00'),
  },
  {
    detailId: 'INVD-011',
    sessionId: 'INV-20250110-001',
    productId: 'ITA-0005',
    confirmationStatus: '未確認',
  },
];

/**
 * 販売済み製品のテスト用データ（日付範囲テスト用）
 */
export const soldProductsForDateRange: Product[] = [
  {
    productId: 'ITA-0011',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: '杉テーブルA',
    woodType: '杉',
    supplierId: 'SUP-001',
    purchaseDate: new Date('2024-10-01'),
    purchasePrice: 50000,
    storageLocationId: 'LOC-001',
    status: '販売済み',
    salesDestination: '佐藤様',
    salesDate: new Date('2025-01-05'),
    actualSalesPrice: 120000,
    createdAt: new Date('2024-10-01'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0012',
    majorCategory: 'カウンター',
    minorCategory: '家具',
    productName: 'ウォルナットカウンターB',
    woodType: 'ウォルナット',
    supplierId: 'SUP-002',
    purchaseDate: new Date('2024-11-01'),
    purchasePrice: 80000,
    storageLocationId: 'LOC-002',
    status: '販売済み',
    salesDestination: '鈴木様',
    salesDate: new Date('2025-01-15'),
    actualSalesPrice: 200000,
    createdAt: new Date('2024-11-01'),
    createdBy: 'user@example.com',
  },
  {
    productId: 'ITA-0013',
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: '欅テーブルC',
    woodType: '欅',
    supplierId: 'SUP-001',
    purchaseDate: new Date('2024-09-01'),
    purchasePrice: 100000,
    storageLocationId: 'LOC-001',
    status: '販売済み',
    salesDestination: '高橋様',
    salesDate: new Date('2024-12-25'),
    actualSalesPrice: 250000,
    createdAt: new Date('2024-09-01'),
    createdBy: 'user@example.com',
  },
];

/**
 * テスト用データのディープコピー
 */
export function cloneTestData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * テスト用の新規製品を生成
 */
export function createTestProduct(overrides: Partial<Product> = {}): Product {
  return {
    productId: `ITA-TEST-${Date.now()}`,
    majorCategory: 'テーブル',
    minorCategory: '家具',
    productName: 'テスト製品',
    woodType: 'ウォルナット',
    supplierId: 'SUP-001',
    purchaseDate: new Date(),
    purchasePrice: 100000,
    storageLocationId: 'LOC-001',
    status: '販売中',
    createdAt: new Date(),
    createdBy: 'test@example.com',
    ...overrides,
  };
}

/**
 * テスト用の新規加工費を生成
 */
export function createTestProcessingCost(
  overrides: Partial<ProcessingCost> = {}
): ProcessingCost {
  return {
    processingCostId: `COST-TEST-${Date.now()}`,
    productId: 'ITA-0001',
    processingType: '木材加工',
    processorId: 'PROC-001',
    processingContent: 'テスト加工',
    amount: 10000,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * テスト用の新規棚卸しセッションを生成
 */
export function createTestInventorySession(
  overrides: Partial<InventorySession> = {}
): InventorySession {
  return {
    sessionId: `INV-TEST-${Date.now()}-001`,
    storageLocationId: 'LOC-001',
    startedAt: new Date(),
    startedBy: 'test@example.com',
    status: '進行中',
    targetCount: 5,
    confirmedCount: 0,
    discrepancyCount: 0,
    ...overrides,
  };
}

/**
 * テスト用の新規棚卸し詳細を生成
 */
export function createTestInventoryDetail(
  overrides: Partial<InventoryDetail> = {}
): InventoryDetail {
  return {
    detailId: `INVD-TEST-${Date.now()}`,
    sessionId: 'INV-20250120-001',
    productId: 'ITA-0001',
    confirmationStatus: '未確認',
    ...overrides,
  };
}
