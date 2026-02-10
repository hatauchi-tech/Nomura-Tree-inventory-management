/**
 * InventoryRepository - 棚卸しデータアクセス層
 * 棚卸しセッションと棚卸し詳細を管理
 */

import { BaseRepository, RepositoryConfig } from './BaseRepository';
import { SHEET_NAMES, SheetRowData, ConfirmationMethod } from '../types/common';
import {
  InventorySession,
  InventoryDetail,
  InventorySessionStatus,
  ConfirmationStatus,
  DiscrepancyType,
  INVENTORY_SESSION_HEADERS,
  INVENTORY_DETAIL_HEADERS,
  rowToInventorySession,
  rowToInventoryDetail,
  inventorySessionToRow,
  inventoryDetailToRow,
  StartInventorySessionDto,
  ConfirmProductDto,
  AdjustDiscrepancyDto,
} from '../types/inventory';
import { generateInventorySessionId, getNextInventorySessionSequence } from '../utils/idGenerator';

// ==================== 棚卸しセッションリポジトリ ====================

export class InventorySessionRepository extends BaseRepository<InventorySession> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.INVENTORY_SESSIONS,
      headers: INVENTORY_SESSION_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): InventorySession {
    return rowToInventorySession(row as SheetRowData);
  }

  protected entityToRow(entity: InventorySession): unknown[] {
    return inventorySessionToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // sessionId
  }

  /**
   * 保管場所IDでセッション一覧を取得
   */
  findByStorageLocationId(storageLocationId: string): InventorySession[] {
    return this.findWhere((session) => session.storageLocationId === storageLocationId);
  }

  /**
   * ステータスでセッション一覧を取得
   */
  findByStatus(status: InventorySessionStatus): InventorySession[] {
    return this.findWhere((session) => session.status === status);
  }

  /**
   * 進行中のセッションを取得
   */
  findActiveSessions(): InventorySession[] {
    return this.findByStatus('進行中');
  }

  /**
   * 保管場所の最新セッションを取得
   */
  findLatestByStorageLocationId(storageLocationId: string): InventorySession | null {
    const sessions = this.findByStorageLocationId(storageLocationId);
    if (sessions.length === 0) return null;

    return sessions.sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    )[0];
  }

  /**
   * セッションを開始
   */
  createSession(dto: StartInventorySessionDto, targetCount: number): InventorySession {
    const today = new Date();
    const existingIds = this.findAll().map((s) => s.sessionId);
    const nextSeq = getNextInventorySessionSequence(existingIds, today);
    const sessionId = generateInventorySessionId(today, nextSeq);

    const session: InventorySession = {
      sessionId,
      storageLocationId: dto.storageLocationId,
      startedAt: new Date(),
      startedBy: dto.startedBy,
      status: '進行中',
      targetCount,
      confirmedCount: 0,
      discrepancyCount: 0,
    };

    return this.create(session);
  }

  /**
   * セッションを完了
   */
  completeSession(sessionId: string, completedBy: string): InventorySession | null {
    return this.update(sessionId, {
      status: '完了',
      completedAt: new Date(),
      completedBy,
    });
  }

  /**
   * セッションを中断
   */
  pauseSession(sessionId: string): InventorySession | null {
    return this.update(sessionId, {
      status: '中断中',
    });
  }

  /**
   * セッションを再開
   */
  resumeSession(sessionId: string): InventorySession | null {
    return this.update(sessionId, {
      status: '進行中',
    });
  }

  /**
   * 確認済み件数を更新
   */
  updateConfirmedCount(sessionId: string, confirmedCount: number): InventorySession | null {
    return this.update(sessionId, { confirmedCount });
  }

  /**
   * 差異件数を更新
   */
  updateDiscrepancyCount(sessionId: string, discrepancyCount: number): InventorySession | null {
    return this.update(sessionId, { discrepancyCount });
  }

  /**
   * カウントを一括更新
   */
  updateCounts(
    sessionId: string,
    confirmedCount: number,
    discrepancyCount: number
  ): InventorySession | null {
    return this.update(sessionId, { confirmedCount, discrepancyCount });
  }
}

// ==================== 棚卸し詳細リポジトリ ====================

export class InventoryDetailRepository extends BaseRepository<InventoryDetail> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.INVENTORY_DETAILS,
      headers: INVENTORY_DETAIL_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): InventoryDetail {
    return rowToInventoryDetail(row as SheetRowData);
  }

  protected entityToRow(entity: InventoryDetail): unknown[] {
    return inventoryDetailToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // detailId
  }

  /**
   * セッションIDで詳細一覧を取得
   */
  findBySessionId(sessionId: string): InventoryDetail[] {
    return this.findWhere((detail) => detail.sessionId === sessionId);
  }

  /**
   * 製品IDで詳細を取得
   */
  findByProductId(productId: string): InventoryDetail[] {
    return this.findWhere((detail) => detail.productId === productId);
  }

  /**
   * セッションと製品IDで詳細を取得
   */
  findBySessionAndProductId(sessionId: string, productId: string): InventoryDetail | null {
    const found = this.findWhere(
      (detail) => detail.sessionId === sessionId && detail.productId === productId
    );
    return found.length > 0 ? found[0] : null;
  }

  /**
   * 確認状況でフィルタ
   */
  findBySessionIdAndStatus(
    sessionId: string,
    status: ConfirmationStatus
  ): InventoryDetail[] {
    return this.findWhere(
      (detail) => detail.sessionId === sessionId && detail.confirmationStatus === status
    );
  }

  /**
   * 未確認の詳細を取得
   */
  findUnconfirmedBySessionId(sessionId: string): InventoryDetail[] {
    return this.findBySessionIdAndStatus(sessionId, '未確認');
  }

  /**
   * 確認済みの詳細を取得
   */
  findConfirmedBySessionId(sessionId: string): InventoryDetail[] {
    return this.findBySessionIdAndStatus(sessionId, '確認済み');
  }

  /**
   * 差異ありの詳細を取得
   */
  findDiscrepancyBySessionId(sessionId: string): InventoryDetail[] {
    return this.findBySessionIdAndStatus(sessionId, '差異あり');
  }

  /**
   * 棚卸し詳細を一括作成
   */
  createDetails(sessionId: string, productIds: string[]): InventoryDetail[] {
    const details: InventoryDetail[] = productIds.map((productId, index) => ({
      detailId: `${sessionId}-${String(index + 1).padStart(4, '0')}`,
      sessionId,
      productId,
      confirmationStatus: '未確認' as ConfirmationStatus,
    }));

    return this.createMany(details);
  }

  /**
   * 製品を確認
   */
  confirmProduct(dto: ConfirmProductDto): InventoryDetail | null {
    const detail = this.findBySessionAndProductId(dto.sessionId, dto.productId);
    if (!detail) return null;

    return this.update(detail.detailId, {
      confirmationStatus: '確認済み',
      confirmationMethod: dto.confirmationMethod,
      confirmedBy: dto.confirmedBy,
      confirmedAt: new Date(),
    });
  }

  /**
   * 差異を調整
   */
  adjustDiscrepancy(dto: AdjustDiscrepancyDto): InventoryDetail | null {
    return this.update(dto.detailId, {
      confirmationStatus: '差異あり',
      discrepancyType: dto.discrepancyType,
      discrepancyReason: dto.discrepancyReason,
      actionTaken: dto.actionTaken,
    });
  }

  /**
   * セッションの確認済み件数を集計
   */
  countConfirmedBySessionId(sessionId: string): number {
    return this.findConfirmedBySessionId(sessionId).length;
  }

  /**
   * セッションの差異件数を集計
   */
  countDiscrepancyBySessionId(sessionId: string): number {
    return this.findDiscrepancyBySessionId(sessionId).length;
  }

  /**
   * セッションの全詳細を削除
   */
  deleteBySessionId(sessionId: string): number {
    const details = this.findBySessionId(sessionId);
    let deletedCount = 0;

    // 逆順で削除
    const sortedDetails = [...details].sort((a, b) =>
      b.detailId.localeCompare(a.detailId)
    );

    for (const detail of sortedDetails) {
      if (this.delete(detail.detailId)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
