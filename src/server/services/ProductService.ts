/**
 * ProductService - 製品ビジネスロジック
 */

import { ProductRepository } from '../repositories/ProductRepository';
import { ProcessingCostRepository } from '../repositories/ProcessingCostRepository';
import {
  Product,
  ProductStatus,
  CreateProductDto,
  UpdateProductDto,
  ProductSearchCondition,
  ProductListItem,
} from '../types/product';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { calculateAllPrices, PriceCalculationResult } from './PriceCalculator';

/**
 * 製品サービスエラー
 */
export class ProductServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

/**
 * 製品サービスインターフェース
 */
export interface IProductService {
  searchProducts(
    conditions: ProductSearchCondition,
    pagination: PaginationOptions
  ): PaginatedResult<ProductListItem>;
  getProductDetail(productId: string): Product | null;
  createProduct(dto: CreateProductDto): Product;
  updateProduct(productId: string, dto: UpdateProductDto): Product;
  deleteProduct(productId: string, reason: string): Product;
  calculateProductPrices(productId: string): PriceCalculationResult;
}

/**
 * 製品サービス
 */
export class ProductService implements IProductService {
  private productRepo: ProductRepository;
  private processingCostRepo: ProcessingCostRepository;

  constructor(spreadsheetId: string) {
    this.productRepo = new ProductRepository(spreadsheetId);
    this.processingCostRepo = new ProcessingCostRepository(spreadsheetId);
  }

  /**
   * 製品検索
   */
  searchProducts(
    conditions: ProductSearchCondition,
    pagination: PaginationOptions
  ): PaginatedResult<ProductListItem> {
    const result = this.productRepo.searchWithPagination(conditions, pagination);

    // ProductListItem形式に変換
    const items: ProductListItem[] = result.data.map((product) => {
      // 価格計算
      const prices = this.calculateProductPricesInternal(product);
      // 在庫日数計算
      const stockDays = product.purchaseDate
        ? Math.ceil(
            (new Date().getTime() - new Date(product.purchaseDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : undefined;

      return {
        productId: product.productId,
        productName: product.productName,
        majorCategory: product.majorCategory,
        woodType: product.woodType,
        status: product.status,
        sellingPriceIncTax: prices.sellingPriceIncTax,
        storageLocation: product.storageLocationId,
        rawPhotoUrl: product.rawPhotoUrls,
        stockDays,
        lastInventoryDate: product.lastInventoryDate,
      };
    });

    return {
      ...result,
      data: items,
    };
  }

  /**
   * 製品の価格を内部計算（製品オブジェクトから）
   */
  private calculateProductPricesInternal(product: Product): PriceCalculationResult {
    const processingCosts = this.processingCostRepo.findByProductId(product.productId);

    return calculateAllPrices({
      purchasePrice: product.purchasePrice || 0,
      processingCosts: processingCosts.map((c) => ({ amount: c.amount })),
      shippingCost: product.shippingCost || 0,
      profitMargin: product.profitMargin,
      priceAdjustment: product.priceAdjustment || 0,
    });
  }

  /**
   * 製品詳細取得
   */
  getProductDetail(productId: string): Product | null {
    return this.productRepo.findById(productId);
  }

  /**
   * 製品登録
   */
  createProduct(dto: CreateProductDto): Product {
    // 必須項目チェック
    if (!dto.productName || dto.productName.trim().length === 0) {
      throw new ProductServiceError(
        '商品名は必須です',
        'VALIDATION_ERROR',
        { field: 'productName' }
      );
    }

    // 製品作成
    const product = this.productRepo.createFromDto(dto);

    return this.productRepo.findById(product.productId)!;
  }

  /**
   * 製品更新
   */
  updateProduct(productId: string, dto: UpdateProductDto): Product {
    // 存在確認
    const existing = this.productRepo.findById(productId);
    if (!existing) {
      throw new ProductServiceError(
        '製品が見つかりません',
        'NOT_FOUND',
        { productId }
      );
    }

    // 更新実行
    const updated = this.productRepo.update(productId, {
      ...dto,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new ProductServiceError(
        '更新に失敗しました',
        'UPDATE_FAILED',
        { productId }
      );
    }

    return this.productRepo.findById(productId)!;
  }

  /**
   * 製品削除（論理削除）
   */
  deleteProduct(productId: string, reason: string): Product {
    const existing = this.productRepo.findById(productId);
    if (!existing) {
      throw new ProductServiceError(
        '製品が見つかりません',
        'NOT_FOUND',
        { productId }
      );
    }

    if (existing.status === '削除済み') {
      throw new ProductServiceError(
        '既に削除済みです',
        'ALREADY_DELETED',
        { productId }
      );
    }

    const deleted = this.productRepo.softDelete(productId, reason);
    if (!deleted) {
      throw new ProductServiceError(
        '削除に失敗しました',
        'DELETE_FAILED',
        { productId }
      );
    }

    return deleted;
  }

  /**
   * 製品の価格を計算
   */
  calculateProductPrices(productId: string): PriceCalculationResult {
    const product = this.productRepo.findById(productId);
    if (!product) {
      throw new ProductServiceError(
        '製品が見つかりません',
        'NOT_FOUND',
        { productId }
      );
    }

    // 加工費を取得
    const processingCosts = this.processingCostRepo.findByProductId(productId);

    return calculateAllPrices({
      purchasePrice: product.purchasePrice || 0,
      processingCosts: processingCosts.map((c) => ({ amount: c.amount })),
      shippingCost: product.shippingCost || 0,
      profitMargin: product.profitMargin,
      priceAdjustment: product.priceAdjustment || 0,
    });
  }

  /**
   * 在庫日数を計算
   */
  calculateStockDays(product: Product): number {
    if (!product.purchaseDate) {
      return 0;
    }

    const today = new Date();
    const purchaseDate = new Date(product.purchaseDate);
    const diffTime = Math.abs(today.getTime() - purchaseDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * ステータスで製品を取得
   */
  getProductsByStatus(status: ProductStatus): Product[] {
    return this.productRepo.findByStatus(status);
  }

  /**
   * 保管場所で製品を取得
   */
  getProductsByStorageLocation(storageLocation: string): Product[] {
    return this.productRepo.findByStorageLocation(storageLocation);
  }

  /**
   * ダッシュボード用統計を取得
   */
  getDashboardStats(): {
    totalProducts: number;
    availableProducts: number;
    soldProducts: number;
    totalInventoryValue: number;
    lowStockItems: number;
  } {
    const allProducts = this.productRepo.findAll();
    const available = allProducts.filter((p) => p.status === '販売中');
    const sold = allProducts.filter((p) => p.status === '販売済み');

    // 在庫価値の合計を計算
    let totalInventoryValue = 0;
    let lowStockItems = 0;

    for (const product of available) {
      // 価格計算
      const prices = this.calculateProductPricesInternal(product);
      totalInventoryValue += prices.sellingPriceIncTax;

      // 在庫日数が90日以上のものを低回転在庫とする
      const stockDays = this.calculateStockDays(product);
      if (stockDays >= 90) {
        lowStockItems++;
      }
    }

    return {
      totalProducts: allProducts.length,
      availableProducts: available.length,
      soldProducts: sold.length,
      totalInventoryValue,
      lowStockItems,
    };
  }
}
