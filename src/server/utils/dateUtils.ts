/**
 * 日付ユーティリティ
 */

/**
 * 日付を yyyy/MM/dd 形式でフォーマット
 */
export function formatDateJP(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 日時を yyyy/MM/dd HH:mm 形式でフォーマット
 */
export function formatDateTimeJP(date: Date): string {
  const dateStr = formatDateJP(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * 日付を YYYY-MM-DD 形式でフォーマット（ISO形式）
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 文字列またはDateオブジェクトをDateに変換
 */
export function parseDate(value: string | Date | null | undefined): Date | null {
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
export function getStockDays(purchaseDate: Date, referenceDate?: Date): number {
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
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

/**
 * 日付に日数を加算
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 2つの日付が同じ日かどうかを判定
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * date1がdate2より前かどうかを判定（日単位）
 */
export function isBeforeDate(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);

  return d1.getTime() < d2.getTime();
}

/**
 * date1がdate2より後かどうかを判定（日単位）
 */
export function isAfterDate(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);

  return d1.getTime() > d2.getTime();
}

/**
 * 日の開始時刻（00:00:00.000）を取得
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 日の終了時刻（23:59:59.999）を取得
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 2つの日付の差分を日数で取得
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);

  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 指定日が今日から指定日数以内かどうかを判定
 */
export function isWithinDays(date: Date, days: number): boolean {
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
export function getYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 月の最初の日を取得
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 月の最後の日を取得
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 今日の日付を取得（時刻なし）
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * 指定日数前の日付を取得
 */
export function getDaysAgo(days: number): Date {
  return addDays(getToday(), -days);
}
