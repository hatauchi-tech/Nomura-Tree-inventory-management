/**
 * Utilities モック
 * Google Apps ScriptのUtilitiesをテスト用にシミュレート
 */

export class UtilitiesMock {
  static formatDate(date: Date, timeZone: string, format: string): string {
    // 簡易的な日付フォーマット実装
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    let result = format;
    result = result.replace('yyyy', String(year));
    result = result.replace('MM', month);
    result = result.replace('dd', day);
    result = result.replace('HH', hours);
    result = result.replace('mm', minutes);
    result = result.replace('ss', seconds);

    return result;
  }

  static getUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static base64Encode(data: string | number[]): string {
    if (typeof data === 'string') {
      return Buffer.from(data).toString('base64');
    }
    return Buffer.from(data).toString('base64');
  }

  static base64Decode(data: string): number[] {
    const buffer = Buffer.from(data, 'base64');
    return Array.from(buffer);
  }

  static newBlob(data: string | number[], contentType?: string, name?: string): {
    getDataAsString(): string;
    getContentType(): string;
    getName(): string;
    setName(name: string): void;
    getBytes(): number[];
  } {
    const content = typeof data === 'string' ? data : String.fromCharCode(...data);
    let blobName = name || '';
    return {
      getDataAsString: () => content,
      getContentType: () => contentType || 'application/octet-stream',
      getName: () => blobName,
      setName: (n: string) => {
        blobName = n;
      },
      getBytes: () =>
        typeof data === 'string'
          ? Array.from(data).map((c) => c.charCodeAt(0))
          : data,
    };
  }

  static sleep(milliseconds: number): void {
    // テスト環境では実際にスリープしない
    // eslint-disable-next-line no-console
    console.log(`Utilities.sleep called with ${milliseconds}ms`);
  }

  static parseCsv(csv: string, delimiter?: string): string[][] {
    const delim = delimiter || ',';
    const lines = csv.split('\n');
    return lines.map((line) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    });
  }

  static computeDigest(
    algorithm: GoogleAppsScript.Utilities.DigestAlgorithm,
    value: string
  ): number[] {
    // 簡易的なハッシュ実装（テスト用）
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Array.from(String(Math.abs(hash))).map((c) => parseInt(c, 10));
  }
}
