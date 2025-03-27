# 🏨 Hotel Planisphere E2E自動テストフレームワーク

[![Playwright Tests](https://github.com/ysoma/playwright-sample/actions/workflows/playwright.yml/badge.svg)](https://github.com/ysoma/playwright-sample/actions/workflows/playwright.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?logo=github)](https://ysoma.github.io/playwright-sample/)

このプロジェクトは [Hotel Planisphere](https://hotel.testplanisphere.dev/) を対象とした自動E2Eテストのデモンストレーションです。
Playwright + TypeScript + Allure Report を使用し、効率的かつ堅牢なテスト設計・構成を実装しています。

**📊 最新のテスト結果は [https://ysoma.github.io/playwright-sample/](https://ysoma.github.io/playwright-sample/) で確認できます**

![Playwright](https://img.shields.io/badge/Playwright-v1.51.1-45ba4b.svg?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.3.3-3178C6.svg?logo=typescript)
![Allure](https://img.shields.io/badge/Allure_Report-v2.33.0-orange.svg?logo=qameta)

## 📋 機能

- **Page Object Model (POM)設計** - 保守性と再利用性の高いテストコード
- **ビジュアルリグレッションテスト** - UIの変更を自動検出
- **クロスブラウザテスト** - Chrome, Firefox, Safari対応
- **CI/CD統合** - GitHub Actionsによる自動テスト実行
- **Allureレポート** - 詳細なテスト結果を視覚的に表示
- **GitHub Pages連携** - テスト結果レポートの自動公開

## 🔗 リンク

- [テスト対象サイト](https://hotel.testplanisphere.dev/)
- [テスト結果レポート](https://ysoma.github.io/playwright-sample/) - GitHub Actionsで自動生成されたAllureレポート
- [CI/CDパイプライン](https://github.com/ysoma/playwright-sample/actions)

## 🛠️ 技術スタック

- [Playwright](https://playwright.dev/) - モダンなE2Eテストフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Allure Report](https://docs.qameta.io/allure/) - 豊富な視覚化機能を持つレポートツール
- [GitHub Actions](https://github.com/features/actions) - CI/CDパイプライン
- [GitHub Pages](https://pages.github.com/) - 静的サイトホスティング

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/ysoma/playwright-sample.git
cd playwright-sample

# 依存パッケージのインストール
npm install
```

## ✅ テストの実行

### 全テストを実行

```bash
npm test
```

### 特定のテストファイルの実行

```bash
npx playwright test tests/login.spec.ts
```

### UIモードでテスト実行（開発時に便利）

```bash
npx playwright test --ui
```

### 特定のブラウザでのみテスト実行

```bash
npx playwright test --project=chromium
```

## 📊 レポート生成

### Allureレポートの生成と表示

```bash
# レポート生成
npm run allure:generate

# ブラウザでレポート表示
npm run allure:open
```

### 自動生成されたレポートの確認

GitHub Actionsで実行されたテスト結果は、以下のURLで確認できます：
**[https://ysoma.github.io/playwright-sample/](https://ysoma.github.io/playwright-sample/)**

このレポートは、mainブランチへのコミット時に自動的に更新されます。

### レポートのクリーンアップ

```bash
npm run allure:clean
```

## 🧪 テストスイート

| テストファイル | 内容 | 特徴 |
|--------------|------|------|
| `index.spec.ts` | トップページとナビゲーション | 基本機能とUIテスト |
| `login.spec.ts` | ログイン機能 | 認証フロー、バリデーション、セキュリティ |
| `reservation.spec.ts` | 宿泊予約フロー | E2Eフロー検証（予約〜確定） |
| `visual.spec.ts` | ビジュアルリグレッション | UI一貫性の検証 |

## 📸 ビジュアルテスト

ビジュアルリグレッションテストはUIの変更を自動検出します。

### 期待画像の更新

UIが意図的に変更された場合、期待画像を更新します：

```bash
npx playwright test tests/visual.spec.ts --update-snapshots
```

## 📊 ビジュアルリグレッション検証例

このプロジェクトでは、Playwrightのスクリーンショット比較機能を使用して、UIの視覚的な変更を自動的に検出します。

### 宿泊予約フォーム - ビジュアル比較

<table>
  <tr>
    <th>基準画像（期待値）</th>
    <th>テスト画像（実際）</th>
    <th>差分検出</th>
  </tr>
  <tr>
    <td><img src="docs/images/visual-regression/reserve-expected.png" width="250" alt="基準となる画像"/></td>
    <td><img src="docs/images/visual-regression/reserve-actual.png" width="250" alt="テスト実行時の画像"/></td>
    <td><img src="docs/images/visual-regression/reserve-diff.png" width="250" alt="差分を表示した画像"/></td>
  </tr>
</table>

ビジュアルリグレッションテストでは、上記のように画面の視覚的な変更を自動検出します。わずかなUIの変更でもピクセルレベルで比較し、意図しない変更が発生した場合にテストが失敗します。これにより、デザインの一貫性を保ち、予期せぬUI変更を防止します。

このテストは `tests/visual.spec.ts` で実装されており、宿泊予約フローの各ステップでスクリーンショットを取得・比較します。期待画像を更新したい場合は以下のコマンドを使用します：

```bash
npx playwright test tests/visual.spec.ts --update-snapshots
```

## 🔄 継続的インテグレーション

このプロジェクトはGitHub Actionsと統合されており、以下の自動化が実現されています：

1. **自動テスト実行**
   - プッシュやプルリクエスト時に全テストが自動実行
   - 3種類のブラウザでクロスブラウザテスト

2. **テストレポート生成**
   - Allureレポートの自動生成
   - テスト成果物（スクリーンショットなど）の保存

3. **レポート公開**
   - GitHub Pagesへの自動デプロイ
   - 最新のテスト結果が [https://ysoma.github.io/playwright-sample/](https://ysoma.github.io/playwright-sample/) で常に確認可能

## 📁 プロジェクト構成

```
.
├── pages/              # ページオブジェクト
│   ├── basePage.ts     # 基本ページクラス（共通機能）
│   ├── indexPage.ts    # トップページ
│   ├── loginPage.ts    # ログインページ
│   └── ...             # その他ページオブジェクト
├── tests/              # テストケース
│   ├── index.spec.ts   # トップページテスト
│   ├── login.spec.ts   # ログインテスト
│   └── ...             # その他テスト
├── helpers/            # ヘルパー関数
├── .github/workflows/  # GitHub Actions設定
├── allure-results/     # テスト結果（生成される）
├── allure-report/      # HTMLレポート（生成される）
├── playwright.config.ts # Playwright設定
├── package.json        # プロジェクト設定
└── README.md           # プロジェクト説明
```

## 📝 テスト設計

このプロジェクトでは以下のテスト設計アプローチを採用しています：

1. **ページオブジェクトモデル (POM)** - ページごとの操作をカプセル化
2. **テストデータの分離** - テストとデータを分離し保守性向上
3. **Allureアノテーション** - テストメタデータの付与でレポート強化
4. **エラーハンドリング** - 安定したテスト実行のための対策実装

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順でご参加ください：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT

## 👤 作者

- [@ysoma](https://github.com/ysoma)

---

*このプロジェクトは学習目的で作成されています。*