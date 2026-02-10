/**
 * 加工費型定義
 */

import { ProcessingType, SheetRowData } from './common';

/**
 * 加工費インターフェース
 */
export interface ProcessingCost {
  processingCostId: string; // 加工費ID (COST-000001形式)
  productId: string; // 製品ID
  processingType: ProcessingType; // 加工種別
  processorId: string; // 加工業者ID
  processingContent?: string; // 加工内容
  amount: number; // 金額
  createdAt: Date; // 作成日時
}

/**
 * 加工費登録用DTO
 */
export interface CreateProcessingCostDto {
  productId: string;
  processingType: ProcessingType;
  processorId: string;
  processingContent?: string;
  amount: number;
}

/**
 * 加工費更新用DTO
 */
export interface UpdateProcessingCostDto {
  processingType?: ProcessingType;
  processorId?: string;
  processingContent?: string;
  amount?: number;
}

/**
 * 加工費詳細（業者名込み）
 */
export interface ProcessingCostDetail extends ProcessingCost {
  processorName?: string;
}

/**
 * 製品の加工費サマリー
 */
export interface ProductProcessingCostSummary {
  productId: string;
  totalAmount: number;
  items: ProcessingCostDetail[];
  itemCount: number;
}

/**
 * 加工費のスプレッドシート列インデックス
 */
export const PROCESSING_COST_COLUMNS = {
  PROCESSING_COST_ID: 0, // A
  PRODUCT_ID: 1, // B
  PROCESSING_TYPE: 2, // C
  PROCESSOR_ID: 3, // D
  PROCESSING_CONTENT: 4, // E
  AMOUNT: 5, // F
  CREATED_AT: 6, // G
} as const;

/**
 * 加工費ヘッダー
 */
export const PROCESSING_COST_HEADERS = [
  '加工費ID',
  '製品ID',
  '加工種別',
  '加工業者ID',
  '加工内容',
  '金額',
  '作成日時',
];

/**
 * 行データを加工費オブジェクトに変換
 */
export function rowToProcessingCost(row: SheetRowData): ProcessingCost {
  const parseDate = (value: unknown): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const C = PROCESSING_COST_COLUMNS;

  return {
    processingCostId: String(row[C.PROCESSING_COST_ID] ?? ''),
    productId: String(row[C.PRODUCT_ID] ?? ''),
    processingType: (row[C.PROCESSING_TYPE] as ProcessingType) ?? 'その他',
    processorId: String(row[C.PROCESSOR_ID] ?? ''),
    processingContent: row[C.PROCESSING_CONTENT]
      ? String(row[C.PROCESSING_CONTENT])
      : undefined,
    amount: Number(row[C.AMOUNT]) || 0,
    createdAt: parseDate(row[C.CREATED_AT]),
  };
}

/**
 * 加工費オブジェクトを行データに変換
 */
export function processingCostToRow(cost: ProcessingCost): SheetRowData {
  const C = PROCESSING_COST_COLUMNS;
  const row: SheetRowData = new Array(7).fill('');

  row[C.PROCESSING_COST_ID] = cost.processingCostId;
  row[C.PRODUCT_ID] = cost.productId;
  row[C.PROCESSING_TYPE] = cost.processingType;
  row[C.PROCESSOR_ID] = cost.processorId;
  row[C.PROCESSING_CONTENT] = cost.processingContent ?? '';
  row[C.AMOUNT] = cost.amount;
  row[C.CREATED_AT] = cost.createdAt;

  return row;
}
