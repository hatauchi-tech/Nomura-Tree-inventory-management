/**
 * SalesService - 販売ビジネスロジック
 */

import { ProductRepository } from '../repositories/ProductRepository';
import { Product, ProductStatus } from '../types/product';

/**
 * 販売データ
 */
export interface SalesData {
  soldDate: Date;
  soldPrice: number;
  soldTo?: string;
  shippingCost?: number;
  remarks?: string;
}

/**
 * 販売サービスエラー
 */
export class SalesServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SalesServiceError';
  }
}

/**
 * 販売サービス
 */
export class SalesService {
  private productRepo: ProductRepository;
  private readonly CANCEL_LIMIT_DAYS = 7; // 販売キャンセル可能期間

  constructor(spreadsheetId: string) {
    this.productRepo = new ProductRepository(spreadsheetId);
  }

  /**
   * 製品を販売
   */
  sellProduct(productId: string, salesData: SalesData): Product {
    const product = this.productRepo.findById(productId);
    if (!product) {
      throw new SalesServiceError(
        '製品が見つかりません',
        'NOT_FOUND',
        { productId }
      );
    }

    if (product.status !== '販売中') {
      throw new SalesServiceError(
        '販売可能な状態ではありません',
        'NOT_AVAILABLE',
        { productId, currentStatus: product.status }
      );
    }

    // バリデーション
    if (!salesData.soldDate) {
      throw new SalesServiceError(
        '販売日を指定してください',
        'MISSING_SOLD_DATE'
      );
    }

    if (!salesData.soldPrice || salesData.soldPrice <= 0) {
      throw new SalesServiceError(
        '販売価格は0より大きい値を指定してください',
        'INVALID_SOLD_PRICE',
        { soldPrice: salesData.soldPrice }
      );
    }

    // 販売処理
    const sold = this.productRepo.sell(productId, salesData);
    if (!sold) {
      throw new SalesServiceError(
        '販売処理に失敗しました',
        'SELL_FAILED',
        { productId }
      );
    }

    return sold;
  }

  /**
   * 複数製品を一括販売
   */
  sellProducts(
    productIds: string[],
    salesData: Omit<SalesData, 'soldPrice'>,
    soldPrices: Map<string, number>
  ): Product[] {
    const soldProducts: Product[] = [];
    const errors: { productId: string; error: string }[] = [];

    for (const productId of productIds) {
      try {
        const soldPrice = soldPrices.get(productId);
        if (!soldPrice) {
          errors.push({ productId, error: '販売価格が指定されていません' });
          continue;
        }

        const sold = this.sellProduct(productId, {
          ...salesData,
          soldPrice,
        });
        soldProducts.push(sold);
      } catch (error) {
        const errorMessage =
          error instanceof SalesServiceError
            ? error.message
            : '不明なエラー';
        errors.push({ productId, error: errorMessage });
      }
    }

    if (errors.length > 0 && soldProducts.length === 0) {
      throw new SalesServiceError(
        '販売処理に全て失敗しました',
        'BULK_SELL_FAILED',
        { errors }
      );
    }

    return soldProducts;
  }

  /**
   * 販売をキャンセル
   */
  cancelSale(productId: string, reason: string): Product {
    const product = this.productRepo.findById(productId);
    if (!product) {
      throw new SalesServiceError(
        '製品が見つかりません',
        'NOT_FOUND',
        { productId }
      );
    }

    if (product.status !== '販売済み') {
      throw new SalesServiceError(
        '販売済みの状態ではありません',
        'NOT_SOLD',
        { productId, currentStatus: product.status }
      );
    }

    // キャンセル期限チェック
    if (product.salesDate) {
      const salesDate = new Date(product.salesDate);
      const today = new Date();
      const diffTime = today.getTime() - salesDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > this.CANCEL_LIMIT_DAYS) {
        throw new SalesServiceError(
          `販売から${this.CANCEL_LIMIT_DAYS}日以上経過しているためキャンセルできません`,
          'CANCEL_PERIOD_EXPIRED',
          { productId, salesDate, daysPassed: diffDays }
        );
      }
    }

    if (!reason || reason.trim().length === 0) {
      throw new SalesServiceError(
        'キャンセル理由を入力してください',
        'MISSING_REASON'
      );
    }

    // キャンセル処理
    const cancelled = this.productRepo.cancelSale(productId, reason);
    if (!cancelled) {
      throw new SalesServiceError(
        'キャンセル処理に失敗しました',
        'CANCEL_FAILED',
        { productId }
      );
    }

    return cancelled;
  }

  /**
   * 販売済み製品一覧を取得
   */
  getSoldProducts(): Product[] {
    return this.productRepo.findByStatus('販売済み');
  }

  /**
   * 期間内の販売製品を取得
   */
  getSoldProductsByDateRange(startDate: Date, endDate: Date): Product[] {
    const soldProducts = this.getSoldProducts();
    return soldProducts.filter((p) => {
      if (!p.salesDate) return false;
      const salesDate = new Date(p.salesDate);
      return salesDate >= startDate && salesDate <= endDate;
    });
  }

  /**
   * 売上統計を取得
   */
  getSalesStats(startDate?: Date, endDate?: Date): {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averagePrice: number;
    averageProfitMargin: number;
  } {
    let products: Product[];

    if (startDate && endDate) {
      products = this.getSoldProductsByDateRange(startDate, endDate);
    } else {
      products = this.getSoldProducts();
    }

    if (products.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averagePrice: 0,
        averageProfitMargin: 0,
      };
    }

    const totalSales = products.length;
    const totalRevenue = products.reduce(
      (sum, p) => sum + (p.actualSalesPrice || 0),
      0
    );
    const totalCost = products.reduce(
      (sum, p) => sum + (p.purchasePrice || 0),
      0
    );
    const totalProfit = totalRevenue - totalCost;
    const averagePrice = Math.round(totalRevenue / totalSales);
    const averageProfitMargin =
      totalRevenue > 0
        ? Math.round((totalProfit / totalRevenue) * 100)
        : 0;

    return {
      totalSales,
      totalRevenue,
      totalProfit,
      averagePrice,
      averageProfitMargin,
    };
  }

  /**
   * 月別売上を取得
   */
  getMonthlySales(year: number): Map<number, { count: number; revenue: number }> {
    const soldProducts = this.getSoldProducts();
    const monthlySales = new Map<number, { count: number; revenue: number }>();

    // 初期化
    for (let month = 1; month <= 12; month++) {
      monthlySales.set(month, { count: 0, revenue: 0 });
    }

    // 集計
    for (const product of soldProducts) {
      if (!product.salesDate) continue;
      const salesDate = new Date(product.salesDate);
      if (salesDate.getFullYear() !== year) continue;

      const month = salesDate.getMonth() + 1;
      const current = monthlySales.get(month)!;
      monthlySales.set(month, {
        count: current.count + 1,
        revenue: current.revenue + (product.actualSalesPrice || 0),
      });
    }

    return monthlySales;
  }

  /**
   * 樹種別売上を取得
   */
  getSalesByWoodType(): Map<string, { count: number; revenue: number }> {
    const soldProducts = this.getSoldProducts();
    const salesByWoodType = new Map<string, { count: number; revenue: number }>();

    for (const product of soldProducts) {
      const woodType = product.woodType || 'その他';
      const current = salesByWoodType.get(woodType) || { count: 0, revenue: 0 };
      salesByWoodType.set(woodType, {
        count: current.count + 1,
        revenue: current.revenue + (product.actualSalesPrice || 0),
      });
    }

    return salesByWoodType;
  }
}
