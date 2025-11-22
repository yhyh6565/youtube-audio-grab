from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TALB
import requests
import asyncio
from typing import Optional, Dict


class AudioService:
    @staticmethod
    async def embed_cover_image(
        audio_path: str,
        thumbnail_url: str,
        metadata: Optional[Dict] = None
    ) -> None:
        """
        MP3 파일에 커버 이미지 및 메타데이터 삽입

        Args:
            audio_path: MP3 file path
            thumbnail_url: Thumbnail image URL
            metadata: Optional metadata (title, artist, album)

        Raises:
            Exception: If embedding fails
        """
        try:
            # 썸네일 다운로드
            loop = asyncio.get_event_loop()
            thumbnail_data = await loop.run_in_executor(
                None,
                AudioService._download_thumbnail,
                thumbnail_url
            )

            # MP3 파일 열기
            audio = MP3(audio_path, ID3=ID3)

            # ID3 태그가 없으면 생성
            if audio.tags is None:
                audio.add_tags()

            # 기존 APIC (앨범 아트) 제거
            audio.tags.delall('APIC')

            # 커버 이미지 삽입
            audio.tags.add(
                APIC(
                    encoding=3,  # UTF-8
                    mime='image/jpeg',  # MIME type
                    type=3,  # Cover (front)
                    desc='Cover',
                    data=thumbnail_data
                )
            )

            # 메타데이터 추가 (옵션)
            if metadata:
                if 'title' in metadata:
                    # 기존 타이틀 제거 후 추가
                    audio.tags.delall('TIT2')
                    audio.tags.add(TIT2(encoding=3, text=metadata['title']))

                if 'artist' in metadata:
                    # 기존 아티스트 제거 후 추가
                    audio.tags.delall('TPE1')
                    audio.tags.add(TPE1(encoding=3, text=metadata['artist']))

                if 'album' in metadata:
                    # 기존 앨범 제거 후 추가
                    audio.tags.delall('TALB')
                    audio.tags.add(TALB(encoding=3, text=metadata['album']))

            # 저장
            audio.save()

        except Exception as e:
            raise Exception(f'커버 이미지 삽입 실패: {str(e)}')

    @staticmethod
    def _download_thumbnail(url: str) -> bytes:
        """
        썸네일 다운로드 (동기 함수)

        Args:
            url: Thumbnail URL

        Returns:
            Image data as bytes

        Raises:
            Exception: If download fails
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            raise Exception(f'썸네일 다운로드 실패: {str(e)}')


# 싱글톤 인스턴스
audio_service = AudioService()
