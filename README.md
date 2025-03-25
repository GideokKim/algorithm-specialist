# Algorithm Specialist

알고리즘 스터디 멤버들의 solved.ac 스트릭을 추적하고 랭킹을 보여주는 웹 애플리케이션입니다.

🔗 [Live Demo](https://algorithm-specialist.vercel.app/)

## 주요 기능

### 1. 스트릭 랭킹
- `GitHub ID`와 `solved.ac 핸들`을 매핑하여 스터디 멤버들의 스트릭 현황을 표시
- 현재 스트릭 기준으로 자동 랭킹 정렬
- 1시간마다 자동 업데이트

### 2. 스트릭 시각화
- `solved.ac` 사용자별 스트릭 이미지 표시 (mazandi API 활용)
- 각 사용자의 현재 스트릭과 최장 스트릭 정보 제공

## 기술 스택

- **Frontend**: Next.js 13+ (App Router)
- **Deployment**: Vercel
- **API Integration**: 
  - solved.ac API
  - mazandi API (스트릭 시각화)

## 프로젝트 구조

```bash
app/
├── api/
│   └── solved/        # solved.ac API 프록시
├── components/
│   ├── UserRanking    # 랭킹 표시 컴포넌트
│   └── UserStreak     # 스트릭 표시 컴포넌트
├── utils/
│   └── solvedac.ts    # solved.ac API 관련 유틸리티
├── page.tsx           # 메인 페이지
└── layout.tsx         # 루트 레이아웃
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 환경 설정

프로젝트 루트에 `next.config.js` 파일에서 다음 설정이 필요합니다:

```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mazandi.herokuapp.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          // ... CORS 설정
        ],
      },
    ];
  }
};
```

## 배포

이 프로젝트는 Vercel을 통해 자동 배포됩니다. main 브랜치에 push하면 자동으로 배포가 진행됩니다.

## 라이선스

MIT License
