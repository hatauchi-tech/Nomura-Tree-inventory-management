/**
 * ProcessingCostService - 加工費ビジネスロジック
 */

import { ProcessingCostRepository } from '../repositories/ProcessingCostRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import {
  ProcessingCost,
  CreateProcessingCostDto,
  UpdateProcessingCostDto,
  ProductProcessingCostSummary,
} from '../types/processingCost';
import { calculateAllPrices } from './PriceCalculator';

/**
 * 加工費サービスエラー
 */
export class ProcessingCostServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProcessingCostServiceError';
  }
}

/**
 * 加工費サービス
 */
export class ProcessingCostService {
  private processingCostRepo: ProcessingCostRepository;
  private productRepo: ProductRepository;

  constructor(spreadsheetId: string) {
    this.processingCostRepo = new ProcessingCostRepository(spreadsheetId);
    this.productRepo = new ProductRepository(spreadsheetId);
  }

  /**
   * 製品の加工費一覧を取得
   */
  getProcessingCosts(productId: string): ProcessingCost[] {
    return this.processingCostRepo.findByProductId(productId);
  }

  /**
   * 製品の加工費サマリーを取得
   */
  getProductSummary(productId: string): ProductProcessingCostSummary {
    return this.processingCostRepo.getProductSummary(productId);
  }

  /**
   * 加工費を登録
   */
  createProcessingCost(dto: CreateProcessingCostDto): ProcessingCost {
    // 製品の存在確認
    const product = this.productRepo.findById(dto.productId);
    if (!product) {
      throw new ProcessingCostServiceError(
        '製品が見つかりません',
        'PRODUCT_NOT_FOUND',
        { productId: dto.productId }
      );
    }

    // バリデーション
    if (!dto.amount || dto.amount < 0) {
      throw new ProcessingCostServiceError(
        '金額は0以上の数値を指定してください',
        'INVALID_AMOUNT',
        { amount: dto.amount }
      );
    }

    if (!dto.processingType) {
      throw new ProcessingCostServiceError(
        '加工種別を指定してください',
        'MISSING_PROCESSING_TYPE'
      );
    }

    if (!dto.processorId) {
      throw new ProcessingCostServiceError(
        '加工業者を指定してください',
        'MISSING_PROCESSOR'
      );
    }

    // 加工費を登録
    const cost = this.processingCostRepo.createFromDto(dto);

    // 製品の価格を再計算
    this.recalculateProductPrices(dto.productId);

    return cost;
  }

  /**
   * 加工費を更新
   */
  updateProcessingCost(
    costId: string,
    dto: UpdateProcessingCostDto
  ): ProcessingCost {
    const existing = this.processingCostRepo.findById(costId);
    if (!existing) {
      throw new ProcessingCostServiceError(
        '加工費が見つかりません',
        'NOT_FOUND',
        { costId }
      );
    }

    // バリデーション
    if (dto.amount !== undefined && dto.amount < 0) {
      throw new ProcessingCostServiceError(
        '金額は0以上の数値を指定してください',
        'INVALID_AMOUNT',
        { amount: dto.amount }
      );
    }

    const updated = this.processingCostRepo.update(costId, dto);
    if (!updated) {
      throw new ProcessingCostServiceError(
        '更新に失敗しました',
        'UPDATE_FAILED',
        { costId }
      );
    }

    // 製品の価格を再計算
    this.recalculateProductPrices(existing.productId);

    return updated;
  }

  /**
   * 加工費を削除
   */
  deleteProcessingCost(costId: string): boolean {
    const existing = this.processingCostRepo.findById(costId);
    if (!existing) {
      throw new ProcessingCostServiceError(
        '加工費が見つかりません',
        'NOT_FOUND',
        { costId }
      );
    }

    const productId = existing.productId;
    const deleted = this.processingCostRepo.delete(costId);

    if (deleted) {
      // 製品の価格を再計算
      this.recalculateProductPrices(productId);
    }

    return deleted;
  }

  /**
   * 製品の価格を再計算（ログ用）
   */
  private recalculateProductPrices(productId: string): void {
    const product = this.productRepo.findById(productId);
    if (!product) return;

    const costs = this.processingCostRepo.findByProductId(productId);

    // 価格を計算（計算結果は使用しないが、将来の拡張用）
    calculateAllPrices({
      purchasePrice: product.purchasePrice || 0,
      processingCosts: costs.map((c) => ({ amount: c.amount })),
      shippingCost: product.shippingCost || 0,
      profitMargin: product.profitMargin,
      priceAdjustment: product.priceAdjustment || 0,
    });
  }

  /**
   * 加工業者別の加工費集計
   */
  getProcessorStats(): Map<string, { count: number; totalAmount: number }> {
    const allCosts = this.processingCostRepo.findAll();
    const stats = new Map<string, { count: number; totalAmount: number }>();

    for (const cost of allCosts) {
      const current = stats.get(cost.processorId) || {
        count: 0,
        totalAmount: 0,
      };
      stats.set(cost.processorId, {
        count: current.count + 1,
        totalAmount: current.totalAmount + cost.amount,
      });
    }

    return stats;
  }

  /**
   * 加工種別別の加工費集計
   */
  getProcessingTypeStats(): Map<string, { count: number; totalAmount: number }> {
    const allCosts = this.processingCostRepo.findAll();
    const stats = new Map<string, { count: number; totalAmount: number }>();

    for (const cost of allCosts) {
      const current = stats.get(cost.processingType) || {
        count: 0,
        totalAmount: 0,
      };
      stats.set(cost.processingType, {
        count: current.count + 1,
        totalAmount: current.totalAmount + cost.amount,
      });
    }

    return stats;
  }
}
