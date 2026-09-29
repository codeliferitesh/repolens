from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "RepoLens API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    GITHUB_TOKEN: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    GITHUB_API_BASE_URL: str = "https://api.github.com"
    REQUEST_TIMEOUT_SECONDS: float = 20.0

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS as a comma-separated string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
