// 設定
function setupSpreadsheetId() {
}
function getConfig() {
}
// Webアプリ
function doGet() {
}
function include() {
}
// ユーティリティ
function getSpreadsheet() {
}
function getCurrentUserEmail() {
}
function getCurrentDateTime() {
}
function formatDate() {
}
// 製品API
function searchProducts() {
}
function getProductDetail() {
}
function createProduct() {
}
function updateProduct() {
}
function deleteProduct() {
}
function getDashboardStats() {
}
// 販売API
function sellProduct() {
}
function cancelSale() {
}
function getSalesStats() {
}
function getSoldProductsWithFilter() {
}
// 加工費API
function getProcessingCosts() {
}
function createProcessingCost() {
}
function deleteProcessingCost() {
}
// マスターAPI
function getWoodTypes() {
}
function getSuppliers() {
}
function getProcessors() {
}
function getStorageLocations() {
}
function addMasterData() {
}
function deleteMasterData() {
}
// 棚卸しAPI
function startInventorySession() {
}
function getInventoryProgress() {
}
function confirmInventoryProduct() {
}
function completeInventorySession() {
}
function getActiveSessions() {
}
// 認証API
function getOAuthToken() {
}
// 写真アップロードAPI
function setupPhotoFolderId() {
}
function uploadProductPhoto() {
}
// レポートAPI
function getInventoryReport() {
}
function generateCatalogPdf() {
}
function exportCsv() {
}
// データセットアップ
function setupAllSheets() {
}
function setupSheetsOnly() {
}
function clearAllData() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 123
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 棚卸し型定義
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INVENTORY_DETAIL_HEADERS = exports.INVENTORY_DETAIL_COLUMNS = exports.INVENTORY_SESSION_HEADERS = exports.INVENTORY_SESSION_COLUMNS = exports.DISCREPANCY_TYPES = exports.CONFIRMATION_STATUSES = exports.INVENTORY_SESSION_STATUSES = void 0;
exports.rowToInventorySession = rowToInventorySession;
exports.inventorySessionToRow = inventorySessionToRow;
exports.rowToInventoryDetail = rowToInventoryDetail;
exports.inventoryDetailToRow = inventoryDetailToRow;
/**
 * 棚卸しセッションステータス
 */
exports.INVENTORY_SESSION_STATUSES = ['進行中', '中断中', '完了'];
/**
 * 確認状況
 */
exports.CONFIRMATION_STATUSES = ['未確認', '確認済み', '差異あり'];
/**
 * 差異種別
 */
exports.DISCREPANCY_TYPES = [
    '紛失',
    '場所違い',
    '未登録発見',
    'その他',
];
// ==================== 棚卸しセッション ====================
exports.INVENTORY_SESSION_COLUMNS = {
    SESSION_ID: 0,
    STORAGE_LOCATION_ID: 1,
    STARTED_AT: 2,
    STARTED_BY: 3,
    COMPLETED_AT: 4,
    COMPLETED_BY: 5,
    STATUS: 6,
    TARGET_COUNT: 7,
    CONFIRMED_COUNT: 8,
    DISCREPANCY_COUNT: 9,
    REMARKS: 10,
};
exports.INVENTORY_SESSION_HEADERS = [
    'セッションID',
    '保管場所ID',
    '開始日時',
    '開始者',
    '完了日時',
    '完了者',
    'ステータス',
    '対象件数',
    '確認済件数',
    '差異件数',
    '備考',
];
function rowToInventorySession(row) {
    var _a, _b, _c, _d, _e;
    const parseDate = (value) => {
        if (!value)
            return undefined;
        if (value instanceof Date)
            return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    };
    const C = exports.INVENTORY_SESSION_COLUMNS;
    return {
        sessionId: String((_a = row[C.SESSION_ID]) !== null && _a !== void 0 ? _a : ''),
        storageLocationId: String((_b = row[C.STORAGE_LOCATION_ID]) !== null && _b !== void 0 ? _b : ''),
        startedAt: (_c = parseDate(row[C.STARTED_AT])) !== null && _c !== void 0 ? _c : new Date(),
        startedBy: String((_d = row[C.STARTED_BY]) !== null && _d !== void 0 ? _d : ''),
        completedAt: parseDate(row[C.COMPLETED_AT]),
        completedBy: row[C.COMPLETED_BY] ? String(row[C.COMPLETED_BY]) : undefined,
        status: (_e = row[C.STATUS]) !== null && _e !== void 0 ? _e : '進行中',
        targetCount: Number(row[C.TARGET_COUNT]) || 0,
        confirmedCount: Number(row[C.CONFIRMED_COUNT]) || 0,
        discrepancyCount: Number(row[C.DISCREPANCY_COUNT]) || 0,
        remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
    };
}
function inventorySessionToRow(session) {
    var _a, _b, _c;
    const C = exports.INVENTORY_SESSION_COLUMNS;
    const row = new Array(11).fill('');
    row[C.SESSION_ID] = session.sessionId;
    row[C.STORAGE_LOCATION_ID] = session.storageLocationId;
    row[C.STARTED_AT] = session.startedAt;
    row[C.STARTED_BY] = session.startedBy;
    row[C.COMPLETED_AT] = (_a = session.completedAt) !== null && _a !== void 0 ? _a : '';
    row[C.COMPLETED_BY] = (_b = session.completedBy) !== null && _b !== void 0 ? _b : '';
    row[C.STATUS] = session.status;
    row[C.TARGET_COUNT] = session.targetCount;
    row[C.CONFIRMED_COUNT] = session.confirmedCount;
    row[C.DISCREPANCY_COUNT] = session.discrepancyCount;
    row[C.REMARKS] = (_c = session.remarks) !== null && _c !== void 0 ? _c : '';
    return row;
}
// ==================== 棚卸し詳細 ====================
exports.INVENTORY_DETAIL_COLUMNS = {
    DETAIL_ID: 0,
    SESSION_ID: 1,
    PRODUCT_ID: 2,
    CONFIRMATION_STATUS: 3,
    CONFIRMATION_METHOD: 4,
    CONFIRMED_BY: 5,
    CONFIRMED_AT: 6,
    DISCREPANCY_TYPE: 7,
    DISCREPANCY_REASON: 8,
    ACTION_TAKEN: 9,
};
exports.INVENTORY_DETAIL_HEADERS = [
    '詳細ID',
    'セッションID',
    '製品ID',
    '確認状況',
    '確認方法',
    '確認者',
    '確認日時',
    '差異種別',
    '差異理由',
    '対応内容',
];
function rowToInventoryDetail(row) {
    var _a, _b, _c, _d;
    const parseDate = (value) => {
        if (!value)
            return undefined;
        if (value instanceof Date)
            return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    };
    const C = exports.INVENTORY_DETAIL_COLUMNS;
    return {
        detailId: String((_a = row[C.DETAIL_ID]) !== null && _a !== void 0 ? _a : ''),
        sessionId: String((_b = row[C.SESSION_ID]) !== null && _b !== void 0 ? _b : ''),
        productId: String((_c = row[C.PRODUCT_ID]) !== null && _c !== void 0 ? _c : ''),
        confirmationStatus: (_d = row[C.CONFIRMATION_STATUS]) !== null && _d !== void 0 ? _d : '未確認',
        confirmationMethod: row[C.CONFIRMATION_METHOD]
            ? row[C.CONFIRMATION_METHOD]
            : undefined,
        confirmedBy: row[C.CONFIRMED_BY] ? String(row[C.CONFIRMED_BY]) : undefined,
        confirmedAt: parseDate(row[C.CONFIRMED_AT]),
        discrepancyType: row[C.DISCREPANCY_TYPE]
            ? row[C.DISCREPANCY_TYPE]
            : undefined,
        discrepancyReason: row[C.DISCREPANCY_REASON]
            ? String(row[C.DISCREPANCY_REASON])
            : undefined,
        actionTaken: row[C.ACTION_TAKEN] ? String(row[C.ACTION_TAKEN]) : undefined,
    };
}
function inventoryDetailToRow(detail) {
    var _a, _b, _c, _d, _e, _f;
    const C = exports.INVENTORY_DETAIL_COLUMNS;
    const row = new Array(10).fill('');
    row[C.DETAIL_ID] = detail.detailId;
    row[C.SESSION_ID] = detail.sessionId;
    row[C.PRODUCT_ID] = detail.productId;
    row[C.CONFIRMATION_STATUS] = detail.confirmationStatus;
    row[C.CONFIRMATION_METHOD] = (_a = detail.confirmationMethod) !== null && _a !== void 0 ? _a : '';
    row[C.CONFIRMED_BY] = (_b = detail.confirmedBy) !== null && _b !== void 0 ? _b : '';
    row[C.CONFIRMED_AT] = (_c = detail.confirmedAt) !== null && _c !== void 0 ? _c : '';
    row[C.DISCREPANCY_TYPE] = (_d = detail.discrepancyType) !== null && _d !== void 0 ? _d : '';
    row[C.DISCREPANCY_REASON] = (_e = detail.discrepancyReason) !== null && _e !== void 0 ? _e : '';
    row[C.ACTION_TAKEN] = (_f = detail.actionTaken) !== null && _f !== void 0 ? _f : '';
    return row;
}


/***/ },

/***/ 153
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * BaseRepository - データアクセス層の基底クラス
 * スプレッドシートに対するCRUD操作を提供
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseRepository = void 0;
/**
 * BaseRepository - 抽象基底クラス
 */
class BaseRepository {
    constructor(config) {
        this.config = config;
    }
    /**
     * スプレッドシートを取得
     */
    getSpreadsheet() {
        return SpreadsheetApp.openById(this.config.spreadsheetId);
    }
    /**
     * シートを取得
     */
    getSheet() {
        const ss = this.getSpreadsheet();
        let sheet = ss.getSheetByName(this.config.sheetName);
        if (!sheet) {
            // シートが存在しない場合は作成
            sheet = ss.insertSheet(this.config.sheetName);
            // ヘッダーを設定
            sheet.appendRow(this.config.headers);
        }
        return sheet;
    }
    /**
     * 全データを取得（ヘッダー除く）
     */
    getAllData() {
        const sheet = this.getSheet();
        const lastRow = sheet.getLastRow();
        if (lastRow <= 1) {
            return [];
        }
        const lastCol = this.config.headers.length;
        return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    }
    /**
     * 全件取得
     */
    findAll() {
        const data = this.getAllData();
        return data.map((row) => this.rowToEntity(row));
    }
    /**
     * IDで検索
     */
    findById(id) {
        const data = this.getAllData();
        const idIndex = this.getIdColumnIndex();
        const row = data.find((r) => String(r[idIndex]) === id);
        return row ? this.rowToEntity(row) : null;
    }
    /**
     * 複数IDで検索
     */
    findByIds(ids) {
        const data = this.getAllData();
        const idIndex = this.getIdColumnIndex();
        const idSet = new Set(ids);
        return data
            .filter((r) => idSet.has(String(r[idIndex])))
            .map((row) => this.rowToEntity(row));
    }
    /**
     * 新規作成
     */
    create(entity) {
        const sheet = this.getSheet();
        const row = this.entityToRow(entity);
        sheet.appendRow(row);
        return entity;
    }
    /**
     * 一括作成
     */
    createMany(entities) {
        const sheet = this.getSheet();
        const rows = entities.map((e) => this.entityToRow(e));
        if (rows.length > 0) {
            const lastRow = sheet.getLastRow();
            const range = sheet.getRange(lastRow + 1, 1, rows.length, this.config.headers.length);
            range.setValues(rows);
        }
        return entities;
    }
    /**
     * 更新
     */
    update(id, updates) {
        const sheet = this.getSheet();
        const data = this.getAllData();
        const idIndex = this.getIdColumnIndex();
        const rowIndex = data.findIndex((r) => String(r[idIndex]) === id);
        if (rowIndex === -1) {
            return null;
        }
        // 現在のエンティティを取得
        const currentEntity = this.rowToEntity(data[rowIndex]);
        // 更新を適用
        const updatedEntity = { ...currentEntity, ...updates };
        // 行データに変換
        const newRow = this.entityToRow(updatedEntity);
        // シートを更新（行インデックス + 2 = ヘッダー行 + 1ベースインデックス）
        const range = sheet.getRange(rowIndex + 2, 1, 1, this.config.headers.length);
        range.setValues([newRow]);
        return updatedEntity;
    }
    /**
     * 削除
     */
    delete(id) {
        const sheet = this.getSheet();
        const data = this.getAllData();
        const idIndex = this.getIdColumnIndex();
        const rowIndex = data.findIndex((r) => String(r[idIndex]) === id);
        if (rowIndex === -1) {
            return false;
        }
        // 行を削除（行インデックス + 2 = ヘッダー行 + 1ベースインデックス）
        sheet.deleteRow(rowIndex + 2);
        return true;
    }
    /**
     * 件数取得
     */
    count() {
        const data = this.getAllData();
        return data.length;
    }
    /**
     * 存在確認
     */
    exists(id) {
        return this.findById(id) !== null;
    }
    /**
     * ページネーション付き取得
     */
    findWithPagination(options) {
        const { page, limit } = options;
        const allData = this.findAll();
        const total = allData.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const data = allData.slice(startIndex, endIndex);
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
     * 条件に一致する行インデックスを取得
     */
    findRowIndex(predicate) {
        const data = this.getAllData();
        return data.findIndex((row) => predicate(this.rowToEntity(row)));
    }
    /**
     * 条件に一致する全エンティティを取得
     */
    findWhere(predicate) {
        return this.findAll().filter(predicate);
    }
}
exports.BaseRepository = BaseRepository;


/***/ },

/***/ 211
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 型定義エントリーポイント
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(798), exports);
__exportStar(__webpack_require__(780), exports);
__exportStar(__webpack_require__(721), exports);
__exportStar(__webpack_require__(877), exports);
__exportStar(__webpack_require__(123), exports);


/***/ },

/***/ 230
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * ProcessingCostRepository - 加工費データアクセス層
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcessingCostRepository = void 0;
const BaseRepository_1 = __webpack_require__(153);
const processingCost_1 = __webpack_require__(721);
const common_1 = __webpack_require__(798);
const idGenerator_1 = __webpack_require__(781);
/**
 * 加工費リポジトリ
 */
class ProcessingCostRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.PROCESSING_COSTS,
            headers: processingCost_1.PROCESSING_COST_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, processingCost_1.rowToProcessingCost)(row);
    }
    entityToRow(entity) {
        return (0, processingCost_1.processingCostToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // processingCostId
    }
    /**
     * 製品IDで加工費一覧を取得
     */
    findByProductId(productId) {
        return this.findWhere((cost) => cost.productId === productId);
    }
    /**
     * 製品IDの加工費合計を取得
     */
    getTotalByProductId(productId) {
        const costs = this.findByProductId(productId);
        return costs.reduce((sum, cost) => sum + cost.amount, 0);
    }
    /**
     * 製品の加工費サマリーを取得
     */
    getProductSummary(productId) {
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
    createFromDto(dto) {
        // 既存の加工費IDを取得して新しいIDを生成
        const existingIds = this.findAll().map((c) => c.processingCostId);
        const nextNum = (0, idGenerator_1.getNextSequenceNumber)(existingIds, 'COST');
        const processingCostId = (0, idGenerator_1.generateProcessingCostId)(nextNum);
        const cost = {
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
    deleteByProductId(productId) {
        const costs = this.findByProductId(productId);
        let deletedCount = 0;
        // 逆順で削除（行番号がずれないように）
        const sortedCosts = [...costs].sort((a, b) => b.processingCostId.localeCompare(a.processingCostId));
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
    findByProcessorId(processorId) {
        return this.findWhere((cost) => cost.processorId === processorId);
    }
    /**
     * 加工種別で加工費一覧を取得
     */
    findByProcessingType(processingType) {
        return this.findWhere((cost) => cost.processingType === processingType);
    }
    /**
     * 複数製品の加工費サマリーを一括取得
     */
    getProductSummaries(productIds) {
        const allCosts = this.findAll();
        const productIdSet = new Set(productIds);
        const summaryMap = new Map();
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
                const summary = summaryMap.get(cost.productId);
                summary.items.push(cost);
                summary.totalAmount += cost.amount;
                summary.itemCount++;
            }
        }
        return summaryMap;
    }
}
exports.ProcessingCostRepository = ProcessingCostRepository;


/***/ },

/***/ 255
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * InventoryService - 棚卸しビジネスロジック
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryService = exports.InventoryServiceError = void 0;
const InventoryRepository_1 = __webpack_require__(542);
const ProductRepository_1 = __webpack_require__(453);
const MasterRepository_1 = __webpack_require__(570);
/**
 * 棚卸しサービスエラー
 */
class InventoryServiceError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'InventoryServiceError';
    }
}
exports.InventoryServiceError = InventoryServiceError;
/**
 * 棚卸しサービス
 */
class InventoryService {
    constructor(spreadsheetId) {
        this.sessionRepo = new InventoryRepository_1.InventorySessionRepository(spreadsheetId);
        this.detailRepo = new InventoryRepository_1.InventoryDetailRepository(spreadsheetId);
        this.productRepo = new ProductRepository_1.ProductRepository(spreadsheetId);
        this.locationRepo = new MasterRepository_1.StorageLocationRepository(spreadsheetId);
    }
    /**
     * 棚卸しセッションを開始
     */
    startInventorySession(storageLocationId) {
        // 保管場所の存在確認
        const location = this.locationRepo.findById(storageLocationId);
        if (!location) {
            throw new InventoryServiceError('保管場所が見つかりません', 'LOCATION_NOT_FOUND', { storageLocationId });
        }
        // 既に進行中のセッションがないか確認
        const activeSessions = this.sessionRepo.findByStorageLocationId(storageLocationId);
        const hasActive = activeSessions.some((s) => s.status === '進行中');
        if (hasActive) {
            throw new InventoryServiceError('この保管場所には既に進行中の棚卸しセッションがあります', 'SESSION_ALREADY_ACTIVE', { storageLocationId });
        }
        // 対象製品を取得（該当保管場所の販売中製品）
        const products = this.productRepo.findByStorageLocation(storageLocationId);
        const targetProducts = products.filter((p) => p.status === '販売中');
        if (targetProducts.length === 0) {
            throw new InventoryServiceError('この保管場所には棚卸し対象の製品がありません', 'NO_TARGET_PRODUCTS', { storageLocationId });
        }
        // セッションを作成
        const session = this.sessionRepo.createSession({
            storageLocationId,
            startedBy: 'system', // 後で実際のユーザー情報に変更
        }, targetProducts.length);
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
    getInventoryProgress(sessionId) {
        const session = this.sessionRepo.findById(sessionId);
        if (!session) {
            throw new InventoryServiceError('セッションが見つかりません', 'SESSION_NOT_FOUND', { sessionId });
        }
        const location = this.locationRepo.findById(session.storageLocationId);
        const details = this.detailRepo.findBySessionId(sessionId);
        // 詳細を製品情報込みで取得
        const enrichDetails = (items) => {
            return items.map((detail) => {
                const product = this.productRepo.findById(detail.productId);
                return {
                    ...detail,
                    productName: product === null || product === void 0 ? void 0 : product.productName,
                    woodType: product === null || product === void 0 ? void 0 : product.woodType,
                    rawPhotoUrl: product === null || product === void 0 ? void 0 : product.rawPhotoUrls,
                };
            });
        };
        const unconfirmed = details.filter((d) => d.confirmationStatus === '未確認');
        const confirmed = details.filter((d) => d.confirmationStatus === '確認済み');
        const discrepancy = details.filter((d) => d.confirmationStatus === '差異あり');
        const progressPercent = session.targetCount > 0
            ? Math.round(((confirmed.length + discrepancy.length) / session.targetCount) * 100)
            : 0;
        return {
            sessionId,
            storageLocationName: (location === null || location === void 0 ? void 0 : location.name) || '不明',
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
    confirmInventoryProduct(sessionId, productId, method) {
        const session = this.sessionRepo.findById(sessionId);
        if (!session) {
            throw new InventoryServiceError('セッションが見つかりません', 'SESSION_NOT_FOUND', { sessionId });
        }
        if (session.status !== '進行中') {
            throw new InventoryServiceError('進行中のセッションではありません', 'SESSION_NOT_ACTIVE', { sessionId, status: session.status });
        }
        const detail = this.detailRepo.findBySessionAndProductId(sessionId, productId);
        if (!detail) {
            throw new InventoryServiceError('対象の製品がこのセッションにありません', 'PRODUCT_NOT_IN_SESSION', { sessionId, productId });
        }
        if (detail.confirmationStatus !== '未確認') {
            throw new InventoryServiceError('既に確認済みの製品です', 'ALREADY_CONFIRMED', { sessionId, productId });
        }
        const confirmed = this.detailRepo.confirmProduct({
            sessionId,
            productId,
            confirmationMethod: method,
            confirmedBy: 'system', // 後で実際のユーザー情報に変更
        });
        if (!confirmed) {
            throw new InventoryServiceError('確認処理に失敗しました', 'CONFIRM_FAILED', { sessionId, productId });
        }
        // セッションのカウントを更新
        const confirmedCount = this.detailRepo.countConfirmedBySessionId(sessionId);
        this.sessionRepo.updateConfirmedCount(sessionId, confirmedCount);
        return confirmed;
    }
    /**
     * 差異を報告
     */
    reportDiscrepancy(dto) {
        const detail = this.detailRepo.findById(dto.detailId);
        if (!detail) {
            throw new InventoryServiceError('棚卸し詳細が見つかりません', 'DETAIL_NOT_FOUND', { detailId: dto.detailId });
        }
        const adjusted = this.detailRepo.adjustDiscrepancy(dto);
        if (!adjusted) {
            throw new InventoryServiceError('差異調整に失敗しました', 'ADJUST_FAILED', { detailId: dto.detailId });
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
    pauseSession(sessionId) {
        const session = this.sessionRepo.findById(sessionId);
        if (!session) {
            throw new InventoryServiceError('セッションが見つかりません', 'SESSION_NOT_FOUND', { sessionId });
        }
        if (session.status !== '進行中') {
            throw new InventoryServiceError('進行中のセッションではありません', 'SESSION_NOT_ACTIVE', { sessionId, status: session.status });
        }
        const paused = this.sessionRepo.pauseSession(sessionId);
        if (!paused) {
            throw new InventoryServiceError('中断処理に失敗しました', 'PAUSE_FAILED', { sessionId });
        }
        return paused;
    }
    /**
     * セッションを再開
     */
    resumeSession(sessionId) {
        const session = this.sessionRepo.findById(sessionId);
        if (!session) {
            throw new InventoryServiceError('セッションが見つかりません', 'SESSION_NOT_FOUND', { sessionId });
        }
        if (session.status !== '中断中') {
            throw new InventoryServiceError('中断中のセッションではありません', 'SESSION_NOT_PAUSED', { sessionId, status: session.status });
        }
        const resumed = this.sessionRepo.resumeSession(sessionId);
        if (!resumed) {
            throw new InventoryServiceError('再開処理に失敗しました', 'RESUME_FAILED', { sessionId });
        }
        return resumed;
    }
    /**
     * セッションを完了
     */
    completeInventorySession(sessionId) {
        const session = this.sessionRepo.findById(sessionId);
        if (!session) {
            throw new InventoryServiceError('セッションが見つかりません', 'SESSION_NOT_FOUND', { sessionId });
        }
        if (session.status === '完了') {
            throw new InventoryServiceError('既に完了済みのセッションです', 'SESSION_ALREADY_COMPLETED', { sessionId });
        }
        // 未確認の製品がないか確認
        const unconfirmed = this.detailRepo.findUnconfirmedBySessionId(sessionId);
        if (unconfirmed.length > 0) {
            throw new InventoryServiceError('未確認の製品があります', 'HAS_UNCONFIRMED_PRODUCTS', { sessionId, unconfirmedCount: unconfirmed.length });
        }
        // セッションを完了
        const completed = this.sessionRepo.completeSession(sessionId, 'system');
        if (!completed) {
            throw new InventoryServiceError('完了処理に失敗しました', 'COMPLETE_FAILED', { sessionId });
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
    getActiveSessions() {
        return this.sessionRepo.findActiveSessions();
    }
    /**
     * 保管場所の棚卸し履歴を取得
     */
    getSessionHistory(storageLocationId) {
        return this.sessionRepo
            .findByStorageLocationId(storageLocationId)
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    }
}
exports.InventoryService = InventoryService;


/***/ },

/***/ 266
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 日付ユーティリティ
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatDateJP = formatDateJP;
exports.formatDateTimeJP = formatDateTimeJP;
exports.formatDateISO = formatDateISO;
exports.parseDate = parseDate;
exports.getStockDays = getStockDays;
exports.isBusinessDay = isBusinessDay;
exports.addDays = addDays;
exports.isSameDay = isSameDay;
exports.isBeforeDate = isBeforeDate;
exports.isAfterDate = isAfterDate;
exports.getStartOfDay = getStartOfDay;
exports.getEndOfDay = getEndOfDay;
exports.getDaysDifference = getDaysDifference;
exports.isWithinDays = isWithinDays;
exports.getYearMonth = getYearMonth;
exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.getLastDayOfMonth = getLastDayOfMonth;
exports.getToday = getToday;
exports.getDaysAgo = getDaysAgo;
/**
 * 日付を yyyy/MM/dd 形式でフォーマット
 */
function formatDateJP(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}
/**
 * 日時を yyyy/MM/dd HH:mm 形式でフォーマット
 */
function formatDateTimeJP(date) {
    const dateStr = formatDateJP(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
}
/**
 * 日付を YYYY-MM-DD 形式でフォーマット（ISO形式）
 */
function formatDateISO(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * 文字列またはDateオブジェクトをDateに変換
 */
function parseDate(value) {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value !== 'string') {
        return null;
    }
    // yyyy/MM/dd または yyyy-MM-dd 形式をサポート
    const normalized = value.replace(/\//g, '-');
    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
}
/**
 * 在庫日数を計算（仕入れ日から現在までの日数）
 */
function getStockDays(purchaseDate, referenceDate) {
    const ref = referenceDate ? new Date(referenceDate) : new Date();
    ref.setHours(0, 0, 0, 0);
    const purchase = new Date(purchaseDate);
    purchase.setHours(0, 0, 0, 0);
    const diffTime = ref.getTime() - purchase.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * 営業日かどうかを判定（土日は非営業日）
 */
function isBusinessDay(date) {
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 6 = Saturday
    return dayOfWeek !== 0 && dayOfWeek !== 6;
}
/**
 * 日付に日数を加算
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * 2つの日付が同じ日かどうかを判定
 */
function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
/**
 * date1がdate2より前かどうかを判定（日単位）
 */
function isBeforeDate(date1, date2) {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() < d2.getTime();
}
/**
 * date1がdate2より後かどうかを判定（日単位）
 */
function isAfterDate(date1, date2) {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() > d2.getTime();
}
/**
 * 日の開始時刻（00:00:00.000）を取得
 */
function getStartOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
/**
 * 日の終了時刻（23:59:59.999）を取得
 */
function getEndOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
/**
 * 2つの日付の差分を日数で取得
 */
function getDaysDifference(date1, date2) {
    const d1 = getStartOfDay(date1);
    const d2 = getStartOfDay(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * 指定日が今日から指定日数以内かどうかを判定
 */
function isWithinDays(date, days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
}
/**
 * 年月を取得 (YYYY-MM形式)
 */
function getYearMonth(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}
/**
 * 月の最初の日を取得
 */
function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
/**
 * 月の最後の日を取得
 */
function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
/**
 * 今日の日付を取得（時刻なし）
 */
function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
/**
 * 指定日数前の日付を取得
 */
function getDaysAgo(days) {
    return addDays(getToday(), -days);
}


/***/ },

/***/ 338
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * ProductService - 製品ビジネスロジック
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductService = exports.ProductServiceError = void 0;
const ProductRepository_1 = __webpack_require__(453);
const ProcessingCostRepository_1 = __webpack_require__(230);
const PriceCalculator_1 = __webpack_require__(983);
/**
 * 製品サービスエラー
 */
class ProductServiceError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ProductServiceError';
    }
}
exports.ProductServiceError = ProductServiceError;
/**
 * 製品サービス
 */
class ProductService {
    constructor(spreadsheetId) {
        this.productRepo = new ProductRepository_1.ProductRepository(spreadsheetId);
        this.processingCostRepo = new ProcessingCostRepository_1.ProcessingCostRepository(spreadsheetId);
    }
    /**
     * 製品検索
     */
    searchProducts(conditions, pagination) {
        const result = this.productRepo.searchWithPagination(conditions, pagination);
        // ProductListItem形式に変換
        const items = result.data.map((product) => {
            // 価格計算
            const prices = this.calculateProductPricesInternal(product);
            // 在庫日数計算
            const stockDays = product.purchaseDate
                ? Math.ceil((new Date().getTime() - new Date(product.purchaseDate).getTime()) /
                    (1000 * 60 * 60 * 24))
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
    calculateProductPricesInternal(product) {
        const processingCosts = this.processingCostRepo.findByProductId(product.productId);
        return (0, PriceCalculator_1.calculateAllPrices)({
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
    getProductDetail(productId) {
        return this.productRepo.findById(productId);
    }
    /**
     * 製品登録
     */
    createProduct(dto) {
        // 必須項目チェック
        if (!dto.productName || dto.productName.trim().length === 0) {
            throw new ProductServiceError('商品名は必須です', 'VALIDATION_ERROR', { field: 'productName' });
        }
        // 製品作成
        const product = this.productRepo.createFromDto(dto);
        return this.productRepo.findById(product.productId);
    }
    /**
     * 製品更新
     */
    updateProduct(productId, dto) {
        // 存在確認
        const existing = this.productRepo.findById(productId);
        if (!existing) {
            throw new ProductServiceError('製品が見つかりません', 'NOT_FOUND', { productId });
        }
        // 更新実行
        const updated = this.productRepo.update(productId, {
            ...dto,
            updatedAt: new Date(),
        });
        if (!updated) {
            throw new ProductServiceError('更新に失敗しました', 'UPDATE_FAILED', { productId });
        }
        return this.productRepo.findById(productId);
    }
    /**
     * 製品削除（論理削除）
     */
    deleteProduct(productId, reason) {
        const existing = this.productRepo.findById(productId);
        if (!existing) {
            throw new ProductServiceError('製品が見つかりません', 'NOT_FOUND', { productId });
        }
        if (existing.status === '削除済み') {
            throw new ProductServiceError('既に削除済みです', 'ALREADY_DELETED', { productId });
        }
        const deleted = this.productRepo.softDelete(productId, reason);
        if (!deleted) {
            throw new ProductServiceError('削除に失敗しました', 'DELETE_FAILED', { productId });
        }
        return deleted;
    }
    /**
     * 製品の価格を計算
     */
    calculateProductPrices(productId) {
        const product = this.productRepo.findById(productId);
        if (!product) {
            throw new ProductServiceError('製品が見つかりません', 'NOT_FOUND', { productId });
        }
        // 加工費を取得
        const processingCosts = this.processingCostRepo.findByProductId(productId);
        return (0, PriceCalculator_1.calculateAllPrices)({
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
    calculateStockDays(product) {
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
    getProductsByStatus(status) {
        return this.productRepo.findByStatus(status);
    }
    /**
     * 保管場所で製品を取得
     */
    getProductsByStorageLocation(storageLocation) {
        return this.productRepo.findByStorageLocation(storageLocation);
    }
    /**
     * ダッシュボード用統計を取得
     */
    getDashboardStats() {
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
exports.ProductService = ProductService;


/***/ },

/***/ 453
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * ProductRepository - 製品データアクセス層
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductRepository = void 0;
const BaseRepository_1 = __webpack_require__(153);
const product_1 = __webpack_require__(780);
const common_1 = __webpack_require__(798);
const dateUtils_1 = __webpack_require__(266);
const idGenerator_1 = __webpack_require__(781);
/**
 * ProductRepository - 製品リポジトリ
 */
class ProductRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.PRODUCTS,
            headers: product_1.PRODUCT_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, product_1.rowToProduct)(row);
    }
    entityToRow(entity) {
        return (0, product_1.productToRow)(entity);
    }
    getIdColumnIndex() {
        return product_1.PRODUCT_COLUMNS.PRODUCT_ID;
    }
    /**
     * ステータスで製品を検索
     */
    findByStatus(status) {
        return this.findWhere((product) => product.status === status);
    }
    /**
     * 複数ステータスで製品を検索
     */
    findByStatuses(statuses) {
        const statusSet = new Set(statuses);
        return this.findWhere((product) => statusSet.has(product.status));
    }
    /**
     * 保管場所で製品を検索
     */
    findByStorageLocation(storageLocationId) {
        return this.findWhere((product) => product.storageLocationId === storageLocationId);
    }
    /**
     * 仕入れ先で製品を検索
     */
    findBySupplier(supplierId) {
        return this.findWhere((product) => product.supplierId === supplierId);
    }
    /**
     * 樹種で製品を検索
     */
    findByWoodType(woodType) {
        return this.findWhere((product) => product.woodType === woodType);
    }
    /**
     * 販売中の製品を取得
     */
    findAvailable() {
        return this.findByStatus('販売中');
    }
    /**
     * 販売済みの製品を取得
     */
    findSold() {
        return this.findByStatus('販売済み');
    }
    /**
     * 削除済み以外の製品を取得
     */
    findActive() {
        return this.findWhere((product) => product.status !== '削除済み');
    }
    /**
     * 長期在庫製品を取得（指定日数以上）
     */
    findLongStockProducts(days) {
        return this.findWhere((product) => {
            if (product.status !== '販売中')
                return false;
            const stockDays = (0, dateUtils_1.getStockDays)(product.purchaseDate);
            return stockDays >= days;
        });
    }
    /**
     * 複合条件検索
     */
    search(conditions) {
        let results = this.findAll();
        // ステータスフィルター（デフォルトで削除済みを除外）
        if (conditions.statuses && conditions.statuses.length > 0) {
            const statusSet = new Set(conditions.statuses);
            results = results.filter((p) => statusSet.has(p.status));
        }
        else {
            results = results.filter((p) => p.status !== '削除済み');
        }
        // 製品IDフィルター
        if (conditions.productId) {
            const searchId = conditions.productId.toLowerCase();
            results = results.filter((p) => p.productId.toLowerCase().includes(searchId));
        }
        // キーワード検索（商品名）
        if (conditions.keyword) {
            const keyword = conditions.keyword.toLowerCase();
            results = results.filter((p) => p.productName.toLowerCase().includes(keyword));
        }
        // 大分類フィルター
        if (conditions.majorCategories && conditions.majorCategories.length > 0) {
            const categorySet = new Set(conditions.majorCategories);
            results = results.filter((p) => categorySet.has(p.majorCategory));
        }
        // 中分類フィルター
        if (conditions.minorCategories && conditions.minorCategories.length > 0) {
            const categorySet = new Set(conditions.minorCategories);
            results = results.filter((p) => p.minorCategory && categorySet.has(p.minorCategory));
        }
        // 樹種フィルター
        if (conditions.woodTypes && conditions.woodTypes.length > 0) {
            const woodTypeSet = new Set(conditions.woodTypes);
            results = results.filter((p) => woodTypeSet.has(p.woodType));
        }
        // 保管場所フィルター
        if (conditions.storageLocationIds &&
            conditions.storageLocationIds.length > 0) {
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
                const length = size === null || size === void 0 ? void 0 : size.length;
                if (length === undefined)
                    return false;
                if (min !== undefined && length < min)
                    return false;
                if (max !== undefined && length > max)
                    return false;
                return true;
            });
        }
        // サイズ範囲（幅）
        if (conditions.widthRange) {
            const { min, max } = conditions.widthRange;
            const useFinished = conditions.useFinishedSize;
            results = results.filter((p) => {
                const size = useFinished ? p.finishedSize : p.rawSize;
                const width = size === null || size === void 0 ? void 0 : size.width;
                if (width === undefined)
                    return false;
                if (min !== undefined && width < min)
                    return false;
                if (max !== undefined && width > max)
                    return false;
                return true;
            });
        }
        // 在庫日数範囲
        if (conditions.stockDaysRange) {
            const { min, max } = conditions.stockDaysRange;
            results = results.filter((p) => {
                const days = (0, dateUtils_1.getStockDays)(p.purchaseDate);
                if (min !== undefined && days < min)
                    return false;
                if (max !== undefined && days > max)
                    return false;
                return true;
            });
        }
        // ソート
        if (conditions.sortBy) {
            const order = conditions.sortOrder === 'asc' ? 1 : -1;
            results.sort((a, b) => {
                let aVal;
                let bVal;
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
                        aVal = (0, dateUtils_1.getStockDays)(a.purchaseDate);
                        bVal = (0, dateUtils_1.getStockDays)(b.purchaseDate);
                        break;
                    default:
                        return 0;
                }
                if (aVal < bVal)
                    return -1 * order;
                if (aVal > bVal)
                    return 1 * order;
                return 0;
            });
        }
        return results;
    }
    /**
     * 複合条件検索（ページネーション付き）
     */
    searchWithPagination(conditions, pagination) {
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
    updateStatus(productId, status) {
        return this.update(productId, {
            status,
            updatedAt: new Date(),
        });
    }
    /**
     * 製品を論理削除
     */
    softDelete(productId, reason, deletedBy) {
        return this.update(productId, {
            status: '削除済み',
            deletedAt: new Date(),
            deleteReason: reason,
            updatedAt: new Date(),
            updatedBy: deletedBy,
        });
    }
    /**
     * 製品を復元
     */
    restore(productId, restoredBy) {
        return this.update(productId, {
            status: '販売中',
            deletedAt: undefined,
            deleteReason: undefined,
            updatedAt: new Date(),
            updatedBy: restoredBy,
        });
    }
    /**
     * 販売処理
     */
    markAsSold(productId, salesDestination, salesDate, actualSalesPrice, salesRemarks, soldBy) {
        return this.update(productId, {
            status: '販売済み',
            salesDestination,
            salesDate,
            actualSalesPrice,
            salesRemarks,
            updatedAt: new Date(),
            updatedBy: soldBy,
        });
    }
    /**
     * 販売キャンセル
     */
    cancelSale(productId, cancelledBy) {
        return this.update(productId, {
            status: '販売中',
            salesDestination: undefined,
            salesDate: undefined,
            actualSalesPrice: undefined,
            salesRemarks: undefined,
            updatedAt: new Date(),
            updatedBy: cancelledBy,
        });
    }
    /**
     * 最終棚卸し日を更新
     */
    updateLastInventoryDate(productId, inventoryDate) {
        return this.update(productId, {
            lastInventoryDate: inventoryDate,
            updatedAt: new Date(),
        });
    }
    /**
     * 保管場所を変更
     */
    changeStorageLocation(productId, newLocationId, changedBy) {
        return this.update(productId, {
            storageLocationId: newLocationId,
            updatedAt: new Date(),
            updatedBy: changedBy,
        });
    }
    /**
     * DTOから製品を作成
     */
    createFromDto(dto, createdBy) {
        var _a;
        const existingIds = this.findAll().map((p) => p.productId);
        const nextNum = (0, idGenerator_1.getNextSequenceNumber)(existingIds, 'ITA');
        const productId = (0, idGenerator_1.generateProductId)(nextNum);
        const product = {
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
            profitMargin: (_a = dto.profitMargin) !== null && _a !== void 0 ? _a : common_1.DEFAULTS.PROFIT_MARGIN,
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
    sell(productId, salesData) {
        var _a;
        return this.update(productId, {
            status: '販売済み',
            salesDate: salesData.soldDate,
            actualSalesPrice: salesData.soldPrice,
            salesDestination: salesData.soldTo,
            shippingCost: (_a = salesData.shippingCost) !== null && _a !== void 0 ? _a : undefined,
            salesRemarks: salesData.remarks,
            updatedAt: new Date(),
        });
    }
    /**
     * 価格情報を更新
     */
    updatePrices(productId, prices) {
        // 価格情報は計算値なので、Productに直接保存しない
        // 必要に応じてキャッシュやセッションストレージに保存する設計
        // 現在のProduct型には計算値フィールドがないため、
        // 呼び出し元でProductDetailとして管理する
        return this.findById(productId);
    }
}
exports.ProductRepository = ProductRepository;


/***/ },

/***/ 542
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * InventoryRepository - 棚卸しデータアクセス層
 * 棚卸しセッションと棚卸し詳細を管理
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryDetailRepository = exports.InventorySessionRepository = void 0;
const BaseRepository_1 = __webpack_require__(153);
const common_1 = __webpack_require__(798);
const inventory_1 = __webpack_require__(123);
const idGenerator_1 = __webpack_require__(781);
// ==================== 棚卸しセッションリポジトリ ====================
class InventorySessionRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.INVENTORY_SESSIONS,
            headers: inventory_1.INVENTORY_SESSION_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, inventory_1.rowToInventorySession)(row);
    }
    entityToRow(entity) {
        return (0, inventory_1.inventorySessionToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // sessionId
    }
    /**
     * 保管場所IDでセッション一覧を取得
     */
    findByStorageLocationId(storageLocationId) {
        return this.findWhere((session) => session.storageLocationId === storageLocationId);
    }
    /**
     * ステータスでセッション一覧を取得
     */
    findByStatus(status) {
        return this.findWhere((session) => session.status === status);
    }
    /**
     * 進行中のセッションを取得
     */
    findActiveSessions() {
        return this.findByStatus('進行中');
    }
    /**
     * 保管場所の最新セッションを取得
     */
    findLatestByStorageLocationId(storageLocationId) {
        const sessions = this.findByStorageLocationId(storageLocationId);
        if (sessions.length === 0)
            return null;
        return sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];
    }
    /**
     * セッションを開始
     */
    createSession(dto, targetCount) {
        const today = new Date();
        const existingIds = this.findAll().map((s) => s.sessionId);
        const nextSeq = (0, idGenerator_1.getNextInventorySessionSequence)(existingIds, today);
        const sessionId = (0, idGenerator_1.generateInventorySessionId)(today, nextSeq);
        const session = {
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
    completeSession(sessionId, completedBy) {
        return this.update(sessionId, {
            status: '完了',
            completedAt: new Date(),
            completedBy,
        });
    }
    /**
     * セッションを中断
     */
    pauseSession(sessionId) {
        return this.update(sessionId, {
            status: '中断中',
        });
    }
    /**
     * セッションを再開
     */
    resumeSession(sessionId) {
        return this.update(sessionId, {
            status: '進行中',
        });
    }
    /**
     * 確認済み件数を更新
     */
    updateConfirmedCount(sessionId, confirmedCount) {
        return this.update(sessionId, { confirmedCount });
    }
    /**
     * 差異件数を更新
     */
    updateDiscrepancyCount(sessionId, discrepancyCount) {
        return this.update(sessionId, { discrepancyCount });
    }
    /**
     * カウントを一括更新
     */
    updateCounts(sessionId, confirmedCount, discrepancyCount) {
        return this.update(sessionId, { confirmedCount, discrepancyCount });
    }
}
exports.InventorySessionRepository = InventorySessionRepository;
// ==================== 棚卸し詳細リポジトリ ====================
class InventoryDetailRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.INVENTORY_DETAILS,
            headers: inventory_1.INVENTORY_DETAIL_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, inventory_1.rowToInventoryDetail)(row);
    }
    entityToRow(entity) {
        return (0, inventory_1.inventoryDetailToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // detailId
    }
    /**
     * セッションIDで詳細一覧を取得
     */
    findBySessionId(sessionId) {
        return this.findWhere((detail) => detail.sessionId === sessionId);
    }
    /**
     * 製品IDで詳細を取得
     */
    findByProductId(productId) {
        return this.findWhere((detail) => detail.productId === productId);
    }
    /**
     * セッションと製品IDで詳細を取得
     */
    findBySessionAndProductId(sessionId, productId) {
        const found = this.findWhere((detail) => detail.sessionId === sessionId && detail.productId === productId);
        return found.length > 0 ? found[0] : null;
    }
    /**
     * 確認状況でフィルタ
     */
    findBySessionIdAndStatus(sessionId, status) {
        return this.findWhere((detail) => detail.sessionId === sessionId && detail.confirmationStatus === status);
    }
    /**
     * 未確認の詳細を取得
     */
    findUnconfirmedBySessionId(sessionId) {
        return this.findBySessionIdAndStatus(sessionId, '未確認');
    }
    /**
     * 確認済みの詳細を取得
     */
    findConfirmedBySessionId(sessionId) {
        return this.findBySessionIdAndStatus(sessionId, '確認済み');
    }
    /**
     * 差異ありの詳細を取得
     */
    findDiscrepancyBySessionId(sessionId) {
        return this.findBySessionIdAndStatus(sessionId, '差異あり');
    }
    /**
     * 棚卸し詳細を一括作成
     */
    createDetails(sessionId, productIds) {
        const details = productIds.map((productId, index) => ({
            detailId: `${sessionId}-${String(index + 1).padStart(4, '0')}`,
            sessionId,
            productId,
            confirmationStatus: '未確認',
        }));
        return this.createMany(details);
    }
    /**
     * 製品を確認
     */
    confirmProduct(dto) {
        const detail = this.findBySessionAndProductId(dto.sessionId, dto.productId);
        if (!detail)
            return null;
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
    adjustDiscrepancy(dto) {
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
    countConfirmedBySessionId(sessionId) {
        return this.findConfirmedBySessionId(sessionId).length;
    }
    /**
     * セッションの差異件数を集計
     */
    countDiscrepancyBySessionId(sessionId) {
        return this.findDiscrepancyBySessionId(sessionId).length;
    }
    /**
     * セッションの全詳細を削除
     */
    deleteBySessionId(sessionId) {
        const details = this.findBySessionId(sessionId);
        let deletedCount = 0;
        // 逆順で削除
        const sortedDetails = [...details].sort((a, b) => b.detailId.localeCompare(a.detailId));
        for (const detail of sortedDetails) {
            if (this.delete(detail.detailId)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
}
exports.InventoryDetailRepository = InventoryDetailRepository;


/***/ },

/***/ 552
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * データベースセットアップスクリプト
 * シート作成とダミーデータ投入
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupAllSheets = setupAllSheets;
exports.setupSheetsOnly = setupSheetsOnly;
exports.clearAllData = clearAllData;
// ==================== 定数定義 ====================
const SPREADSHEET_ID = '1a9ItLJgDd3oxOBhk1S2LhvsBRZohFtGCqzslxSqrT8g';
// シート名
const SHEETS = {
    PRODUCTS: '製品マスター',
    PROCESSING_COSTS: '加工費詳細',
    WOOD_TYPES: '樹種マスター',
    SUPPLIERS: '仕入れ先マスター',
    PROCESSORS: '加工業者マスター',
    STORAGE_LOCATIONS: '保管場所マスター',
    INVENTORY_SESSIONS: '棚卸しセッション',
    INVENTORY_DETAILS: '棚卸し詳細',
};
// ヘッダー定義
const HEADERS = {
    [SHEETS.PRODUCTS]: [
        '製品ID', '大分類', '中分類', '商品名', '樹種',
        '入荷時_長さ', '入荷時_幅', '入荷時_厚み',
        '仕上げ後_長さ', '仕上げ後_幅', '仕上げ後_厚み',
        '入荷時写真URL', '仕上げ後写真URL',
        '仕入れ先ID', '仕入れ日', '入荷単価', '保管場所ID',
        '販売時送料', '利益率', '価格調整額', 'ステータス',
        '販売先', '売上計上日', '実際販売価格', '販売備考',
        '最終棚卸し日', '削除日時', '削除理由', '備考',
        '作成日時', '更新日時', '登録者', '更新者',
    ],
    [SHEETS.PROCESSING_COSTS]: [
        '加工費ID', '製品ID', '加工種別', '加工業者ID', '加工内容', '金額', '作成日時',
    ],
    [SHEETS.WOOD_TYPES]: ['樹種ID', '樹種名', '表示順'],
    [SHEETS.SUPPLIERS]: ['仕入れ先ID', '業者名', '連絡先', '住所', '備考'],
    [SHEETS.PROCESSORS]: ['加工業者ID', '業者名', '対応加工種別', '連絡先', '住所', '備考'],
    [SHEETS.STORAGE_LOCATIONS]: ['保管場所ID', '場所名', '表示順'],
    [SHEETS.INVENTORY_SESSIONS]: [
        'セッションID', '保管場所ID', '開始日時', '開始者',
        '完了日時', '完了者', 'ステータス', '対象件数', '確認済件数', '差異件数', '備考',
    ],
    [SHEETS.INVENTORY_DETAILS]: [
        '詳細ID', 'セッションID', '製品ID', '確認状況', '確認方法',
        '確認者', '確認日時', '差異種別', '差異理由', '対応内容',
    ],
};
// ==================== ダミーデータ ====================
// 樹種マスター
const WOOD_TYPES_DATA = [
    ['WOOD-001', 'ウォルナット', 1],
    ['WOOD-002', 'モンキーポッド', 2],
    ['WOOD-003', '杉', 3],
    ['WOOD-004', '欅（ケヤキ）', 4],
    ['WOOD-005', 'ポプラ', 5],
    ['WOOD-006', 'パイン', 6],
    ['WOOD-007', 'オーク', 7],
    ['WOOD-008', 'チェリー', 8],
    ['WOOD-009', 'メープル', 9],
    ['WOOD-010', 'その他', 99],
];
// 仕入れ先マスター
const SUPPLIERS_DATA = [
    ['SUP-001', '山田木材株式会社', '03-1234-5678', '東京都港区芝1-1-1', '大口取引先'],
    ['SUP-002', '森林組合 木の里', '06-2345-6789', '大阪府豊中市新千里1-2-3', '良質な国産材'],
    ['SUP-003', '輸入木材センター', '045-3456-7890', '神奈川県横浜市中区1-2-3', '海外材専門'],
    ['SUP-004', '北海道銘木店', '011-4567-8901', '北海道札幌市中央区1-2-3', '北海道産材'],
    ['SUP-005', '九州木材市場', '092-5678-9012', '福岡県福岡市博多区1-2-3', '九州産材'],
];
// 加工業者マスター
const PROCESSORS_DATA = [
    ['PROC-001', '匠工房', '木材加工,塗装', '06-1111-2222', '大阪府豊中市庄内1-1-1', '高品質仕上げ'],
    ['PROC-002', '塗装の達人', '塗装', '06-2222-3333', '大阪府吹田市江坂1-2-3', 'ウレタン塗装専門'],
    ['PROC-003', '鉄脚工房', '足', '06-3333-4444', '大阪府東大阪市1-2-3', 'アイアン脚製作'],
    ['PROC-004', 'ガラス工芸社', 'ガラス', '06-4444-5555', '兵庫県尼崎市1-2-3', '強化ガラス加工'],
    ['PROC-005', '総合木工所', '木材加工,塗装,足,その他', '06-5555-6666', '大阪府堺市1-2-3', 'オールマイティ'],
];
// 保管場所マスター
const STORAGE_LOCATIONS_DATA = [
    ['LOC-001', 'ショールーム', 1],
    ['LOC-002', '豊中工場1階', 2],
    ['LOC-003', '豊中工場2階', 3],
    ['LOC-004', 'モデルハウスA', 4],
    ['LOC-005', 'モデルハウスB', 5],
    ['LOC-006', 'その他', 99],
];
// ==================== ユーティリティ関数 ====================
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function formatDate(date) {
    return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
}
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}
// ==================== データ生成関数 ====================
function generateProducts() {
    const products = [];
    const categories = ['テーブル', 'カウンター', 'スツール', '足', 'その他'];
    const minorCategories = ['家具', '雑貨', '加工材料', 'その他'];
    const statuses = ['販売中', '販売中', '販売中', '販売済み', '棚卸し中', '削除済み'];
    const woodTypeIds = WOOD_TYPES_DATA.map(w => w[0]);
    const supplierIds = SUPPLIERS_DATA.map(s => s[0]);
    const locationIds = STORAGE_LOCATIONS_DATA.map(l => l[0]);
    const now = new Date();
    for (let i = 1; i <= 30; i++) {
        const productId = `ITA-${String(i).padStart(4, '0')}`;
        const status = randomChoice(statuses);
        const purchaseDate = daysAgo(randomInt(30, 365));
        const createdAt = purchaseDate;
        // サイズ生成
        const rawLength = randomInt(800, 2500);
        const rawWidth = randomInt(400, 1200);
        const rawThickness = randomInt(30, 80);
        const finishedLength = rawLength - randomInt(0, 50);
        const finishedWidth = rawWidth - randomInt(0, 30);
        const finishedThickness = rawThickness - randomInt(0, 10);
        // 価格生成
        const purchasePrice = randomInt(50000, 500000);
        const shippingCost = randomInt(5000, 30000);
        const profitMargin = randomInt(55, 70);
        const priceAdjustment = randomInt(-10000, 20000);
        // 販売情報（販売済みの場合）
        let salesDestination = '';
        let salesDate = '';
        let actualSalesPrice = '';
        let salesRemarks = '';
        if (status === '販売済み') {
            salesDestination = randomChoice(['個人A様', '個人B様', '法人C社', 'インテリアショップD', '設計事務所E']);
            salesDate = daysAgo(randomInt(1, 30));
            const basePrice = Math.round(purchasePrice / (1 - profitMargin / 100) + priceAdjustment);
            actualSalesPrice = Math.round(basePrice * 1.1);
            salesRemarks = randomChoice(['配送済み', '店頭引取', '取付工事込み', '']);
        }
        // 削除情報（削除済みの場合）
        let deletedAt = '';
        let deleteReason = '';
        if (status === '削除済み') {
            deletedAt = daysAgo(randomInt(1, 30));
            deleteReason = randomChoice(['破損', '品質不良', '誤登録', 'その他']);
        }
        // 最終棚卸し日
        const lastInventoryDate = status === '棚卸し中' ? '' : daysAgo(randomInt(30, 180));
        const row = [
            productId,
            randomChoice(categories),
            randomChoice(minorCategories),
            `${randomChoice(['銘木', '天然', '無垢'])} ${randomChoice(['ダイニング', 'センター', 'ワーク', 'カウンター'])}テーブル ${i}号`,
            randomChoice(woodTypeIds),
            rawLength,
            rawWidth,
            rawThickness,
            finishedLength,
            finishedWidth,
            finishedThickness,
            '', // 入荷時写真URL
            '', // 仕上げ後写真URL
            randomChoice(supplierIds),
            purchaseDate,
            purchasePrice,
            randomChoice(locationIds),
            shippingCost,
            profitMargin,
            priceAdjustment,
            status,
            salesDestination,
            salesDate,
            actualSalesPrice,
            salesRemarks,
            lastInventoryDate,
            deletedAt,
            deleteReason,
            randomChoice(['', '良材', '節あり', '耳付き', '希少材']),
            createdAt,
            '', // 更新日時
            'システム',
            '',
        ];
        products.push(row);
    }
    return products;
}
function generateProcessingCosts(products) {
    const costs = [];
    const processingTypes = ['木材加工', '塗装', '足', 'ガラス', 'その他'];
    const processorIds = PROCESSORS_DATA.map(p => p[0]);
    let costNum = 1;
    for (const product of products) {
        const productId = product[0];
        const status = product[20];
        // 削除済み以外の製品に加工費を追加
        if (status !== '削除済み') {
            // 1〜3件の加工費を追加
            const numCosts = randomInt(1, 3);
            for (let j = 0; j < numCosts; j++) {
                const costId = `COST-${String(costNum).padStart(6, '0')}`;
                const processingType = randomChoice(processingTypes);
                const amount = randomInt(5000, 100000);
                const row = [
                    costId,
                    productId,
                    processingType,
                    randomChoice(processorIds),
                    randomChoice([
                        '天板加工・仕上げ',
                        'ウレタン塗装',
                        'オイル仕上げ',
                        'アイアン脚取付',
                        '強化ガラス加工',
                        '研磨・面取り',
                    ]),
                    amount,
                    new Date(),
                ];
                costs.push(row);
                costNum++;
            }
        }
    }
    return costs;
}
function generateInventorySessions() {
    const sessions = [];
    const locationIds = STORAGE_LOCATIONS_DATA.map(l => l[0]);
    // 完了済みセッション
    sessions.push([
        'INV-20260110-001',
        'LOC-001',
        daysAgo(6),
        'admin@example.com',
        daysAgo(6),
        'admin@example.com',
        '完了',
        5,
        5,
        0,
        '定期棚卸し',
    ]);
    // 進行中セッション
    sessions.push([
        'INV-20260115-001',
        'LOC-002',
        daysAgo(1),
        'staff@example.com',
        '',
        '',
        '進行中',
        8,
        3,
        1,
        '',
    ]);
    // 中断中セッション
    sessions.push([
        'INV-20260114-001',
        'LOC-003',
        daysAgo(2),
        'staff@example.com',
        '',
        '',
        '中断中',
        6,
        2,
        0,
        '作業中断',
    ]);
    return sessions;
}
function generateInventoryDetails(sessions, products) {
    const details = [];
    // 販売中の製品IDを取得
    const availableProducts = products
        .filter(p => p[20] === '販売中' || p[20] === '棚卸し中')
        .map(p => p[0]);
    let detailNum = 1;
    for (const session of sessions) {
        const sessionId = session[0];
        const targetCount = session[7];
        const confirmedCount = session[8];
        const discrepancyCount = session[9];
        const status = session[6];
        // セッションごとに詳細を生成
        for (let i = 0; i < targetCount; i++) {
            const detailId = `${sessionId}-${String(detailNum).padStart(4, '0')}`;
            const productId = availableProducts[i % availableProducts.length];
            let confirmationStatus = '未確認';
            let confirmationMethod = '';
            let confirmedBy = '';
            let confirmedAt = '';
            let discrepancyType = '';
            let discrepancyReason = '';
            let actionTaken = '';
            if (i < confirmedCount) {
                confirmationStatus = '確認済み';
                confirmationMethod = randomChoice(['QRスキャン', '手入力', '一覧選択']);
                confirmedBy = 'staff@example.com';
                confirmedAt = daysAgo(randomInt(0, 2));
            }
            else if (i < confirmedCount + discrepancyCount) {
                confirmationStatus = '差異あり';
                discrepancyType = randomChoice(['紛失', '場所違い', '未登録発見', 'その他']);
                discrepancyReason = '確認時に発見';
                actionTaken = discrepancyType === '紛失' ? '調査中' : '対応済み';
            }
            const row = [
                detailId,
                sessionId,
                productId,
                confirmationStatus,
                confirmationMethod,
                confirmedBy,
                confirmedAt,
                discrepancyType,
                discrepancyReason,
                actionTaken,
            ];
            details.push(row);
            detailNum++;
        }
    }
    return details;
}
// ==================== メイン関数 ====================
/**
 * すべてのシートとダミーデータをセットアップ
 * GASエディタから実行してください
 */
function setupAllSheets() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('=== シートセットアップ開始 ===');
    // 各シートを作成（既存の場合はクリア）
    for (const [sheetName, headers] of Object.entries(HEADERS)) {
        let sheet = ss.getSheetByName(sheetName);
        if (sheet) {
            console.log(`シート「${sheetName}」をクリア中...`);
            sheet.clear();
        }
        else {
            console.log(`シート「${sheetName}」を作成中...`);
            sheet = ss.insertSheet(sheetName);
        }
        // ヘッダーを設定
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90d9');
        sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
        // 列幅を自動調整
        sheet.setFrozenRows(1);
    }
    console.log('=== ダミーデータ投入開始 ===');
    // マスターデータ投入
    insertData(ss, SHEETS.WOOD_TYPES, WOOD_TYPES_DATA);
    insertData(ss, SHEETS.SUPPLIERS, SUPPLIERS_DATA);
    insertData(ss, SHEETS.PROCESSORS, PROCESSORS_DATA);
    insertData(ss, SHEETS.STORAGE_LOCATIONS, STORAGE_LOCATIONS_DATA);
    // 製品データ生成・投入
    const products = generateProducts();
    insertData(ss, SHEETS.PRODUCTS, products);
    // 加工費データ生成・投入
    const processingCosts = generateProcessingCosts(products);
    insertData(ss, SHEETS.PROCESSING_COSTS, processingCosts);
    // 棚卸しデータ生成・投入
    const sessions = generateInventorySessions();
    insertData(ss, SHEETS.INVENTORY_SESSIONS, sessions);
    const details = generateInventoryDetails(sessions, products);
    insertData(ss, SHEETS.INVENTORY_DETAILS, details);
    console.log('=== セットアップ完了 ===');
    console.log(`製品: ${products.length}件`);
    console.log(`加工費: ${processingCosts.length}件`);
    console.log(`棚卸しセッション: ${sessions.length}件`);
    console.log(`棚卸し詳細: ${details.length}件`);
}
function insertData(ss, sheetName, data) {
    if (data.length === 0)
        return;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        console.error(`シート「${sheetName}」が見つかりません`);
        return;
    }
    console.log(`${sheetName}: ${data.length}件のデータを投入中...`);
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}
/**
 * シートのみ作成（データなし）
 */
function setupSheetsOnly() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('=== シート作成開始 ===');
    for (const [sheetName, headers] of Object.entries(HEADERS)) {
        let sheet = ss.getSheetByName(sheetName);
        if (sheet) {
            console.log(`シート「${sheetName}」は既に存在します`);
            continue;
        }
        console.log(`シート「${sheetName}」を作成中...`);
        sheet = ss.insertSheet(sheetName);
        // ヘッダーを設定
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90d9');
        sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
        sheet.setFrozenRows(1);
    }
    console.log('=== シート作成完了 ===');
}
/**
 * すべてのデータをクリア（ヘッダーは残す）
 */
function clearAllData() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('=== データクリア開始 ===');
    for (const sheetName of Object.keys(HEADERS)) {
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet)
            continue;
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            console.log(`${sheetName}: ${lastRow - 1}件のデータを削除中...`);
            sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
        }
    }
    console.log('=== データクリア完了 ===');
}


/***/ },

/***/ 561
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * GASエントリーポイント
 * Webアプリケーションのメインファイル
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// 型のエクスポート
__exportStar(__webpack_require__(211), exports);
// サービス・リポジトリのインポート
const ProductService_1 = __webpack_require__(338);
const ProcessingCostService_1 = __webpack_require__(927);
const InventoryService_1 = __webpack_require__(255);
const SalesService_1 = __webpack_require__(871);
const MasterRepository_1 = __webpack_require__(570);
const setupData_1 = __webpack_require__(552);
// ==================== 設定 ====================
/**
 * デフォルトのスプレッドシートID
 */
const DEFAULT_SPREADSHEET_ID = '1a9ItLJgDd3oxOBhk1S2LhvsBRZohFtGCqzslxSqrT8g';
/**
 * 初期セットアップ - スプレッドシートIDをScript Propertiesに設定
 * GASエディタから一度だけ実行してください
 */
function setupSpreadsheetId(spreadsheetId) {
    const id = spreadsheetId || DEFAULT_SPREADSHEET_ID;
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SPREADSHEET_ID', id);
    return { success: true, spreadsheetId: id };
}
/**
 * 現在の設定を確認
 */
function getConfig() {
    const props = PropertiesService.getScriptProperties();
    return {
        spreadsheetId: props.getProperty('SPREADSHEET_ID') || '(未設定)',
        defaultSpreadsheetId: DEFAULT_SPREADSHEET_ID,
    };
}
// ==================== ユーティリティ ====================
/**
 * スプレッドシートIDを取得
 */
function getSpreadsheetId() {
    const props = PropertiesService.getScriptProperties();
    let id = props.getProperty('SPREADSHEET_ID');
    // 未設定の場合はデフォルト値を使用して自動設定
    if (!id) {
        id = DEFAULT_SPREADSHEET_ID;
        props.setProperty('SPREADSHEET_ID', id);
    }
    return id;
}
/**
 * スプレッドシートを取得
 */
function getSpreadsheet() {
    const id = getSpreadsheetId();
    const ss = SpreadsheetApp.openById(id);
    if (!ss) {
        throw new Error(`Spreadsheet with ID ${id} not found`);
    }
    return ss;
}
/**
 * 現在のユーザーメールアドレスを取得
 */
function getCurrentUserEmail() {
    try {
        return Session.getActiveUser().getEmail() || 'unknown@example.com';
    }
    catch {
        return 'unknown@example.com';
    }
}
/**
 * 現在日時を取得（日本時間）
 */
function getCurrentDateTime() {
    return new Date();
}
/**
 * 日付をフォーマット
 */
function formatDate(date, format = 'yyyy/MM/dd') {
    return Utilities.formatDate(date, 'Asia/Tokyo', format);
}
// ==================== Webアプリケーション ====================
/**
 * Webアプリのエントリーポイント
 */
function doGet(e) {
    var _a;
    const page = ((_a = e === null || e === void 0 ? void 0 : e.parameter) === null || _a === void 0 ? void 0 : _a.page) || 'index';
    const template = HtmlService.createTemplateFromFile(page);
    return template
        .evaluate()
        .setTitle('木材在庫管理システム')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
/**
 * HTMLファイルをインクルード
 */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
// ==================== 製品API ====================
/**
 * 製品検索
 */
function searchProducts(conditions = {}, pagination = { page: 1, limit: 20 }) {
    try {
        console.log('searchProducts called:', JSON.stringify(conditions), JSON.stringify(pagination));
        const spreadsheetId = getSpreadsheetId();
        console.log('spreadsheetId:', spreadsheetId);
        const service = new ProductService_1.ProductService(spreadsheetId);
        const result = service.searchProducts(conditions, pagination);
        console.log('searchProducts result:', JSON.stringify(result));
        // Date オブジェクトをJSON互換に変換
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('searchProducts error:', error);
        throw error;
    }
}
/**
 * 製品詳細取得
 */
function getProductDetail(productId) {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.getProductDetail(productId);
        return result ? JSON.parse(JSON.stringify(result)) : null;
    }
    catch (error) {
        console.error('getProductDetail error:', error);
        throw error;
    }
}
/**
 * 製品登録
 */
function createProduct(dto) {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.createProduct(dto);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('createProduct error:', error);
        throw error;
    }
}
/**
 * 製品更新
 */
function updateProduct(productId, dto) {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.updateProduct(productId, dto);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('updateProduct error:', error);
        throw error;
    }
}
/**
 * 製品削除（論理削除）
 */
function deleteProduct(productId, reason) {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.deleteProduct(productId, reason);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('deleteProduct error:', error);
        throw error;
    }
}
/**
 * ダッシュボード統計取得
 */
function getDashboardStats() {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.getDashboardStats();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getDashboardStats error:', error);
        throw error;
    }
}
// ==================== 販売API ====================
/**
 * 販売処理
 */
function sellProduct(productId, salesData) {
    try {
        const service = new SalesService_1.SalesService(getSpreadsheetId());
        const result = service.sellProduct(productId, salesData);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('sellProduct error:', error);
        throw error;
    }
}
/**
 * 販売キャンセル
 */
function cancelSale(productId, reason) {
    try {
        const service = new SalesService_1.SalesService(getSpreadsheetId());
        const result = service.cancelSale(productId, reason);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('cancelSale error:', error);
        throw error;
    }
}
/**
 * 売上統計取得
 * クライアントからはISO文字列として日付を受け取り、Dateに変換する
 */
function getSalesStats(startDateStr, endDateStr) {
    try {
        const service = new SalesService_1.SalesService(getSpreadsheetId());
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;
        const result = service.getSalesStats(startDate, endDate);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getSalesStats error:', error);
        throw error;
    }
}
/**
 * フィルタ付きで販売済み製品を取得
 */
function getSoldProductsWithFilter(startDateStr, endDateStr, woodType) {
    try {
        const service = new SalesService_1.SalesService(getSpreadsheetId());
        let products = service.getSoldProducts();
        // 日付フィルタ
        if (startDateStr || endDateStr) {
            const startDate = startDateStr ? new Date(startDateStr) : null;
            const endDate = endDateStr ? new Date(endDateStr) : null;
            products = products.filter((p) => {
                if (!p.salesDate)
                    return false;
                const salesDate = new Date(p.salesDate);
                if (startDate && salesDate < startDate)
                    return false;
                if (endDate && salesDate > endDate)
                    return false;
                return true;
            });
        }
        // 樹種フィルタ
        if (woodType) {
            products = products.filter((p) => p.woodType === woodType);
        }
        // 販売日で降順ソート
        products.sort((a, b) => {
            const dateA = a.salesDate ? new Date(a.salesDate).getTime() : 0;
            const dateB = b.salesDate ? new Date(b.salesDate).getTime() : 0;
            return dateB - dateA;
        });
        return JSON.parse(JSON.stringify(products));
    }
    catch (error) {
        console.error('getSoldProductsWithFilter error:', error);
        throw error;
    }
}
// ==================== 加工費API ====================
/**
 * 製品の加工費一覧取得
 */
function getProcessingCosts(productId) {
    try {
        const service = new ProcessingCostService_1.ProcessingCostService(getSpreadsheetId());
        const costs = service.getProcessingCosts(productId);
        const summary = service.getProductSummary(productId);
        return JSON.parse(JSON.stringify({ costs, summary }));
    }
    catch (error) {
        console.error('getProcessingCosts error:', error);
        throw error;
    }
}
/**
 * 加工費登録
 */
function createProcessingCost(dto) {
    try {
        const service = new ProcessingCostService_1.ProcessingCostService(getSpreadsheetId());
        const result = service.createProcessingCost(dto);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('createProcessingCost error:', error);
        throw error;
    }
}
/**
 * 加工費削除
 */
function deleteProcessingCost(costId) {
    try {
        const service = new ProcessingCostService_1.ProcessingCostService(getSpreadsheetId());
        const result = service.deleteProcessingCost(costId);
        return result;
    }
    catch (error) {
        console.error('deleteProcessingCost error:', error);
        throw error;
    }
}
// ==================== マスターAPI ====================
/**
 * 樹種一覧取得
 */
function getWoodTypes() {
    try {
        const repo = new MasterRepository_1.WoodTypeRepository(getSpreadsheetId());
        const result = repo.findAllSorted();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getWoodTypes error:', error);
        throw error;
    }
}
/**
 * 仕入れ先一覧取得
 */
function getSuppliers() {
    try {
        const repo = new MasterRepository_1.SupplierRepository(getSpreadsheetId());
        const result = repo.findAll();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getSuppliers error:', error);
        throw error;
    }
}
/**
 * 加工業者一覧取得
 */
function getProcessors() {
    try {
        const repo = new MasterRepository_1.ProcessorRepository(getSpreadsheetId());
        const result = repo.findAll();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getProcessors error:', error);
        throw error;
    }
}
/**
 * 保管場所一覧取得
 */
function getStorageLocations() {
    try {
        const repo = new MasterRepository_1.StorageLocationRepository(getSpreadsheetId());
        const result = repo.findAllSorted();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getStorageLocations error:', error);
        throw error;
    }
}
/**
 * マスターデータ追加
 */
function addMasterData(type, data) {
    try {
        const spreadsheetId = getSpreadsheetId();
        let result;
        switch (type) {
            case 'woodType': {
                const repo = new MasterRepository_1.WoodTypeRepository(spreadsheetId);
                result = repo.createFromDto(data);
                break;
            }
            case 'supplier': {
                const repo = new MasterRepository_1.SupplierRepository(spreadsheetId);
                result = repo.createFromDto(data);
                break;
            }
            case 'processor': {
                const repo = new MasterRepository_1.ProcessorRepository(spreadsheetId);
                result = repo.createFromDto(data);
                break;
            }
            case 'storageLocation': {
                const repo = new MasterRepository_1.StorageLocationRepository(spreadsheetId);
                result = repo.createFromDto(data);
                break;
            }
            default:
                throw new Error(`Unknown master type: ${type}`);
        }
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('addMasterData error:', error);
        throw error;
    }
}
/**
 * マスターデータ削除
 */
function deleteMasterData(type, id) {
    try {
        const spreadsheetId = getSpreadsheetId();
        switch (type) {
            case 'woodType': {
                const repo = new MasterRepository_1.WoodTypeRepository(spreadsheetId);
                return repo.delete(id);
            }
            case 'supplier': {
                const repo = new MasterRepository_1.SupplierRepository(spreadsheetId);
                return repo.delete(id);
            }
            case 'processor': {
                const repo = new MasterRepository_1.ProcessorRepository(spreadsheetId);
                return repo.delete(id);
            }
            case 'storageLocation': {
                const repo = new MasterRepository_1.StorageLocationRepository(spreadsheetId);
                return repo.delete(id);
            }
            default:
                throw new Error(`Unknown master type: ${type}`);
        }
    }
    catch (error) {
        console.error('deleteMasterData error:', error);
        throw error;
    }
}
// ==================== 棚卸しAPI ====================
/**
 * 棚卸しセッション開始
 */
function startInventorySession(storageLocationId) {
    try {
        const service = new InventoryService_1.InventoryService(getSpreadsheetId());
        const result = service.startInventorySession(storageLocationId);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('startInventorySession error:', error);
        throw error;
    }
}
/**
 * 棚卸し進捗取得
 */
function getInventoryProgress(sessionId) {
    try {
        const service = new InventoryService_1.InventoryService(getSpreadsheetId());
        const result = service.getInventoryProgress(sessionId);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getInventoryProgress error:', error);
        throw error;
    }
}
/**
 * 製品確認
 */
function confirmInventoryProduct(sessionId, productId, method) {
    try {
        const service = new InventoryService_1.InventoryService(getSpreadsheetId());
        const result = service.confirmInventoryProduct(sessionId, productId, method);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('confirmInventoryProduct error:', error);
        throw error;
    }
}
/**
 * 棚卸しセッション完了
 */
function completeInventorySession(sessionId) {
    try {
        const service = new InventoryService_1.InventoryService(getSpreadsheetId());
        const result = service.completeInventorySession(sessionId);
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('completeInventorySession error:', error);
        throw error;
    }
}
/**
 * 進行中のセッション一覧取得
 */
function getActiveSessions() {
    try {
        const service = new InventoryService_1.InventoryService(getSpreadsheetId());
        const result = service.getActiveSessions();
        return JSON.parse(JSON.stringify(result));
    }
    catch (error) {
        console.error('getActiveSessions error:', error);
        throw error;
    }
}
// ==================== 認証API ====================
/**
 * 現在のユーザーのOAuthトークンを取得
 * Google Picker APIで使用
 */
function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}
// ==================== 写真アップロードAPI ====================
/**
 * 写真保存先フォルダIDを取得
 */
function getPhotoFolderId() {
    try {
        const props = PropertiesService.getScriptProperties();
        let folderId = props.getProperty('PHOTO_FOLDER_ID');
        if (!folderId) {
            // 未設定の場合はスプレッドシートと同じフォルダを使用
            try {
                const spreadsheetId = getSpreadsheetId();
                if (spreadsheetId) {
                    const file = DriveApp.getFileById(spreadsheetId);
                    const parents = file.getParents();
                    if (parents.hasNext()) {
                        folderId = parents.next().getId();
                    }
                }
            }
            catch (e) {
                console.log('Could not get spreadsheet folder, using root folder');
            }
            // それでも取得できない場合はルートフォルダを使用
            if (!folderId) {
                folderId = DriveApp.getRootFolder().getId();
            }
        }
        return folderId;
    }
    catch (error) {
        console.error('getPhotoFolderId error:', error);
        // フォールバック: ルートフォルダ
        return DriveApp.getRootFolder().getId();
    }
}
/**
 * 写真保存先フォルダIDを設定
 */
function setupPhotoFolderId(folderId) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('PHOTO_FOLDER_ID', folderId);
    return { success: true, folderId };
}
/**
 * 製品写真をアップロード
 */
function uploadProductPhoto(base64Data, filename, mimeType) {
    try {
        console.log('uploadProductPhoto called: filename=' + filename + ', mimeType=' + mimeType);
        // バリデーション
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new Error('対応していないファイル形式です: ' + mimeType);
        }
        if (!base64Data || base64Data.length === 0) {
            throw new Error('画像データが空です');
        }
        console.log('Base64 data length: ' + base64Data.length);
        // Base64データをデコード
        const decodedData = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decodedData, mimeType, filename);
        // ファイルサイズチェック
        const fileSize = blob.getBytes().length;
        console.log('File size: ' + fileSize + ' bytes');
        if (fileSize > maxSize) {
            throw new Error('ファイルサイズが5MBを超えています');
        }
        // ファイル名をユニークにする
        const timestamp = new Date().getTime();
        const uniqueFilename = 'product_' + timestamp + '_' + filename;
        blob.setName(uniqueFilename);
        console.log('Unique filename: ' + uniqueFilename);
        // マイドライブのルートフォルダに保存（権限問題を回避）
        console.log('Getting root folder...');
        const folder = DriveApp.getRootFolder();
        console.log('Root folder ID: ' + folder.getId());
        console.log('Creating file...');
        const file = folder.createFile(blob);
        console.log('File created: ' + file.getId());
        // 「リンクを知っている全員」に共有設定
        console.log('Setting sharing permissions...');
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        console.log('Sharing set');
        // 共有URLを生成
        const fileId = file.getId();
        const url = 'https://drive.google.com/file/d/' + fileId + '/view?usp=sharing';
        console.log('Upload completed: ' + url);
        return {
            success: true,
            url: url,
            fileId: fileId,
            filename: uniqueFilename,
        };
    }
    catch (error) {
        console.error('uploadProductPhoto error:', error);
        const errorMessage = error && error.message ? error.message : String(error);
        throw new Error('写真アップロードエラー: ' + errorMessage);
    }
}
// ==================== レポートAPI ====================
/**
 * 在庫レポート取得
 */
function getInventoryReport(conditions = {}) {
    try {
        const service = new ProductService_1.ProductService(getSpreadsheetId());
        const result = service.searchProducts(conditions, { page: 1, limit: 10000 });
        // レポート形式で返す
        return JSON.parse(JSON.stringify({
            generatedAt: new Date(),
            totalCount: result.total,
            items: result.data,
            summary: service.getDashboardStats(),
        }));
    }
    catch (error) {
        console.error('getInventoryReport error:', error);
        throw error;
    }
}
/**
 * PDFカタログ生成（スタブ）
 */
function generateCatalogPdf(productIds) {
    // TODO: PDF生成実装
    // 現時点ではスタブとして、DriveにPDFを作成するロジックを記述予定
    return {
        success: false,
        message: 'PDF生成機能は現在開発中です',
        productIds,
    };
}
/**
 * CSVエクスポート
 */
function exportCsv(type, conditions = {}) {
    try {
        const spreadsheetId = getSpreadsheetId();
        switch (type) {
            case 'products': {
                const service = new ProductService_1.ProductService(spreadsheetId);
                const result = service.searchProducts(conditions, { page: 1, limit: 10000 });
                return convertToCsvGeneric(result.data, [
                    'productId',
                    'productName',
                    'majorCategory',
                    'woodType',
                    'status',
                    'sellingPriceIncTax',
                    'storageLocation',
                ]);
            }
            case 'sales': {
                const service = new SalesService_1.SalesService(spreadsheetId);
                const soldProducts = service.getSoldProducts();
                return convertToCsvGeneric(soldProducts, [
                    'productId',
                    'productName',
                    'salesDate',
                    'actualSalesPrice',
                    'salesDestination',
                ]);
            }
            case 'inventory': {
                const service = new InventoryService_1.InventoryService(spreadsheetId);
                const sessions = service.getActiveSessions();
                return convertToCsvGeneric(sessions, [
                    'sessionId',
                    'storageLocationId',
                    'startedAt',
                    'status',
                    'targetCount',
                    'confirmedCount',
                ]);
            }
            default:
                throw new Error(`Unknown export type: ${type}`);
        }
    }
    catch (error) {
        console.error('exportCsv error:', error);
        throw error;
    }
}
/**
 * オブジェクト配列をCSV文字列に変換
 */
function convertToCsvGeneric(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
data, columns) {
    if (data.length === 0) {
        return columns.join(',');
    }
    const header = columns.join(',');
    const rows = data.map((item) => columns
        .map((col) => {
        const value = item[col];
        if (value === null || value === undefined)
            return '';
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
    })
        .join(','));
    return [header, ...rows].join('\n');
}
// 設定
__webpack_require__.g.setupSpreadsheetId = setupSpreadsheetId;
__webpack_require__.g.getConfig = getConfig;
// Webアプリ
__webpack_require__.g.doGet = doGet;
__webpack_require__.g.include = include;
// ユーティリティ
__webpack_require__.g.getSpreadsheet = getSpreadsheet;
__webpack_require__.g.getCurrentUserEmail = getCurrentUserEmail;
__webpack_require__.g.getCurrentDateTime = getCurrentDateTime;
__webpack_require__.g.formatDate = formatDate;
// 製品API
__webpack_require__.g.searchProducts = searchProducts;
__webpack_require__.g.getProductDetail = getProductDetail;
__webpack_require__.g.createProduct = createProduct;
__webpack_require__.g.updateProduct = updateProduct;
__webpack_require__.g.deleteProduct = deleteProduct;
__webpack_require__.g.getDashboardStats = getDashboardStats;
// 販売API
__webpack_require__.g.sellProduct = sellProduct;
__webpack_require__.g.cancelSale = cancelSale;
__webpack_require__.g.getSalesStats = getSalesStats;
__webpack_require__.g.getSoldProductsWithFilter = getSoldProductsWithFilter;
// 加工費API
__webpack_require__.g.getProcessingCosts = getProcessingCosts;
__webpack_require__.g.createProcessingCost = createProcessingCost;
__webpack_require__.g.deleteProcessingCost = deleteProcessingCost;
// マスターAPI
__webpack_require__.g.getWoodTypes = getWoodTypes;
__webpack_require__.g.getSuppliers = getSuppliers;
__webpack_require__.g.getProcessors = getProcessors;
__webpack_require__.g.getStorageLocations = getStorageLocations;
__webpack_require__.g.addMasterData = addMasterData;
__webpack_require__.g.deleteMasterData = deleteMasterData;
// 棚卸しAPI
__webpack_require__.g.startInventorySession = startInventorySession;
__webpack_require__.g.getInventoryProgress = getInventoryProgress;
__webpack_require__.g.confirmInventoryProduct = confirmInventoryProduct;
__webpack_require__.g.completeInventorySession = completeInventorySession;
__webpack_require__.g.getActiveSessions = getActiveSessions;
// 認証API
__webpack_require__.g.getOAuthToken = getOAuthToken;
// 写真アップロードAPI
__webpack_require__.g.setupPhotoFolderId = setupPhotoFolderId;
__webpack_require__.g.uploadProductPhoto = uploadProductPhoto;
// レポートAPI
__webpack_require__.g.getInventoryReport = getInventoryReport;
__webpack_require__.g.generateCatalogPdf = generateCatalogPdf;
__webpack_require__.g.exportCsv = exportCsv;
// データセットアップ
__webpack_require__.g.setupAllSheets = setupData_1.setupAllSheets;
__webpack_require__.g.setupSheetsOnly = setupData_1.setupSheetsOnly;
__webpack_require__.g.clearAllData = setupData_1.clearAllData;


/***/ },

/***/ 570
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * MasterRepository - マスターデータアクセス層
 * 樹種、仕入れ先、加工業者、保管場所マスターを管理
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageLocationRepository = exports.ProcessorRepository = exports.SupplierRepository = exports.WoodTypeRepository = void 0;
const BaseRepository_1 = __webpack_require__(153);
const common_1 = __webpack_require__(798);
const master_1 = __webpack_require__(877);
// ==================== 樹種リポジトリ ====================
class WoodTypeRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.WOOD_TYPES,
            headers: master_1.WOOD_TYPE_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, master_1.rowToWoodType)(row);
    }
    entityToRow(entity) {
        return (0, master_1.woodTypeToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // woodTypeId
    }
    /**
     * 名前で検索
     */
    findByName(name) {
        const found = this.findWhere((wt) => wt.name === name);
        return found.length > 0 ? found[0] : null;
    }
    /**
     * 表示順でソートして取得
     */
    findAllSorted() {
        return this.findAll().sort((a, b) => a.displayOrder - b.displayOrder);
    }
    /**
     * 新規登録
     */
    createFromDto(dto) {
        var _a;
        const existingIds = this.findAll().map((w) => w.woodTypeId);
        const nextNum = existingIds.length + 1;
        const woodTypeId = `WOOD-${String(nextNum).padStart(4, '0')}`;
        const woodType = {
            woodTypeId,
            name: dto.name,
            displayOrder: (_a = dto.displayOrder) !== null && _a !== void 0 ? _a : nextNum,
        };
        return this.create(woodType);
    }
    /**
     * 名前の重複チェック
     */
    isNameExists(name, excludeId) {
        return this.findAll().some((wt) => wt.name === name && wt.woodTypeId !== excludeId);
    }
}
exports.WoodTypeRepository = WoodTypeRepository;
// ==================== 仕入れ先リポジトリ ====================
class SupplierRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.SUPPLIERS,
            headers: master_1.SUPPLIER_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, master_1.rowToSupplier)(row);
    }
    entityToRow(entity) {
        return (0, master_1.supplierToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // supplierId
    }
    /**
     * 名前で検索
     */
    findByName(name) {
        const found = this.findWhere((s) => s.name === name);
        return found.length > 0 ? found[0] : null;
    }
    /**
     * 新規登録
     */
    createFromDto(dto) {
        const existingIds = this.findAll().map((s) => s.supplierId);
        const nextNum = existingIds.length + 1;
        const supplierId = `SUP-${String(nextNum).padStart(4, '0')}`;
        const supplier = {
            supplierId,
            name: dto.name,
            contact: dto.contact,
            address: dto.address,
            remarks: dto.remarks,
        };
        return this.create(supplier);
    }
    /**
     * 名前の重複チェック
     */
    isNameExists(name, excludeId) {
        return this.findAll().some((s) => s.name === name && s.supplierId !== excludeId);
    }
}
exports.SupplierRepository = SupplierRepository;
// ==================== 加工業者リポジトリ ====================
class ProcessorRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.PROCESSORS,
            headers: master_1.PROCESSOR_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, master_1.rowToProcessor)(row);
    }
    entityToRow(entity) {
        return (0, master_1.processorToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // processorId
    }
    /**
     * 名前で検索
     */
    findByName(name) {
        const found = this.findWhere((p) => p.name === name);
        return found.length > 0 ? found[0] : null;
    }
    /**
     * 加工種別で検索
     */
    findByProcessingType(processingType) {
        return this.findWhere((p) => p.processingTypes.includes(processingType));
    }
    /**
     * 新規登録
     */
    createFromDto(dto) {
        const existingIds = this.findAll().map((p) => p.processorId);
        const nextNum = existingIds.length + 1;
        const processorId = `PROC-${String(nextNum).padStart(4, '0')}`;
        const processor = {
            processorId,
            name: dto.name,
            processingTypes: dto.processingTypes,
            contact: dto.contact,
            address: dto.address,
            remarks: dto.remarks,
        };
        return this.create(processor);
    }
    /**
     * 名前の重複チェック
     */
    isNameExists(name, excludeId) {
        return this.findAll().some((p) => p.name === name && p.processorId !== excludeId);
    }
}
exports.ProcessorRepository = ProcessorRepository;
// ==================== 保管場所リポジトリ ====================
class StorageLocationRepository extends BaseRepository_1.BaseRepository {
    constructor(spreadsheetId) {
        const config = {
            spreadsheetId,
            sheetName: common_1.SHEET_NAMES.STORAGE_LOCATIONS,
            headers: master_1.STORAGE_LOCATION_HEADERS,
        };
        super(config);
    }
    rowToEntity(row) {
        return (0, master_1.rowToStorageLocation)(row);
    }
    entityToRow(entity) {
        return (0, master_1.storageLocationToRow)(entity);
    }
    getIdColumnIndex() {
        return 0; // storageLocationId
    }
    /**
     * 名前で検索
     */
    findByName(name) {
        const found = this.findWhere((sl) => sl.name === name);
        return found.length > 0 ? found[0] : null;
    }
    /**
     * 表示順でソートして取得
     */
    findAllSorted() {
        return this.findAll().sort((a, b) => a.displayOrder - b.displayOrder);
    }
    /**
     * 新規登録
     */
    createFromDto(dto) {
        var _a;
        const existingIds = this.findAll().map((sl) => sl.storageLocationId);
        const nextNum = existingIds.length + 1;
        const storageLocationId = `LOC-${String(nextNum).padStart(4, '0')}`;
        const location = {
            storageLocationId,
            name: dto.name,
            displayOrder: (_a = dto.displayOrder) !== null && _a !== void 0 ? _a : nextNum,
        };
        return this.create(location);
    }
    /**
     * 名前の重複チェック
     */
    isNameExists(name, excludeId) {
        return this.findAll().some((sl) => sl.name === name && sl.storageLocationId !== excludeId);
    }
    /**
     * 最終棚卸し日を更新
     */
    updateLastInventoryDate(storageLocationId, date) {
        return this.update(storageLocationId, { lastInventoryDate: date });
    }
}
exports.StorageLocationRepository = StorageLocationRepository;


/***/ },

/***/ 721
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 加工費型定義
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PROCESSING_COST_HEADERS = exports.PROCESSING_COST_COLUMNS = void 0;
exports.rowToProcessingCost = rowToProcessingCost;
exports.processingCostToRow = processingCostToRow;
/**
 * 加工費のスプレッドシート列インデックス
 */
exports.PROCESSING_COST_COLUMNS = {
    PROCESSING_COST_ID: 0, // A
    PRODUCT_ID: 1, // B
    PROCESSING_TYPE: 2, // C
    PROCESSOR_ID: 3, // D
    PROCESSING_CONTENT: 4, // E
    AMOUNT: 5, // F
    CREATED_AT: 6, // G
};
/**
 * 加工費ヘッダー
 */
exports.PROCESSING_COST_HEADERS = [
    '加工費ID',
    '製品ID',
    '加工種別',
    '加工業者ID',
    '加工内容',
    '金額',
    '作成日時',
];
/**
 * 行データを加工費オブジェクトに変換
 */
function rowToProcessingCost(row) {
    var _a, _b, _c, _d;
    const parseDate = (value) => {
        if (!value)
            return new Date();
        if (value instanceof Date)
            return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };
    const C = exports.PROCESSING_COST_COLUMNS;
    return {
        processingCostId: String((_a = row[C.PROCESSING_COST_ID]) !== null && _a !== void 0 ? _a : ''),
        productId: String((_b = row[C.PRODUCT_ID]) !== null && _b !== void 0 ? _b : ''),
        processingType: (_c = row[C.PROCESSING_TYPE]) !== null && _c !== void 0 ? _c : 'その他',
        processorId: String((_d = row[C.PROCESSOR_ID]) !== null && _d !== void 0 ? _d : ''),
        processingContent: row[C.PROCESSING_CONTENT]
            ? String(row[C.PROCESSING_CONTENT])
            : undefined,
        amount: Number(row[C.AMOUNT]) || 0,
        createdAt: parseDate(row[C.CREATED_AT]),
    };
}
/**
 * 加工費オブジェクトを行データに変換
 */
function processingCostToRow(cost) {
    var _a;
    const C = exports.PROCESSING_COST_COLUMNS;
    const row = new Array(7).fill('');
    row[C.PROCESSING_COST_ID] = cost.processingCostId;
    row[C.PRODUCT_ID] = cost.productId;
    row[C.PROCESSING_TYPE] = cost.processingType;
    row[C.PROCESSOR_ID] = cost.processorId;
    row[C.PROCESSING_CONTENT] = (_a = cost.processingContent) !== null && _a !== void 0 ? _a : '';
    row[C.AMOUNT] = cost.amount;
    row[C.CREATED_AT] = cost.createdAt;
    return row;
}


/***/ },

/***/ 780
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 製品（一枚板）型定義
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PRODUCT_HEADERS = exports.PRODUCT_COLUMNS = exports.PRODUCT_STATUSES = void 0;
exports.rowToProduct = rowToProduct;
exports.productToRow = productToRow;
/**
 * 製品ステータス
 */
exports.PRODUCT_STATUSES = [
    '販売中',
    '販売済み',
    '棚卸し中',
    '削除済み',
    '紛失',
];
/**
 * 製品のスプレッドシート列インデックス
 */
exports.PRODUCT_COLUMNS = {
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
};
/**
 * 製品ヘッダー（スプレッドシート1行目）
 */
exports.PRODUCT_HEADERS = [
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
];
/**
 * 行データを製品オブジェクトに変換
 */
function rowToProduct(row) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const parseDate = (value) => {
        if (!value)
            return undefined;
        if (value instanceof Date)
            return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    };
    const parseNumber = (value) => {
        if (value === '' || value === null || value === undefined)
            return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    };
    const C = exports.PRODUCT_COLUMNS;
    return {
        productId: String((_a = row[C.PRODUCT_ID]) !== null && _a !== void 0 ? _a : ''),
        majorCategory: (_b = row[C.MAJOR_CATEGORY]) !== null && _b !== void 0 ? _b : 'その他',
        minorCategory: row[C.MINOR_CATEGORY]
            ? row[C.MINOR_CATEGORY]
            : undefined,
        productName: String((_c = row[C.PRODUCT_NAME]) !== null && _c !== void 0 ? _c : ''),
        woodType: String((_d = row[C.WOOD_TYPE]) !== null && _d !== void 0 ? _d : ''),
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
        supplierId: String((_e = row[C.SUPPLIER_ID]) !== null && _e !== void 0 ? _e : ''),
        purchaseDate: (_f = parseDate(row[C.PURCHASE_DATE])) !== null && _f !== void 0 ? _f : new Date(),
        purchasePrice: (_g = parseNumber(row[C.PURCHASE_PRICE])) !== null && _g !== void 0 ? _g : 0,
        storageLocationId: String((_h = row[C.STORAGE_LOCATION_ID]) !== null && _h !== void 0 ? _h : ''),
        shippingCost: parseNumber(row[C.SHIPPING_COST]),
        profitMargin: parseNumber(row[C.PROFIT_MARGIN]),
        priceAdjustment: parseNumber(row[C.PRICE_ADJUSTMENT]),
        status: (_j = row[C.STATUS]) !== null && _j !== void 0 ? _j : '販売中',
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
        createdAt: (_k = parseDate(row[C.CREATED_AT])) !== null && _k !== void 0 ? _k : new Date(),
        updatedAt: parseDate(row[C.UPDATED_AT]),
        createdBy: row[C.CREATED_BY] ? String(row[C.CREATED_BY]) : undefined,
        updatedBy: row[C.UPDATED_BY] ? String(row[C.UPDATED_BY]) : undefined,
    };
}
/**
 * 製品オブジェクトを行データに変換
 */
function productToRow(product) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
    const C = exports.PRODUCT_COLUMNS;
    const row = new Array(33).fill('');
    row[C.PRODUCT_ID] = product.productId;
    row[C.MAJOR_CATEGORY] = product.majorCategory;
    row[C.MINOR_CATEGORY] = (_a = product.minorCategory) !== null && _a !== void 0 ? _a : '';
    row[C.PRODUCT_NAME] = product.productName;
    row[C.WOOD_TYPE] = product.woodType;
    row[C.RAW_LENGTH] = (_c = (_b = product.rawSize) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : '';
    row[C.RAW_WIDTH] = (_e = (_d = product.rawSize) === null || _d === void 0 ? void 0 : _d.width) !== null && _e !== void 0 ? _e : '';
    row[C.RAW_THICKNESS] = (_g = (_f = product.rawSize) === null || _f === void 0 ? void 0 : _f.thickness) !== null && _g !== void 0 ? _g : '';
    row[C.FINISHED_LENGTH] = (_j = (_h = product.finishedSize) === null || _h === void 0 ? void 0 : _h.length) !== null && _j !== void 0 ? _j : '';
    row[C.FINISHED_WIDTH] = (_l = (_k = product.finishedSize) === null || _k === void 0 ? void 0 : _k.width) !== null && _l !== void 0 ? _l : '';
    row[C.FINISHED_THICKNESS] = (_o = (_m = product.finishedSize) === null || _m === void 0 ? void 0 : _m.thickness) !== null && _o !== void 0 ? _o : '';
    row[C.RAW_PHOTO_URLS] = (_p = product.rawPhotoUrls) !== null && _p !== void 0 ? _p : '';
    row[C.FINISHED_PHOTO_URLS] = (_q = product.finishedPhotoUrls) !== null && _q !== void 0 ? _q : '';
    row[C.SUPPLIER_ID] = product.supplierId;
    row[C.PURCHASE_DATE] = product.purchaseDate;
    row[C.PURCHASE_PRICE] = product.purchasePrice;
    row[C.STORAGE_LOCATION_ID] = product.storageLocationId;
    row[C.SHIPPING_COST] = (_r = product.shippingCost) !== null && _r !== void 0 ? _r : '';
    row[C.PROFIT_MARGIN] = (_s = product.profitMargin) !== null && _s !== void 0 ? _s : '';
    row[C.PRICE_ADJUSTMENT] = (_t = product.priceAdjustment) !== null && _t !== void 0 ? _t : '';
    row[C.STATUS] = product.status;
    row[C.SALES_DESTINATION] = (_u = product.salesDestination) !== null && _u !== void 0 ? _u : '';
    row[C.SALES_DATE] = (_v = product.salesDate) !== null && _v !== void 0 ? _v : '';
    row[C.ACTUAL_SALES_PRICE] = (_w = product.actualSalesPrice) !== null && _w !== void 0 ? _w : '';
    row[C.SALES_REMARKS] = (_x = product.salesRemarks) !== null && _x !== void 0 ? _x : '';
    row[C.LAST_INVENTORY_DATE] = (_y = product.lastInventoryDate) !== null && _y !== void 0 ? _y : '';
    row[C.DELETED_AT] = (_z = product.deletedAt) !== null && _z !== void 0 ? _z : '';
    row[C.DELETE_REASON] = (_0 = product.deleteReason) !== null && _0 !== void 0 ? _0 : '';
    row[C.REMARKS] = (_1 = product.remarks) !== null && _1 !== void 0 ? _1 : '';
    row[C.CREATED_AT] = product.createdAt;
    row[C.UPDATED_AT] = (_2 = product.updatedAt) !== null && _2 !== void 0 ? _2 : '';
    row[C.CREATED_BY] = (_3 = product.createdBy) !== null && _3 !== void 0 ? _3 : '';
    row[C.UPDATED_BY] = (_4 = product.updatedBy) !== null && _4 !== void 0 ? _4 : '';
    return row;
}


/***/ },

/***/ 781
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * ID採番ユーティリティ
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatSequenceNumber = formatSequenceNumber;
exports.generateProductId = generateProductId;
exports.generateProcessingCostId = generateProcessingCostId;
exports.generateInventorySessionId = generateInventorySessionId;
exports.generateLogId = generateLogId;
exports.parseProductIdNumber = parseProductIdNumber;
exports.parseProcessingCostIdNumber = parseProcessingCostIdNumber;
exports.getNextSequenceNumber = getNextSequenceNumber;
exports.parseInventorySessionId = parseInventorySessionId;
exports.getNextInventorySessionSequence = getNextInventorySessionSequence;
/**
 * シーケンス番号をゼロパディングでフォーマット
 */
function formatSequenceNumber(num, digits) {
    return num.toString().padStart(digits, '0');
}
/**
 * 製品IDを生成 (ITA-0001 形式)
 */
function generateProductId(sequenceNumber) {
    if (sequenceNumber <= 0) {
        throw new Error('Sequence number must be positive');
    }
    return `ITA-${formatSequenceNumber(sequenceNumber, 4)}`;
}
/**
 * 加工費IDを生成 (COST-000001 形式)
 */
function generateProcessingCostId(sequenceNumber) {
    if (sequenceNumber <= 0) {
        throw new Error('Sequence number must be positive');
    }
    return `COST-${formatSequenceNumber(sequenceNumber, 6)}`;
}
/**
 * 棚卸しセッションIDを生成 (INV-YYYYMMDD-001 形式)
 */
function generateInventorySessionId(date, dailySequence) {
    if (dailySequence <= 0) {
        throw new Error('Daily sequence number must be positive');
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    return `INV-${dateStr}-${formatSequenceNumber(dailySequence, 3)}`;
}
/**
 * ログIDを生成 (LOG-000000001 形式)
 */
function generateLogId(sequenceNumber) {
    if (sequenceNumber <= 0) {
        throw new Error('Sequence number must be positive');
    }
    return `LOG-${formatSequenceNumber(sequenceNumber, 9)}`;
}
/**
 * 製品IDから番号部分を抽出
 */
function parseProductIdNumber(productId) {
    if (!productId || typeof productId !== 'string') {
        return null;
    }
    const match = productId.match(/^ITA-(\d+)$/);
    if (!match) {
        return null;
    }
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
}
/**
 * 加工費IDから番号部分を抽出
 */
function parseProcessingCostIdNumber(costId) {
    if (!costId || typeof costId !== 'string') {
        return null;
    }
    const match = costId.match(/^COST-(\d+)$/);
    if (!match) {
        return null;
    }
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
}
/**
 * 既存IDリストから次のシーケンス番号を取得
 */
function getNextSequenceNumber(existingIds, prefix) {
    if (existingIds.length === 0) {
        return 1;
    }
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)`);
    for (const id of existingIds) {
        const match = id.match(regex);
        if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    }
    return maxNum + 1;
}
/**
 * 棚卸しセッションIDから日付と番号を抽出
 */
function parseInventorySessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
        return null;
    }
    const match = sessionId.match(/^INV-(\d{8})-(\d+)$/);
    if (!match) {
        return null;
    }
    const dateStr = match[1];
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const date = new Date(year, month, day);
    const sequence = parseInt(match[2], 10);
    if (isNaN(date.getTime()) || isNaN(sequence)) {
        return null;
    }
    return { date, sequence };
}
/**
 * 今日の棚卸しセッションの次の番号を取得
 */
function getNextInventorySessionSequence(existingSessionIds, date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const prefix = `INV-${dateStr}`;
    let maxSequence = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    for (const id of existingSessionIds) {
        const match = id.match(regex);
        if (match) {
            const seq = parseInt(match[1], 10);
            if (!isNaN(seq) && seq > maxSequence) {
                maxSequence = seq;
            }
        }
    }
    return maxSequence + 1;
}


/***/ },

/***/ 798
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 共通型定義
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VALIDATION_CONSTRAINTS = exports.DEFAULTS = exports.TARGET_TYPES = exports.OPERATION_TYPES = exports.CONFIRMATION_METHODS = exports.PROCESSING_TYPES = exports.MINOR_CATEGORIES = exports.MAJOR_CATEGORIES = exports.SHEET_NAMES = void 0;
/**
 * シート名列挙
 */
exports.SHEET_NAMES = {
    PRODUCTS: '製品マスター',
    PROCESSING_COSTS: '加工費詳細',
    WOOD_TYPES: '樹種マスター',
    SUPPLIERS: '仕入れ先マスター',
    PROCESSORS: '加工業者マスター',
    STORAGE_LOCATIONS: '保管場所マスター',
    INVENTORY_SESSIONS: '棚卸しセッション',
    INVENTORY_DETAILS: '棚卸し詳細',
    OPERATION_LOGS: '操作ログ',
    LOCATION_HISTORY: '保管場所移動履歴',
    SALES_CANCEL_HISTORY: '販売キャンセル履歴',
    PHOTOS: '写真管理',
    SEQUENCES: 'シーケンス管理',
};
/**
 * 大分類
 */
exports.MAJOR_CATEGORIES = [
    'テーブル',
    'カウンター',
    'スツール',
    '足',
    'その他',
];
/**
 * 中分類
 */
exports.MINOR_CATEGORIES = ['家具', '雑貨', '加工材料', 'その他'];
/**
 * 加工種別
 */
exports.PROCESSING_TYPES = [
    '木材加工',
    '塗装',
    '足',
    'ガラス',
    'その他',
];
/**
 * 確認方法
 */
exports.CONFIRMATION_METHODS = ['QRスキャン', '手入力', '一覧選択'];
/**
 * 操作種別
 */
exports.OPERATION_TYPES = [
    '登録',
    '更新',
    '削除',
    '販売',
    'キャンセル',
    '棚卸し',
];
/**
 * 対象種別
 */
exports.TARGET_TYPES = ['製品', '加工費', 'マスター'];
/**
 * デフォルト値
 */
exports.DEFAULTS = {
    PROFIT_MARGIN: 60, // 利益率 60%
    TAX_RATE: 0.1, // 消費税 10%
    PAGE_SIZE: 20,
    MAX_BATCH_SALES: 20,
    SALES_CANCEL_DAYS: 7,
    LONG_STOCK_DAYS: 180,
    INVENTORY_ALERT_DAYS: 90,
};
/**
 * バリデーション制約
 */
exports.VALIDATION_CONSTRAINTS = {
    SIZE: { min: 1, max: 99999 },
    PRICE: { min: 0, max: 99999999 },
    SHIPPING_COST: { min: 0, max: 9999999 },
    PROFIT_MARGIN: { min: 0, max: 99 },
    PRICE_ADJUSTMENT: { min: -9999999, max: 9999999 },
    PRODUCT_NAME: { minLength: 1, maxLength: 100 },
    REMARKS: { maxLength: 500 },
    SALES_DESTINATION: { minLength: 1, maxLength: 100 },
    PROCESSING_CONTENT: { maxLength: 200 },
    VENDOR_NAME: { minLength: 1, maxLength: 50 },
    CONTACT: { maxLength: 100 },
    ADDRESS: { maxLength: 200 },
};


/***/ },

/***/ 871
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * SalesService - 販売ビジネスロジック
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SalesService = exports.SalesServiceError = void 0;
const ProductRepository_1 = __webpack_require__(453);
/**
 * 販売サービスエラー
 */
class SalesServiceError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'SalesServiceError';
    }
}
exports.SalesServiceError = SalesServiceError;
/**
 * 販売サービス
 */
class SalesService {
    constructor(spreadsheetId) {
        this.CANCEL_LIMIT_DAYS = 7; // 販売キャンセル可能期間
        this.productRepo = new ProductRepository_1.ProductRepository(spreadsheetId);
    }
    /**
     * 製品を販売
     */
    sellProduct(productId, salesData) {
        const product = this.productRepo.findById(productId);
        if (!product) {
            throw new SalesServiceError('製品が見つかりません', 'NOT_FOUND', { productId });
        }
        if (product.status !== '販売中') {
            throw new SalesServiceError('販売可能な状態ではありません', 'NOT_AVAILABLE', { productId, currentStatus: product.status });
        }
        // バリデーション
        if (!salesData.soldDate) {
            throw new SalesServiceError('販売日を指定してください', 'MISSING_SOLD_DATE');
        }
        if (!salesData.soldPrice || salesData.soldPrice <= 0) {
            throw new SalesServiceError('販売価格は0より大きい値を指定してください', 'INVALID_SOLD_PRICE', { soldPrice: salesData.soldPrice });
        }
        // 販売処理
        const sold = this.productRepo.sell(productId, salesData);
        if (!sold) {
            throw new SalesServiceError('販売処理に失敗しました', 'SELL_FAILED', { productId });
        }
        return sold;
    }
    /**
     * 複数製品を一括販売
     */
    sellProducts(productIds, salesData, soldPrices) {
        const soldProducts = [];
        const errors = [];
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
            }
            catch (error) {
                const errorMessage = error instanceof SalesServiceError
                    ? error.message
                    : '不明なエラー';
                errors.push({ productId, error: errorMessage });
            }
        }
        if (errors.length > 0 && soldProducts.length === 0) {
            throw new SalesServiceError('販売処理に全て失敗しました', 'BULK_SELL_FAILED', { errors });
        }
        return soldProducts;
    }
    /**
     * 販売をキャンセル
     */
    cancelSale(productId, reason) {
        const product = this.productRepo.findById(productId);
        if (!product) {
            throw new SalesServiceError('製品が見つかりません', 'NOT_FOUND', { productId });
        }
        if (product.status !== '販売済み') {
            throw new SalesServiceError('販売済みの状態ではありません', 'NOT_SOLD', { productId, currentStatus: product.status });
        }
        // キャンセル期限チェック
        if (product.salesDate) {
            const salesDate = new Date(product.salesDate);
            const today = new Date();
            const diffTime = today.getTime() - salesDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > this.CANCEL_LIMIT_DAYS) {
                throw new SalesServiceError(`販売から${this.CANCEL_LIMIT_DAYS}日以上経過しているためキャンセルできません`, 'CANCEL_PERIOD_EXPIRED', { productId, salesDate, daysPassed: diffDays });
            }
        }
        if (!reason || reason.trim().length === 0) {
            throw new SalesServiceError('キャンセル理由を入力してください', 'MISSING_REASON');
        }
        // キャンセル処理
        const cancelled = this.productRepo.cancelSale(productId, reason);
        if (!cancelled) {
            throw new SalesServiceError('キャンセル処理に失敗しました', 'CANCEL_FAILED', { productId });
        }
        return cancelled;
    }
    /**
     * 販売済み製品一覧を取得
     */
    getSoldProducts() {
        return this.productRepo.findByStatus('販売済み');
    }
    /**
     * 期間内の販売製品を取得
     */
    getSoldProductsByDateRange(startDate, endDate) {
        const soldProducts = this.getSoldProducts();
        return soldProducts.filter((p) => {
            if (!p.salesDate)
                return false;
            const salesDate = new Date(p.salesDate);
            return salesDate >= startDate && salesDate <= endDate;
        });
    }
    /**
     * 売上統計を取得
     */
    getSalesStats(startDate, endDate) {
        let products;
        if (startDate && endDate) {
            products = this.getSoldProductsByDateRange(startDate, endDate);
        }
        else {
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
        const totalRevenue = products.reduce((sum, p) => sum + (p.actualSalesPrice || 0), 0);
        const totalCost = products.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const averagePrice = Math.round(totalRevenue / totalSales);
        const averageProfitMargin = totalRevenue > 0
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
    getMonthlySales(year) {
        const soldProducts = this.getSoldProducts();
        const monthlySales = new Map();
        // 初期化
        for (let month = 1; month <= 12; month++) {
            monthlySales.set(month, { count: 0, revenue: 0 });
        }
        // 集計
        for (const product of soldProducts) {
            if (!product.salesDate)
                continue;
            const salesDate = new Date(product.salesDate);
            if (salesDate.getFullYear() !== year)
                continue;
            const month = salesDate.getMonth() + 1;
            const current = monthlySales.get(month);
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
    getSalesByWoodType() {
        const soldProducts = this.getSoldProducts();
        const salesByWoodType = new Map();
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
exports.SalesService = SalesService;


/***/ },

/***/ 877
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * マスターデータ型定義
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INITIAL_STORAGE_LOCATIONS = exports.INITIAL_WOOD_TYPES = exports.STORAGE_LOCATION_HEADERS = exports.STORAGE_LOCATION_COLUMNS = exports.PROCESSOR_HEADERS = exports.PROCESSOR_COLUMNS = exports.SUPPLIER_HEADERS = exports.SUPPLIER_COLUMNS = exports.WOOD_TYPE_HEADERS = exports.WOOD_TYPE_COLUMNS = void 0;
exports.rowToWoodType = rowToWoodType;
exports.woodTypeToRow = woodTypeToRow;
exports.rowToSupplier = rowToSupplier;
exports.supplierToRow = supplierToRow;
exports.rowToProcessor = rowToProcessor;
exports.processorToRow = processorToRow;
exports.rowToStorageLocation = rowToStorageLocation;
exports.storageLocationToRow = storageLocationToRow;
// ==================== 樹種マスター ====================
exports.WOOD_TYPE_COLUMNS = {
    WOOD_TYPE_ID: 0,
    NAME: 1,
    DISPLAY_ORDER: 2,
};
exports.WOOD_TYPE_HEADERS = ['樹種ID', '樹種名', '表示順'];
function rowToWoodType(row) {
    var _a, _b;
    const C = exports.WOOD_TYPE_COLUMNS;
    return {
        woodTypeId: String((_a = row[C.WOOD_TYPE_ID]) !== null && _a !== void 0 ? _a : ''),
        name: String((_b = row[C.NAME]) !== null && _b !== void 0 ? _b : ''),
        displayOrder: Number(row[C.DISPLAY_ORDER]) || 0,
    };
}
function woodTypeToRow(woodType) {
    const C = exports.WOOD_TYPE_COLUMNS;
    const row = new Array(3).fill('');
    row[C.WOOD_TYPE_ID] = woodType.woodTypeId;
    row[C.NAME] = woodType.name;
    row[C.DISPLAY_ORDER] = woodType.displayOrder;
    return row;
}
// ==================== 仕入れ先マスター ====================
exports.SUPPLIER_COLUMNS = {
    SUPPLIER_ID: 0,
    NAME: 1,
    CONTACT: 2,
    ADDRESS: 3,
    REMARKS: 4,
};
exports.SUPPLIER_HEADERS = ['仕入れ先ID', '業者名', '連絡先', '住所', '備考'];
function rowToSupplier(row) {
    var _a, _b;
    const C = exports.SUPPLIER_COLUMNS;
    return {
        supplierId: String((_a = row[C.SUPPLIER_ID]) !== null && _a !== void 0 ? _a : ''),
        name: String((_b = row[C.NAME]) !== null && _b !== void 0 ? _b : ''),
        contact: row[C.CONTACT] ? String(row[C.CONTACT]) : undefined,
        address: row[C.ADDRESS] ? String(row[C.ADDRESS]) : undefined,
        remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
    };
}
function supplierToRow(supplier) {
    var _a, _b, _c;
    const C = exports.SUPPLIER_COLUMNS;
    const row = new Array(5).fill('');
    row[C.SUPPLIER_ID] = supplier.supplierId;
    row[C.NAME] = supplier.name;
    row[C.CONTACT] = (_a = supplier.contact) !== null && _a !== void 0 ? _a : '';
    row[C.ADDRESS] = (_b = supplier.address) !== null && _b !== void 0 ? _b : '';
    row[C.REMARKS] = (_c = supplier.remarks) !== null && _c !== void 0 ? _c : '';
    return row;
}
// ==================== 加工業者マスター ====================
exports.PROCESSOR_COLUMNS = {
    PROCESSOR_ID: 0,
    NAME: 1,
    PROCESSING_TYPES: 2,
    CONTACT: 3,
    ADDRESS: 4,
    REMARKS: 5,
};
exports.PROCESSOR_HEADERS = [
    '加工業者ID',
    '業者名',
    '対応加工種別',
    '連絡先',
    '住所',
    '備考',
];
function rowToProcessor(row) {
    var _a, _b;
    const C = exports.PROCESSOR_COLUMNS;
    const typesStr = row[C.PROCESSING_TYPES] ? String(row[C.PROCESSING_TYPES]) : '';
    const processingTypes = typesStr
        ? typesStr.split(',').map((s) => s.trim())
        : [];
    return {
        processorId: String((_a = row[C.PROCESSOR_ID]) !== null && _a !== void 0 ? _a : ''),
        name: String((_b = row[C.NAME]) !== null && _b !== void 0 ? _b : ''),
        processingTypes,
        contact: row[C.CONTACT] ? String(row[C.CONTACT]) : undefined,
        address: row[C.ADDRESS] ? String(row[C.ADDRESS]) : undefined,
        remarks: row[C.REMARKS] ? String(row[C.REMARKS]) : undefined,
    };
}
function processorToRow(processor) {
    var _a, _b, _c;
    const C = exports.PROCESSOR_COLUMNS;
    const row = new Array(6).fill('');
    row[C.PROCESSOR_ID] = processor.processorId;
    row[C.NAME] = processor.name;
    row[C.PROCESSING_TYPES] = processor.processingTypes.join(',');
    row[C.CONTACT] = (_a = processor.contact) !== null && _a !== void 0 ? _a : '';
    row[C.ADDRESS] = (_b = processor.address) !== null && _b !== void 0 ? _b : '';
    row[C.REMARKS] = (_c = processor.remarks) !== null && _c !== void 0 ? _c : '';
    return row;
}
// ==================== 保管場所マスター ====================
exports.STORAGE_LOCATION_COLUMNS = {
    STORAGE_LOCATION_ID: 0,
    NAME: 1,
    DISPLAY_ORDER: 2,
};
exports.STORAGE_LOCATION_HEADERS = ['保管場所ID', '場所名', '表示順'];
function rowToStorageLocation(row) {
    var _a, _b;
    const C = exports.STORAGE_LOCATION_COLUMNS;
    return {
        storageLocationId: String((_a = row[C.STORAGE_LOCATION_ID]) !== null && _a !== void 0 ? _a : ''),
        name: String((_b = row[C.NAME]) !== null && _b !== void 0 ? _b : ''),
        displayOrder: Number(row[C.DISPLAY_ORDER]) || 0,
    };
}
function storageLocationToRow(location) {
    const C = exports.STORAGE_LOCATION_COLUMNS;
    const row = new Array(3).fill('');
    row[C.STORAGE_LOCATION_ID] = location.storageLocationId;
    row[C.NAME] = location.name;
    row[C.DISPLAY_ORDER] = location.displayOrder;
    return row;
}
/**
 * 初期樹種データ
 */
exports.INITIAL_WOOD_TYPES = [
    'ウォルナット',
    'モンキーポッド',
    '杉',
    '欅',
    'ポプラ',
    'パイン',
    'その他',
];
/**
 * 初期保管場所データ
 */
exports.INITIAL_STORAGE_LOCATIONS = [
    'ショールーム',
    '豊中工場1階',
    '豊中工場2階',
    'モデルハウスA',
    'モデルハウスB',
    'その他',
];


/***/ },

/***/ 927
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * ProcessingCostService - 加工費ビジネスロジック
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcessingCostService = exports.ProcessingCostServiceError = void 0;
const ProcessingCostRepository_1 = __webpack_require__(230);
const ProductRepository_1 = __webpack_require__(453);
const PriceCalculator_1 = __webpack_require__(983);
/**
 * 加工費サービスエラー
 */
class ProcessingCostServiceError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ProcessingCostServiceError';
    }
}
exports.ProcessingCostServiceError = ProcessingCostServiceError;
/**
 * 加工費サービス
 */
class ProcessingCostService {
    constructor(spreadsheetId) {
        this.processingCostRepo = new ProcessingCostRepository_1.ProcessingCostRepository(spreadsheetId);
        this.productRepo = new ProductRepository_1.ProductRepository(spreadsheetId);
    }
    /**
     * 製品の加工費一覧を取得
     */
    getProcessingCosts(productId) {
        return this.processingCostRepo.findByProductId(productId);
    }
    /**
     * 製品の加工費サマリーを取得
     */
    getProductSummary(productId) {
        return this.processingCostRepo.getProductSummary(productId);
    }
    /**
     * 加工費を登録
     */
    createProcessingCost(dto) {
        // 製品の存在確認
        const product = this.productRepo.findById(dto.productId);
        if (!product) {
            throw new ProcessingCostServiceError('製品が見つかりません', 'PRODUCT_NOT_FOUND', { productId: dto.productId });
        }
        // バリデーション
        if (!dto.amount || dto.amount < 0) {
            throw new ProcessingCostServiceError('金額は0以上の数値を指定してください', 'INVALID_AMOUNT', { amount: dto.amount });
        }
        if (!dto.processingType) {
            throw new ProcessingCostServiceError('加工種別を指定してください', 'MISSING_PROCESSING_TYPE');
        }
        if (!dto.processorId) {
            throw new ProcessingCostServiceError('加工業者を指定してください', 'MISSING_PROCESSOR');
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
    updateProcessingCost(costId, dto) {
        const existing = this.processingCostRepo.findById(costId);
        if (!existing) {
            throw new ProcessingCostServiceError('加工費が見つかりません', 'NOT_FOUND', { costId });
        }
        // バリデーション
        if (dto.amount !== undefined && dto.amount < 0) {
            throw new ProcessingCostServiceError('金額は0以上の数値を指定してください', 'INVALID_AMOUNT', { amount: dto.amount });
        }
        const updated = this.processingCostRepo.update(costId, dto);
        if (!updated) {
            throw new ProcessingCostServiceError('更新に失敗しました', 'UPDATE_FAILED', { costId });
        }
        // 製品の価格を再計算
        this.recalculateProductPrices(existing.productId);
        return updated;
    }
    /**
     * 加工費を削除
     */
    deleteProcessingCost(costId) {
        const existing = this.processingCostRepo.findById(costId);
        if (!existing) {
            throw new ProcessingCostServiceError('加工費が見つかりません', 'NOT_FOUND', { costId });
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
    recalculateProductPrices(productId) {
        const product = this.productRepo.findById(productId);
        if (!product)
            return;
        const costs = this.processingCostRepo.findByProductId(productId);
        // 価格を計算（計算結果は使用しないが、将来の拡張用）
        (0, PriceCalculator_1.calculateAllPrices)({
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
    getProcessorStats() {
        const allCosts = this.processingCostRepo.findAll();
        const stats = new Map();
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
    getProcessingTypeStats() {
        const allCosts = this.processingCostRepo.findAll();
        const stats = new Map();
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
exports.ProcessingCostService = ProcessingCostService;


/***/ },

/***/ 983
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * 価格計算サービス
 * 要件定義書4.3に基づく原価・販売価格計算
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculateProcessingCostTotal = calculateProcessingCostTotal;
exports.calculateTotalCost = calculateTotalCost;
exports.calculateSuggestedPrice = calculateSuggestedPrice;
exports.calculateSellingPriceExTax = calculateSellingPriceExTax;
exports.calculateSellingPriceIncTax = calculateSellingPriceIncTax;
exports.calculateGrossProfit = calculateGrossProfit;
exports.calculateActualMarginPercent = calculateActualMarginPercent;
exports.calculateAllPrices = calculateAllPrices;
exports.recalculatePricesForProduct = recalculatePricesForProduct;
const common_1 = __webpack_require__(798);
/**
 * 加工費合計を計算
 */
function calculateProcessingCostTotal(costs) {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
}
/**
 * トータル原価を計算
 * 計算式: トータル原価 = 入荷単価 + 加工費合計 + 販売時送料
 */
function calculateTotalCost(purchasePrice, processingCostTotal, shippingCost) {
    return purchasePrice + processingCostTotal + shippingCost;
}
/**
 * 目安販売価格を計算（税抜）
 * 計算式: 目安販売価格 = トータル原価 ÷ (1 - 利益率)
 */
function calculateSuggestedPrice(totalCost, profitMargin) {
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
function calculateSellingPriceExTax(suggestedPrice, priceAdjustment) {
    return suggestedPrice + (priceAdjustment !== null && priceAdjustment !== void 0 ? priceAdjustment : 0);
}
/**
 * 販売価格（税込）を計算
 * 計算式: 販売価格（税込） = 販売価格（税抜） × 1.1
 */
function calculateSellingPriceIncTax(sellingPriceExTax) {
    return Math.round(sellingPriceExTax * (1 + common_1.DEFAULTS.TAX_RATE));
}
/**
 * 粗利を計算
 */
function calculateGrossProfit(sellingPriceExTax, totalCost) {
    return sellingPriceExTax - totalCost;
}
/**
 * 実際の利益率を計算
 */
function calculateActualMarginPercent(sellingPriceExTax, totalCost) {
    if (sellingPriceExTax === 0) {
        return 0;
    }
    return ((sellingPriceExTax - totalCost) / sellingPriceExTax) * 100;
}
/**
 * すべての価格を一括計算
 */
function calculateAllPrices(input) {
    const { purchasePrice, processingCosts, shippingCost = 0, profitMargin = common_1.DEFAULTS.PROFIT_MARGIN, priceAdjustment = 0, } = input;
    // 加工費合計
    const processingCostTotal = calculateProcessingCostTotal(processingCosts);
    // トータル原価
    const totalCost = calculateTotalCost(purchasePrice, processingCostTotal, shippingCost);
    // 目安販売価格（税抜）
    const suggestedPrice = calculateSuggestedPrice(totalCost, profitMargin);
    // 販売価格（税抜）
    const sellingPriceExTax = calculateSellingPriceExTax(suggestedPrice, priceAdjustment);
    // 販売価格（税込）
    const sellingPriceIncTax = calculateSellingPriceIncTax(sellingPriceExTax);
    // 粗利
    const grossProfit = calculateGrossProfit(sellingPriceExTax, totalCost);
    // 実際の利益率
    const actualMarginPercent = calculateActualMarginPercent(sellingPriceExTax, totalCost);
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
function recalculatePricesForProduct(purchasePrice, processingCosts, shippingCost, profitMargin, priceAdjustment) {
    return calculateAllPrices({
        purchasePrice,
        processingCosts,
        shippingCost,
        profitMargin,
        priceAdjustment,
    });
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(561);
/******/ 	
/******/ })()
;