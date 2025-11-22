from datetime import datetime, timedelta
from typing import Dict, Optional
import os
import uuid


class SessionManager:
    """세션 관리 (인메모리)"""

    def __init__(self):
        self.sessions: Dict[str, dict] = {}

    def create_session(self, file_path: str, metadata: dict) -> str:
        """
        새 세션 생성

        Args:
            file_path: MP3 파일 경로
            metadata: 영상 메타데이터

        Returns:
            Session ID (UUID)
        """
        session_id = str(uuid.uuid4())

        self.sessions[session_id] = {
            'file_path': file_path,
            'metadata': metadata,
            'created_at': datetime.now()
        }

        return session_id

    def get_session(self, session_id: str) -> Optional[dict]:
        """
        세션 조회

        Args:
            session_id: Session ID

        Returns:
            Session data or None if not found
        """
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """
        세션 삭제 (파일도 함께 삭제)

        Args:
            session_id: Session ID

        Returns:
            True if deleted, False if not found
        """
        if session_id not in self.sessions:
            return False

        session = self.sessions[session_id]
        file_path = session.get('file_path')

        # 파일 삭제
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Failed to delete file {file_path}: {e}")

        # 세션 삭제
        del self.sessions[session_id]
        return True

    def cleanup_old_sessions(self, max_age_hours: int = 1) -> int:
        """
        오래된 세션 정리 (1시간 이상)

        Args:
            max_age_hours: 최대 보존 시간 (시간)

        Returns:
            Number of cleaned sessions
        """
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)

        # 삭제할 세션 ID 목록
        expired_sessions = [
            sid for sid, data in self.sessions.items()
            if data['created_at'] < cutoff_time
        ]

        # 삭제
        count = 0
        for sid in expired_sessions:
            if self.delete_session(sid):
                count += 1

        return count

    def get_session_count(self) -> int:
        """현재 세션 수"""
        return len(self.sessions)


# 싱글톤 인스턴스
session_manager = SessionManager()
