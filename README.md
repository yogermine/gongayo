# 공아요 🎓
> 공부를 아시나요? — AI 맞춤 학습 분석 서비스

## 주요 기능
- **답안 분석**: 문제·정답 입력 → 학생 답안 → Claude AI 맞춤 피드백
- **약점 지도**: 오답률 높은 단원 자동 추출 + 유튜브 강의 연결
- **대학 예측**: 현재 등급 → 대학 그룹별 합격 가능성 %
- **대시보드**: 학습 현황 한눈에 보기

## 빠른 시작

### 1. 설치
```bash
cd gongayo
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
# .env.local 파일을 열어 API 키 입력
```

**API 키 발급 방법:**
- Anthropic: https://console.anthropic.com → API Keys → Create Key
- Supabase: https://supabase.com → New Project → Settings → API

### 3. 실행
```bash
npm run dev
# http://localhost:5173 에서 확인
```

### 4. 배포 (Vercel)
```bash
npm install -g vercel
vercel
# 환경변수를 Vercel 대시보드에서 동일하게 입력
```

## 기술 스택
| 역할 | 기술 | 비용 |
|------|------|------|
| 프론트엔드 | React + Vite | 무료 |
| AI 엔진 | Claude API (claude-sonnet-4) | 월 2~5만원 |
| 데이터베이스 | Supabase | 무료 (500MB) |
| 배포 | Vercel | 무료 |
| 도메인 | .kr 도메인 | 연 1~2만원 |

## 폴더 구조
```
src/
├── components/
│   └── Nav.jsx          # 상단 네비게이션
├── pages/
│   ├── Dashboard.jsx    # 메인 대시보드
│   ├── ExamAnalyzer.jsx # 답안 분석 (핵심)
│   ├── WeaknessMap.jsx  # 약점 지도
│   └── UnivPredictor.jsx# 대학 합격 예측
├── App.jsx
├── main.jsx
└── index.css
```

## 다음 단계 (로드맵)
- [ ] Supabase 연동 → 데이터 영구 저장
- [ ] 구글 로그인 연동
- [ ] 학생별 성장 추이 그래프
- [ ] 결제 연동 (토스페이먼츠)
- [ ] 모바일 앱 (React Native)
