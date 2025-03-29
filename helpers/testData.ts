/**
 * @name testData.ts
 * @description テスト用データの集約モジュール
 * 複数のテストファイルで使用される共通のテストデータを定義します。
 */

/**
 * ログイン認証情報
 */
export const loginCredentials = {
    validUser: {
        email: 'ichiro@example.com',
        password: 'password'
    },
    invalidUser: {
        email: 'ichiro@example.com',
        password: 'wrongpassword'
    },
    nonExistentUser: {
        email: 'nonexistent@example.com',
        password: 'password'
    }
};

/**
 * 宿泊予約データ
 */
export const reservationData = {
    planName: 'お得な特典付きプラン',
    checkInDate: '2025/04/01',
    stayDays: '2',
    guests: '2',
    additionalPlans: ['朝食バイキング', 'お得な観光プラン'],
    guestName: 'テスト太郎',
    email: 'test@example.com',
    remarks: '静かな部屋を希望します'
};

/**
 * ログインテストケース
 */
export const loginTestCases = [
    // 有効なケース
    {
        testName: '標準的な有効なログイン情報',
        email: loginCredentials.validUser.email,
        password: loginCredentials.validUser.password,
        expectedOutcome: 'success' as const,
        expectedEmailError: '',  // エラーなし
        expectedPasswordError: '',  // エラーなし
        tags: ['positive', 'smoke']
    },
    // メールアドレスの境界値テスト
    {
        testName: '空のメールアドレス',
        email: '',
        password: loginCredentials.validUser.password,
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'このフィールドを入力してください',
        expectedPasswordError: '',  // エラーなし
        tags: ['negative', 'validation', 'boundary']
    },
    {
        testName: '無効な形式のメールアドレス',
        email: 'ichiro-example.com',
        password: loginCredentials.validUser.password,
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'メールアドレスを入力してください',
        expectedPasswordError: '',  // エラーなし
        tags: ['negative', 'validation', 'format']
    },
    {
        testName: '存在しないユーザーのメールアドレス',
        email: loginCredentials.nonExistentUser.email,
        password: loginCredentials.nonExistentUser.password,
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'authentication']
    },
    // パスワードの境界値テスト
    {
        testName: '空のパスワード',
        email: loginCredentials.validUser.email,
        password: '',
        expectedOutcome: 'failure' as const,
        expectedEmailError: '',  // エラーなし
        expectedPasswordError: 'このフィールドを入力してください',
        tags: ['negative', 'validation', 'boundary']
    },
    {
        testName: '誤ったパスワード',
        email: loginCredentials.invalidUser.email,
        password: loginCredentials.invalidUser.password,
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'authentication']
    },
    // エッジケース
    {
        testName: '極端に長いメールアドレス',
        email: 'very-very-very-very-very-very-very-very-very-very-long-email-address@example.com',
        password: loginCredentials.validUser.password,
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'boundary', 'security']
    },
    {
        testName: '特殊文字を含むパスワード（XSSパターン）',
        email: loginCredentials.validUser.email,
        password: '<script>alert("XSS")</script>',
        expectedOutcome: 'failure' as const,
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'security']
    }
];
