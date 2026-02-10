/**
 * 価格計算サービスのテスト
 */

import {
  calculateProcessingCostTotal,
  calculateTotalCost,
  calculateSuggestedPrice,
  calculateSellingPriceExTax,
  calculateSellingPriceIncTax,
  calculateAllPrices,
  PriceCalculationInput,
  PriceCalculationResult,
} from '../../../src/server/services/PriceCalculator';
import { DEFAULTS } from '../../../src/server/types/common';

describe('PriceCalculator Service', () => {
  describe('calculateProcessingCostTotal', () => {
    it('should calculate sum of processing costs', () => {
      const costs = [
        { amount: 25000 },
        { amount: 15000 },
        { amount: 10000 },
      ];
      expect(calculateProcessingCostTotal(costs)).toBe(50000);
    });

    it('should return 0 for empty array', () => {
      expect(calculateProcessingCostTotal([])).toBe(0);
    });

    it('should handle single cost', () => {
      expect(calculateProcessingCostTotal([{ amount: 30000 }])).toBe(30000);
    });

    it('should handle zero costs', () => {
      const costs = [{ amount: 0 }, { amount: 0 }];
      expect(calculateProcessingCostTotal(costs)).toBe(0);
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total cost correctly', () => {
      // トータル原価 = 入荷単価 + 加工費合計 + 販売時送料
      // 150000 + 40000 + 15000 = 205000
      const result = calculateTotalCost(150000, 40000, 15000);
      expect(result).toBe(205000);
    });

    it('should handle zero processing costs', () => {
      // 150000 + 0 + 15000 = 165000
      const result = calculateTotalCost(150000, 0, 15000);
      expect(result).toBe(165000);
    });

    it('should handle zero shipping cost', () => {
      // 150000 + 40000 + 0 = 190000
      const result = calculateTotalCost(150000, 40000, 0);
      expect(result).toBe(190000);
    });

    it('should handle all zeros', () => {
      expect(calculateTotalCost(0, 0, 0)).toBe(0);
    });
  });

  describe('calculateSuggestedPrice', () => {
    it('should calculate suggested price with default profit margin 60%', () => {
      // 目安販売価格 = トータル原価 ÷ (1 - 利益率)
      // 200000 ÷ (1 - 0.6) = 200000 ÷ 0.4 = 500000
      const result = calculateSuggestedPrice(200000, DEFAULTS.PROFIT_MARGIN);
      expect(result).toBe(500000);
    });

    it('should calculate with custom profit margin', () => {
      // 200000 ÷ (1 - 0.5) = 200000 ÷ 0.5 = 400000
      const result = calculateSuggestedPrice(200000, 50);
      expect(result).toBe(400000);
    });

    it('should handle 0% profit margin', () => {
      // 200000 ÷ (1 - 0) = 200000
      const result = calculateSuggestedPrice(200000, 0);
      expect(result).toBe(200000);
    });

    it('should handle small profit margin', () => {
      // 100000 ÷ (1 - 0.1) = 100000 ÷ 0.9 ≈ 111111
      const result = calculateSuggestedPrice(100000, 10);
      expect(result).toBe(111111);
    });

    it('should round to nearest integer', () => {
      // 100000 ÷ (1 - 0.33) = 100000 ÷ 0.67 ≈ 149254
      const result = calculateSuggestedPrice(100000, 33);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('calculateSellingPriceExTax', () => {
    it('should add price adjustment to suggested price', () => {
      // 販売価格（税抜） = 目安販売価格 + 価格調整額
      // 500000 + 10000 = 510000
      const result = calculateSellingPriceExTax(500000, 10000);
      expect(result).toBe(510000);
    });

    it('should apply negative adjustment (discount)', () => {
      // 500000 + (-50000) = 450000
      const result = calculateSellingPriceExTax(500000, -50000);
      expect(result).toBe(450000);
    });

    it('should handle zero adjustment', () => {
      const result = calculateSellingPriceExTax(500000, 0);
      expect(result).toBe(500000);
    });

    it('should handle undefined adjustment', () => {
      const result = calculateSellingPriceExTax(500000, undefined);
      expect(result).toBe(500000);
    });
  });

  describe('calculateSellingPriceIncTax', () => {
    it('should calculate tax-included price with 10% tax', () => {
      // 販売価格（税込） = 販売価格（税抜） × 1.1
      // 500000 × 1.1 = 550000
      const result = calculateSellingPriceIncTax(500000);
      expect(result).toBe(550000);
    });

    it('should round to nearest integer', () => {
      // 333333 × 1.1 = 366666.3 → 366666
      const result = calculateSellingPriceIncTax(333333);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle zero', () => {
      expect(calculateSellingPriceIncTax(0)).toBe(0);
    });
  });

  describe('calculateAllPrices', () => {
    it('should calculate all prices correctly', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 150000,
        processingCosts: [{ amount: 25000 }, { amount: 15000 }],
        shippingCost: 15000,
        profitMargin: 60,
        priceAdjustment: 0,
      };

      // 加工費合計: 25000 + 15000 = 40000
      // トータル原価: 150000 + 40000 + 15000 = 205000
      // 目安販売価格: 205000 ÷ 0.4 = 512500
      // 販売価格（税抜）: 512500 + 0 = 512500
      // 販売価格（税込）: 512500 × 1.1 = 563750

      const result = calculateAllPrices(input);

      expect(result.processingCostTotal).toBe(40000);
      expect(result.totalCost).toBe(205000);
      expect(result.suggestedPrice).toBe(512500);
      expect(result.sellingPriceExTax).toBe(512500);
      expect(result.sellingPriceIncTax).toBe(563750);
    });

    it('should apply price adjustment correctly', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 100000,
        processingCosts: [{ amount: 20000 }],
        shippingCost: 10000,
        profitMargin: 60,
        priceAdjustment: -30000, // 値引き
      };

      // トータル原価: 100000 + 20000 + 10000 = 130000
      // 目安販売価格: 130000 ÷ 0.4 = 325000
      // 販売価格（税抜）: 325000 - 30000 = 295000
      // 販売価格（税込）: 295000 × 1.1 = 324500

      const result = calculateAllPrices(input);

      expect(result.totalCost).toBe(130000);
      expect(result.suggestedPrice).toBe(325000);
      expect(result.sellingPriceExTax).toBe(295000);
      expect(result.sellingPriceIncTax).toBe(324500);
    });

    it('should use default profit margin when not specified', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 100000,
        processingCosts: [],
        shippingCost: 0,
      };

      const result = calculateAllPrices(input);

      // デフォルト利益率60%を使用
      // 目安販売価格: 100000 ÷ 0.4 = 250000
      expect(result.suggestedPrice).toBe(250000);
    });

    it('should handle zero processing costs', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 100000,
        processingCosts: [],
        shippingCost: 10000,
        profitMargin: 50,
      };

      const result = calculateAllPrices(input);

      expect(result.processingCostTotal).toBe(0);
      expect(result.totalCost).toBe(110000);
    });

    it('should handle undefined shipping cost', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 100000,
        processingCosts: [{ amount: 20000 }],
      };

      const result = calculateAllPrices(input);

      // 送料は0として計算
      expect(result.totalCost).toBe(120000);
    });

    it('should calculate margin percentage', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 150000,
        processingCosts: [{ amount: 40000 }],
        shippingCost: 10000,
        profitMargin: 60,
        priceAdjustment: 0,
      };

      const result = calculateAllPrices(input);

      // 実際の利益率 = (販売価格税抜 - トータル原価) / 販売価格税抜 × 100
      expect(result.actualMarginPercent).toBeDefined();
      expect(result.actualMarginPercent).toBeCloseTo(60, 0);
    });

    it('should calculate gross profit', () => {
      const input: PriceCalculationInput = {
        purchasePrice: 100000,
        processingCosts: [{ amount: 20000 }],
        shippingCost: 10000,
        profitMargin: 60,
        priceAdjustment: 0,
      };

      const result = calculateAllPrices(input);

      // 粗利 = 販売価格（税抜） - トータル原価
      expect(result.grossProfit).toBe(result.sellingPriceExTax - result.totalCost);
    });
  });
});
