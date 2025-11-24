from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "YouTube Audio Extractor"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File settings
    UPLOAD_DIR: str = "temp_files"
    MAX_FILE_AGE_HOURS: int = 1

    # Rate limiting
    RATE_LIMIT_PER_HOUR: int = 10

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))  # Railway uses dynamic PORT

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Extraction progress thresholds
    PROGRESS_VALIDATION_START: int = 0
    PROGRESS_VALIDATION_END: int = 15
    PROGRESS_DOWNLOAD_START: int = 15
    PROGRESS_DOWNLOAD_END: int = 70
    PROGRESS_THUMBNAIL_START: int = 70
    PROGRESS_THUMBNAIL_END: int = 85
    PROGRESS_EMBEDDING_START: int = 85
    PROGRESS_EMBEDDING_END: int = 100

    # UI delay times (seconds)
    DELAY_STEP_TRANSITION: float = 0.3
    DELAY_THUMBNAIL_EXTRACTION: float = 0.5

    # Video duration warning threshold (seconds)
    LONG_VIDEO_WARNING_SECONDS: int = 1800  # 30 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated origins string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def upload_path(self) -> str:
        """Get absolute path for upload directory"""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.join(base_dir, self.UPLOAD_DIR)


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.upload_path, exist_ok=True)
