/**
 * データベースセットアップスクリプト
 * シート作成とダミーデータ投入
 */

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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date: Date): string {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// ==================== データ生成関数 ====================

function generateProducts(): unknown[][] {
  const products: unknown[][] = [];
  const categories = ['テーブル', 'カウンター', 'スツール', '足', 'その他'];
  const minorCategories = ['家具', '雑貨', '加工材料', 'その他'];
  const statuses = ['販売中', '販売中', '販売中', '販売済み', '棚卸し中', '削除済み'];
  const woodTypeIds = WOOD_TYPES_DATA.map(w => w[0] as string);
  const supplierIds = SUPPLIERS_DATA.map(s => s[0] as string);
  const locationIds = STORAGE_LOCATIONS_DATA.map(l => l[0] as string);

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
    let salesDate: Date | string = '';
    let actualSalesPrice: number | string = '';
    let salesRemarks = '';

    if (status === '販売済み') {
      salesDestination = randomChoice(['個人A様', '個人B様', '法人C社', 'インテリアショップD', '設計事務所E']);
      salesDate = daysAgo(randomInt(1, 30));
      const basePrice = Math.round(purchasePrice / (1 - profitMargin / 100) + priceAdjustment);
      actualSalesPrice = Math.round(basePrice * 1.1);
      salesRemarks = randomChoice(['配送済み', '店頭引取', '取付工事込み', '']);
    }

    // 削除情報（削除済みの場合）
    let deletedAt: Date | string = '';
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

function generateProcessingCosts(products: unknown[][]): unknown[][] {
  const costs: unknown[][] = [];
  const processingTypes = ['木材加工', '塗装', '足', 'ガラス', 'その他'];
  const processorIds = PROCESSORS_DATA.map(p => p[0] as string);
  let costNum = 1;

  for (const product of products) {
    const productId = product[0] as string;
    const status = product[20] as string;

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

function generateInventorySessions(): unknown[][] {
  const sessions: unknown[][] = [];
  const locationIds = STORAGE_LOCATIONS_DATA.map(l => l[0] as string);

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

function generateInventoryDetails(sessions: unknown[][], products: unknown[][]): unknown[][] {
  const details: unknown[][] = [];

  // 販売中の製品IDを取得
  const availableProducts = products
    .filter(p => p[20] === '販売中' || p[20] === '棚卸し中')
    .map(p => p[0] as string);

  let detailNum = 1;

  for (const session of sessions) {
    const sessionId = session[0] as string;
    const targetCount = session[7] as number;
    const confirmedCount = session[8] as number;
    const discrepancyCount = session[9] as number;
    const status = session[6] as string;

    // セッションごとに詳細を生成
    for (let i = 0; i < targetCount; i++) {
      const detailId = `${sessionId}-${String(detailNum).padStart(4, '0')}`;
      const productId = availableProducts[i % availableProducts.length];

      let confirmationStatus = '未確認';
      let confirmationMethod = '';
      let confirmedBy = '';
      let confirmedAt: Date | string = '';
      let discrepancyType = '';
      let discrepancyReason = '';
      let actionTaken = '';

      if (i < confirmedCount) {
        confirmationStatus = '確認済み';
        confirmationMethod = randomChoice(['QRスキャン', '手入力', '一覧選択']);
        confirmedBy = 'staff@example.com';
        confirmedAt = daysAgo(randomInt(0, 2));
      } else if (i < confirmedCount + discrepancyCount) {
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
function setupAllSheets(): void {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  console.log('=== シートセットアップ開始 ===');

  // 各シートを作成（既存の場合はクリア）
  for (const [sheetName, headers] of Object.entries(HEADERS)) {
    let sheet = ss.getSheetByName(sheetName);

    if (sheet) {
      console.log(`シート「${sheetName}」をクリア中...`);
      sheet.clear();
    } else {
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

function insertData(ss: GoogleAppsScript.Spreadsheet.Spreadsheet, sheetName: string, data: unknown[][]): void {
  if (data.length === 0) return;

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
function setupSheetsOnly(): void {
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
function clearAllData(): void {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  console.log('=== データクリア開始 ===');

  for (const sheetName of Object.keys(HEADERS)) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      console.log(`${sheetName}: ${lastRow - 1}件のデータを削除中...`);
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
    }
  }

  console.log('=== データクリア完了 ===');
}

// 関数をエクスポート
export { setupAllSheets, setupSheetsOnly, clearAllData };
