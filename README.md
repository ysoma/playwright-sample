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

## 🧪 テスト対象一覧（随時追加予定）

| ページ       | テスト内容 |
|--------------|------------------------------|
| `/index`     | トップページ表示、ナビゲーションメニューの遷移 |
| `/login`     | ログイン成功／失敗、ログアウト、認証制御 |
| `BasePage`   | 共通ナビゲーション（ホーム・プラン・ログイン・ログアウト） |
| ✅ 予定       | 宿泊予約フロー（`/plans → /reserve → /complete`） |

---

## 📁 ディレクトリ構成

```
.
├── pages/            # ページオブジェクト（URLごとにファイル分割）
├── tests/            # Playwrightのテストコード
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

---

## 📌 補足情報

- テストには公式で利用可能なアカウント（`ichiro@example.com` / `password`）を使用
- レポートは [Allure](https://docs.qameta.io/allure/) を用いて視覚化

---

## 👤 作者

- @ysoma

---