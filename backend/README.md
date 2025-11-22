# YouTube Audio Extractor - Backend

FastAPI 기반 유튜브 음원 추출 백엔드 서버

## 기능

- 유튜브 영상 정보 미리보기
- 음원 추출 (MP3 192kbps)
- 썸네일 자동 커버 이미지 삽입
- 실시간 진행 상황 업데이트 (SSE)
- 자동 파일명 정리
- 세션 기반 파일 관리

## 기술 스택

- **FastAPI**: 고성능 비동기 웹 프레임워크
- **yt-dlp**: 유튜브 다운로드 라이브러리
- **mutagen**: MP3 메타데이터 편집
- **FFmpeg**: 오디오 변환

## 시작하기

### 1. 로컬 개발 (Python)

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# FFmpeg 설치 (macOS)
brew install ffmpeg

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 설정 수정

# 서버 실행
uvicorn app.main:app --reload
```

서버가 실행되면 http://localhost:8000에서 접근 가능합니다.

### 2. Docker로 실행

```bash
# Docker 컨테이너 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## API 엔드포인트

### 1. 영상 정보 미리보기

```http
POST /api/preview
Content-Type: application/json

{
  "youtube_url": "https://www.youtube.com/watch?v=xxxxx"
}
```

### 2. 음원 추출 (SSE)

```http
POST /api/extract
Content-Type: application/json

{
  "youtube_url": "https://www.youtube.com/watch?v=xxxxx"
}
```

응답: Server-Sent Events 스트림

### 3. 파일 다운로드

```http
POST /api/download
Content-Type: application/json

{
  "session_id": "abc-123-def",
  "filename": "My Song (cover by. Artist)"
}
```

### 4. 헬스 체크

```http
GET /health
```

## API 문서

서버 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 환경 변수

`.env` 파일에서 설정 가능한 환경 변수:

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PROJECT_NAME` | 프로젝트 이름 | YouTube Audio Extractor |
| `VERSION` | 버전 | 1.0.0 |
| `API_PREFIX` | API 경로 prefix | /api |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (콤마 구분) | http://localhost:5173 |
| `UPLOAD_DIR` | 임시 파일 저장 경로 | temp_files |
| `MAX_FILE_AGE_HOURS` | 파일 자동 삭제 시간 (시간) | 1 |
| `RATE_LIMIT_PER_HOUR` | IP당 시간당 요청 제한 | 10 |
| `HOST` | 서버 호스트 | 0.0.0.0 |
| `PORT` | 서버 포트 | 8000 |
| `ENVIRONMENT` | 환경 (development/production) | development |

## 프로젝트 구조

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py          # API 엔드포인트
│   ├── core/
│   │   └── config.py          # 설정
│   ├── models/
│   │   └── schemas.py         # Pydantic 스키마
│   ├── services/
│   │   ├── youtube.py         # 유튜브 서비스
│   │   ├── audio.py           # 오디오 처리
│   │   └── session.py         # 세션 관리
│   ├── utils/
│   │   └── sanitize.py        # 파일명 정리
│   └── main.py                # FastAPI 앱
├── temp_files/                # 임시 파일 (git ignore)
├── requirements.txt           # Python 의존성
├── Dockerfile                 # Docker 이미지
├── docker-compose.yml         # Docker Compose 설정
├── .env.example               # 환경 변수 예시
└── README.md
```

## 보안 주의사항

⚠️ **중요**: `.env` 파일은 절대 git에 커밋하지 마세요!

`.gitignore`에 다음 항목들이 포함되어 있는지 확인하세요:
- `.env`
- `temp_files/`
- `*.mp3`

## 배포

### Railway 배포

1. Railway 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

### Render 배포

1. Render 계정 생성
2. New Web Service 선택
3. GitHub 저장소 연결
4. 환경 변수 설정:
   - `ALLOWED_ORIGINS`: 프론트엔드 도메인
5. 배포

## 라이선스

개인 프로젝트
