/**
 * マスターデータ型定義
 */

import { ProcessingType, SheetRowData, MajorCategoryMaster, CreateMajorCategoryDto } from './common';

/**
 * 樹種マスター
 */
export interface WoodType {
  woodTypeId: string;
  name: string;
  displayOrder: number;
  isActive?: boolean;
}

/**
 * 仕入れ先マスター
 */
export interface Supplier {
  supplierId: string;
  name: string;
  contact?: string;
  address?: string;
  remarks?: string;
  isActive?: boolean;
}

/**
 * 加工業者マスター
 */
export interface Processor {
  processorId: string;
  name: string;
  processingTypes: ProcessingType[]; // 対応加工種別（複数）
  contact?: string;
  address?: string;
  remarks?: string;
  isActive?: boolean;
}

/**
 * 保管場所マスター
 */
export interface StorageLocation {
  storageLocationId: string;
  name: string;
  displayOrder: number;
  isActive?: boolean;
  lastInventoryDate?: Date; // 最終棚卸し日
}

// ==================== 樹種マスター ====================

export const WOOD_TYPE_COLUMNS = {
  WOOD_TYPE_ID: 0,
  NAME: 1,
  DISPLAY_ORDER: 2,
} as const;

export const WOOD_TYPE_HEADERS = ['樹種ID', '樹種名', '表示順'];

export function rowToWoodType(row: SheetRowData): WoodType {
  const C = WOOD_TYPE_COLUMNS;
  return {
    woodTypeId: String(row[C.WOOD_TYPE_ID] ?? ''),
    name: String(row[C.NAME] ?? ''),
    displayOrder: Number(row[C.DISPLAY_ORDER]) || 0,
  };
}

export function woodTypeToRow(woodType: WoodType): SheetRowData {
  const C = WOOD_TYPE_COLUMNS;
  const row: SheetRowData = new Array(3).fill('');
  row[C.WOOD_TYPE_ID] = woodType.woodTypeId;
  row[C.NAME] = woodType.name;
  row[C.DISPLAY_ORDER] = woodType.displayOrder;
  return row;
}

// ==================== 仕入れ先マスター ====================

export const SUPPLIER_COLUMNS = {
  SUPPLIER_ID: 0,
  NAME: 1,
  CONTACT: 2,
  ADDRESS: 3,
  REMARKS: 4,
} as const;

export const SUPPLIER_HEADERS = ['仕入れ先ID', '業者名', '連絡先', '住所', '備考'];

export function rowToSupplier(row: SheetRowData): Supplier {
  const C = SUPPLIER_COLUMNS;
  return {
    supplierId: String(row[C.SUPPLIER_ID] ?? ''),
    name: String(row[C.NAME] ?? ''),
    contact: row[C.CONTACT] ? String(row[C.CONTACT]) : undefined,
    address: row[C.ADDRESS] ? String(row[C.ADDRESS]) : undefined,
    remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
  };
}

export function supplierToRow(supplier: Supplier): SheetRowData {
  const C = SUPPLIER_COLUMNS;
  const row: SheetRowData = new Array(5).fill('');
  row[C.SUPPLIER_ID] = supplier.supplierId;
  row[C.NAME] = supplier.name;
  row[C.CONTACT] = supplier.contact ?? '';
  row[C.ADDRESS] = supplier.address ?? '';
  row[C.REMARKS] = supplier.remarks ?? '';
  return row;
}

// ==================== 加工業者マスター ====================

export const PROCESSOR_COLUMNS = {
  PROCESSOR_ID: 0,
  NAME: 1,
  PROCESSING_TYPES: 2,
  CONTACT: 3,
  ADDRESS: 4,
  REMARKS: 5,
} as const;

export const PROCESSOR_HEADERS = [
  '加工業者ID',
  '業者名',
  '対応加工種別',
  '連絡先',
  '住所',
  '備考',
];

export function rowToProcessor(row: SheetRowData): Processor {
  const C = PROCESSOR_COLUMNS;
  const typesStr = row[C.PROCESSING_TYPES] ? String(row[C.PROCESSING_TYPES]) : '';
  const processingTypes = typesStr
    ? (typesStr.split(',').map((s) => s.trim()) as ProcessingType[])
    : [];

  return {
    processorId: String(row[C.PROCESSOR_ID] ?? ''),
    name: String(row[C.NAME] ?? ''),
    processingTypes,
    contact: row[C.CONTACT] ? String(row[C.CONTACT]) : undefined,
    address: row[C.ADDRESS] ? String(row[C.ADDRESS]) : undefined,
    remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
  };
}

export function processorToRow(processor: Processor): SheetRowData {
  const C = PROCESSOR_COLUMNS;
  const row: SheetRowData = new Array(6).fill('');
  row[C.PROCESSOR_ID] = processor.processorId;
  row[C.NAME] = processor.name;
  row[C.PROCESSING_TYPES] = processor.processingTypes.join(',');
  row[C.CONTACT] = processor.contact ?? '';
  row[C.ADDRESS] = processor.address ?? '';
  row[C.REMARKS] = processor.remarks ?? '';
  return row;
}

// ==================== 保管場所マスター ====================

export const STORAGE_LOCATION_COLUMNS = {
  STORAGE_LOCATION_ID: 0,
  NAME: 1,
  DISPLAY_ORDER: 2,
} as const;

export const STORAGE_LOCATION_HEADERS = ['保管場所ID', '場所名', '表示順'];

export function rowToStorageLocation(row: SheetRowData): StorageLocation {
  const C = STORAGE_LOCATION_COLUMNS;
  return {
    storageLocationId: String(row[C.STORAGE_LOCATION_ID] ?? ''),
    name: String(row[C.NAME] ?? ''),
    displayOrder: Number(row[C.DISPLAY_ORDER]) || 0,
  };
}

export function storageLocationToRow(location: StorageLocation): SheetRowData {
  const C = STORAGE_LOCATION_COLUMNS;
  const row: SheetRowData = new Array(3).fill('');
  row[C.STORAGE_LOCATION_ID] = location.storageLocationId;
  row[C.NAME] = location.name;
  row[C.DISPLAY_ORDER] = location.displayOrder;
  return row;
}

// ==================== DTO ====================

/**
 * 樹種登録用DTO
 */
export interface CreateWoodTypeDto {
  name: string;
  displayOrder?: number;
}

/**
 * 仕入れ先登録用DTO
 */
export interface CreateSupplierDto {
  name: string;
  contact?: string;
  address?: string;
  remarks?: string;
}

/**
 * 加工業者登録用DTO
 */
export interface CreateProcessorDto {
  name: string;
  processingTypes: ProcessingType[];
  contact?: string;
  address?: string;
  remarks?: string;
}

/**
 * 保管場所登録用DTO
 */
export interface CreateStorageLocationDto {
  name: string;
  displayOrder?: number;
}

// ==================== 大分類マスター ====================

export const MAJOR_CATEGORY_COLUMNS = {
  CATEGORY_ID: 0,
  NAME: 1,
  DISPLAY_ORDER: 2,
} as const;

export const MAJOR_CATEGORY_HEADERS = ['カテゴリID', 'カテゴリ名', '表示順'];

export function rowToMajorCategory(row: SheetRowData): MajorCategoryMaster {
  const C = MAJOR_CATEGORY_COLUMNS;
  return {
    categoryId: String(row[C.CATEGORY_ID] ?? ''),
    name: String(row[C.NAME] ?? ''),
    displayOrder: Number(row[C.DISPLAY_ORDER]) || 0,
  };
}

export function majorCategoryToRow(category: MajorCategoryMaster): SheetRowData {
  const C = MAJOR_CATEGORY_COLUMNS;
  const row: SheetRowData = new Array(3).fill('');
  row[C.CATEGORY_ID] = category.categoryId;
  row[C.NAME] = category.name;
  row[C.DISPLAY_ORDER] = category.displayOrder;
  return row;
}

// Re-export for convenience
export type { MajorCategoryMaster, CreateMajorCategoryDto };

/**
 * 初期樹種データ
 */
export const INITIAL_WOOD_TYPES = [
  'ウォルナット',
  'モンキーポッド',
  '杉',
  '欅',
  'ポプラ',
  'パイン',
  'その他',
];

/**
 * 初期保管場所データ
 */
export const INITIAL_STORAGE_LOCATIONS = [
  'ショールーム',
  '豊中工場1階',
  '豊中工場2階',
  'モデルハウスA',
  'モデルハウスB',
  'その他',
];
