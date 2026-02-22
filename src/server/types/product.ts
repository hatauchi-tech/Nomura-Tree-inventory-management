/**
 * 製品（一枚板）型定義
 */

import {
  BaseEntity,
  MajorCategory,
  RangeCondition,
  DateRangeCondition,
  BaseSearchCondition,
  SheetRowData,
} from './common';

/**
 * 製品ステータス
 */
export const PRODUCT_STATUSES = [
  '販売中',
  '商談中',
  '販売済み',
  '棚卸し中',
  '削除済み',
  '紛失',
] as const;

export type ProductStatus = typeof PRODUCT_STATUSES[number];

/**
 * サイズ情報
 */
export interface Size {
  length?: number; // 長さ (mm)
  width?: number; // 幅 (mm)
  thickness?: number; // 厚み (mm)
}

/**
 * 製品（一枚板）インターフェース
 */
export interface Product extends BaseEntity {
  // 基本情報
  productId: string; // 製品ID (ITA-0001形式)
  majorCategory: MajorCategory; // 大分類
  productName: string; // 商品名
  woodType: string; // 樹種

  // サイズ情報
  rawSize?: Size; // 入荷時サイズ
  finishedSize?: Size; // 仕上げ後サイズ

  // 写真URL（JSON配列として保存）
  rawPhotoUrls?: string; // 入荷時写真URL（JSON配列）
  finishedPhotoUrls?: string; // 仕上げ後写真URL（JSON配列）

  // 仕入れ情報
  supplierId: string; // 仕入れ先ID
  purchaseDate: Date; // 仕入れ日
  purchasePrice: number; // 入荷単価

  // 保管・価格情報
  storageLocationId: string; // 保管場所ID
  shippingCost?: number; // 販売時送料
  profitMargin?: number; // 利益率 (デフォルト60%)
  priceAdjustment?: number; // 価格調整額

  // ステータス
  status: ProductStatus; // ステータス

  // 販売情報
  salesDestination?: string; // 販売先
  salesDate?: Date; // 売上計上日
  actualSalesPrice?: number; // 実際販売価格（税込）
  salesRemarks?: string; // 販売備考

  // 棚卸し
  lastInventoryDate?: Date; // 最終棚卸し日

  // 削除情報
  deletedAt?: Date; // 削除日時
  deleteReason?: string; // 削除理由

  // 備考
  remarks?: string; // 備考

  // 配送情報
  shippingCarrier?: string; // 配送業者
  deliveryDate?: Date; // 納品日

  // 商談情報
  negotiator?: string; // 商談担当者
  department?: string; // 担当部署
}

/**
 * 製品登録用DTO
 */
export interface CreateProductDto {
  majorCategory: MajorCategory;
  productName: string;
  woodType: string;
  rawSize?: Size;
  finishedSize?: Size;
  rawPhotoUrls?: string;
  finishedPhotoUrls?: string;
  supplierId: string;
  purchaseDate: Date;
  purchasePrice: number;
  storageLocationId: string;
  shippingCost?: number;
  profitMargin?: number;
  priceAdjustment?: number;
  remarks?: string;
  shippingCarrier?: string;
}

/**
 * 製品更新用DTO
 */
export interface UpdateProductDto {
  majorCategory?: MajorCategory;
  productName?: string;
  woodType?: string;
  rawSize?: Size;
  finishedSize?: Size;
  rawPhotoUrls?: string;
  finishedPhotoUrls?: string;
  storageLocationId?: string;
  shippingCost?: number;
  profitMargin?: number;
  priceAdjustment?: number;
  remarks?: string;
  shippingCarrier?: string;
  status?: ProductStatus;
  negotiator?: string;
  department?: string;
}

/**
 * 製品検索条件
 */
export interface ProductSearchCondition extends BaseSearchCondition {
  productId?: string;
  majorCategories?: MajorCategory[];
  woodTypes?: string[];
  storageLocationIds?: string[];
  supplierIds?: string[];
  statuses?: ProductStatus[];
  purchaseDateRange?: DateRangeCondition;
  purchasePriceRange?: RangeCondition<number>;
  salesPriceRange?: RangeCondition<number>;
  lengthRange?: RangeCondition<number>;
  widthRange?: RangeCondition<number>;
  thicknessRange?: RangeCondition<number>;
  stockDaysRange?: RangeCondition<number>;
  useFinishedSize?: boolean;
}

/**
 * 製品計算値
 */
export interface ProductCalculatedValues {
  processingCostTotal: number; // 加工費合計
  totalCost: number; // トータル原価
  suggestedPrice: number; // 目安販売価格（税抜）
  sellingPriceExTax: number; // 販売価格（税抜）
  sellingPriceIncTax: number; // 販売価格（税込）
  stockDays: number; // 在庫日数
}

/**
 * 製品詳細（計算値込み）
 */
export interface ProductDetail extends Product {
  calculated: ProductCalculatedValues;
  supplierName?: string;
  storageLocationName?: string;
}

/**
 * 製品一覧表示用
 */
export interface ProductListItem {
  productId: string;
  productName: string;
  majorCategory: MajorCategory;
  woodType: string;
  status: ProductStatus;
  sellingPriceIncTax?: number;
  storageLocation?: string;
  rawPhotoUrl?: string;
  stockDays?: number;
  lastInventoryDate?: Date;
}

/**
 * 製品検索条件（エイリアス）
 */
export type ProductSearchConditions = ProductSearchCondition;

/**
 * 製品のスプレッドシート列インデックス
 */
export const PRODUCT_COLUMNS = {
  PRODUCT_ID: 0, // A
  MAJOR_CATEGORY: 1, // B
  MINOR_CATEGORY: 2, // C
  PRODUCT_NAME: 3, // D
  WOOD_TYPE: 4, // E
  RAW_LENGTH: 5, // F
  RAW_WIDTH: 6, // G
  RAW_THICKNESS: 7, // H
  FINISHED_LENGTH: 8, // I
  FINISHED_WIDTH: 9, // J
  FINISHED_THICKNESS: 10, // K
  RAW_PHOTO_URLS: 11, // L
  FINISHED_PHOTO_URLS: 12, // M
  SUPPLIER_ID: 13, // N
  PURCHASE_DATE: 14, // O
  PURCHASE_PRICE: 15, // P
  STORAGE_LOCATION_ID: 16, // Q
  SHIPPING_COST: 17, // R
  PROFIT_MARGIN: 18, // S
  PRICE_ADJUSTMENT: 19, // T
  STATUS: 20, // U
  SALES_DESTINATION: 21, // V
  SALES_DATE: 22, // W
  ACTUAL_SALES_PRICE: 23, // X
  SALES_REMARKS: 24, // Y
  LAST_INVENTORY_DATE: 25, // Z
  DELETED_AT: 26, // AA
  DELETE_REASON: 27, // AB
  REMARKS: 28, // AC
  CREATED_AT: 29, // AD
  UPDATED_AT: 30, // AE
  CREATED_BY: 31, // AF
  UPDATED_BY: 32, // AG
  SHIPPING_CARRIER: 33, // AH
  DELIVERY_DATE: 34, // AI
  NEGOTIATOR: 35, // AJ
  DEPARTMENT: 36, // AK
} as const;

/**
 * 製品ヘッダー（スプレッドシート1行目）
 */
export const PRODUCT_HEADERS = [
  '製品ID',
  '大分類',
  '中分類',
  '商品名',
  '樹種',
  '入荷時_長さ',
  '入荷時_幅',
  '入荷時_厚み',
  '仕上げ後_長さ',
  '仕上げ後_幅',
  '仕上げ後_厚み',
  '入荷時写真URL',
  '仕上げ後写真URL',
  '仕入れ先ID',
  '仕入れ日',
  '入荷単価',
  '保管場所ID',
  '販売時送料',
  '利益率',
  '価格調整額',
  'ステータス',
  '販売先',
  '売上計上日',
  '実際販売価格',
  '販売備考',
  '最終棚卸し日',
  '削除日時',
  '削除理由',
  '備考',
  '作成日時',
  '更新日時',
  '登録者',
  '更新者',
  '配送業者',
  '納品日',
  '商談担当者',
  '担当部署',
];

/**
 * 行データを製品オブジェクトに変換
 */
export function rowToProduct(row: SheetRowData): Product {
  const parseDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const parseNumber = (value: unknown): number | undefined => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const C = PRODUCT_COLUMNS;

  return {
    productId: String(row[C.PRODUCT_ID] ?? ''),
    majorCategory: (row[C.MAJOR_CATEGORY] as MajorCategory) ?? 'その他',
    productName: String(row[C.PRODUCT_NAME] ?? ''),
    woodType: String(row[C.WOOD_TYPE] ?? ''),
    rawSize: {
      length: parseNumber(row[C.RAW_LENGTH]),
      width: parseNumber(row[C.RAW_WIDTH]),
      thickness: parseNumber(row[C.RAW_THICKNESS]),
    },
    finishedSize: {
      length: parseNumber(row[C.FINISHED_LENGTH]),
      width: parseNumber(row[C.FINISHED_WIDTH]),
      thickness: parseNumber(row[C.FINISHED_THICKNESS]),
    },
    rawPhotoUrls: row[C.RAW_PHOTO_URLS]
      ? String(row[C.RAW_PHOTO_URLS])
      : undefined,
    finishedPhotoUrls: row[C.FINISHED_PHOTO_URLS]
      ? String(row[C.FINISHED_PHOTO_URLS])
      : undefined,
    supplierId: String(row[C.SUPPLIER_ID] ?? ''),
    purchaseDate: parseDate(row[C.PURCHASE_DATE]) ?? new Date(),
    purchasePrice: parseNumber(row[C.PURCHASE_PRICE]) ?? 0,
    storageLocationId: String(row[C.STORAGE_LOCATION_ID] ?? ''),
    shippingCost: parseNumber(row[C.SHIPPING_COST]),
    profitMargin: parseNumber(row[C.PROFIT_MARGIN]),
    priceAdjustment: parseNumber(row[C.PRICE_ADJUSTMENT]),
    status: (row[C.STATUS] as ProductStatus) ?? '販売中',
    salesDestination: row[C.SALES_DESTINATION]
      ? String(row[C.SALES_DESTINATION])
      : undefined,
    salesDate: parseDate(row[C.SALES_DATE]),
    actualSalesPrice: parseNumber(row[C.ACTUAL_SALES_PRICE]),
    salesRemarks: row[C.SALES_REMARKS]
      ? String(row[C.SALES_REMARKS])
      : undefined,
    lastInventoryDate: parseDate(row[C.LAST_INVENTORY_DATE]),
    deletedAt: parseDate(row[C.DELETED_AT]),
    deleteReason: row[C.DELETE_REASON]
      ? String(row[C.DELETE_REASON])
      : undefined,
    remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
    shippingCarrier: row[C.SHIPPING_CARRIER] ? String(row[C.SHIPPING_CARRIER]) : undefined,
    deliveryDate: parseDate(row[C.DELIVERY_DATE]),
    negotiator: row[C.NEGOTIATOR] ? String(row[C.NEGOTIATOR]) : undefined,
    department: row[C.DEPARTMENT] ? String(row[C.DEPARTMENT]) : undefined,
    createdAt: parseDate(row[C.CREATED_AT]) ?? new Date(),
    updatedAt: parseDate(row[C.UPDATED_AT]),
    createdBy: row[C.CREATED_BY] ? String(row[C.CREATED_BY]) : undefined,
    updatedBy: row[C.UPDATED_BY] ? String(row[C.UPDATED_BY]) : undefined,
  };
}

/**
 * 製品オブジェクトを行データに変換
 */
export function productToRow(product: Product): SheetRowData {
  const C = PRODUCT_COLUMNS;
  const row: SheetRowData = new Array(37).fill('');

  row[C.PRODUCT_ID] = product.productId;
  row[C.MAJOR_CATEGORY] = product.majorCategory;
  row[C.MINOR_CATEGORY] = '';
  row[C.PRODUCT_NAME] = product.productName;
  row[C.WOOD_TYPE] = product.woodType;
  row[C.RAW_LENGTH] = product.rawSize?.length ?? '';
  row[C.RAW_WIDTH] = product.rawSize?.width ?? '';
  row[C.RAW_THICKNESS] = product.rawSize?.thickness ?? '';
  row[C.FINISHED_LENGTH] = product.finishedSize?.length ?? '';
  row[C.FINISHED_WIDTH] = product.finishedSize?.width ?? '';
  row[C.FINISHED_THICKNESS] = product.finishedSize?.thickness ?? '';
  row[C.RAW_PHOTO_URLS] = product.rawPhotoUrls ?? '';
  row[C.FINISHED_PHOTO_URLS] = product.finishedPhotoUrls ?? '';
  row[C.SUPPLIER_ID] = product.supplierId;
  row[C.PURCHASE_DATE] = product.purchaseDate;
  row[C.PURCHASE_PRICE] = product.purchasePrice;
  row[C.STORAGE_LOCATION_ID] = product.storageLocationId;
  row[C.SHIPPING_COST] = product.shippingCost ?? '';
  row[C.PROFIT_MARGIN] = product.profitMargin ?? '';
  row[C.PRICE_ADJUSTMENT] = product.priceAdjustment ?? '';
  row[C.STATUS] = product.status;
  row[C.SALES_DESTINATION] = product.salesDestination ?? '';
  row[C.SALES_DATE] = product.salesDate ?? '';
  row[C.ACTUAL_SALES_PRICE] = product.actualSalesPrice ?? '';
  row[C.SALES_REMARKS] = product.salesRemarks ?? '';
  row[C.LAST_INVENTORY_DATE] = product.lastInventoryDate ?? '';
  row[C.DELETED_AT] = product.deletedAt ?? '';
  row[C.DELETE_REASON] = product.deleteReason ?? '';
  row[C.REMARKS] = product.remarks ?? '';
  row[C.CREATED_AT] = product.createdAt;
  row[C.UPDATED_AT] = product.updatedAt ?? '';
  row[C.CREATED_BY] = product.createdBy ?? '';
  row[C.UPDATED_BY] = product.updatedBy ?? '';
  row[C.SHIPPING_CARRIER] = product.shippingCarrier ?? '';
  row[C.DELIVERY_DATE] = product.deliveryDate ?? '';
  row[C.NEGOTIATOR] = product.negotiator ?? '';
  row[C.DEPARTMENT] = product.department ?? '';

  return row;
}
