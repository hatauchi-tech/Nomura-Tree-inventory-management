/**
 * 共通型定義
 */

/**
 * 基本エンティティインターフェース
 */
export interface BaseEntity {
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * ページネーション設定
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * ページネーション結果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ソートオプション
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * API レスポンス
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 検索条件基本型
 */
export interface BaseSearchCondition {
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 範囲検索条件
 */
export interface RangeCondition<T> {
  min?: T;
  max?: T;
}

/**
 * 日付範囲検索条件
 */
export interface DateRangeCondition {
  start?: Date;
  end?: Date;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * バリデーションエラー
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * スプレッドシートの行データ型
 */
export type SheetRowData = (string | number | boolean | Date | null)[];

/**
 * シート定義
 */
export interface SheetDefinition {
  name: string;
  headers: string[];
}

/**
 * シート名列挙
 */
export const SHEET_NAMES = {
  PRODUCTS: '製品マスター',
  PROCESSING_COSTS: '加工費詳細',
  WOOD_TYPES: '樹種マスター',
  SUPPLIERS: '仕入れ先マスター',
  PROCESSORS: '加工業者マスター',
  STORAGE_LOCATIONS: '保管場所マスター',
  INVENTORY_SESSIONS: '棚卸しセッション',
  INVENTORY_DETAILS: '棚卸し詳細',
  OPERATION_LOGS: '操作ログ',
  LOCATION_HISTORY: '保管場所移動履歴',
  SALES_CANCEL_HISTORY: '販売キャンセル履歴',
  PHOTOS: '写真管理',
  SEQUENCES: 'シーケンス管理',
  MAJOR_CATEGORIES_MASTER: '大分類マスター',
  MINOR_CATEGORIES_MASTER: '中分類マスター',
} as const;

export type SheetName = typeof SHEET_NAMES[keyof typeof SHEET_NAMES];

/**
 * 大分類
 */
export const MAJOR_CATEGORIES = [
  'テーブル',
  'カウンター',
  'スツール',
  '足',
  'その他',
] as const;

export type MajorCategory = typeof MAJOR_CATEGORIES[number];

/**
 * 中分類
 */
export const MINOR_CATEGORIES = ['家具', '雑貨', '加工材料', 'その他'] as const;

export type MinorCategory = typeof MINOR_CATEGORIES[number];

/**
 * 大分類マスター
 */
export interface MajorCategoryMaster {
  categoryId: string;  // MCAT-0001 format
  name: string;
  displayOrder: number;
}

/**
 * 中分類マスター
 */
export interface MinorCategoryMaster {
  categoryId: string;  // SCAT-0001 format
  name: string;
  displayOrder: number;
}

/**
 * 大分類登録用DTO
 */
export interface CreateMajorCategoryDto {
  name: string;
  displayOrder?: number;
}

/**
 * 中分類登録用DTO
 */
export interface CreateMinorCategoryDto {
  name: string;
  displayOrder?: number;
}

/**
 * 加工種別
 */
export const PROCESSING_TYPES = [
  '木材加工',
  '塗装',
  '足',
  'ガラス',
  'その他',
] as const;

export type ProcessingType = typeof PROCESSING_TYPES[number];

/**
 * 確認方法
 */
export const CONFIRMATION_METHODS = ['QRスキャン', '手入力', '一覧選択'] as const;

export type ConfirmationMethod = typeof CONFIRMATION_METHODS[number];

/**
 * 操作種別
 */
export const OPERATION_TYPES = [
  '登録',
  '更新',
  '削除',
  '販売',
  'キャンセル',
  '棚卸し',
] as const;

export type OperationType = typeof OPERATION_TYPES[number];

/**
 * 対象種別
 */
export const TARGET_TYPES = ['製品', '加工費', 'マスター'] as const;

export type TargetType = typeof TARGET_TYPES[number];

/**
 * デフォルト値
 */
export const DEFAULTS = {
  PROFIT_MARGIN: 60, // 利益率 60%
  TAX_RATE: 0.1, // 消費税 10%
  PAGE_SIZE: 20,
  MAX_BATCH_SALES: 20,
  SALES_CANCEL_DAYS: 7,
  LONG_STOCK_DAYS: 180,
  INVENTORY_ALERT_DAYS: 90,
} as const;

/**
 * バリデーション制約
 */
export const VALIDATION_CONSTRAINTS = {
  SIZE: { min: 1, max: 99999 },
  PRICE: { min: 0, max: 99999999 },
  SHIPPING_COST: { min: 0, max: 9999999 },
  PROFIT_MARGIN: { min: 0, max: 99 },
  PRICE_ADJUSTMENT: { min: -9999999, max: 9999999 },
  PRODUCT_NAME: { minLength: 1, maxLength: 100 },
  REMARKS: { maxLength: 500 },
  SALES_DESTINATION: { minLength: 1, maxLength: 100 },
  PROCESSING_CONTENT: { maxLength: 200 },
  VENDOR_NAME: { minLength: 1, maxLength: 50 },
  CONTACT: { maxLength: 100 },
  ADDRESS: { maxLength: 200 },
} as const;
