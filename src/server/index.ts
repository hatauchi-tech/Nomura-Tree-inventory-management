/**
 * GASエントリーポイント
 * Webアプリケーションのメインファイル
 */

// 型のエクスポート
export * from './types';

// サービス・リポジトリのインポート
import { ProductService } from './services/ProductService';
import { ProcessingCostService } from './services/ProcessingCostService';
import { InventoryService } from './services/InventoryService';
import { SalesService, SalesData } from './services/SalesService';
import {
  WoodTypeRepository,
  SupplierRepository,
  ProcessorRepository,
  StorageLocationRepository,
  MajorCategoryRepository,
} from './repositories/MasterRepository';
import {
  ProductSearchCondition,
  CreateProductDto,
  UpdateProductDto,
  PRODUCT_STATUSES,
  ProductStatus,
} from './types/product';
import { CreateProcessingCostDto } from './types/processingCost';
import {
  CreateWoodTypeDto,
  CreateSupplierDto,
  CreateProcessorDto,
  CreateStorageLocationDto,
  CreateMajorCategoryDto,
} from './types/master';
import { ConfirmationMethod, PaginationOptions, MAJOR_CATEGORIES } from './types/common';
import { setupAllSheets, setupSheetsOnly, clearAllData } from './setupData';

// ==================== 設定 ====================

/**
 * デフォルトのスプレッドシートID
 */
const DEFAULT_SPREADSHEET_ID = '1a9ItLJgDd3oxOBhk1S2LhvsBRZohFtGCqzslxSqrT8g';

/**
 * 初期セットアップ - スプレッドシートIDをScript Propertiesに設定
 * GASエディタから一度だけ実行してください
 */
function setupSpreadsheetId(spreadsheetId?: string) {
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
function getSpreadsheetId(): string {
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
function getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
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
function getCurrentUserEmail(): string {
  try {
    return Session.getActiveUser().getEmail() || 'unknown@example.com';
  } catch {
    return 'unknown@example.com';
  }
}

/**
 * 現在日時を取得（日本時間）
 */
function getCurrentDateTime(): Date {
  return new Date();
}

/**
 * 日付をフォーマット
 */
function formatDate(date: Date, format: string = 'yyyy/MM/dd'): string {
  return Utilities.formatDate(date, 'Asia/Tokyo', format);
}

// ==================== Webアプリケーション ====================

/**
 * Webアプリのエントリーポイント
 */
function doGet(
  e: GoogleAppsScript.Events.DoGet
): GoogleAppsScript.HTML.HtmlOutput {
  const page = e?.parameter?.page || 'index';
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
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== 製品API ====================

/**
 * 製品検索
 */
function searchProducts(
  conditions: ProductSearchCondition = {},
  pagination: PaginationOptions = { page: 1, limit: 20 }
) {
  try {
    console.log('searchProducts called:', JSON.stringify(conditions), JSON.stringify(pagination));
    const spreadsheetId = getSpreadsheetId();
    console.log('spreadsheetId:', spreadsheetId);
    const service = new ProductService(spreadsheetId);
    const result = service.searchProducts(conditions, pagination);
    console.log('searchProducts result:', JSON.stringify(result));
    // Date オブジェクトをJSON互換に変換
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('searchProducts error:', error);
    throw error;
  }
}

/**
 * 製品詳細取得
 */
function getProductDetail(productId: string) {
  try {
    const service = new ProductService(getSpreadsheetId());
    const result = service.getProductDetail(productId);
    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    console.error('getProductDetail error:', error);
    throw error;
  }
}

/**
 * 製品登録
 */
function createProduct(dto: CreateProductDto) {
  try {
    // クライアントからの日付文字列をDateに変換
    if (dto.purchaseDate) {
      dto.purchaseDate = new Date(dto.purchaseDate as any);
    }
    const service = new ProductService(getSpreadsheetId());
    const result = service.createProduct(dto);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('createProduct error:', error);
    throw error;
  }
}

/**
 * 製品更新
 */
function updateProduct(productId: string, dto: UpdateProductDto) {
  try {
    const service = new ProductService(getSpreadsheetId());
    const result = service.updateProduct(productId, dto);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('updateProduct error:', error);
    throw error;
  }
}

/**
 * 製品削除（論理削除）
 */
function deleteProduct(productId: string, reason: string) {
  try {
    const service = new ProductService(getSpreadsheetId());
    const result = service.deleteProduct(productId, reason);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('deleteProduct error:', error);
    throw error;
  }
}

/**
 * 製品ステータス変更
 */
function updateProductStatus(productId: string, newStatus: string) {
  try {
    // バリデーション
    if (!PRODUCT_STATUSES.includes(newStatus as ProductStatus)) {
      throw new Error('無効なステータスです: ' + newStatus);
    }
    if (newStatus === '削除済み') {
      throw new Error('削除済みへの変更は削除機能を使用してください');
    }

    const service = new ProductService(getSpreadsheetId());
    const current = service.getProductDetail(productId);
    if (!current) {
      throw new Error('製品が見つかりません: ' + productId);
    }

    const updateData: UpdateProductDto = { status: newStatus as ProductStatus };

    // 販売済みから他ステータスへの変更時: 販売データをクリア
    if (current.status === '販売済み' && newStatus !== '販売済み') {
      (updateData as any).salesDestination = '';
      (updateData as any).salesDate = '';
      (updateData as any).actualSalesPrice = '';
      (updateData as any).salesRemarks = '';
    }

    const result = service.updateProduct(productId, updateData);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('updateProductStatus error:', error);
    throw error;
  }
}

/**
 * ダッシュボード統計取得
 */
function getDashboardStats() {
  try {
    const service = new ProductService(getSpreadsheetId());
    const result = service.getDashboardStats();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getDashboardStats error:', error);
    throw error;
  }
}

// ==================== 販売API ====================

/**
 * 販売処理
 */
function sellProduct(productId: string, salesData: SalesData) {
  try {
    const service = new SalesService(getSpreadsheetId());
    // Convert string dates and prices from client
    const convertedData: SalesData = {
      ...salesData,
      soldDate: salesData.soldDate ? new Date(salesData.soldDate as any) : salesData.soldDate,
      soldPrice: Number(salesData.soldPrice),
      deliveryDate: salesData.deliveryDate ? new Date(salesData.deliveryDate as any) : undefined,
    };
    const result = service.sellProduct(productId, convertedData);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('sellProduct error:', error);
    throw error;
  }
}

/**
 * 販売キャンセル
 */
function cancelSale(productId: string, reason: string) {
  try {
    const service = new SalesService(getSpreadsheetId());
    const result = service.cancelSale(productId, reason);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('cancelSale error:', error);
    throw error;
  }
}

/**
 * 売上統計取得
 * クライアントからはISO文字列として日付を受け取り、Dateに変換する
 */
function getSalesStats(startDateStr?: string | null, endDateStr?: string | null) {
  try {
    const service = new SalesService(getSpreadsheetId());
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    const result = service.getSalesStats(startDate, endDate);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getSalesStats error:', error);
    throw error;
  }
}

/**
 * フィルタ付きで販売済み製品を取得
 */
function getSoldProductsWithFilter(
  startDateStr?: string | null,
  endDateStr?: string | null,
  woodType?: string | null
) {
  try {
    const service = new SalesService(getSpreadsheetId());
    let products = service.getSoldProducts();

    // 日付フィルタ
    if (startDateStr || endDateStr) {
      const startDate = startDateStr ? new Date(startDateStr) : null;
      const endDate = endDateStr ? new Date(endDateStr) : null;

      products = products.filter((p) => {
        if (!p.salesDate) return false;
        const salesDate = new Date(p.salesDate);
        if (startDate && salesDate < startDate) return false;
        if (endDate && salesDate > endDate) return false;
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
  } catch (error) {
    console.error('getSoldProductsWithFilter error:', error);
    throw error;
  }
}

// ==================== 加工費API ====================

/**
 * 製品の加工費一覧取得
 */
function getProcessingCosts(productId: string) {
  try {
    const service = new ProcessingCostService(getSpreadsheetId());
    const costs = service.getProcessingCosts(productId);
    const summary = service.getProductSummary(productId);
    return JSON.parse(JSON.stringify({ costs, summary }));
  } catch (error) {
    console.error('getProcessingCosts error:', error);
    throw error;
  }
}

/**
 * 加工費登録
 */
function createProcessingCost(dto: CreateProcessingCostDto) {
  try {
    const service = new ProcessingCostService(getSpreadsheetId());
    const result = service.createProcessingCost(dto);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('createProcessingCost error:', error);
    throw error;
  }
}

/**
 * 加工費削除
 */
function deleteProcessingCost(costId: string) {
  try {
    const service = new ProcessingCostService(getSpreadsheetId());
    const result = service.deleteProcessingCost(costId);
    return result;
  } catch (error) {
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
    const repo = new WoodTypeRepository(getSpreadsheetId());
    const result = repo.findAllSorted();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getWoodTypes error:', error);
    throw error;
  }
}

/**
 * 仕入れ先一覧取得
 */
function getSuppliers() {
  try {
    const repo = new SupplierRepository(getSpreadsheetId());
    const result = repo.findAll();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getSuppliers error:', error);
    throw error;
  }
}

/**
 * 加工業者一覧取得
 */
function getProcessors() {
  try {
    const repo = new ProcessorRepository(getSpreadsheetId());
    const result = repo.findAll();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getProcessors error:', error);
    throw error;
  }
}

/**
 * 保管場所一覧取得
 */
function getStorageLocations() {
  try {
    const repo = new StorageLocationRepository(getSpreadsheetId());
    const result = repo.findAllSorted();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getStorageLocations error:', error);
    throw error;
  }
}

/**
 * 大分類一覧取得
 */
function getMajorCategories() {
  try {
    const repo = new MajorCategoryRepository(getSpreadsheetId());
    const result = repo.findAllSorted();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getMajorCategories error:', error);
    throw error;
  }
}

/**
 * マスターデータ追加
 */
function addMasterData(
  type: 'woodType' | 'supplier' | 'processor' | 'storageLocation' | 'majorCategory',
  data: CreateWoodTypeDto | CreateSupplierDto | CreateProcessorDto | CreateStorageLocationDto | CreateMajorCategoryDto
) {
  try {
    const spreadsheetId = getSpreadsheetId();
    let result;

    switch (type) {
      case 'woodType': {
        const repo = new WoodTypeRepository(spreadsheetId);
        result = repo.createFromDto(data as CreateWoodTypeDto);
        break;
      }
      case 'supplier': {
        const repo = new SupplierRepository(spreadsheetId);
        result = repo.createFromDto(data as CreateSupplierDto);
        break;
      }
      case 'processor': {
        const repo = new ProcessorRepository(spreadsheetId);
        result = repo.createFromDto(data as CreateProcessorDto);
        break;
      }
      case 'storageLocation': {
        const repo = new StorageLocationRepository(spreadsheetId);
        result = repo.createFromDto(data as CreateStorageLocationDto);
        break;
      }
      case 'majorCategory': {
        const repo = new MajorCategoryRepository(spreadsheetId);
        result = repo.createFromDto(data as CreateMajorCategoryDto);
        break;
      }
      default:
        throw new Error(`Unknown master type: ${type}`);
    }
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('addMasterData error:', error);
    throw error;
  }
}

/**
 * マスターデータ削除
 */
function deleteMasterData(
  type: 'woodType' | 'supplier' | 'processor' | 'storageLocation' | 'majorCategory',
  id: string
) {
  try {
    const spreadsheetId = getSpreadsheetId();

    switch (type) {
      case 'woodType': {
        const repo = new WoodTypeRepository(spreadsheetId);
        return repo.delete(id);
      }
      case 'supplier': {
        const repo = new SupplierRepository(spreadsheetId);
        return repo.delete(id);
      }
      case 'processor': {
        const repo = new ProcessorRepository(spreadsheetId);
        return repo.delete(id);
      }
      case 'storageLocation': {
        const repo = new StorageLocationRepository(spreadsheetId);
        return repo.delete(id);
      }
      case 'majorCategory': {
        const repo = new MajorCategoryRepository(spreadsheetId);
        return repo.delete(id);
      }
      default:
        throw new Error(`Unknown master type: ${type}`);
    }
  } catch (error) {
    console.error('deleteMasterData error:', error);
    throw error;
  }
}

// ==================== 棚卸しAPI ====================

/**
 * 棚卸しセッション開始
 */
function startInventorySession(storageLocationId: string) {
  try {
    const service = new InventoryService(getSpreadsheetId());
    const result = service.startInventorySession(storageLocationId);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('startInventorySession error:', error);
    throw error;
  }
}

/**
 * 棚卸し進捗取得
 */
function getInventoryProgress(sessionId: string) {
  try {
    const service = new InventoryService(getSpreadsheetId());
    const result = service.getInventoryProgress(sessionId);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getInventoryProgress error:', error);
    throw error;
  }
}

/**
 * 製品確認
 */
function confirmInventoryProduct(
  sessionId: string,
  productId: string,
  method: ConfirmationMethod
) {
  try {
    const service = new InventoryService(getSpreadsheetId());
    const result = service.confirmInventoryProduct(sessionId, productId, method);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('confirmInventoryProduct error:', error);
    throw error;
  }
}

/**
 * 棚卸しセッション完了
 */
function completeInventorySession(sessionId: string) {
  try {
    const service = new InventoryService(getSpreadsheetId());
    const result = service.completeInventorySession(sessionId);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('completeInventorySession error:', error);
    throw error;
  }
}

/**
 * 進行中のセッション一覧取得
 */
function getActiveSessions() {
  try {
    const service = new InventoryService(getSpreadsheetId());
    const result = service.getActiveSessions();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('getActiveSessions error:', error);
    throw error;
  }
}

// ==================== 認証API ====================

/**
 * 現在のユーザーのOAuthトークンを取得
 * Google Picker APIで使用
 */
function getOAuthToken(): string {
  return ScriptApp.getOAuthToken();
}

// ==================== 写真アップロードAPI ====================

/**
 * 写真保存先フォルダIDを取得
 */
function getPhotoFolderId(): string {
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
      } catch (e) {
        console.log('Could not get spreadsheet folder, using root folder');
      }

      // それでも取得できない場合はルートフォルダを使用
      if (!folderId) {
        folderId = DriveApp.getRootFolder().getId();
      }
    }

    return folderId;
  } catch (error) {
    console.error('getPhotoFolderId error:', error);
    // フォールバック: ルートフォルダ
    return DriveApp.getRootFolder().getId();
  }
}

/**
 * 写真保存先フォルダIDを設定
 */
function setupPhotoFolderId(folderId: string) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('PHOTO_FOLDER_ID', folderId);
  return { success: true, folderId };
}

/**
 * 製品写真をアップロード
 */
function uploadProductPhoto(base64Data: string, filename: string, mimeType: string) {
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
  } catch (error: any) {
    console.error('uploadProductPhoto error:', error);
    const errorMessage = error && error.message ? error.message : String(error);
    throw new Error('写真アップロードエラー: ' + errorMessage);
  }
}

// ==================== カテゴリサジェストAPI ====================

/**
 * 製品データ＋マスターから大分類・中分類のユニーク値を取得
 */
function getUniqueCategoryValues() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const productService = new ProductService(spreadsheetId);
    const majorCategoryRepo = new MajorCategoryRepository(spreadsheetId);

    // デフォルト候補を初期値として設定
    const majorSet = new Set<string>(MAJOR_CATEGORIES);

    // 製品データからユニーク値を収集
    const allProducts = productService.searchProducts({}, { page: 1, limit: 10000 });

    allProducts.data.forEach((p: { majorCategory?: string }) => {
      if (p.majorCategory) majorSet.add(p.majorCategory);
    });

    // マスターデータからも追加
    const majorMasters = majorCategoryRepo.findAllSorted();
    majorMasters.forEach((m: { name: string }) => majorSet.add(m.name));

    return {
      majorCategories: Array.from(majorSet).sort(),
    };
  } catch (error) {
    console.error('getUniqueCategoryValues error:', error);
    throw error;
  }
}

// ==================== レポートAPI ====================

/**
 * 在庫レポート取得
 */
function getInventoryReport(conditions: ProductSearchCondition = {}) {
  try {
    const service = new ProductService(getSpreadsheetId());
    const result = service.searchProducts(conditions, { page: 1, limit: 10000 });

    // レポート形式で返す
    return JSON.parse(JSON.stringify({
      generatedAt: new Date(),
      totalCount: result.total,
      items: result.data,
      summary: service.getDashboardStats(),
    }));
  } catch (error) {
    console.error('getInventoryReport error:', error);
    throw error;
  }
}

/**
 * 製品PDF出力（個別製品）
 * 原価情報は含めず、販売価格・写真・サイズなどを出力
 */
function generateProductPdf(productId: string) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const service = new ProductService(spreadsheetId);
    const product = service.getProductDetail(productId);
    if (!product) {
      throw new Error('製品が見つかりません: ' + productId);
    }

    // 写真URLを解析
    const rawPhotos: string[] = product.rawPhotoUrls && product.rawPhotoUrls.startsWith('[')
      ? JSON.parse(product.rawPhotoUrls) : (product.rawPhotoUrls ? [product.rawPhotoUrls] : []);
    const finishedPhotos: string[] = product.finishedPhotoUrls && product.finishedPhotoUrls.startsWith('[')
      ? JSON.parse(product.finishedPhotoUrls) : (product.finishedPhotoUrls ? [product.finishedPhotoUrls] : []);

    // サイズ文字列を作成
    const rawSize = [product.rawSize?.length, product.rawSize?.width, product.rawSize?.thickness]
      .filter(v => v).map(v => v + 'mm').join(' × ') || '-';
    const finishedSize = [product.finishedSize?.length, product.finishedSize?.width, product.finishedSize?.thickness]
      .filter(v => v).map(v => v + 'mm').join(' × ') || '-';

    // 販売価格（税込）
    const priceIncTax = product.calculated?.sellingPriceIncTax
      ? '¥' + Math.round(product.calculated.sellingPriceIncTax).toLocaleString()
      : '-';
    const priceExTax = product.calculated?.sellingPriceExTax
      ? '¥' + Math.round(product.calculated.sellingPriceExTax).toLocaleString()
      : '-';

    // 写真HTMLを生成（最大3枚、Drive thumbnailを使用）
    let photoHtml = '';
    const allPhotos = rawPhotos.concat(finishedPhotos).slice(0, 3);
    for (const url of allPhotos) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        photoHtml += '<img src="https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w300" style="max-width:200px;max-height:150px;margin:4px;border-radius:4px;">';
      }
    }

    // HTML構築（原価情報は除外）
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans JP', sans-serif; margin: 40px; color: #333; }
          h1 { font-size: 24px; color: #2c5530; border-bottom: 2px solid #2c5530; padding-bottom: 8px; }
          .product-id { color: #888; font-size: 12px; }
          .section { margin: 16px 0; }
          .section-title { font-size: 14px; font-weight: 700; color: #2c5530; margin-bottom: 8px; border-left: 3px solid #2c5530; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          td:first-child { color: #666; width: 120px; }
          .price { font-size: 22px; font-weight: 700; color: #2c5530; }
          .photos { margin: 12px 0; }
          .footer { margin-top: 30px; font-size: 10px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${escapeHtmlForPdf(product.productName)}</h1>
        <p class="product-id">${escapeHtmlForPdf(product.productId)}</p>

        ${photoHtml ? '<div class="photos">' + photoHtml + '</div>' : ''}

        <div class="section">
          <div class="section-title">基本情報</div>
          <table>
            <tr><td>大分類</td><td>${escapeHtmlForPdf(product.majorCategory || '-')}</td></tr>
            <tr><td>樹種</td><td>${escapeHtmlForPdf(product.woodType || '-')}</td></tr>
            <tr><td>保管場所</td><td>${escapeHtmlForPdf(product.storageLocationId || '-')}</td></tr>
            <tr><td>ステータス</td><td>${escapeHtmlForPdf(product.status || '-')}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">サイズ</div>
          <table>
            <tr><td>入荷時</td><td>${escapeHtmlForPdf(rawSize)}</td></tr>
            <tr><td>仕上げ後</td><td>${escapeHtmlForPdf(finishedSize)}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">価格</div>
          <table>
            <tr><td>販売価格（税抜）</td><td>${escapeHtmlForPdf(priceExTax)}</td></tr>
            <tr><td>販売価格（税込）</td><td class="price">${escapeHtmlForPdf(priceIncTax)}</td></tr>
          </table>
        </div>

        ${product.remarks ? '<div class="section"><div class="section-title">備考</div><p style="font-size:13px;">' + escapeHtmlForPdf(product.remarks) + '</p></div>' : ''}

        <div class="footer">野村木材 在庫管理システム - ${new Date().toLocaleDateString('ja-JP')}</div>
      </body>
      </html>
    `;

    // PDF生成
    const blob = HtmlService.createHtmlOutput(html).getBlob().getAs('application/pdf');
    blob.setName(product.productName + '_' + product.productId + '.pdf');

    // Driveに保存
    let folder: GoogleAppsScript.Drive.Folder;
    try {
      const folderId = getPhotoFolderId();
      folder = DriveApp.getFolderById(folderId);
    } catch {
      folder = DriveApp.getRootFolder();
    }
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: file.getUrl(),
      fileName: file.getName(),
    };
  } catch (error) {
    console.error('generateProductPdf error:', error);
    throw error;
  }
}

/**
 * PDF用HTMLエスケープ
 */
function escapeHtmlForPdf(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * CSVエクスポート
 */
function exportCsv(type: 'products' | 'sales' | 'inventory', conditions: ProductSearchCondition = {}) {
  try {
    const spreadsheetId = getSpreadsheetId();

    switch (type) {
      case 'products': {
        const service = new ProductService(spreadsheetId);
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
        const service = new SalesService(spreadsheetId);
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
        const service = new InventoryService(spreadsheetId);
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
  } catch (error) {
    console.error('exportCsv error:', error);
    throw error;
  }
}

/**
 * オブジェクト配列をCSV文字列に変換
 */
function convertToCsvGeneric(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  columns: string[]
): string {
  if (data.length === 0) {
    return columns.join(',');
  }

  const header = columns.join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

// ==================== グローバルエクスポート ====================

declare const global: {
  // 設定
  setupSpreadsheetId: typeof setupSpreadsheetId;
  getConfig: typeof getConfig;
  // Webアプリ
  doGet: typeof doGet;
  include: typeof include;
  // ユーティリティ
  getSpreadsheet: typeof getSpreadsheet;
  getCurrentUserEmail: typeof getCurrentUserEmail;
  getCurrentDateTime: typeof getCurrentDateTime;
  formatDate: typeof formatDate;
  // 製品API
  searchProducts: typeof searchProducts;
  getProductDetail: typeof getProductDetail;
  createProduct: typeof createProduct;
  updateProduct: typeof updateProduct;
  deleteProduct: typeof deleteProduct;
  updateProductStatus: typeof updateProductStatus;
  getDashboardStats: typeof getDashboardStats;
  // 販売API
  sellProduct: typeof sellProduct;
  cancelSale: typeof cancelSale;
  getSalesStats: typeof getSalesStats;
  getSoldProductsWithFilter: typeof getSoldProductsWithFilter;
  // 加工費API
  getProcessingCosts: typeof getProcessingCosts;
  createProcessingCost: typeof createProcessingCost;
  deleteProcessingCost: typeof deleteProcessingCost;
  // マスターAPI
  getWoodTypes: typeof getWoodTypes;
  getSuppliers: typeof getSuppliers;
  getProcessors: typeof getProcessors;
  getStorageLocations: typeof getStorageLocations;
  getMajorCategories: typeof getMajorCategories;
  addMasterData: typeof addMasterData;
  deleteMasterData: typeof deleteMasterData;
  getUniqueCategoryValues: typeof getUniqueCategoryValues;
  // 棚卸しAPI
  startInventorySession: typeof startInventorySession;
  getInventoryProgress: typeof getInventoryProgress;
  confirmInventoryProduct: typeof confirmInventoryProduct;
  completeInventorySession: typeof completeInventorySession;
  getActiveSessions: typeof getActiveSessions;
  // 認証API
  getOAuthToken: typeof getOAuthToken;
  // 写真アップロードAPI
  setupPhotoFolderId: typeof setupPhotoFolderId;
  uploadProductPhoto: typeof uploadProductPhoto;
  // レポートAPI
  getInventoryReport: typeof getInventoryReport;
  generateProductPdf: typeof generateProductPdf;
  exportCsv: typeof exportCsv;
  // データセットアップ
  setupAllSheets: typeof setupAllSheets;
  setupSheetsOnly: typeof setupSheetsOnly;
  clearAllData: typeof clearAllData;
};

// 設定
global.setupSpreadsheetId = setupSpreadsheetId;
global.getConfig = getConfig;
// Webアプリ
global.doGet = doGet;
global.include = include;
// ユーティリティ
global.getSpreadsheet = getSpreadsheet;
global.getCurrentUserEmail = getCurrentUserEmail;
global.getCurrentDateTime = getCurrentDateTime;
global.formatDate = formatDate;
// 製品API
global.searchProducts = searchProducts;
global.getProductDetail = getProductDetail;
global.createProduct = createProduct;
global.updateProduct = updateProduct;
global.deleteProduct = deleteProduct;
global.updateProductStatus = updateProductStatus;
global.getDashboardStats = getDashboardStats;
// 販売API
global.sellProduct = sellProduct;
global.cancelSale = cancelSale;
global.getSalesStats = getSalesStats;
global.getSoldProductsWithFilter = getSoldProductsWithFilter;
// 加工費API
global.getProcessingCosts = getProcessingCosts;
global.createProcessingCost = createProcessingCost;
global.deleteProcessingCost = deleteProcessingCost;
// マスターAPI
global.getWoodTypes = getWoodTypes;
global.getSuppliers = getSuppliers;
global.getProcessors = getProcessors;
global.getStorageLocations = getStorageLocations;
global.getMajorCategories = getMajorCategories;
global.addMasterData = addMasterData;
global.deleteMasterData = deleteMasterData;
global.getUniqueCategoryValues = getUniqueCategoryValues;
// 棚卸しAPI
global.startInventorySession = startInventorySession;
global.getInventoryProgress = getInventoryProgress;
global.confirmInventoryProduct = confirmInventoryProduct;
global.completeInventorySession = completeInventorySession;
global.getActiveSessions = getActiveSessions;
// 認証API
global.getOAuthToken = getOAuthToken;
// 写真アップロードAPI
global.setupPhotoFolderId = setupPhotoFolderId;
global.uploadProductPhoto = uploadProductPhoto;
// レポートAPI
global.getInventoryReport = getInventoryReport;
global.generateProductPdf = generateProductPdf;
global.exportCsv = exportCsv;
// データセットアップ
global.setupAllSheets = setupAllSheets;
global.setupSheetsOnly = setupSheetsOnly;
global.clearAllData = clearAllData;
