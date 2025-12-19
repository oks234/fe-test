module.exports = {
  ignores: ['dist'],
  env: { // 실행 환경 설정
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [ // 규칙 확장 설정
    'eslint:recommended', // ESLint 기본 권장 규칙
    'plugin:prettier/recommended', // Prettier 규칙 포함 (eslint-config-prettier에 의해 비활성화됨)
  ],
  parserOptions: { // 파서 옵션
    ecmaVersion: 'latest',  // 최신 ECMAScript 문법 지원
    sourceType: 'module',  // ECMAScript 모듈(ESM) 사용
  },
  rules: { // 세부 규칙 설정 (필요에 따라 추가/수정)
    'no-unused-vars': 'warn', // 사용되지 않는 변수 경고
    'prettier/prettier': ['error', { // Prettier 규칙 적용 (여기서 포맷 옵션 지정 가능)
      'endOfLine': 'auto', // 개행 문자 자동 설정
      'singleQuote': true, // 작은따옴표 사용
      'semi': true, // 세미콜론 사용
      'tabWidth': 2, // 탭 크기
      'trailingComma': 'all', // 후행 쉼표 'all'로 설정
    }],
  },
};
