/**
 * 価格計算サービス
 * 要件定義書4.3に基づく原価・販売価格計算
 */

import { DEFAULTS } from '../types/common';

/**
 * 価格計算入力
 */
export interface PriceCalculationInput {
  purchasePrice: number; // 入荷単価
  processingCosts: { amount: number }[]; // 加工費リスト
  shippingCost?: number; // 販売時送料
  profitMargin?: number; // 利益率（%）
  priceAdjustment?: number; // 価格調整額
}

/**
 * 価格計算結果
 */
export interface PriceCalculationResult {
  processingCostTotal: number; // 加工費合計
  totalCost: number; // トータル原価
  suggestedPrice: number; // 目安販売価格（税抜）
  sellingPriceExTax: number; // 販売価格（税抜）
  sellingPriceIncTax: number; // 販売価格（税込）
  grossProfit: number; // 粗利
  actualMarginPercent: number; // 実際の利益率（%）
}

/**
 * 加工費合計を計算
 */
export function calculateProcessingCostTotal(
  costs: { amount: number }[]
): number {
  return costs.reduce((sum, cost) => sum + cost.amount, 0);
}

/**
 * トータル原価を計算
 * 計算式: トータル原価 = 入荷単価 + 加工費合計 + 販売時送料
 */
export function calculateTotalCost(
  purchasePrice: number,
  processingCostTotal: number,
  shippingCost: number
): number {
  return purchasePrice + processingCostTotal + shippingCost;
}

/**
 * 目安販売価格を計算（税抜）
 * 計算式: 目安販売価格 = トータル原価 ÷ (1 - 利益率)
 */
export function calculateSuggestedPrice(
  totalCost: number,
  profitMargin: number
): number {
  const marginRate = profitMargin / 100;
  const divisor = 1 - marginRate;

  if (divisor === 0) {
    // 利益率100%の場合（実際にはありえないが安全のため）
    return totalCost;
  }

  return Math.round(totalCost / divisor);
}

/**
 * 販売価格（税抜）を計算
 * 計算式: 販売価格（税抜） = 目安販売価格 + 価格調整額
 */
export function calculateSellingPriceExTax(
  suggestedPrice: number,
  priceAdjustment?: number
): number {
  return suggestedPrice + (priceAdjustment ?? 0);
}

/**
 * 販売価格（税込）を計算
 * 計算式: 販売価格（税込） = 販売価格（税抜） × 1.1
 */
export function calculateSellingPriceIncTax(sellingPriceExTax: number): number {
  return Math.round(sellingPriceExTax * (1 + DEFAULTS.TAX_RATE));
}

/**
 * 粗利を計算
 */
export function calculateGrossProfit(
  sellingPriceExTax: number,
  totalCost: number
): number {
  return sellingPriceExTax - totalCost;
}

/**
 * 実際の利益率を計算
 */
export function calculateActualMarginPercent(
  sellingPriceExTax: number,
  totalCost: number
): number {
  if (sellingPriceExTax === 0) {
    return 0;
  }
  return ((sellingPriceExTax - totalCost) / sellingPriceExTax) * 100;
}

/**
 * すべての価格を一括計算
 */
export function calculateAllPrices(
  input: PriceCalculationInput
): PriceCalculationResult {
  const {
    purchasePrice,
    processingCosts,
    shippingCost = 0,
    profitMargin = DEFAULTS.PROFIT_MARGIN,
    priceAdjustment = 0,
  } = input;

  // 加工費合計
  const processingCostTotal = calculateProcessingCostTotal(processingCosts);

  // トータル原価
  const totalCost = calculateTotalCost(
    purchasePrice,
    processingCostTotal,
    shippingCost
  );

  // 目安販売価格（税抜）
  const suggestedPrice = calculateSuggestedPrice(totalCost, profitMargin);

  // 販売価格（税抜）
  const sellingPriceExTax = calculateSellingPriceExTax(
    suggestedPrice,
    priceAdjustment
  );

  // 販売価格（税込）
  const sellingPriceIncTax = calculateSellingPriceIncTax(sellingPriceExTax);

  // 粗利
  const grossProfit = calculateGrossProfit(sellingPriceExTax, totalCost);

  // 実際の利益率
  const actualMarginPercent = calculateActualMarginPercent(
    sellingPriceExTax,
    totalCost
  );

  return {
    processingCostTotal,
    totalCost,
    suggestedPrice,
    sellingPriceExTax,
    sellingPriceIncTax,
    grossProfit,
    actualMarginPercent,
  };
}

/**
 * 製品の価格情報を更新するためのヘルパー
 */
export function recalculatePricesForProduct(
  purchasePrice: number,
  processingCosts: { amount: number }[],
  shippingCost?: number,
  profitMargin?: number,
  priceAdjustment?: number
): PriceCalculationResult {
  return calculateAllPrices({
    purchasePrice,
    processingCosts,
    shippingCost,
    profitMargin,
    priceAdjustment,
  });
}
