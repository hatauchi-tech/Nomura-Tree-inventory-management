/**
 * MasterRepository - マスターデータアクセス層
 * 樹種、仕入れ先、加工業者、保管場所マスターを管理
 */

import { BaseRepository, RepositoryConfig } from './BaseRepository';
import { SHEET_NAMES, SheetRowData } from '../types/common';
import {
  WoodType,
  Supplier,
  Processor,
  StorageLocation,
  WOOD_TYPE_HEADERS,
  SUPPLIER_HEADERS,
  PROCESSOR_HEADERS,
  STORAGE_LOCATION_HEADERS,
  rowToWoodType,
  rowToSupplier,
  rowToProcessor,
  rowToStorageLocation,
  woodTypeToRow,
  supplierToRow,
  processorToRow,
  storageLocationToRow,
  CreateWoodTypeDto,
  CreateSupplierDto,
  CreateProcessorDto,
  CreateStorageLocationDto,
} from '../types/master';

// ==================== 樹種リポジトリ ====================

export class WoodTypeRepository extends BaseRepository<WoodType> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.WOOD_TYPES,
      headers: WOOD_TYPE_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): WoodType {
    return rowToWoodType(row as SheetRowData);
  }

  protected entityToRow(entity: WoodType): unknown[] {
    return woodTypeToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // woodTypeId
  }

  /**
   * 名前で検索
   */
  findByName(name: string): WoodType | null {
    const found = this.findWhere((wt) => wt.name === name);
    return found.length > 0 ? found[0] : null;
  }

  /**
   * 表示順でソートして取得
   */
  findAllSorted(): WoodType[] {
    return this.findAll().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * 新規登録
   */
  createFromDto(dto: CreateWoodTypeDto): WoodType {
    const existingIds = this.findAll().map((w) => w.woodTypeId);
    const nextNum = existingIds.length + 1;
    const woodTypeId = `WOOD-${String(nextNum).padStart(4, '0')}`;

    const woodType: WoodType = {
      woodTypeId,
      name: dto.name,
      displayOrder: dto.displayOrder ?? nextNum,
    };

    return this.create(woodType);
  }

  /**
   * 名前の重複チェック
   */
  isNameExists(name: string, excludeId?: string): boolean {
    return this.findAll().some(
      (wt) => wt.name === name && wt.woodTypeId !== excludeId
    );
  }
}

// ==================== 仕入れ先リポジトリ ====================

export class SupplierRepository extends BaseRepository<Supplier> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.SUPPLIERS,
      headers: SUPPLIER_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): Supplier {
    return rowToSupplier(row as SheetRowData);
  }

  protected entityToRow(entity: Supplier): unknown[] {
    return supplierToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // supplierId
  }

  /**
   * 名前で検索
   */
  findByName(name: string): Supplier | null {
    const found = this.findWhere((s) => s.name === name);
    return found.length > 0 ? found[0] : null;
  }

  /**
   * 新規登録
   */
  createFromDto(dto: CreateSupplierDto): Supplier {
    const existingIds = this.findAll().map((s) => s.supplierId);
    const nextNum = existingIds.length + 1;
    const supplierId = `SUP-${String(nextNum).padStart(4, '0')}`;

    const supplier: Supplier = {
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
  isNameExists(name: string, excludeId?: string): boolean {
    return this.findAll().some(
      (s) => s.name === name && s.supplierId !== excludeId
    );
  }
}

// ==================== 加工業者リポジトリ ====================

export class ProcessorRepository extends BaseRepository<Processor> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.PROCESSORS,
      headers: PROCESSOR_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): Processor {
    return rowToProcessor(row as SheetRowData);
  }

  protected entityToRow(entity: Processor): unknown[] {
    return processorToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // processorId
  }

  /**
   * 名前で検索
   */
  findByName(name: string): Processor | null {
    const found = this.findWhere((p) => p.name === name);
    return found.length > 0 ? found[0] : null;
  }

  /**
   * 加工種別で検索
   */
  findByProcessingType(processingType: string): Processor[] {
    return this.findWhere((p) => p.processingTypes.includes(processingType as any));
  }

  /**
   * 新規登録
   */
  createFromDto(dto: CreateProcessorDto): Processor {
    const existingIds = this.findAll().map((p) => p.processorId);
    const nextNum = existingIds.length + 1;
    const processorId = `PROC-${String(nextNum).padStart(4, '0')}`;

    const processor: Processor = {
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
  isNameExists(name: string, excludeId?: string): boolean {
    return this.findAll().some(
      (p) => p.name === name && p.processorId !== excludeId
    );
  }
}

// ==================== 保管場所リポジトリ ====================

export class StorageLocationRepository extends BaseRepository<StorageLocation> {
  constructor(spreadsheetId: string) {
    const config: RepositoryConfig = {
      spreadsheetId,
      sheetName: SHEET_NAMES.STORAGE_LOCATIONS,
      headers: STORAGE_LOCATION_HEADERS,
    };
    super(config);
  }

  protected rowToEntity(row: unknown[]): StorageLocation {
    return rowToStorageLocation(row as SheetRowData);
  }

  protected entityToRow(entity: StorageLocation): unknown[] {
    return storageLocationToRow(entity);
  }

  protected getIdColumnIndex(): number {
    return 0; // storageLocationId
  }

  /**
   * 名前で検索
   */
  findByName(name: string): StorageLocation | null {
    const found = this.findWhere((sl) => sl.name === name);
    return found.length > 0 ? found[0] : null;
  }

  /**
   * 表示順でソートして取得
   */
  findAllSorted(): StorageLocation[] {
    return this.findAll().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * 新規登録
   */
  createFromDto(dto: CreateStorageLocationDto): StorageLocation {
    const existingIds = this.findAll().map((sl) => sl.storageLocationId);
    const nextNum = existingIds.length + 1;
    const storageLocationId = `LOC-${String(nextNum).padStart(4, '0')}`;

    const location: StorageLocation = {
      storageLocationId,
      name: dto.name,
      displayOrder: dto.displayOrder ?? nextNum,
    };

    return this.create(location);
  }

  /**
   * 名前の重複チェック
   */
  isNameExists(name: string, excludeId?: string): boolean {
    return this.findAll().some(
      (sl) => sl.name === name && sl.storageLocationId !== excludeId
    );
  }

  /**
   * 最終棚卸し日を更新
   */
  updateLastInventoryDate(storageLocationId: string, date: Date): StorageLocation | null {
    return this.update(storageLocationId, { lastInventoryDate: date });
  }
}
