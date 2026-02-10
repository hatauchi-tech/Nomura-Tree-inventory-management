/**
 * SpreadsheetApp モック
 * Google Apps ScriptのSpreadsheetAppをテスト用にシミュレート
 */

export interface MockSheetData {
  name: string;
  data: unknown[][];
}

export interface MockRange {
  getValues(): unknown[][];
  setValues(values: unknown[][]): MockRange;
  getValue(): unknown;
  setValue(value: unknown): MockRange;
  getRow(): number;
  getColumn(): number;
  getNumRows(): number;
  getNumColumns(): number;
  getA1Notation(): string;
  clear(): MockRange;
  clearContent(): MockRange;
}

export interface MockSheet {
  getName(): string;
  getDataRange(): MockRange;
  getRange(row: number, column: number, numRows?: number, numColumns?: number): MockRange;
  getLastRow(): number;
  getLastColumn(): number;
  appendRow(values: unknown[]): MockSheet;
  deleteRow(rowPosition: number): void;
  insertRowAfter(afterPosition: number): MockSheet;
  getMaxRows(): number;
  getMaxColumns(): number;
  clear(): MockSheet;
  clearContents(): MockSheet;
  setName(name: string): MockSheet;
}

export interface MockSpreadsheet {
  getId(): string;
  getName(): string;
  getSheetByName(name: string): MockSheet | null;
  getSheets(): MockSheet[];
  insertSheet(name: string): MockSheet;
  deleteSheet(sheet: MockSheet): void;
  getActiveSheet(): MockSheet;
  setActiveSheet(sheet: MockSheet): MockSheet;
}

class MockRangeImpl implements MockRange {
  private sheet: MockSheetImpl;
  private startRow: number;
  private startCol: number;
  private numRows: number;
  private numCols: number;

  constructor(
    sheet: MockSheetImpl,
    startRow: number,
    startCol: number,
    numRows: number = 1,
    numCols: number = 1
  ) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }

  getValues(): unknown[][] {
    const result: unknown[][] = [];
    const data = this.sheet.getData();
    for (let i = 0; i < this.numRows; i++) {
      const row: unknown[] = [];
      for (let j = 0; j < this.numCols; j++) {
        const dataRow = data[this.startRow - 1 + i];
        row.push(dataRow ? dataRow[this.startCol - 1 + j] ?? '' : '');
      }
      result.push(row);
    }
    return result;
  }

  setValues(values: unknown[][]): MockRange {
    const data = this.sheet.getData();
    for (let i = 0; i < values.length; i++) {
      const rowIdx = this.startRow - 1 + i;
      if (!data[rowIdx]) {
        data[rowIdx] = [];
      }
      for (let j = 0; j < values[i].length; j++) {
        data[rowIdx][this.startCol - 1 + j] = values[i][j];
      }
    }
    return this;
  }

  getValue(): unknown {
    const data = this.sheet.getData();
    const row = data[this.startRow - 1];
    return row ? row[this.startCol - 1] ?? '' : '';
  }

  setValue(value: unknown): MockRange {
    const data = this.sheet.getData();
    if (!data[this.startRow - 1]) {
      data[this.startRow - 1] = [];
    }
    data[this.startRow - 1][this.startCol - 1] = value;
    return this;
  }

  getRow(): number {
    return this.startRow;
  }

  getColumn(): number {
    return this.startCol;
  }

  getNumRows(): number {
    return this.numRows;
  }

  getNumColumns(): number {
    return this.numCols;
  }

  getA1Notation(): string {
    const colLetter = String.fromCharCode(64 + this.startCol);
    if (this.numRows === 1 && this.numCols === 1) {
      return `${colLetter}${this.startRow}`;
    }
    const endColLetter = String.fromCharCode(64 + this.startCol + this.numCols - 1);
    return `${colLetter}${this.startRow}:${endColLetter}${this.startRow + this.numRows - 1}`;
  }

  clear(): MockRange {
    return this.clearContent();
  }

  clearContent(): MockRange {
    const data = this.sheet.getData();
    for (let i = 0; i < this.numRows; i++) {
      const rowIdx = this.startRow - 1 + i;
      if (data[rowIdx]) {
        for (let j = 0; j < this.numCols; j++) {
          data[rowIdx][this.startCol - 1 + j] = '';
        }
      }
    }
    return this;
  }
}

class MockSheetImpl implements MockSheet {
  private name: string;
  private data: unknown[][];

  constructor(name: string, data: unknown[][] = []) {
    this.name = name;
    this.data = data;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): MockSheet {
    this.name = name;
    return this;
  }

  getData(): unknown[][] {
    return this.data;
  }

  getDataRange(): MockRange {
    const lastRow = this.getLastRow();
    const lastCol = this.getLastColumn();
    return new MockRangeImpl(
      this,
      1,
      1,
      Math.max(1, lastRow),
      Math.max(1, lastCol)
    );
  }

  getRange(
    row: number,
    column: number,
    numRows: number = 1,
    numColumns: number = 1
  ): MockRange {
    return new MockRangeImpl(this, row, column, numRows, numColumns);
  }

  getLastRow(): number {
    let lastRow = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] && this.data[i].some((cell) => cell !== '' && cell !== null && cell !== undefined)) {
        lastRow = i + 1;
      }
    }
    return lastRow;
  }

  getLastColumn(): number {
    let lastCol = 0;
    for (const row of this.data) {
      if (row) {
        for (let j = row.length - 1; j >= 0; j--) {
          if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
            lastCol = Math.max(lastCol, j + 1);
            break;
          }
        }
      }
    }
    return lastCol;
  }

  appendRow(values: unknown[]): MockSheet {
    const newRow = [...values];
    this.data.push(newRow);
    return this;
  }

  deleteRow(rowPosition: number): void {
    if (rowPosition > 0 && rowPosition <= this.data.length) {
      this.data.splice(rowPosition - 1, 1);
    }
  }

  insertRowAfter(afterPosition: number): MockSheet {
    this.data.splice(afterPosition, 0, []);
    return this;
  }

  getMaxRows(): number {
    return Math.max(1000, this.data.length);
  }

  getMaxColumns(): number {
    return 26;
  }

  clear(): MockSheet {
    this.data = [];
    return this;
  }

  clearContents(): MockSheet {
    return this.clear();
  }
}

class MockSpreadsheetImpl implements MockSpreadsheet {
  private id: string;
  private name: string;
  private sheets: Map<string, MockSheetImpl>;
  private activeSheet: MockSheetImpl | null = null;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.sheets = new Map();
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSheetByName(name: string): MockSheet | null {
    return this.sheets.get(name) || null;
  }

  getSheets(): MockSheet[] {
    return Array.from(this.sheets.values());
  }

  insertSheet(name: string): MockSheet {
    const sheet = new MockSheetImpl(name);
    this.sheets.set(name, sheet);
    return sheet;
  }

  deleteSheet(sheet: MockSheet): void {
    this.sheets.delete(sheet.getName());
  }

  getActiveSheet(): MockSheet {
    if (!this.activeSheet && this.sheets.size > 0) {
      this.activeSheet = Array.from(this.sheets.values())[0];
    }
    return this.activeSheet!;
  }

  setActiveSheet(sheet: MockSheet): MockSheet {
    this.activeSheet = sheet as MockSheetImpl;
    return sheet;
  }

  addSheet(name: string, data: unknown[][]): MockSheetImpl {
    const sheet = new MockSheetImpl(name, data);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

// SpreadsheetApp モッククラス
export class SpreadsheetAppMock {
  private static spreadsheets: Map<string, MockSpreadsheetImpl> = new Map();
  private static activeSpreadsheet: MockSpreadsheetImpl | null = null;

  static reset(): void {
    this.spreadsheets.clear();
    this.activeSpreadsheet = null;
  }

  static setupSpreadsheet(
    id: string,
    name: string,
    sheetsData: MockSheetData[]
  ): MockSpreadsheetImpl {
    const spreadsheet = new MockSpreadsheetImpl(id, name);
    for (const sheetData of sheetsData) {
      spreadsheet.addSheet(sheetData.name, sheetData.data);
    }
    this.spreadsheets.set(id, spreadsheet);
    if (!this.activeSpreadsheet) {
      this.activeSpreadsheet = spreadsheet;
    }
    return spreadsheet;
  }

  static getActiveSpreadsheet(): MockSpreadsheet | null {
    return this.activeSpreadsheet;
  }

  static openById(id: string): MockSpreadsheet {
    const spreadsheet = this.spreadsheets.get(id);
    if (!spreadsheet) {
      throw new Error(`Spreadsheet with id "${id}" not found`);
    }
    return spreadsheet;
  }

  static create(name: string): MockSpreadsheet {
    const id = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spreadsheet = new MockSpreadsheetImpl(id, name);
    this.spreadsheets.set(id, spreadsheet);
    return spreadsheet;
  }

  static setActiveSpreadsheet(spreadsheet: MockSpreadsheet): void {
    this.activeSpreadsheet = spreadsheet as MockSpreadsheetImpl;
  }
}
