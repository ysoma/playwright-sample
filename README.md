# 🏨 Hotel Planisphere 自動E2Eテスト

このプロジェクトは [Hotel Planisphere](https://hotel.testplanisphere.dev/) を対象にした、自動E2Eテストのサンプルです。  
Playwright + TypeScript + Allure Report を使用し、実践的なテスト設計・構成を実現しています。

---

## 📦 技術スタック

- [Playwright](https://playwright.dev/)
- TypeScript
- Allure Report
- ページオブジェクトモデル（POM）設計

---

## 🚀 セットアップ

```bash
npm install
```

---

## ✅ テスト実行

```bash
npm test
```

---

## 📊 Allure レポート生成 & 表示

```bash
npm run allure:generate
npm run allure:open
```

---

## 🧪 テストスイート一覧（随時追加予定）

| ページ       | テスト内容 |
|--------------|------------------------------|
| `index.spec`     | トップページ表示、ナビゲーションメニューの遷移 |
| `login.spec`     | ログイン成功／失敗、ログアウト、認証制御 |
| `reservation.spec`       | 宿泊予約フロー（`/plans → /reserve → /complete`） |
| `visual.spec`       | 宿泊予約フローのビジュアルリグレッションテスト |
| ✅ 予定       | 異常系テスト、管理画面テスト... |

---

## 📁 ディレクトリ構成

```
.
├── pages/            # ページオブジェクト（URLごとにファイル分割）
├── tests/            # Playwrightのテストコード
├── helpers/            # ヘルパーメソッド
├── allure-results/   # テスト結果（Allure用）
├── allure-report/    # HTMLレポート（生成される）
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧰 スクリプト一覧

| コマンド                     | 内容                           |
|-----------------------------|--------------------------------|
| `npm run test`              | テスト全実行                   |
| `npm run allure:generate`   | レポート生成（古い結果は削除）|
| `npm run allure:open`       | ブラウザでレポート表示         |
| `npm run allure:clean`      | 結果・レポート完全削除（任意）|
| `npx playwright test tests/visual.spec.ts --update-snapshots` | 期待画像の更新|

---

## 📌 補足情報

- テストには公式で利用可能なアカウント（`ichiro@example.com` / `password`）を使用
- レポートは [Allure](https://docs.qameta.io/allure/) を用いて視覚化

---

## 👤 作者

- @ysoma

---