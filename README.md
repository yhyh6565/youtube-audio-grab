# YouTube Audio Extractor

유튜브 커버곡을 쉽게 음원으로 추출하는 웹 서비스

## 주요 기능

- ✅ 유튜브 URL 입력만으로 자동 음원 추출
- ✅ 고음질 MP3 파일 (192kbps)
- ✅ 썸네일 자동 커버 이미지 삽입
- ✅ 실시간 진행 상황 표시
- ✅ 파일명 자동 파싱 및 정리
- ✅ 모바일/데스크톱 반응형 디자인

## 기술 스택

### Frontend
- React + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router

### Backend
- FastAPI (Python)
- yt-dlp (YouTube 다운로드)
- mutagen (MP3 메타데이터 편집)
- FFmpeg (오디오 변환)

## 시작하기

### 환경 요구사항

- Node.js 18+
- Python 3.10+
- FFmpeg

### 1. 저장소 클론

```bash
git clone <YOUR_GIT_URL>
cd youtube-audio-grab-main
```

### 2. 백엔드 설정

```bash
cd backend

# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# FFmpeg 설치 (macOS)
brew install ffmpeg

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 설정 수정
```

### 3. 프론트엔드 설정

```bash
# 프로젝트 루트로 이동
cd ..

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# VITE_API_URL을 백엔드 URL로 설정 (기본: http://localhost:8000/api)
```

### 4. 실행

**터미널 1 - 백엔드 실행:**

```bash
cd backend
uvicorn app.main:app --reload
```

백엔드가 http://localhost:8000에서 실행됩니다.

**터미널 2 - 프론트엔드 실행:**

```bash
npm run dev
```

프론트엔드가 http://localhost:5173에서 실행됩니다.

### 5. Docker로 실행 (선택사항)

```bash
# 백엔드만 Docker로 실행
cd backend
docker-compose up --build

# 또는 백그라운드 실행
docker-compose up -d
```

## 프로젝트 구조

```
youtube-audio-grab-main/
├── backend/              # FastAPI 백엔드
│   ├── app/
│   │   ├── api/          # API 엔드포인트
│   │   ├── core/         # 설정
│   │   ├── models/       # 데이터 스키마
│   │   ├── services/     # 비즈니스 로직
│   │   └── utils/        # 유틸리티
│   ├── temp_files/       # 임시 파일 (git ignore)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── src/                  # React 프론트엔드
│   ├── components/       # React 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── lib/              # API 클라이언트
│   └── hooks/            # Custom Hooks
│
├── .env.example          # 프론트엔드 환경 변수 예시
└── README.md
```

## API 문서

백엔드 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 주요 엔드포인트

1. **영상 미리보기** - `POST /api/preview`
2. **음원 추출** - `POST /api/extract` (SSE 스트림)
3. **파일 다운로드** - `POST /api/download`

## 환경 변수

### 프론트엔드 (`.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

### 백엔드 (`backend/.env`)

```env
PROJECT_NAME="YouTube Audio Extractor"
VERSION="1.0.0"
API_PREFIX="/api"
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
UPLOAD_DIR="temp_files"
MAX_FILE_AGE_HOURS=1
RATE_LIMIT_PER_HOUR=10
```

## 주의사항

⚠️ **중요**: 다음 파일들은 절대 git에 커밋하지 마세요!

- `backend/.env` - 환경 변수
- `backend/temp_files/` - 임시 MP3 파일
- `.env` - 프론트엔드 환경 변수

이미 `.gitignore`에 추가되어 있습니다.

## 배포

### 프론트엔드 배포 (Vercel)

1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정: `VITE_API_URL=<백엔드 URL>/api`
4. 자동 배포

### 백엔드 배포 (Railway/Render)

1. Railway 또는 Render 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

자세한 배포 가이드는 `backend/README.md` 참조

## 개발 가이드

### 새로운 기능 추가

1. 백엔드 API 엔드포인트 추가: `backend/app/api/routes.py`
2. 프론트엔드 API 클라이언트 업데이트: `src/lib/api.ts`
3. UI 컴포넌트 추가: `src/components/`
4. 페이지에 통합: `src/pages/Index.tsx`

### 코드 스타일

- **프론트엔드**: ESLint + Prettier
- **백엔드**: Black + isort

## 라이선스

개인 프로젝트

## 저작권 안내

본 서비스로 추출된 음원은 **개인 소장 목적으로만** 사용 가능합니다.
대량 배포 및 영리적 사용은 저작권법 위반에 해당할 수 있습니다.

---

Made with ❤️ by Yeonhee
