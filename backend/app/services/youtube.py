import yt_dlp
from typing import Dict, Optional, Callable
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor


class VideoError(Exception):
    """영상 관련 에러"""
    pass


class YouTubeService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)

        # 미리보기용 옵션
        self.ydl_opts_preview = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
            'force_ipv4': True,
        }

    async def get_video_info(self, url: str) -> Dict:
        """
        영상 정보 미리보기 (다운로드 없이 메타데이터만)

        Args:
            url: YouTube video URL

        Returns:
            Dict with video information

        Raises:
            VideoError: If video is unavailable or private
        """
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(
                self.executor,
                self._extract_info,
                url,
                False  # download=False
            )

            # 비공개/삭제 체크
            if info.get('is_private'):
                raise VideoError('비공개 영상입니다')

            availability = info.get('availability', '')
            if availability not in ['public', 'unlisted', '']:
                raise VideoError('비공개 또는 삭제된 영상입니다')

            # 썸네일 URL 추출 (최고 해상도)
            thumbnail_url = self._get_best_thumbnail(info)

            # 30분 이상 체크
            duration = info.get('duration', 0)
            warning = 'long_video' if duration > 1800 else None

            return {
                'title': info.get('title', 'Unknown'),
                'thumbnail_url': thumbnail_url,
                'duration': duration,
                'channel': info.get('uploader', 'Unknown'),
                'warning': warning
            }

        except yt_dlp.utils.DownloadError as e:
            error_msg = str(e).lower()
            if 'private video' in error_msg:
                raise VideoError('비공개 영상입니다')
            elif 'video unavailable' in error_msg or 'video not available' in error_msg:
                raise VideoError('삭제되었거나 존재하지 않는 영상입니다')
            elif 'copyright' in error_msg:
                raise VideoError('저작권 제한으로 다운로드할 수 없습니다')
            else:
                raise VideoError(f'영상을 불러올 수 없습니다: {str(e)}')
        except Exception as e:
            raise VideoError(f'영상 정보를 가져오는 중 오류가 발생했습니다: {str(e)}')

    async def download_audio(
        self,
        url: str,
        output_path: str,
        progress_callback: Optional[Callable] = None
    ) -> str:
        """
        음원 다운로드 (MP3 192kbps)

        Args:
            url: YouTube video URL
            output_path: Output file path (without extension)
            progress_callback: Optional callback for progress updates

        Returns:
            Path to downloaded MP3 file

        Raises:
            VideoError: If download fails
        """
        def progress_hook(d):
            if progress_callback and d['status'] == 'downloading':
                # yt-dlp progress format
                downloaded = d.get('downloaded_bytes', 0)
                total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)

                if total > 0:
                    percent = (downloaded / total) * 100
                    progress_callback({
                        'status': 'downloading',
                        'downloaded_bytes': downloaded,
                        'total_bytes': total,
                        'percent': percent,
                        'speed': d.get('speed', 0),
                        'eta': d.get('eta', 0)
                    })

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': f"{output_path}.%(ext)s",
            'quiet': False,
            'no_warnings': False,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
            'force_ipv4': True,
            'progress_hooks': [progress_hook] if progress_callback else [],
        }

        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                self._download_with_opts,
                url,
                ydl_opts
            )

            # MP3 파일 경로 반환 (.mp3 확장자 추가)
            mp3_path = f"{output_path}.mp3"
            if not os.path.exists(mp3_path):
                # 디버깅을 위해 디렉토리 내용 확인
                dir_path = os.path.dirname(output_path)
                files = os.listdir(dir_path) if os.path.exists(dir_path) else []
                raise VideoError(f'음원 파일 생성에 실패했습니다. (Files in {dir_path}: {files})')

            return mp3_path

        except yt_dlp.utils.DownloadError as e:
            error_msg = str(e).lower()
            if 'copyright' in error_msg:
                raise VideoError('저작권 제한으로 다운로드할 수 없습니다')
            else:
                raise VideoError(f'다운로드 실패: {str(e)}')
        except Exception as e:
            raise VideoError(f'음원 다운로드 중 오류가 발생했습니다: {str(e)}')

    def _extract_info(self, url: str, download: bool = False) -> Dict:
        """yt-dlp를 사용하여 정보 추출 (동기 함수)"""
        with yt_dlp.YoutubeDL(self.ydl_opts_preview) as ydl:
            return ydl.extract_info(url, download=download)

    def _download_with_opts(self, url: str, opts: Dict):
        """yt-dlp를 사용하여 다운로드 (동기 함수)"""
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([url])

    def _get_best_thumbnail(self, info: Dict) -> str:
        """최고 해상도 썸네일 URL 추출"""
        thumbnails = info.get('thumbnails', [])

        if not thumbnails:
            # 기본 썸네일
            return info.get('thumbnail', '')

        # 해상도별 정렬 (높은 순)
        sorted_thumbnails = sorted(
            thumbnails,
            key=lambda t: (t.get('width', 0) * t.get('height', 0)),
            reverse=True
        )

        # 가장 높은 해상도 선택
        best = sorted_thumbnails[0]
        return best.get('url', info.get('thumbnail', ''))


# 싱글톤 인스턴스
youtube_service = YouTubeService()
