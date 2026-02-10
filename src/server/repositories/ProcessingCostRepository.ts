/**
 * ProcessingCostRepository - 加工費データアクセス層
 */

import { BaseRepository, RepositoryConfig } from './BaseRepository';
import {
  ProcessingCost,
  PROCESSING_COST_HEADERS,
  rowToProcessingCost,
  processingCostToRow,
  CreateProcessingCostDto,
  ProductProcessingCostSummary,
} from '../types/processingCost';
import { SHEET_NAMES, SheetRowData } from '../types/common';
import { generateProcessingCostId, getNextSequenceNumber } from '../utils/idGenerator';

/**
 * 加工費リポジトリ
 */
export class ProcessingCostRepository extends BaseRepository<ProcessingCost> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.PROCESSING_COSTS,
      headers: PROCESSING_COST_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): ProcessingCost {
    return rowToProcessingCost(row as SheetRowData);
  }

  protected entityToRow(entity: ProcessingCost): unknown[] {
    return processingCostToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // processingCostId
  }

  /**
   * 製品IDで加工費一覧を取得
   */
  findByProductId(productId: string): ProcessingCost[] {
    return this.findWhere((cost) => cost.productId === productId);
  }

  /**
   * 製品IDの加工費合計を取得
   */
  getTotalByProductId(productId: string): number {
    const costs = this.findByProductId(productId);
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  }

  /**
   * 製品の加工費サマリーを取得
   */
  getProductSummary(productId: string): ProductProcessingCostSummary {
    const items = this.findByProductId(productId);
    const totalAmount = items.reduce((sum, cost) => sum + cost.amount, 0);

    return {
      productId,
      totalAmount,
      items,
      itemCount: items.length,
    };
  }

  /**
   * 新規加工費を登録
   */
  createFromDto(dto: CreateProcessingCostDto): ProcessingCost {
    // 既存の加工費IDを取得して新しいIDを生成
    const existingIds = this.findAll().map((c) => c.processingCostId);
    const nextNum = getNextSequenceNumber(existingIds, 'COST');
    const processingCostId = generateProcessingCostId(nextNum);

    const cost: ProcessingCost = {
      processingCostId,
      productId: dto.productId,
      processingType: dto.processingType,
      processorId: dto.processorId,
      processingContent: dto.processingContent,
      amount: dto.amount,
      createdAt: new Date(),
    };

    return this.create(cost);
  }

  /**
   * 製品の全加工費を削除
   */
  deleteByProductId(productId: string): number {
    const costs = this.findByProductId(productId);
    let deletedCount = 0;

    // 逆順で削除（行番号がずれないように）
    const sortedCosts = [...costs].sort((a, b) =>
      b.processingCostId.localeCompare(a.processingCostId)
    );

    for (const cost of sortedCosts) {
      if (this.delete(cost.processingCostId)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 加工業者IDで加工費一覧を取得
   */
  findByProcessorId(processorId: string): ProcessingCost[] {
    return this.findWhere((cost) => cost.processorId === processorId);
  }

  /**
   * 加工種別で加工費一覧を取得
   */
  findByProcessingType(processingType: string): ProcessingCost[] {
    return this.findWhere((cost) => cost.processingType === processingType);
  }

  /**
   * 複数製品の加工費サマリーを一括取得
   */
  getProductSummaries(productIds: string[]): Map<string, ProductProcessingCostSummary> {
    const allCosts = this.findAll();
    const productIdSet = new Set(productIds);

    const summaryMap = new Map<string, ProductProcessingCostSummary>();

    // 初期化
    for (const productId of productIds) {
      summaryMap.set(productId, {
        productId,
        totalAmount: 0,
        items: [],
        itemCount: 0,
      });
    }

    // 集計
    for (const cost of allCosts) {
      if (productIdSet.has(cost.productId)) {
        const summary = summaryMap.get(cost.productId)!;
        summary.items.push(cost);
        summary.totalAmount += cost.amount;
        summary.itemCount++;
      }
    }

    return summaryMap;
  }
}
