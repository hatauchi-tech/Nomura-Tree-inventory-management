/**
 * InventoryService - 棚卸しビジネスロジック
 */

import {
  InventorySessionRepository,
  InventoryDetailRepository,
} from '../repositories/InventoryRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { StorageLocationRepository } from '../repositories/MasterRepository';
import {
  InventorySession,
  InventoryDetail,
  InventoryProgress,
  InventoryDetailWithProduct,
  StartInventorySessionDto,
  ConfirmProductDto,
  AdjustDiscrepancyDto,
} from '../types/inventory';
import { ConfirmationMethod } from '../types/common';

/**
 * 棚卸しサービスエラー
 */
export class InventoryServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'InventoryServiceError';
  }
}

/**
 * 棚卸しサービス
 */
export class InventoryService {
  private sessionRepo: InventorySessionRepository;
  private detailRepo: InventoryDetailRepository;
  private productRepo: ProductRepository;
  private locationRepo: StorageLocationRepository;

  constructor(spreadsheetId: string) {
    this.sessionRepo = new InventorySessionRepository(spreadsheetId);
    this.detailRepo = new InventoryDetailRepository(spreadsheetId);
    this.productRepo = new ProductRepository(spreadsheetId);
    this.locationRepo = new StorageLocationRepository(spreadsheetId);
  }

  /**
   * 棚卸しセッションを開始
   */
  startInventorySession(storageLocationId: string): InventorySession {
    // 保管場所の存在確認
    const location = this.locationRepo.findById(storageLocationId);
    if (!location) {
      throw new InventoryServiceError(
        '保管場所が見つかりません',
        'LOCATION_NOT_FOUND',
        { storageLocationId }
      );
    }

    // 既に進行中のセッションがないか確認
    const activeSessions = this.sessionRepo.findByStorageLocationId(storageLocationId);
    const hasActive = activeSessions.some((s) => s.status === '進行中');
    if (hasActive) {
      throw new InventoryServiceError(
        'この保管場所には既に進行中の棚卸しセッションがあります',
        'SESSION_ALREADY_ACTIVE',
        { storageLocationId }
      );
    }

    // 対象製品を取得（該当保管場所の販売中製品）
    const products = this.productRepo.findByStorageLocation(storageLocationId);
    const targetProducts = products.filter((p) => p.status === '販売中');

    if (targetProducts.length === 0) {
      throw new InventoryServiceError(
        'この保管場所には棚卸し対象の製品がありません',
        'NO_TARGET_PRODUCTS',
        { storageLocationId }
      );
    }

    // セッションを作成
    const session = this.sessionRepo.createSession(
      {
        storageLocationId,
        startedBy: 'system', // 後で実際のユーザー情報に変更
      },
      targetProducts.length
    );

    // 棚卸し詳細を作成
    const productIds = targetProducts.map((p) => p.productId);
    this.detailRepo.createDetails(session.sessionId, productIds);

    // 対象製品のステータスを「棚卸し中」に変更
    for (const product of targetProducts) {
      this.productRepo.updateStatus(product.productId, '棚卸し中');
    }

    return session;
  }

  /**
   * 棚卸し進捗を取得
   */
  getInventoryProgress(sessionId: string): InventoryProgress {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InventoryServiceError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    const location = this.locationRepo.findById(session.storageLocationId);
    const details = this.detailRepo.findBySessionId(sessionId);

    // 詳細を製品情報込みで取得
    const enrichDetails = (items: InventoryDetail[]): InventoryDetailWithProduct[] => {
      return items.map((detail) => {
        const product = this.productRepo.findById(detail.productId);
        return {
          ...detail,
          productName: product?.productName,
          woodType: product?.woodType,
          rawPhotoUrl: product?.rawPhotoUrls,
        };
      });
    };

    const unconfirmed = details.filter((d) => d.confirmationStatus === '未確認');
    const confirmed = details.filter((d) => d.confirmationStatus === '確認済み');
    const discrepancy = details.filter((d) => d.confirmationStatus === '差異あり');

    const progressPercent =
      session.targetCount > 0
        ? Math.round(((confirmed.length + discrepancy.length) / session.targetCount) * 100)
        : 0;

    return {
      sessionId,
      storageLocationName: location?.name || '不明',
      status: session.status,
      targetCount: session.targetCount,
      confirmedCount: confirmed.length,
      discrepancyCount: discrepancy.length,
      progressPercent,
      unconfirmedItems: enrichDetails(unconfirmed),
      confirmedItems: enrichDetails(confirmed),
      discrepancyItems: enrichDetails(discrepancy),
    };
  }

  /**
   * 製品を確認
   */
  confirmInventoryProduct(
    sessionId: string,
    productId: string,
    method: ConfirmationMethod
  ): InventoryDetail {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InventoryServiceError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    if (session.status !== '進行中') {
      throw new InventoryServiceError(
        '進行中のセッションではありません',
        'SESSION_NOT_ACTIVE',
        { sessionId, status: session.status }
      );
    }

    const detail = this.detailRepo.findBySessionAndProductId(sessionId, productId);
    if (!detail) {
      throw new InventoryServiceError(
        '対象の製品がこのセッションにありません',
        'PRODUCT_NOT_IN_SESSION',
        { sessionId, productId }
      );
    }

    if (detail.confirmationStatus !== '未確認') {
      throw new InventoryServiceError(
        '既に確認済みの製品です',
        'ALREADY_CONFIRMED',
        { sessionId, productId }
      );
    }

    const confirmed = this.detailRepo.confirmProduct({
      sessionId,
      productId,
      confirmationMethod: method,
      confirmedBy: 'system', // 後で実際のユーザー情報に変更
    });

    if (!confirmed) {
      throw new InventoryServiceError(
        '確認処理に失敗しました',
        'CONFIRM_FAILED',
        { sessionId, productId }
      );
    }

    // セッションのカウントを更新
    const confirmedCount = this.detailRepo.countConfirmedBySessionId(sessionId);
    this.sessionRepo.updateConfirmedCount(sessionId, confirmedCount);

    return confirmed;
  }

  /**
   * 差異を報告
   */
  reportDiscrepancy(dto: AdjustDiscrepancyDto): InventoryDetail {
    const detail = this.detailRepo.findById(dto.detailId);
    if (!detail) {
      throw new InventoryServiceError(
        '棚卸し詳細が見つかりません',
        'DETAIL_NOT_FOUND',
        { detailId: dto.detailId }
      );
    }

    const adjusted = this.detailRepo.adjustDiscrepancy(dto);
    if (!adjusted) {
      throw new InventoryServiceError(
        '差異調整に失敗しました',
        'ADJUST_FAILED',
        { detailId: dto.detailId }
      );
    }

    // セッションのカウントを更新
    const discrepancyCount = this.detailRepo.countDiscrepancyBySessionId(detail.sessionId);
    this.sessionRepo.updateDiscrepancyCount(detail.sessionId, discrepancyCount);

    // 紛失の場合は製品のステータスを更新
    if (dto.discrepancyType === '紛失') {
      this.productRepo.updateStatus(detail.productId, '紛失');
    }

    return adjusted;
  }

  /**
   * セッションを中断
   */
  pauseSession(sessionId: string): InventorySession {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InventoryServiceError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    if (session.status !== '進行中') {
      throw new InventoryServiceError(
        '進行中のセッションではありません',
        'SESSION_NOT_ACTIVE',
        { sessionId, status: session.status }
      );
    }

    const paused = this.sessionRepo.pauseSession(sessionId);
    if (!paused) {
      throw new InventoryServiceError(
        '中断処理に失敗しました',
        'PAUSE_FAILED',
        { sessionId }
      );
    }

    return paused;
  }

  /**
   * セッションを再開
   */
  resumeSession(sessionId: string): InventorySession {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InventoryServiceError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    if (session.status !== '中断中') {
      throw new InventoryServiceError(
        '中断中のセッションではありません',
        'SESSION_NOT_PAUSED',
        { sessionId, status: session.status }
      );
    }

    const resumed = this.sessionRepo.resumeSession(sessionId);
    if (!resumed) {
      throw new InventoryServiceError(
        '再開処理に失敗しました',
        'RESUME_FAILED',
        { sessionId }
      );
    }

    return resumed;
  }

  /**
   * セッションを完了
   */
  completeInventorySession(sessionId: string): InventorySession {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InventoryServiceError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    if (session.status === '完了') {
      throw new InventoryServiceError(
        '既に完了済みのセッションです',
        'SESSION_ALREADY_COMPLETED',
        { sessionId }
      );
    }

    // 未確認の製品がないか確認
    const unconfirmed = this.detailRepo.findUnconfirmedBySessionId(sessionId);
    if (unconfirmed.length > 0) {
      throw new InventoryServiceError(
        '未確認の製品があります',
        'HAS_UNCONFIRMED_PRODUCTS',
        { sessionId, unconfirmedCount: unconfirmed.length }
      );
    }

    // セッションを完了
    const completed = this.sessionRepo.completeSession(sessionId, 'system');
    if (!completed) {
      throw new InventoryServiceError(
        '完了処理に失敗しました',
        'COMPLETE_FAILED',
        { sessionId }
      );
    }

    // 確認済みの製品のステータスを「販売中」に戻す
    const confirmedDetails = this.detailRepo.findConfirmedBySessionId(sessionId);
    for (const detail of confirmedDetails) {
      this.productRepo.updateStatus(detail.productId, '販売中');
      // 最終棚卸し日を更新
      this.productRepo.update(detail.productId, {
        lastInventoryDate: new Date(),
      });
    }

    // 保管場所の最終棚卸し日を更新
    this.locationRepo.updateLastInventoryDate(session.storageLocationId, new Date());

    return completed;
  }

  /**
   * 進行中のセッション一覧を取得
   */
  getActiveSessions(): InventorySession[] {
    return this.sessionRepo.findActiveSessions();
  }

  /**
   * 保管場所の棚卸し履歴を取得
   */
  getSessionHistory(storageLocationId: string): InventorySession[] {
    return this.sessionRepo
      .findByStorageLocationId(storageLocationId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
}
