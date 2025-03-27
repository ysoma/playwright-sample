# 🏨 Hotel Planisphere E2E自動テストフレームワーク

このプロジェクトは [Hotel Planisphere](https://hotel.testplanisphere.dev/) を対象とした自動E2Eテストのデモンストレーションです。
Playwright + TypeScript + Allure Report を使用し、効率的かつ堅牢なテスト設計・構成を実装しています。

![Playwright](https://img.shields.io/badge/Playwright-v1.51.1-45ba4b.svg?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.3.3-3178C6.svg?logo=typescript)
![Allure](https://img.shields.io/badge/Allure_Report-v2.33.0-orange.svg?logo=qameta)

## 📋 機能

- **Page Object Model (POM)設計** - 保守性と再利用性の高いテストコード
- **ビジュアルリグレッションテスト** - UIの変更を自動検出
- **データ駆動テスト** - 様々なテストデータでの検証
- **Allureレポート** - 直感的で視覚的なテスト結果
- **CI/CD互換** - 自動化パイプラインへの統合が容易

## 🛠️ 技術スタック

- [Playwright](https://playwright.dev/) - モダンなE2Eテストフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Allure Report](https://docs.qameta.io/allure/) - 豊富な視覚化機能を持つレポートツール
- [Page Object Model](https://playwright.dev/docs/pom) - テスト設計パターン

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/hotel-planisphere-test.git
cd hotel-planisphere-test

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

## 📊 レポート生成

### Allureレポートの生成と表示

```bash
# レポート生成
npm run allure:generate

# ブラウザでレポート表示
npm run allure:open
```

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
4. **スクリーンショットの活用** - 失敗時の状態を視覚的に把握

## 🔄 継続的インテグレーション

このテストスイートはCI/CDパイプラインに簡単に統合できます。GitHub Actionsの設定例：

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - name: Generate Allure report
        if: always()
        run: npm run allure:generate
      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: allure-report
          path: allure-report/
```

## 📈 将来の拡張計画

- [ ] テストカバレッジの拡大（管理画面、エラーケース等）
- [ ] APIテストの追加
- [ ] 複数ブラウザでの並列テスト実行
- [ ] カスタムレポートダッシュボードの実装

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