from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import json
import asyncio
import os
from typing import AsyncGenerator

from app.models.schemas import (
    PreviewRequest, PreviewResponse, VideoInfo,
    ExtractRequest, DownloadRequest, ErrorResponse
)
from app.services.youtube import youtube_service, VideoError
from app.services.audio import audio_service
from app.services.session import session_manager
from app.utils.sanitize import parse_cover_filename, sanitize_filename
from app.core.config import settings

router = APIRouter()


@router.post("/preview", response_model=PreviewResponse)
async def preview_video(request: PreviewRequest):
    """
    영상 정보 미리보기
    """
    try:
        video_info = await youtube_service.get_video_info(request.youtube_url)

        return PreviewResponse(
            status="success",
            video_info=VideoInfo(**video_info)
        )

    except VideoError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


@router.post("/extract")
async def extract_audio(request: ExtractRequest):
    """
    음원 추출 (SSE 스트림)
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        session_id = None
        output_path = None

        try:
            # Step 1: 영상 정보 확인 (0-15%)
            yield f"data: {json.dumps({'step': 'validating', 'progress': 0, 'message': '영상 정보 확인 중...'})}\n\n"
            await asyncio.sleep(0.3)

            video_info = await youtube_service.get_video_info(request.youtube_url)

            yield f"data: {json.dumps({'step': 'validating', 'progress': 15, 'message': '영상 정보 확인 완료'})}\n\n"
            await asyncio.sleep(0.3)

            # 세션 ID 및 파일 경로 생성
            import uuid
            session_id = str(uuid.uuid4())
            output_path = os.path.join(settings.upload_path, session_id)

            # Step 2: 음원 다운로드 (15-70%)
            last_progress = 15

            def progress_callback(data):
                nonlocal last_progress
                # yt-dlp progress를 15-70% 범위로 매핑
                percent = data.get('percent', 0)
                mapped_progress = 15 + (percent * 0.55)  # 15% + (0-100% * 55%)

                # 변화가 있을 때만 업데이트 (노이즈 감소)
                if abs(mapped_progress - last_progress) >= 1:
                    last_progress = mapped_progress
                    # SSE 이벤트는 비동기 컨텍스트에서만 전송 가능
                    # 여기서는 progress만 저장

            yield f"data: {json.dumps({'step': 'downloading', 'progress': 15, 'message': '음원 다운로드 시작...'})}\n\n"

            mp3_path = await youtube_service.download_audio(
                request.youtube_url,
                output_path,
                progress_callback=None  # 콜백은 동기 함수라 SSE와 호환 안됨
            )

            yield f"data: {json.dumps({'step': 'downloading', 'progress': 70, 'message': '음원 다운로드 완료'})}\n\n"
            await asyncio.sleep(0.3)

            # Step 3: 썸네일 추출 (70-85%)
            yield f"data: {json.dumps({'step': 'extracting_thumbnail', 'progress': 70, 'message': '썸네일 추출 중...'})}\n\n"
            await asyncio.sleep(0.5)

            yield f"data: {json.dumps({'step': 'extracting_thumbnail', 'progress': 85, 'message': '썸네일 추출 완료'})}\n\n"
            await asyncio.sleep(0.3)

            # Step 4: 커버 이미지 삽입 (85-100%)
            yield f"data: {json.dumps({'step': 'embedding', 'progress': 85, 'message': '커버 이미지 삽입 중...'})}\n\n"

            await audio_service.embed_cover_image(
                mp3_path,
                video_info['thumbnail_url'],
                metadata={
                    'title': video_info['title'],
                    'artist': video_info['channel']
                }
            )

            yield f"data: {json.dumps({'step': 'embedding', 'progress': 100, 'message': '커버 이미지 삽입 완료'})}\n\n"
            await asyncio.sleep(0.3)

            # 파일명 제안
            suggested_filename = parse_cover_filename(video_info['title'])

            # 세션 생성
            session_manager.create_session(
                file_path=mp3_path,
                metadata={
                    'thumbnail_url': video_info['thumbnail_url'],
                    'suggested_filename': suggested_filename,
                    'original_title': video_info['title'],
                    'duration': video_info['duration'],
                    'channel': video_info['channel']
                }
            )

            # Step 5: 완료
            yield f"data: {json.dumps({
                'step': 'complete',
                'progress': 100,
                'message': '완료!',
                'session_id': session_id,
                'preview': {
                    'thumbnail_url': video_info['thumbnail_url'],
                    'suggested_filename': suggested_filename,
                    'original_title': video_info['title'],
                    'duration': video_info['duration']
                }
            })}\n\n"

        except VideoError as e:
            # 영상 관련 에러
            yield f"data: {json.dumps({
                'step': 'error',
                'progress': 0,
                'message': str(e),
                'error_detail': 'video_error'
            })}\n\n"

            # 임시 파일 정리
            if output_path and os.path.exists(f"{output_path}.mp3"):
                os.remove(f"{output_path}.mp3")

        except Exception as e:
            # 일반 에러
            yield f"data: {json.dumps({
                'step': 'error',
                'progress': 0,
                'message': '처리 중 오류가 발생했습니다',
                'error_detail': str(e)
            })}\n\n"

            # 임시 파일 정리
            if output_path and os.path.exists(f"{output_path}.mp3"):
                os.remove(f"{output_path}.mp3")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/download")
async def download_file(request: DownloadRequest):
    """
    MP3 파일 다운로드
    """
    # 세션 확인
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    file_path = session['file_path']
    metadata = session['metadata']

    # 파일 존재 확인
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")

    # 파일명 처리
    if request.filename:
        filename = sanitize_filename(request.filename)
    else:
        filename = metadata.get('suggested_filename', 'audio')

    filename = f"{filename}.mp3"

    # 파일 다운로드
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
