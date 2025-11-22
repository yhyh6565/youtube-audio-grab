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
    PORT: int = 8000

    # Environment
    ENVIRONMENT: str = "development"

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
