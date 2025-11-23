# 배포 가이드 (Deployment Guide)

## 환경변수 설정

### 로컬 개발 환경

**프론트엔드 (.env)**
```bash
VITE_API_URL=http://localhost:8000/api
```

**백엔드 (backend/.env)**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:3000
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

---

## 프로덕션 배포

### 1단계: 백엔드 배포 (Railway 추천)

#### Railway 배포:
1. [Railway](https://railway.app/) 가입
2. GitHub 저장소 연결
3. 루트 디렉토리를 `backend`로 설정
4. 환경변수 설정:
   ```bash
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ENVIRONMENT=production
   PORT=8000
   ```
5. 배포 완료 후 URL 복사 (예: `https://youtube-audio-backend.up.railway.app`)

#### 다른 옵션:
- **Render**: [render.com](https://render.com)
- **DigitalOcean App Platform**: [digitalocean.com](https://www.digitalocean.com/products/app-platform)
- **AWS EC2** (직접 서버 관리 필요)

### 2단계: 프론트엔드 배포 (Vercel)

#### Vercel 배포:
1. [Vercel](https://vercel.com/) 가입
2. GitHub 저장소 연결
3. 루트 디렉토리는 그대로 유지 (자동으로 Vite 감지)
4. **환경변수 설정 (중요!)**:
   - Settings → Environment Variables
   - 추가:
     ```
     Name: VITE_API_URL
     Value: https://your-backend.railway.app/api
     ```
   - All Environments 선택
5. Redeploy

---

## 환경변수 체크리스트

### 백엔드 환경변수
| 변수명 | 로컬 | 프로덕션 | 설명 |
|--------|------|----------|------|
| `ALLOWED_ORIGINS` | `http://localhost:5173` | `https://your-app.vercel.app` | CORS 허용 도메인 |
| `PORT` | `8000` | `8000` | 서버 포트 |
| `ENVIRONMENT` | `development` | `production` | 환경 |

### 프론트엔드 환경변수
| 변수명 | 로컬 | 프로덕션 | 설명 |
|--------|------|----------|------|
| `VITE_API_URL` | `http://localhost:8000/api` | `https://your-backend.railway.app/api` | 백엔드 API URL |

---

## 배포 후 확인사항

1. **백엔드 Health Check**:
   ```bash
   curl https://your-backend.railway.app/health
   # 응답: {"status":"healthy","version":"1.0.0","sessions":0}
   ```

2. **프론트엔드에서 API 연결 확인**:
   - 브라우저 개발자 도구 → Network 탭
   - YouTube URL 입력 시 `/api/preview` 요청이 백엔드로 가는지 확인

3. **CORS 오류 발생 시**:
   - 백엔드의 `ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인
   - 프로토콜(http/https) 정확히 일치하는지 확인

---

## 문제 해결 (Troubleshooting)

### "Failed to fetch" 오류
- **원인**: 백엔드 URL이 잘못됨
- **해결**: Vercel 환경변수 `VITE_API_URL` 확인 및 재배포

### CORS 오류
- **원인**: 백엔드에서 프론트엔드 도메인을 허용하지 않음
- **해결**: Railway/Render에서 `ALLOWED_ORIGINS` 환경변수에 Vercel URL 추가

### "File not found" 오류
- **원인**: 세션이 만료되었거나 서버가 재시작됨
- **해결**: 다운로드 히스토리 기능 추가 필요 (향후 개선사항)

---

## 비용 예상

### 무료 티어로 시작 가능:
- **Vercel**: 무료 (월 100GB 대역폭)
- **Railway**: $5/월 크레딧 (약 500시간 사용 가능)
- **Render**: 무료 티어 (15분 유휴 시 슬립 모드)

### 월 사용자 1,000명 기준 예상 비용:
- 프론트엔드 (Vercel): 무료
- 백엔드 (Railway): $10-20/월
- 총: **$10-20/월**
