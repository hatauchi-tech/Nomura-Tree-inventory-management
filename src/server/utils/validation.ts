/**
 * バリデーションユーティリティ
 */

import {
  ValidationResult,
  ValidationError,
  VALIDATION_CONSTRAINTS,
} from '../types/common';
import { CreateProductDto } from '../types/product';
import { CreateProcessingCostDto } from '../types/processingCost';

/**
 * 空のバリデーション結果を作成
 */
function createValidResult(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * エラーを含むバリデーション結果を作成
 */
function createInvalidResult(
  field: string,
  message: string,
  code: string
): ValidationResult {
  return {
    isValid: false,
    errors: [{ field, message, code }],
  };
}

/**
 * 複数のバリデーション結果をマージ
 */
function mergeResults(...results: ValidationResult[]): ValidationResult {
  const errors: ValidationError[] = [];
  for (const result of results) {
    errors.push(...result.errors);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 必須項目チェック
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === null || value === undefined) {
    return createInvalidResult(
      fieldName,
      `${fieldName}を入力してください`,
      'REQUIRED'
    );
  }

  if (typeof value === 'string' && value.trim() === '') {
    return createInvalidResult(
      fieldName,
      `${fieldName}を入力してください`,
      'REQUIRED'
    );
  }

  return createValidResult();
}

/**
 * 文字列長チェック
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): ValidationResult {
  if (value.length < minLength) {
    return createInvalidResult(
      fieldName,
      `${fieldName}は${minLength}文字以上で入力してください`,
      'STRING_TOO_SHORT'
    );
  }

  if (value.length > maxLength) {
    return createInvalidResult(
      fieldName,
      `${fieldName}は${maxLength}文字以内で入力してください`,
      'STRING_TOO_LONG'
    );
  }

  return createValidResult();
}

/**
 * 数値範囲チェック
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number,
  max: number,
  mustBeInteger: boolean = false
): ValidationResult {
  if (mustBeInteger && !Number.isInteger(value)) {
    return createInvalidResult(
      fieldName,
      `${fieldName}は整数で入力してください`,
      'NOT_INTEGER'
    );
  }

  if (value < min || value > max) {
    return createInvalidResult(
      fieldName,
      `${fieldName}は${min}〜${max}の範囲で入力してください`,
      'NUMBER_OUT_OF_RANGE'
    );
  }

  return createValidResult();
}

/**
 * 日付バリデーションオプション
 */
interface DateValidationOptions {
  allowFuture?: boolean;
  maxFutureDays?: number;
  minDate?: Date;
}

/**
 * 日付チェック
 */
export function validateDate(
  value: Date,
  fieldName: string,
  options: DateValidationOptions = {}
): ValidationResult {
  const { allowFuture = true, maxFutureDays, minDate } = options;

  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return createInvalidResult(
      fieldName,
      `${fieldName}の形式が正しくありません`,
      'INVALID_DATE'
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const valueDate = new Date(value);
  valueDate.setHours(0, 0, 0, 0);

  if (!allowFuture && valueDate > today) {
    return createInvalidResult(
      fieldName,
      `${fieldName}に未来日は指定できません`,
      'FUTURE_DATE_NOT_ALLOWED'
    );
  }

  if (allowFuture && maxFutureDays !== undefined) {
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxFutureDays);
    if (valueDate > maxDate) {
      return createInvalidResult(
        fieldName,
        `${fieldName}は${maxFutureDays}日以内で指定してください`,
        'DATE_TOO_FAR_FUTURE'
      );
    }
  }

  if (minDate) {
    const minDateNormalized = new Date(minDate);
    minDateNormalized.setHours(0, 0, 0, 0);
    if (valueDate < minDateNormalized) {
      return createInvalidResult(
        fieldName,
        `${fieldName}が指定可能な範囲より前の日付です`,
        'DATE_BEFORE_MIN'
      );
    }
  }

  return createValidResult();
}

/**
 * 商品名バリデーション
 */
export function validateProductName(value: string): ValidationResult {
  const constraints = VALIDATION_CONSTRAINTS.PRODUCT_NAME;
  const requiredResult = validateRequired(value, '商品名');
  if (!requiredResult.isValid) return requiredResult;

  return validateStringLength(
    value,
    '商品名',
    constraints.minLength,
    constraints.maxLength
  );
}

/**
 * サイズバリデーション（オプショナル）
 */
export function validateSize(
  value: number | undefined,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return createValidResult();
  }

  const constraints = VALIDATION_CONSTRAINTS.SIZE;
  return validateNumberRange(
    value,
    fieldName,
    constraints.min,
    constraints.max,
    true
  );
}

/**
 * 価格バリデーション
 */
export function validatePrice(
  value: number,
  fieldName: string
): ValidationResult {
  const constraints = VALIDATION_CONSTRAINTS.PRICE;
  return validateNumberRange(
    value,
    fieldName,
    constraints.min,
    constraints.max,
    true
  );
}

/**
 * 利益率バリデーション
 */
export function validateProfitMargin(value: number): ValidationResult {
  const constraints = VALIDATION_CONSTRAINTS.PROFIT_MARGIN;

  // 小数点1桁までOK
  const decimalPlaces = (value.toString().split('.')[1] || '').length;
  if (decimalPlaces > 1) {
    return createInvalidResult(
      '利益率',
      '利益率は小数点1桁まで入力できます',
      'TOO_MANY_DECIMALS'
    );
  }

  return validateNumberRange(
    value,
    '利益率',
    constraints.min,
    constraints.max,
    false
  );
}

/**
 * 価格調整額バリデーション
 */
export function validatePriceAdjustment(value: number): ValidationResult {
  const constraints = VALIDATION_CONSTRAINTS.PRICE_ADJUSTMENT;
  return validateNumberRange(
    value,
    '価格調整額',
    constraints.min,
    constraints.max,
    true
  );
}

/**
 * 備考バリデーション
 */
export function validateRemarks(value: string): ValidationResult {
  if (!value || value === '') {
    return createValidResult();
  }

  const constraints = VALIDATION_CONSTRAINTS.REMARKS;
  return validateStringLength(value, '備考', 0, constraints.maxLength);
}

/**
 * 業者名バリデーション
 */
export function validateVendorName(value: string): ValidationResult {
  const constraints = VALIDATION_CONSTRAINTS.VENDOR_NAME;
  const requiredResult = validateRequired(value, '業者名');
  if (!requiredResult.isValid) return requiredResult;

  return validateStringLength(
    value,
    '業者名',
    constraints.minLength,
    constraints.maxLength
  );
}

/**
 * 製品バリデーション
 */
export function validateProduct(dto: CreateProductDto): ValidationResult {
  const results: ValidationResult[] = [];

  // 必須項目
  results.push(validateRequired(dto.majorCategory, '大分類'));
  results.push(validateProductName(dto.productName));
  results.push(validateRequired(dto.woodType, '樹種'));
  results.push(validateRequired(dto.supplierId, '仕入れ先'));
  results.push(validateRequired(dto.storageLocationId, '保管場所'));

  // 仕入れ日
  results.push(
    validateDate(dto.purchaseDate, '仕入れ日', { allowFuture: false })
  );

  // 入荷単価
  results.push(validatePrice(dto.purchasePrice, '入荷単価'));

  // サイズ（オプショナル）
  if (dto.rawSize) {
    results.push(validateSize(dto.rawSize.length, '入荷時_長さ'));
    results.push(validateSize(dto.rawSize.width, '入荷時_幅'));
    results.push(validateSize(dto.rawSize.thickness, '入荷時_厚み'));
  }

  if (dto.finishedSize) {
    results.push(validateSize(dto.finishedSize.length, '仕上げ後_長さ'));
    results.push(validateSize(dto.finishedSize.width, '仕上げ後_幅'));
    results.push(validateSize(dto.finishedSize.thickness, '仕上げ後_厚み'));
  }

  // 販売時送料（オプショナル）
  if (dto.shippingCost !== undefined) {
    const shippingConstraints = VALIDATION_CONSTRAINTS.SHIPPING_COST;
    results.push(
      validateNumberRange(
        dto.shippingCost,
        '販売時送料',
        shippingConstraints.min,
        shippingConstraints.max,
        true
      )
    );
  }

  // 利益率（オプショナル）
  if (dto.profitMargin !== undefined) {
    results.push(validateProfitMargin(dto.profitMargin));
  }

  // 価格調整額（オプショナル）
  if (dto.priceAdjustment !== undefined) {
    results.push(validatePriceAdjustment(dto.priceAdjustment));
  }

  // 備考（オプショナル）
  if (dto.remarks !== undefined) {
    results.push(validateRemarks(dto.remarks));
  }

  return mergeResults(...results);
}

/**
 * 加工費バリデーション
 */
export function validateProcessingCost(
  dto: CreateProcessingCostDto
): ValidationResult {
  const results: ValidationResult[] = [];

  results.push(validateRequired(dto.productId, '製品ID'));
  results.push(validateRequired(dto.processingType, '加工種別'));
  results.push(validateRequired(dto.processorId, '加工業者'));
  results.push(validatePrice(dto.amount, '金額'));

  // 加工内容（オプショナル）
  if (dto.processingContent !== undefined) {
    const constraints = VALIDATION_CONSTRAINTS.PROCESSING_CONTENT;
    results.push(
      validateStringLength(dto.processingContent, '加工内容', 0, constraints.maxLength)
    );
  }

  return mergeResults(...results);
}

/**
 * 販売登録バリデーション
 */
export function validateSalesRegistration(dto: {
  salesDestination: string;
  salesDate: Date;
  actualSalesPrice?: number;
}): ValidationResult {
  const results: ValidationResult[] = [];

  // 販売先
  const salesDestConstraints = VALIDATION_CONSTRAINTS.SALES_DESTINATION;
  const requiredResult = validateRequired(dto.salesDestination, '販売先');
  if (!requiredResult.isValid) {
    results.push(requiredResult);
  } else {
    results.push(
      validateStringLength(
        dto.salesDestination,
        '販売先',
        salesDestConstraints.minLength,
        salesDestConstraints.maxLength
      )
    );
  }

  // 売上計上日（7日後まで許可）
  results.push(
    validateDate(dto.salesDate, '売上計上日', {
      allowFuture: true,
      maxFutureDays: 7,
    })
  );

  // 実際販売価格（オプショナル）
  if (dto.actualSalesPrice !== undefined) {
    results.push(validatePrice(dto.actualSalesPrice, '実際販売価格'));
  }

  return mergeResults(...results);
}
