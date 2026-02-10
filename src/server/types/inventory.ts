/**
 * 棚卸し型定義
 */

import { ConfirmationMethod, SheetRowData } from './common';

/**
 * 棚卸しセッションステータス
 */
export const INVENTORY_SESSION_STATUSES = ['進行中', '中断中', '完了'] as const;

export type InventorySessionStatus = typeof INVENTORY_SESSION_STATUSES[number];

/**
 * 確認状況
 */
export const CONFIRMATION_STATUSES = ['未確認', '確認済み', '差異あり'] as const;

export type ConfirmationStatus = typeof CONFIRMATION_STATUSES[number];

/**
 * 差異種別
 */
export const DISCREPANCY_TYPES = [
  '紛失',
  '場所違い',
  '未登録発見',
  'その他',
] as const;

export type DiscrepancyType = typeof DISCREPANCY_TYPES[number];

/**
 * 棚卸しセッション
 */
export interface InventorySession {
  sessionId: string; // セッションID (INV-20260116-001形式)
  storageLocationId: string; // 保管場所ID
  startedAt: Date; // 開始日時
  startedBy: string; // 開始者
  completedAt?: Date; // 完了日時
  completedBy?: string; // 完了者
  status: InventorySessionStatus; // ステータス
  targetCount: number; // 対象件数
  confirmedCount: number; // 確認済件数
  discrepancyCount: number; // 差異件数
  remarks?: string; // 備考
}

/**
 * 棚卸し詳細
 */
export interface InventoryDetail {
  detailId: string; // 詳細ID
  sessionId: string; // セッションID
  productId: string; // 製品ID
  confirmationStatus: ConfirmationStatus; // 確認状況
  confirmationMethod?: ConfirmationMethod; // 確認方法
  confirmedBy?: string; // 確認者
  confirmedAt?: Date; // 確認日時
  discrepancyType?: DiscrepancyType; // 差異種別
  discrepancyReason?: string; // 差異理由
  actionTaken?: string; // 対応内容
}

/**
 * 棚卸し詳細（製品情報込み）
 */
export interface InventoryDetailWithProduct extends InventoryDetail {
  productName?: string;
  woodType?: string;
  rawPhotoUrl?: string;
}

/**
 * 棚卸しセッション開始DTO
 */
export interface StartInventorySessionDto {
  storageLocationId: string;
  startedBy: string;
}

/**
 * 製品確認DTO
 */
export interface ConfirmProductDto {
  sessionId: string;
  productId: string;
  confirmationMethod: ConfirmationMethod;
  confirmedBy: string;
}

/**
 * 差異調整DTO
 */
export interface AdjustDiscrepancyDto {
  detailId: string;
  discrepancyType: DiscrepancyType;
  discrepancyReason: string;
  actionTaken?: string;
}

/**
 * 棚卸し進捗
 */
export interface InventoryProgress {
  sessionId: string;
  storageLocationName: string;
  status: InventorySessionStatus;
  targetCount: number;
  confirmedCount: number;
  discrepancyCount: number;
  progressPercent: number;
  unconfirmedItems: InventoryDetailWithProduct[];
  confirmedItems: InventoryDetailWithProduct[];
  discrepancyItems: InventoryDetailWithProduct[];
}

// ==================== 棚卸しセッション ====================

export const INVENTORY_SESSION_COLUMNS = {
  SESSION_ID: 0,
  STORAGE_LOCATION_ID: 1,
  STARTED_AT: 2,
  STARTED_BY: 3,
  COMPLETED_AT: 4,
  COMPLETED_BY: 5,
  STATUS: 6,
  TARGET_COUNT: 7,
  CONFIRMED_COUNT: 8,
  DISCREPANCY_COUNT: 9,
  REMARKS: 10,
} as const;

export const INVENTORY_SESSION_HEADERS = [
  'セッションID',
  '保管場所ID',
  '開始日時',
  '開始者',
  '完了日時',
  '完了者',
  'ステータス',
  '対象件数',
  '確認済件数',
  '差異件数',
  '備考',
];

export function rowToInventorySession(row: SheetRowData): InventorySession {
  const parseDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const C = INVENTORY_SESSION_COLUMNS;

  return {
    sessionId: String(row[C.SESSION_ID] ?? ''),
    storageLocationId: String(row[C.STORAGE_LOCATION_ID] ?? ''),
    startedAt: parseDate(row[C.STARTED_AT]) ?? new Date(),
    startedBy: String(row[C.STARTED_BY] ?? ''),
    completedAt: parseDate(row[C.COMPLETED_AT]),
    completedBy: row[C.COMPLETED_BY] ? String(row[C.COMPLETED_BY]) : undefined,
    status: (row[C.STATUS] as InventorySessionStatus) ?? '進行中',
    targetCount: Number(row[C.TARGET_COUNT]) || 0,
    confirmedCount: Number(row[C.CONFIRMED_COUNT]) || 0,
    discrepancyCount: Number(row[C.DISCREPANCY_COUNT]) || 0,
    remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
  };
}

export function inventorySessionToRow(session: InventorySession): SheetRowData {
  const C = INVENTORY_SESSION_COLUMNS;
  const row: SheetRowData = new Array(11).fill('');

  row[C.SESSION_ID] = session.sessionId;
  row[C.STORAGE_LOCATION_ID] = session.storageLocationId;
  row[C.STARTED_AT] = session.startedAt;
  row[C.STARTED_BY] = session.startedBy;
  row[C.COMPLETED_AT] = session.completedAt ?? '';
  row[C.COMPLETED_BY] = session.completedBy ?? '';
  row[C.STATUS] = session.status;
  row[C.TARGET_COUNT] = session.targetCount;
  row[C.CONFIRMED_COUNT] = session.confirmedCount;
  row[C.DISCREPANCY_COUNT] = session.discrepancyCount;
  row[C.REMARKS] = session.remarks ?? '';

  return row;
}

// ==================== 棚卸し詳細 ====================

export const INVENTORY_DETAIL_COLUMNS = {
  DETAIL_ID: 0,
  SESSION_ID: 1,
  PRODUCT_ID: 2,
  CONFIRMATION_STATUS: 3,
  CONFIRMATION_METHOD: 4,
  CONFIRMED_BY: 5,
  CONFIRMED_AT: 6,
  DISCREPANCY_TYPE: 7,
  DISCREPANCY_REASON: 8,
  ACTION_TAKEN: 9,
} as const;

export const INVENTORY_DETAIL_HEADERS = [
  '詳細ID',
  'セッションID',
  '製品ID',
  '確認状況',
  '確認方法',
  '確認者',
  '確認日時',
  '差異種別',
  '差異理由',
  '対応内容',
];

export function rowToInventoryDetail(row: SheetRowData): InventoryDetail {
  const parseDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const C = INVENTORY_DETAIL_COLUMNS;

  return {
    detailId: String(row[C.DETAIL_ID] ?? ''),
    sessionId: String(row[C.SESSION_ID] ?? ''),
    productId: String(row[C.PRODUCT_ID] ?? ''),
    confirmationStatus: (row[C.CONFIRMATION_STATUS] as ConfirmationStatus) ?? '未確認',
    confirmationMethod: row[C.CONFIRMATION_METHOD]
      ? (row[C.CONFIRMATION_METHOD] as ConfirmationMethod)
      : undefined,
    confirmedBy: row[C.CONFIRMED_BY] ? String(row[C.CONFIRMED_BY]) : undefined,
    confirmedAt: parseDate(row[C.CONFIRMED_AT]),
    discrepancyType: row[C.DISCREPANCY_TYPE]
      ? (row[C.DISCREPANCY_TYPE] as DiscrepancyType)
      : undefined,
    discrepancyReason: row[C.DISCREPANCY_REASON]
      ? String(row[C.DISCREPANCY_REASON])
      : undefined,
    actionTaken: row[C.ACTION_TAKEN] ? String(row[C.ACTION_TAKEN]) : undefined,
  };
}

export function inventoryDetailToRow(detail: InventoryDetail): SheetRowData {
  const C = INVENTORY_DETAIL_COLUMNS;
  const row: SheetRowData = new Array(10).fill('');

  row[C.DETAIL_ID] = detail.detailId;
  row[C.SESSION_ID] = detail.sessionId;
  row[C.PRODUCT_ID] = detail.productId;
  row[C.CONFIRMATION_STATUS] = detail.confirmationStatus;
  row[C.CONFIRMATION_METHOD] = detail.confirmationMethod ?? '';
  row[C.CONFIRMED_BY] = detail.confirmedBy ?? '';
  row[C.CONFIRMED_AT] = detail.confirmedAt ?? '';
  row[C.DISCREPANCY_TYPE] = detail.discrepancyType ?? '';
  row[C.DISCREPANCY_REASON] = detail.discrepancyReason ?? '';
  row[C.ACTION_TAKEN] = detail.actionTaken ?? '';

  return row;
}
