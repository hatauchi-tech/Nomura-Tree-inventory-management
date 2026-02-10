/**
 * ID採番ユーティリティ
 */

/**
 * シーケンス番号をゼロパディングでフォーマット
 */
export function formatSequenceNumber(num: number, digits: number): string {
  return num.toString().padStart(digits, '0');
}

/**
 * 製品IDを生成 (ITA-0001 形式)
 */
export function generateProductId(sequenceNumber: number): string {
  if (sequenceNumber <= 0) {
    throw new Error('Sequence number must be positive');
  }
  return `ITA-${formatSequenceNumber(sequenceNumber, 4)}`;
}

/**
 * 加工費IDを生成 (COST-000001 形式)
 */
export function generateProcessingCostId(sequenceNumber: number): string {
  if (sequenceNumber <= 0) {
    throw new Error('Sequence number must be positive');
  }
  return `COST-${formatSequenceNumber(sequenceNumber, 6)}`;
}

/**
 * 棚卸しセッションIDを生成 (INV-YYYYMMDD-001 形式)
 */
export function generateInventorySessionId(
  date: Date,
  dailySequence: number
): string {
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
export function generateLogId(sequenceNumber: number): string {
  if (sequenceNumber <= 0) {
    throw new Error('Sequence number must be positive');
  }
  return `LOG-${formatSequenceNumber(sequenceNumber, 9)}`;
}

/**
 * 製品IDから番号部分を抽出
 */
export function parseProductIdNumber(productId: string): number | null {
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
export function parseProcessingCostIdNumber(costId: string): number | null {
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
export function getNextSequenceNumber(
  existingIds: string[],
  prefix: string
): number {
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
export function parseInventorySessionId(
  sessionId: string
): { date: Date; sequence: number } | null {
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
export function getNextInventorySessionSequence(
  existingSessionIds: string[],
  date: Date
): number {
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
