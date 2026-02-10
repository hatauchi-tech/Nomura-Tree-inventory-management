/**
 * ProductRepository - 製品データアクセス層
 */

import { BaseRepository, RepositoryConfig } from './BaseRepository';
import {
  Product,
  ProductStatus,
  ProductSearchCondition,
  CreateProductDto,
  PRODUCT_COLUMNS,
  PRODUCT_HEADERS,
  rowToProduct,
  productToRow,
} from '../types/product';
import { SHEET_NAMES, PaginatedResult, PaginationOptions, DEFAULTS } from '../types/common';
import { getStockDays } from '../utils/dateUtils';
import { generateProductId, getNextSequenceNumber } from '../utils/idGenerator';

/**
 * ProductRepository - 製品リポジトリ
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.PRODUCTS,
      headers: PRODUCT_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): Product {
    return rowToProduct(row as (string | number | boolean | Date | null)[]);
  }

  protected entityToRow(entity: Product): unknown[] {
    return productToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return PRODUCT_COLUMNS.PRODUCT_ID;
  }

  /**
   * ステータスで製品を検索
   */
  findByStatus(status: ProductStatus): Product[] {
    return this.findWhere((product) => product.status === status);
  }

  /**
   * 複数ステータスで製品を検索
   */
  findByStatuses(statuses: ProductStatus[]): Product[] {
    const statusSet = new Set(statuses);
    return this.findWhere((product) => statusSet.has(product.status));
  }

  /**
   * 保管場所で製品を検索
   */
  findByStorageLocation(storageLocationId: string): Product[] {
    return this.findWhere(
      (product) => product.storageLocationId === storageLocationId
    );
  }

  /**
   * 仕入れ先で製品を検索
   */
  findBySupplier(supplierId: string): Product[] {
    return this.findWhere((product) => product.supplierId === supplierId);
  }

  /**
   * 樹種で製品を検索
   */
  findByWoodType(woodType: string): Product[] {
    return this.findWhere((product) => product.woodType === woodType);
  }

  /**
   * 販売中の製品を取得
   */
  findAvailable(): Product[] {
    return this.findByStatus('販売中');
  }

  /**
   * 販売済みの製品を取得
   */
  findSold(): Product[] {
    return this.findByStatus('販売済み');
  }

  /**
   * 削除済み以外の製品を取得
   */
  findActive(): Product[] {
    return this.findWhere((product) => product.status !== '削除済み');
  }

  /**
   * 長期在庫製品を取得（指定日数以上）
   */
  findLongStockProducts(days: number): Product[] {
    return this.findWhere((product) => {
      if (product.status !== '販売中') return false;
      const stockDays = getStockDays(product.purchaseDate);
      return stockDays >= days;
    });
  }

  /**
   * 複合条件検索
   */
  search(conditions: ProductSearchCondition): Product[] {
    let results = this.findAll();

    // ステータスフィルター（デフォルトで削除済みを除外）
    if (conditions.statuses && conditions.statuses.length > 0) {
      const statusSet = new Set(conditions.statuses);
      results = results.filter((p) => statusSet.has(p.status));
    } else {
      results = results.filter((p) => p.status !== '削除済み');
    }

    // 製品IDフィルター
    if (conditions.productId) {
      const searchId = conditions.productId.toLowerCase();
      results = results.filter((p) =>
        p.productId.toLowerCase().includes(searchId)
      );
    }

    // キーワード検索（商品名）
    if (conditions.keyword) {
      const keyword = conditions.keyword.toLowerCase();
      results = results.filter((p) =>
        p.productName.toLowerCase().includes(keyword)
      );
    }

    // 大分類フィルター
    if (conditions.majorCategories && conditions.majorCategories.length > 0) {
      const categorySet = new Set(conditions.majorCategories);
      results = results.filter((p) => categorySet.has(p.majorCategory));
    }

    // 中分類フィルター
    if (conditions.minorCategories && conditions.minorCategories.length > 0) {
      const categorySet = new Set(conditions.minorCategories);
      results = results.filter(
        (p) => p.minorCategory && categorySet.has(p.minorCategory)
      );
    }

    // 樹種フィルター
    if (conditions.woodTypes && conditions.woodTypes.length > 0) {
      const woodTypeSet = new Set(conditions.woodTypes);
      results = results.filter((p) => woodTypeSet.has(p.woodType));
    }

    // 保管場所フィルター
    if (
      conditions.storageLocationIds &&
      conditions.storageLocationIds.length > 0
    ) {
      const locationSet = new Set(conditions.storageLocationIds);
      results = results.filter((p) => locationSet.has(p.storageLocationId));
    }

    // 仕入れ先フィルター
    if (conditions.supplierIds && conditions.supplierIds.length > 0) {
      const supplierSet = new Set(conditions.supplierIds);
      results = results.filter((p) => supplierSet.has(p.supplierId));
    }

    // 仕入れ日範囲
    if (conditions.purchaseDateRange) {
      const { start, end } = conditions.purchaseDateRange;
      if (start) {
        results = results.filter((p) => p.purchaseDate >= start);
      }
      if (end) {
        results = results.filter((p) => p.purchaseDate <= end);
      }
    }

    // 入荷単価範囲
    if (conditions.purchasePriceRange) {
      const { min, max } = conditions.purchasePriceRange;
      if (min !== undefined) {
        results = results.filter((p) => p.purchasePrice >= min);
      }
      if (max !== undefined) {
        results = results.filter((p) => p.purchasePrice <= max);
      }
    }

    // サイズ範囲（長さ）
    if (conditions.lengthRange) {
      const { min, max } = conditions.lengthRange;
      const useFinished = conditions.useFinishedSize;
      results = results.filter((p) => {
        const size = useFinished ? p.finishedSize : p.rawSize;
        const length = size?.length;
        if (length === undefined) return false;
        if (min !== undefined && length < min) return false;
        if (max !== undefined && length > max) return false;
        return true;
      });
    }

    // サイズ範囲（幅）
    if (conditions.widthRange) {
      const { min, max } = conditions.widthRange;
      const useFinished = conditions.useFinishedSize;
      results = results.filter((p) => {
        const size = useFinished ? p.finishedSize : p.rawSize;
        const width = size?.width;
        if (width === undefined) return false;
        if (min !== undefined && width < min) return false;
        if (max !== undefined && width > max) return false;
        return true;
      });
    }

    // 在庫日数範囲
    if (conditions.stockDaysRange) {
      const { min, max } = conditions.stockDaysRange;
      results = results.filter((p) => {
        const days = getStockDays(p.purchaseDate);
        if (min !== undefined && days < min) return false;
        if (max !== undefined && days > max) return false;
        return true;
      });
    }

    // ソート
    if (conditions.sortBy) {
      const order = conditions.sortOrder === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        let aVal: unknown;
        let bVal: unknown;

        switch (conditions.sortBy) {
          case 'productId':
            aVal = a.productId;
            bVal = b.productId;
            break;
          case 'productName':
            aVal = a.productName;
            bVal = b.productName;
            break;
          case 'purchaseDate':
            aVal = a.purchaseDate.getTime();
            bVal = b.purchaseDate.getTime();
            break;
          case 'purchasePrice':
            aVal = a.purchasePrice;
            bVal = b.purchasePrice;
            break;
          case 'createdAt':
            aVal = a.createdAt.getTime();
            bVal = b.createdAt.getTime();
            break;
          case 'stockDays':
            aVal = getStockDays(a.purchaseDate);
            bVal = getStockDays(b.purchaseDate);
            break;
          default:
            return 0;
        }

        if ((aVal as number | string) < (bVal as number | string)) return -1 * order;
        if ((aVal as number | string) > (bVal as number | string)) return 1 * order;
        return 0;
      });
    }

    return results;
  }

  /**
   * 複合条件検索（ページネーション付き）
   */
  searchWithPagination(
    conditions: ProductSearchCondition,
    pagination: PaginationOptions
  ): PaginatedResult<Product> {
    const allResults = this.search(conditions);
    const total = allResults.length;
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allResults.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * 製品のステータスを更新
   */
  updateStatus(productId: string, status: ProductStatus): Product | null {
    return this.update(productId, {
      status,
      updatedAt: new Date(),
    } as Partial<Product>);
  }

  /**
   * 製品を論理削除
   */
  softDelete(productId: string, reason: string, deletedBy?: string): Product | null {
    return this.update(productId, {
      status: '削除済み',
      deletedAt: new Date(),
      deleteReason: reason,
      updatedAt: new Date(),
      updatedBy: deletedBy,
    } as Partial<Product>);
  }

  /**
   * 製品を復元
   */
  restore(productId: string, restoredBy?: string): Product | null {
    return this.update(productId, {
      status: '販売中',
      deletedAt: undefined,
      deleteReason: undefined,
      updatedAt: new Date(),
      updatedBy: restoredBy,
    } as Partial<Product>);
  }

  /**
   * 販売処理
   */
  markAsSold(
    productId: string,
    salesDestination: string,
    salesDate: Date,
    actualSalesPrice?: number,
    salesRemarks?: string,
    soldBy?: string
  ): Product | null {
    return this.update(productId, {
      status: '販売済み',
      salesDestination,
      salesDate,
      actualSalesPrice,
      salesRemarks,
      updatedAt: new Date(),
      updatedBy: soldBy,
    } as Partial<Product>);
  }

  /**
   * 販売キャンセル
   */
  cancelSale(productId: string, cancelledBy?: string): Product | null {
    return this.update(productId, {
      status: '販売中',
      salesDestination: undefined,
      salesDate: undefined,
      actualSalesPrice: undefined,
      salesRemarks: undefined,
      updatedAt: new Date(),
      updatedBy: cancelledBy,
    } as Partial<Product>);
  }

  /**
   * 最終棚卸し日を更新
   */
  updateLastInventoryDate(
    productId: string,
    inventoryDate: Date
  ): Product | null {
    return this.update(productId, {
      lastInventoryDate: inventoryDate,
      updatedAt: new Date(),
    } as Partial<Product>);
  }

  /**
   * 保管場所を変更
   */
  changeStorageLocation(
    productId: string,
    newLocationId: string,
    changedBy?: string
  ): Product | null {
    return this.update(productId, {
      storageLocationId: newLocationId,
      updatedAt: new Date(),
      updatedBy: changedBy,
    } as Partial<Product>);
  }

  /**
   * DTOから製品を作成
   */
  createFromDto(dto: CreateProductDto, createdBy?: string): Product {
    const existingIds = this.findAll().map((p) => p.productId);
    const nextNum = getNextSequenceNumber(existingIds, 'ITA');
    const productId = generateProductId(nextNum);

    const product: Product = {
      productId,
      majorCategory: dto.majorCategory,
      minorCategory: dto.minorCategory,
      productName: dto.productName,
      woodType: dto.woodType,
      rawSize: dto.rawSize,
      finishedSize: dto.finishedSize,
      rawPhotoUrls: dto.rawPhotoUrls,
      finishedPhotoUrls: dto.finishedPhotoUrls,
      supplierId: dto.supplierId,
      purchaseDate: dto.purchaseDate,
      purchasePrice: dto.purchasePrice,
      storageLocationId: dto.storageLocationId,
      shippingCost: dto.shippingCost,
      shippingCarrier: dto.shippingCarrier,
      profitMargin: dto.profitMargin ?? DEFAULTS.PROFIT_MARGIN,
      priceAdjustment: dto.priceAdjustment,
      status: '販売中',
      remarks: dto.remarks,
      createdAt: new Date(),
      createdBy,
    };

    return this.create(product);
  }

  /**
   * 販売処理
   */
  sell(
    productId: string,
    salesData: {
      soldDate: Date;
      soldPrice: number;
      soldTo?: string;
      shippingCost?: number;
      deliveryDate?: Date;
      remarks?: string;
    }
  ): Product | null {
    return this.update(productId, {
      status: '販売済み',
      salesDate: salesData.soldDate,
      actualSalesPrice: salesData.soldPrice,
      salesDestination: salesData.soldTo,
      shippingCost: salesData.shippingCost ?? undefined,
      deliveryDate: salesData.deliveryDate ?? undefined,
      salesRemarks: salesData.remarks,
      updatedAt: new Date(),
    } as Partial<Product>);
  }

  /**
   * 価格情報を更新
   */
  updatePrices(
    productId: string,
    prices: {
      totalCost?: number;
      suggestedPrice?: number;
      sellingPriceExTax?: number;
      sellingPriceIncTax?: number;
    }
  ): Product | null {
    // 価格情報は計算値なので、Productに直接保存しない
    // 必要に応じてキャッシュやセッションストレージに保存する設計
    // 現在のProduct型には計算値フィールドがないため、
    // 呼び出し元でProductDetailとして管理する
    return this.findById(productId);
  }
}
