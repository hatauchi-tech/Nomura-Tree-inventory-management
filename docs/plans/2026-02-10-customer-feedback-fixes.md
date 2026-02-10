# お客様フィードバック改修 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 課題管理表の全15件の改善要望を優先度順に実装し、Githubにプッシュする

**Architecture:** Google Apps Script + TypeScript バックエンド / Vanilla JS フロントエンド。変更はサーバー側(src/server/)とクライアント側(src/client/)の両方に及ぶ。既存の3層アーキテクチャ(Presentation → Services → Repositories)を維持しつつ、最小限の変更で各課題を解決する。

**Tech Stack:** TypeScript (GAS), Vanilla JavaScript, HTML/CSS, Webpack, Jest, Google CLASP

---

## 課題一覧（優先度順）

| No. | 優先度 | 内容 | Task |
|-----|--------|------|------|
| 10 | 高 | 製品登録後、編集でサイズや目安販売価格が反映しない | Task 1 |
| 11 | 高 | 価格情報に加工費合計が反映しない | Task 2 |
| 12 | 高 | 販売処理に失敗する | Task 3 |
| 13 | 高 | 大分類と中分類の修正画面がない | Task 4 |
| 15 | 高 | 製品一覧で保管場所・樹種・サイズ検索 | Task 5 |
| 4 | 中 | 販売時送料欄で配送業者を追加 | Task 6 |
| 5 | 中 | 出荷日/納品日を入力する欄を追加 | Task 7 |
| 6 | 中 | 価格調整額で税別・税込を選べるように | Task 8 |
| 7 | 中 | カレンダーの矢印レイアウト変更 | Task 9 |
| 8 | 中 | 価格調整額でエンター押すと入荷サイズ消える | Task 10 |
| 9 | 中 | 写真がありませんクリックで写真追加 | Task 11 |
| 14 | 中 | ステータス販売中→商談中、担当者・部署名追加 | Task 12 |
| 16 | 中 | 製品登録で樹種名が名前に表示される問題 | Task 13 |
| 2 | 低 | 長期在庫表示を削除 | Task 14 |
| 3 | 低 | 金額にカンマ表示 | Task 15 |

---

### Task 1: 製品編集でサイズ・目安販売価格が反映しない [高]

**問題分析:**
ProductForm の編集モードでデータをロードする際、サイズ情報の展開方法やフォーム→DTO変換でフィールドが欠落している可能性がある。`updateProduct`のDTO変換時にrawSize/finishedSizeがnested objectで渡されないか、BaseRepositoryの`update()`でサイズ列が上書きされていない。

**Files:**
- Modify: `src/client/scripts-app.html` (ProductForm.loadProduct / ProductForm.collectFormData 付近)
- Modify: `src/server/repositories/BaseRepository.ts` (update メソッド)
- Modify: `src/server/types/product.ts` (productToRow でのサイズフィールド処理)

**Step 1: 問題箇所を特定 - クライアント側のフォームデータ収集**

`scripts-app.html`のProductForm.collectFormDataを確認し、rawSize/finishedSizeが正しくネストされたオブジェクトとして送信されているか確認。

**Step 2: ProductForm.collectFormData の修正**

フォームデータ収集で、サイズ情報をネストされたオブジェクトとして正しく構築するよう修正:

```javascript
// collectFormData内のサイズデータ構築を確認
const data = {
  // ... other fields
  rawSize: {
    length: parseFloat(document.getElementById('rawLength').value) || undefined,
    width: parseFloat(document.getElementById('rawWidth').value) || undefined,
    thickness: parseFloat(document.getElementById('rawThickness').value) || undefined,
  },
  finishedSize: {
    length: parseFloat(document.getElementById('finishedLength').value) || undefined,
    width: parseFloat(document.getElementById('finishedWidth').value) || undefined,
    thickness: parseFloat(document.getElementById('finishedThickness').value) || undefined,
  },
  // profitMargin, priceAdjustment も確認
};
```

**Step 3: サーバー側 BaseRepository.update() のパーシャル更新確認**

`BaseRepository.update()`がネストされたオブジェクト(Size)を正しくマージしているか確認。productToRowでundefined/nullのサイズフィールドが空文字に変換されているか確認。

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: All existing tests PASS

**Step 5: Commit**

```bash
git add src/client/scripts-app.html src/server/repositories/BaseRepository.ts
git commit -m "fix: 製品編集でサイズ・価格情報が正しく反映されるよう修正"
```

---

### Task 2: 価格情報に加工費合計が反映しない [高]

**問題分析:**
製品詳細画面(ProductDetail)で価格情報を表示する際、加工費合計がサーバーから返された値ではなくフロント計算結果を使っている可能性。`getProductDetail`は生のProduct情報のみ返し、加工費合計を含めていない。クライアント側が`getProcessingCosts`を別途呼んでいるかどうか確認。

**Files:**
- Modify: `src/client/scripts-app.html` (ProductDetail.loadProduct の価格表示部分)
- Modify: `src/server/index.ts` (getProductDetail関数で価格計算値を含めて返す)
- Modify: `src/server/services/ProductService.ts` (getProductDetail で計算値を返す)

**Step 1: getProductDetail を拡張して計算値を含める**

サーバー側の`getProductDetail`が加工費合計や価格計算結果をレスポンスに含めるよう、ProductServiceを修正:

```typescript
// ProductService.ts - getProductDetail を拡張
getProductDetail(productId: string): (Product & { calculated?: PriceCalculationResult }) | null {
  const product = this.productRepo.findById(productId);
  if (!product) return null;

  const prices = this.calculateProductPricesInternal(product);
  return {
    ...product,
    calculated: prices,
  };
}
```

**Step 2: クライアント側で計算値を表示**

ProductDetail.loadProductで、`product.calculated.processingCostTotal`等を正しく表示:

```javascript
// 加工費合計を表示
const processingCostTotal = product.calculated ? product.calculated.processingCostTotal : 0;
document.getElementById('detail-processingCostTotal').textContent = Utils.formatCurrency(processingCostTotal);
```

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/server/services/ProductService.ts src/server/index.ts src/client/scripts-app.html
git commit -m "fix: 製品詳細の価格情報に加工費合計が正しく反映されるよう修正"
```

---

### Task 3: 販売処理に失敗する [高]

**問題分析:**
SalesService.sellProductでは`salesData.soldDate`と`salesData.soldPrice`を検証する。クライアント側の販売モーダルからのデータ変換（特に日付のISO文字列→Date変換）に問題がある可能性。index.tsの`sellProduct`関数でsalesDataの日付がStringのまま渡されている可能性もある。

**Files:**
- Modify: `src/server/index.ts` (sellProduct関数の引数変換)
- Modify: `src/client/scripts-app.html` (ProductDetail.sellProduct のデータ送信部分)

**Step 1: index.ts の sellProduct 関数でデータ型変換を追加**

```typescript
function sellProduct(productId: string, salesData: SalesData) {
  try {
    const service = new SalesService(getSpreadsheetId());
    // 日付の型変換（クライアントからはISO文字列で来る場合がある）
    const convertedData: SalesData = {
      ...salesData,
      soldDate: salesData.soldDate ? new Date(salesData.soldDate as unknown as string) : salesData.soldDate,
      soldPrice: Number(salesData.soldPrice),
    };
    const result = service.sellProduct(productId, convertedData);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('sellProduct error:', error);
    throw error;
  }
}
```

**Step 2: クライアント側の販売データ送信を確認・修正**

ProductDetail内のsellProductデータ構築を確認し、フィールド名がサーバー側のSalesDataインターフェースと一致しているか確認。

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/server/index.ts src/client/scripts-app.html
git commit -m "fix: 販売処理のデータ型変換を修正し、販売が成功するよう修正"
```

---

### Task 4: 大分類と中分類の修正画面がない [高]

**問題分析:**
現在のマスター管理画面は樹種・仕入れ先・加工業者・保管場所の4種類のみ。大分類(MAJOR_CATEGORIES)と中分類(MINOR_CATEGORIES)はコード内のconst配列として定義されており、マスターテーブルではない。修正画面を追加するにはシートベースのマスター管理に変更するか、あるいは既存製品の大分類/中分類を一括変更する画面を追加する必要がある。

要望の意図：既存製品の大分類・中分類をマスター管理画面から編集したい。

**Files:**
- Modify: `src/client/scripts-app.html` (Master オブジェクトにカテゴリ管理機能を追加)
- Modify: `src/client/template-master.html` (大分類・中分類のタブを追加)
- Modify: `src/server/types/common.ts` (カテゴリをマスターシートに移行準備 - ただし今回はシンプルにフロント側で直接管理)

**Step 1: template-master.html にカテゴリ管理タブを追加**

マスター管理画面のタブに「大分類」「中分類」タブを追加。現在はコード上の固定配列なので、今回は大分類・中分類の一覧表示+追加+削除のUIをフロント側で実現。バックエンドにはカテゴリマスター用のシートとリポジトリを新設する。

ただし工数を考慮し、最小限の対応として：
- 大分類・中分類の管理をシートベースのマスターに移行する代わりに
- マスター管理画面にカテゴリ設定タブを追加し、クライアントのconst配列をScript Propertiesで管理可能にする

**より実用的な対応案:** 大分類・中分類を既存のコードベースの定数配列に項目を追加/修正できるようにするのは運用上無理がある。代わりに、マスター管理画面にタブを追加し、大分類・中分類もスプレッドシートのマスターシートで管理するようにリファクタリングする。

**Step 1a: サーバー側 - カテゴリマスターのシートとリポジトリを追加**

`src/server/types/common.ts`にカテゴリマスター型を追加:
```typescript
export interface CategoryMaster {
  categoryId: string;
  type: 'major' | 'minor';
  name: string;
  displayOrder: number;
}
```

`src/server/repositories/MasterRepository.ts`にカテゴリリポジトリを追加。

`src/server/index.ts`にカテゴリAPIを追加：
- `getCategories(type)` - 大分類/中分類一覧取得
- `addCategory(type, data)` - カテゴリ追加
- `deleteCategory(type, id)` - カテゴリ削除

**Step 1b: フロント側 - マスター管理画面にタブ追加**

template-master.htmlに「大分類」「中分類」タブを追加。scripts-app.htmlのMasterオブジェクトにカテゴリ管理機能を追加。

**Step 2: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 3: Commit**

```bash
git add src/server/ src/client/
git commit -m "feat: 大分類・中分類の管理画面を追加"
```

---

### Task 5: 製品一覧で保管場所・樹種・サイズ検索 [高]

**問題分析:**
現在の製品一覧画面にはキーワード検索・ステータスフィルター・カテゴリフィルターのみ。保管場所・樹種・サイズでのフィルタリングUIが未実装。サーバー側の`ProductRepository.search()`は既にこれらの条件に対応している。

**Files:**
- Modify: `src/client/template-product-list.html` (フィルターUIを追加)
- Modify: `src/client/scripts-app.html` (ProductList.searchProducts に新条件を追加)

**Step 1: template-product-list.html にフィルターUIを追加**

```html
<!-- 保管場所フィルター -->
<select id="filterStorageLocation" class="form-select">
  <option value="">保管場所で絞り込み</option>
</select>

<!-- 樹種フィルター -->
<select id="filterWoodType" class="form-select">
  <option value="">樹種で絞り込み</option>
</select>

<!-- サイズフィルター -->
<div class="size-filter">
  <input type="number" id="filterMinLength" placeholder="長さ(mm)以上">
  <input type="number" id="filterMaxLength" placeholder="長さ(mm)以下">
  <input type="number" id="filterMinWidth" placeholder="幅(mm)以上">
  <input type="number" id="filterMaxWidth" placeholder="幅(mm)以下">
</div>
```

**Step 2: scripts-app.html の ProductList.searchProducts を修正**

```javascript
const conditions = {
  keyword: keyword || undefined,
  statuses: status ? [status] : undefined,
  majorCategories: category ? [category] : undefined,
  storageLocationIds: storageLocationId ? [storageLocationId] : undefined,
  woodTypes: woodType ? [woodType] : undefined,
  lengthRange: minLength || maxLength ? { min: minLength, max: maxLength } : undefined,
  widthRange: minWidth || maxWidth ? { min: minWidth, max: maxWidth } : undefined,
};
```

**Step 3: マスターデータからドロップダウンを動的に生成**

ProductList.initで保管場所と樹種のドロップダウンをApp.masterDataから生成。

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 5: Commit**

```bash
git add src/client/template-product-list.html src/client/scripts-app.html
git commit -m "feat: 製品一覧に保管場所・樹種・サイズ検索フィルターを追加"
```

---

### Task 6: 販売時送料欄で配送業者を追加 [中]

**問題分析:**
販売時送料は現在数値入力のみ。配送業者名を選択/入力できるフィールドを追加する。配送業者は今後追加される可能性+社員配送もあるため、マスターデータまたは自由入力で対応。

**Files:**
- Modify: `src/server/types/product.ts` (Product に shippingCarrier フィールドを追加)
- Modify: `src/server/types/product.ts` (PRODUCT_COLUMNS, PRODUCT_HEADERS, rowToProduct, productToRow を修正)
- Modify: `src/client/template-product-form.html` (配送業者入力欄を追加)
- Modify: `src/client/scripts-app.html` (ProductForm.collectFormData に配送業者を追加)
- Modify: `src/client/template-product-detail.html` (配送業者表示を追加)

**Step 1: Product型にshippingCarrierフィールドを追加**

```typescript
// types/product.ts
shippingCarrier?: string; // 配送業者名

// PRODUCT_COLUMNS に追加（列33 = AH）
// PRODUCT_HEADERS に '配送業者' を追加
// rowToProduct / productToRow に対応追加
```

**注意:** スプレッドシートのカラム数を増やすため、既存データとの互換性に注意。新規カラムは末尾に追加する（AG→AH列）。ただし、既存の列マッピング(33列)の後に追加するのが安全。

しかし列を増やすとスプレッドシート側のデータ互換性に問題が生じるリスクがある。より安全な方法として、販売備考（salesRemarks）フィールドに配送業者情報を含める、または別アプローチを検討。

**実装方針の変更:** 新規列追加は運用中のシートへの影響が大きいため、shippingCarrierを別途Productの既存フィールドに埋め込まず、送料欄の横にテキスト入力を追加し、`salesRemarks`の一部として保存するシンプルな方法を採用。ただし将来の拡張性を考えるなら列追加が正しい。ここでは列を追加する正式な方法で実装する。

**Step 1: types/product.ts を修正**

PRODUCT_COLUMNSの最後にSHIPPING_CARRIER: 33を追加、PRODUCT_HEADERSに'配送業者'を追加、rowToProduct/productToRowに対応追加。

**Step 2: フロント側フォームに配送業者入力を追加**

`template-product-form.html`の送料入力欄の横に配送業者のテキスト入力を追加。

**Step 3: ProductDetail に配送業者表示を追加**

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 5: Commit**

```bash
git add src/server/types/product.ts src/client/
git commit -m "feat: 販売時送料に配送業者入力欄を追加"
```

---

### Task 7: 出荷日/納品日入力欄を追加 [中]

**問題分析:**
販売処理モーダルに「出荷日」「納品日」の入力欄がない。SalesData型にdeliveryDateフィールドを追加し、販売モーダルと販売処理に反映する。

**Files:**
- Modify: `src/server/services/SalesService.ts` (SalesData に deliveryDate を追加)
- Modify: `src/server/types/product.ts` (Product に deliveryDate を追加、列マッピング)
- Modify: `src/server/repositories/ProductRepository.ts` (sell メソッドに deliveryDate を追加)
- Modify: `src/client/scripts-app.html` (販売モーダルのデータ収集に納品日を追加)
- Modify: `src/client/template-product-detail.html` (販売モーダルに納品日入力欄を追加)

**Step 1: Product型にdeliveryDateを追加**

types/product.tsにdeliveryDate追加。Task 6でカラム33を使ったので34列目に追加。

**Step 2: SalesData型にdeliveryDateを追加**

**Step 3: フロント側の販売モーダルに納品日入力を追加**

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 5: Commit**

```bash
git add src/server/ src/client/
git commit -m "feat: 販売処理に出荷日・納品日入力欄を追加"
```

---

### Task 8: 価格調整額で税別・税込を選べるように [中]

**問題分析:**
現在、priceAdjustmentは常に税抜価格に加算される。顧客は税込ベースで調整額を入力したい場合がある。税別/税込のトグルを追加し、税込選択時は内部で税抜に変換して計算する。

**Files:**
- Modify: `src/client/template-product-form.html` (税別/税込ラジオボタンを追加)
- Modify: `src/client/scripts-app.html` (価格計算ロジックで税別/税込を考慮)

**Step 1: フォームに税別/税込選択UIを追加**

```html
<div class="form-group">
  <label>価格調整額の種類</label>
  <div>
    <label><input type="radio" name="priceAdjustmentType" value="exTax" checked> 税別</label>
    <label><input type="radio" name="priceAdjustmentType" value="incTax"> 税込</label>
  </div>
</div>
```

**Step 2: 価格計算ロジックの修正**

tax込選択時は`priceAdjustment / 1.1`で税抜に変換してから計算に使用。

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/client/template-product-form.html src/client/scripts-app.html
git commit -m "feat: 価格調整額で税別・税込を選択可能に"
```

---

### Task 9: カレンダーの矢印レイアウト変更 [中]

**問題分析:**
カレンダーの年月表示を「←2026年（令和８年）2月→」の形式に変更し、左右スクロールで月を変更できるようにしたい。現在のHTML date inputはブラウザネイティブの日付ピッカーを使用している可能性が高い。

**実装方針:** HTML5 `<input type="date">` はブラウザネイティブのため、カスタムカレンダーUIに置き換える必要がある。しかし、GAS WebアプリのHTMLで完全なカスタムカレンダーを実装するのは工数が大きい。和暦表示のカスタムヘッダー付きカレンダーをVanilla JSで実装する。

**Files:**
- Create: `src/client/scripts-calendar.html` (カスタムカレンダーコンポーネント)
- Modify: `src/client/styles-components.html` (カレンダースタイル)
- Modify: `src/client/index.html` (calendar scriptをinclude)
- Modify: `src/client/scripts-app.html` (date inputをカスタムカレンダーに置換)

**Step 1: カスタムカレンダーコンポーネントを作成**

Vanilla JSで月送りカレンダーを実装。ヘッダーに「←2026年（令和８年）2月→」表示。

**Step 2: スタイルを追加**

**Step 3: 既存の date input をカスタムカレンダーに接続**

既存の`<input type="date">`はそのまま残し、フォーカス時にカスタムカレンダーポップアップを表示する方式にする。これにより既存のフォームデータフローに影響を与えない。

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 5: Commit**

```bash
git add src/client/
git commit -m "feat: 和暦対応カスタムカレンダーを追加（←年月→ スクロール対応）"
```

---

### Task 10: 価格調整額でエンター押すと入荷サイズが消える [中]

**問題分析:**
価格調整額入力フィールドでEnterキーを押すとフォームがsubmitされ、ページがリロードされてデータが消失する。フォームのsubmitイベントを防止する必要がある。

**Files:**
- Modify: `src/client/scripts-app.html` (フォームのsubmitイベント防止)

**Step 1: フォームのEnterキー制御を追加**

```javascript
// product-form のinputでEnterキーを押した時のsubmitを防止
document.getElementById('product-form').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});
```

**Step 2: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 3: Commit**

```bash
git add src/client/scripts-app.html
git commit -m "fix: 価格調整額フィールドでEnter押下時のフォーム送信を防止"
```

---

### Task 11: 写真がありませんクリックで写真追加 [中]

**問題分析:**
製品詳細画面で写真がない場合に「写真がありません」と表示されるが、クリックしても写真追加機能に遷移しない。クリック時にファイルアップロードダイアログを開くか、編集画面に遷移するようにする。

**Files:**
- Modify: `src/client/scripts-app.html` (ProductDetail の写真なし表示にクリックハンドラを追加)
- Modify: `src/client/template-product-detail.html` (写真なし表示にクリック可能なスタイルを追加)
- Modify: `src/client/styles-components.html` (クリック可能なスタイル)

**Step 1: 写真なし表示にクリックイベントを追加**

クリック時に隠しファイルinputを開く。アップロード完了後に写真URLをproductに保存して表示を更新。

```javascript
// 写真なし表示をクリック可能に
noPhotoElement.style.cursor = 'pointer';
noPhotoElement.addEventListener('click', function() {
  // ファイルアップロードダイアログを開く
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/webp';
  fileInput.onchange = async function(e) {
    // アップロード処理
  };
  fileInput.click();
});
```

**Step 2: スタイル修正**

写真なし表示にhoverスタイルを追加（cursor: pointer, 背景色変更）。

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/client/
git commit -m "feat: 製品詳細の写真なし表示クリックで写真アップロード可能に"
```

---

### Task 12: ステータス「販売中」→「商談中」追加、担当者・部署名 [中]

**問題分析:**
新しいステータス「商談中」を追加し、商談中の製品に担当者名・部署名を記録できるようにしたい。誰が商談を進めているか分かるようにする。

**Files:**
- Modify: `src/server/types/product.ts` (PRODUCT_STATUSES に '商談中' を追加、Product に negotiator/department フィールド追加)
- Modify: `src/client/scripts-app.html` (ステータス変更機能、商談中UIの追加)
- Modify: `src/client/template-product-detail.html` (商談中ステータスのUI)
- Modify: `src/client/styles-common.html` (商談中ステータスのバッジスタイル)

**Step 1: Product型を拡張**

```typescript
// PRODUCT_STATUSES に '商談中' を追加
export const PRODUCT_STATUSES = [
  '販売中', '商談中', '販売済み', '棚卸し中', '削除済み', '紛失',
] as const;

// Product インターフェースに追加
negotiator?: string;   // 商談担当者
department?: string;   // 担当部署
```

**Step 2: 列マッピングに追加**

PRODUCT_COLUMNS、PRODUCT_HEADERS、rowToProduct、productToRowに対応追加。

**Step 3: フロント側 - 商談中ステータスUI**

ProductDetailに「商談開始」ボタンを追加。クリック時に担当者・部署名を入力するモーダルを表示。

**Step 4: ステータスバッジスタイル追加**

```css
.status-negotiating {
  background: #FF9800;
  color: white;
}
```

**Step 5: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 6: Commit**

```bash
git add src/server/ src/client/
git commit -m "feat: 商談中ステータスを追加し、担当者・部署名を記録可能に"
```

---

### Task 13: 製品登録で樹種名が名前に表示される問題 [中]

**問題分析:**
製品登録フォームで樹種を選択すると、商品名フィールドに樹種名がセットされてしまう、または樹種ドロップダウンの表示名が紛らわしい。フォームのauto-fill動作を確認し修正。

**Files:**
- Modify: `src/client/scripts-app.html` (ProductForm の樹種選択イベントハンドラを確認・修正)

**Step 1: 原因特定**

ProductFormの初期化処理で、樹種選択時に商品名フィールドに値がセットされるイベントハンドラがあるか確認。woodType選択のchangeイベントを調査。

**Step 2: 修正**

樹種選択時に商品名が自動セットされる動作があれば削除。または、商品名が空の場合のみ樹種名を補完する意図的な機能であれば、UIで明確にする。

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/client/scripts-app.html
git commit -m "fix: 樹種選択時に商品名が上書きされる問題を修正"
```

---

### Task 14: 長期在庫表示を削除 [低]

**問題分析:**
木材は寝かせるほど価値が出るため、長期在庫アラートが不要。ダッシュボードの「長期在庫」カウントとアラート表示を削除。

**Files:**
- Modify: `src/client/scripts-app.html` (Dashboard の長期在庫関連の表示を削除)
- Modify: `src/client/template-dashboard.html` (長期在庫カードとアラートセクションを削除)

**Step 1: ダッシュボードテンプレートから長期在庫カードを削除**

`template-dashboard.html` から「長期在庫（90日以上）」の統計カードと「アラート」セクションを削除。

**Step 2: scripts-app.html から長期在庫関連ロジックを削除**

Dashboard.loadDataの中の長期在庫カウント表示を削除。

**Step 3: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 4: Commit**

```bash
git add src/client/template-dashboard.html src/client/scripts-app.html
git commit -m "remove: 長期在庫表示・アラートを削除（木材は長期保管が価値になるため）"
```

---

### Task 15: 金額にカンマ表示 [低]

**問題分析:**
入荷単価等の金額入力フィールドにカンマ区切りが表示されない。フォーマットされた表示を追加する。金額表示時はUtils.formatCurrency()を使用しているが、入力フィールドでは数値のままで表示される。

**Files:**
- Modify: `src/client/scripts-app.html` (金額入力フィールドにカンマフォーマットを適用)
- Modify: `src/client/scripts-common.html` (金額入力用のフォーマッタ関数を追加)

**Step 1: scripts-common.html に金額入力フォーマッタを追加**

```javascript
Utils.formatPriceInput = function(input) {
  input.addEventListener('blur', function() {
    const value = this.value.replace(/,/g, '');
    if (value && !isNaN(value)) {
      this.value = Number(value).toLocaleString();
    }
  });
  input.addEventListener('focus', function() {
    this.value = this.value.replace(/,/g, '');
  });
};
```

**Step 2: 全金額入力フィールドにフォーマッタを適用**

ProductForm.init()で全ての金額入力フィールドにformatPriceInputを適用。

**Step 3: collectFormData時にカンマを除去**

```javascript
const purchasePrice = Number(document.getElementById('purchasePrice').value.replace(/,/g, ''));
```

**Step 4: テスト実行**

Run: `cd /home/user/hatauchi/Nomura-Inventory-Tree-app && npx jest --passWithNoTests`
Expected: PASS

**Step 5: Commit**

```bash
git add src/client/scripts-common.html src/client/scripts-app.html
git commit -m "feat: 金額入力フィールドにカンマ区切り表示を追加"
```

---

### Task 16: Git リポジトリ初期化とGithubプッシュ

**Step 1: Gitリポジトリを初期化**

```bash
cd /home/user/hatauchi/Nomura-Inventory-Tree-app
git init
git add .
git commit -m "initial commit: 木材在庫管理アプリ"
```

**Step 2: Githubリポジトリを作成してプッシュ**

```bash
gh repo create Nomura-Inventory-Tree-app --private --source=. --push
```

---

## 実装順序

1. **Task 16** - Git初期化（他の全タスクの前提）
2. **Task 10** - Enterキー問題（1行追加の簡単修正）
3. **Task 14** - 長期在庫表示削除（UI削除の簡単修正）
4. **Task 15** - 金額カンマ表示（ユーティリティ追加）
5. **Task 1** - 編集でサイズ反映しない（高優先度バグ修正）
6. **Task 2** - 加工費合計反映しない（高優先度バグ修正）
7. **Task 3** - 販売処理失敗（高優先度バグ修正）
8. **Task 13** - 樹種名表示問題（小さな修正）
9. **Task 5** - 検索フィルター追加（フロントのみ）
10. **Task 8** - 価格調整額の税別・税込選択（フロントのみ）
11. **Task 9** - カスタムカレンダー（新規コンポーネント）
12. **Task 11** - 写真クリック追加（フロント修正）
13. **Task 6** - 配送業者追加（DB列追加を伴う）
14. **Task 7** - 納品日追加（DB列追加を伴う）
15. **Task 12** - 商談中ステータス（DB列追加を伴う）
16. **Task 4** - 大分類・中分類管理画面（新機能）
17. 最終プッシュ

列追加を伴うTask 6, 7, 12は一括で列追加するため、連続して実装する。
