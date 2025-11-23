# Railway 배포 가이드

## Project ID
`fffb21b0-634f-4b00-82bd-ab186e99c9a0`

## 배포 단계

### 1. Railway 대시보드 설정

#### Root Directory 설정 (필수!)
1. Railway 대시보드 열기: https://railway.app/project/fffb21b0-634f-4b00-82bd-ab186e99c9a0
2. Settings → Deploy
3. **Root Directory**: `backend` 입력
4. Save 클릭

#### 환경변수 설정
Variables 탭에서 다음 변수들을 추가:

```bash
# 필수 환경변수
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081

# 선택적 (기본값 있음)
ENVIRONMENT=production
MAX_FILE_AGE_HOURS=1
RATE_LIMIT_PER_HOUR=10
```

**중요:** 프론트엔드를 Vercel에 배포한 후, `ALLOWED_ORIGINS`를 업데이트해야 합니다:
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

### 2. 배포 확인

#### 자동 배포
- GitHub에 push하면 자동으로 배포됩니다
- Deployments 탭에서 진행상황 확인

#### 배포 로그 확인
로그에서 다음 메시지가 보여야 합니다:
```
INFO:     Starting YouTube Audio Extractor v1.0.0
INFO:     Uvicorn running on http://0.0.0.0:XXXX
INFO:     Application startup complete.
```

#### Health Check 테스트
배포 완료 후 도메인에서:
```bash
curl https://your-backend.railway.app/health
```

응답:
```json
{"status":"healthy","version":"1.0.0","sessions":0}
```

### 3. 도메인 확인
- Settings → Domains
- Railway가 자동으로 생성한 도메인 복사
- 예: `youtube-audio-backend-production.up.railway.app`

### 4. Vercel 프론트엔드 설정
Railway 도메인을 복사한 후, Vercel에서:

1. Vercel 프로젝트 열기
2. Settings → Environment Variables
3. 추가:
   ```
   Name: VITE_API_URL
   Value: https://your-backend.railway.app/api
   ```
4. Redeploy

### 5. CORS 업데이트
Vercel 배포 완료 후, Railway로 돌아가서:
- Variables → `ALLOWED_ORIGINS` 편집
- Vercel URL 추가:
  ```
  https://your-app.vercel.app,http://localhost:5173
  ```

## 트러블슈팅

### "Build failed" 에러
- Root Directory가 `backend`로 설정되었는지 확인
- requirements.txt 파일이 존재하는지 확인

### "FFmpeg not found" 에러
- nixpacks.toml에 ffmpeg가 포함되어 있는지 확인
- 배포 로그에서 "Installing ffmpeg" 메시지 확인

### CORS 에러
- `ALLOWED_ORIGINS`에 프론트엔드 URL이 정확히 입력되었는지 확인
- https/http 프로토콜이 일치하는지 확인
- 슬래시(/) 없이 도메인만 입력했는지 확인

### "Module not found" 에러
- requirements.txt에 모든 의존성이 포함되어 있는지 확인
- Python 버전 호환성 확인 (Python 3.11 사용)

## 비용

- Railway Free Plan: $5/월 크레딧 제공
- 이 프로젝트 예상 사용량: $3-5/월
- 초과 시 종량제로 과금됨

## 유용한 링크

- Railway 대시보드: https://railway.app/project/fffb21b0-634f-4b00-82bd-ab186e99c9a0
- Railway 문서: https://docs.railway.app/
- Nixpacks 문서: https://nixpacks.com/
