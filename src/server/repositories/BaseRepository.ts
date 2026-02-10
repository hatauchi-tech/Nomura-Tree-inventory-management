/**
 * BaseRepository - データアクセス層の基底クラス
 * スプレッドシートに対するCRUD操作を提供
 */

import { PaginationOptions, PaginatedResult } from '../types/common';

/**
 * リポジトリ設定
 */
export interface RepositoryConfig {
  spreadsheetId: string;
  sheetName: string;
  headers: string[];
}

/**
 * BaseRepository - 抽象基底クラス
 */
export abstract class BaseRepository<T> {
  protected config: RepositoryConfig;

  constructor(config: RepositoryConfig) {
    this.config = config;
  }

  /**
   * スプレッドシートを取得
   */
  protected getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    return SpreadsheetApp.openById(this.config.spreadsheetId);
  }

  /**
   * シートを取得
   */
  protected getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
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
  protected getAllData(): unknown[][] {
    const sheet = this.getSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return [];
    }

    const lastCol = this.config.headers.length;
    return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  }

  /**
   * 行データをエンティティに変換（サブクラスで実装）
   */
  protected abstract rowToEntity(row: unknown[]): T;

  /**
   * エンティティを行データに変換（サブクラスで実装）
   */
  protected abstract entityToRow(entity: T): unknown[];

  /**
   * ID列のインデックスを取得（サブクラスで実装）
   */
  protected abstract getIdColumnIndex(): number;

  /**
   * 全件取得
   */
  findAll(): T[] {
    const data = this.getAllData();
    return data.map((row) => this.rowToEntity(row));
  }

  /**
   * IDで検索
   */
  findById(id: string): T | null {
    const data = this.getAllData();
    const idIndex = this.getIdColumnIndex();

    const row = data.find((r) => String(r[idIndex]) === id);
    return row ? this.rowToEntity(row) : null;
  }

  /**
   * 複数IDで検索
   */
  findByIds(ids: string[]): T[] {
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
  create(entity: T): T {
    const sheet = this.getSheet();
    const row = this.entityToRow(entity);
    sheet.appendRow(row);
    return entity;
  }

  /**
   * 一括作成
   */
  createMany(entities: T[]): T[] {
    const sheet = this.getSheet();
    const rows = entities.map((e) => this.entityToRow(e));

    if (rows.length > 0) {
      const lastRow = sheet.getLastRow();
      const range = sheet.getRange(
        lastRow + 1,
        1,
        rows.length,
        this.config.headers.length
      );
      range.setValues(rows);
    }

    return entities;
  }

  /**
   * 更新
   */
  update(id: string, updates: Partial<T>): T | null {
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
    const updatedEntity = { ...currentEntity, ...updates } as T;

    // 行データに変換
    const newRow = this.entityToRow(updatedEntity);

    // シートを更新（行インデックス + 2 = ヘッダー行 + 1ベースインデックス）
    const range = sheet.getRange(
      rowIndex + 2,
      1,
      1,
      this.config.headers.length
    );
    range.setValues([newRow]);

    return updatedEntity;
  }

  /**
   * 削除
   */
  delete(id: string): boolean {
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
  count(): number {
    const data = this.getAllData();
    return data.length;
  }

  /**
   * 存在確認
   */
  exists(id: string): boolean {
    return this.findById(id) !== null;
  }

  /**
   * ページネーション付き取得
   */
  findWithPagination(options: PaginationOptions): PaginatedResult<T> {
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
  protected findRowIndex(predicate: (entity: T) => boolean): number {
    const data = this.getAllData();
    return data.findIndex((row) => predicate(this.rowToEntity(row)));
  }

  /**
   * 条件に一致する全エンティティを取得
   */
  findWhere(predicate: (entity: T) => boolean): T[] {
    return this.findAll().filter(predicate);
  }
}
