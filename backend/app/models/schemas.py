from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal


class PreviewRequest(BaseModel):
    """영상 미리보기 요청"""
    youtube_url: str = Field(..., description="YouTube video URL")


class VideoInfo(BaseModel):
    """영상 정보"""
    title: str = Field(..., description="Video title")
    thumbnail_url: str = Field(..., description="Thumbnail URL")
    duration: int = Field(..., description="Duration in seconds")
    channel: str = Field(..., description="Channel name")
    warning: Optional[Literal['long_video']] = Field(None, description="Warning for long videos (>30min)")


class PreviewResponse(BaseModel):
    """영상 미리보기 응답"""
    status: str = "success"
    video_info: VideoInfo


class ExtractRequest(BaseModel):
    """음원 추출 요청"""
    youtube_url: str = Field(..., description="YouTube video URL")


class PreviewData(BaseModel):
    """추출 완료 후 미리보기 데이터"""
    thumbnail_url: str
    suggested_filename: str
    original_title: str
    duration: int


class ProgressEvent(BaseModel):
    """진행 상황 이벤트 (SSE)"""
    step: Literal['validating', 'downloading', 'extracting_thumbnail', 'embedding', 'complete', 'error']
    progress: int = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    message: str
    session_id: Optional[str] = None
    preview: Optional[PreviewData] = None
    error_detail: Optional[str] = None


class DownloadRequest(BaseModel):
    """다운로드 요청"""
    session_id: str = Field(..., description="Session ID from extraction")
    filename: Optional[str] = Field(None, description="Custom filename (optional)")


class ErrorResponse(BaseModel):
    """에러 응답"""
    status: str = "error"
    message: str
    error_code: Optional[str] = None
    detail: Optional[str] = None
