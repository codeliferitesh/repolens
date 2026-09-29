import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import httpx
from app.services.analysis_orchestrator import AnalysisOrchestrator
from app.services.github_client import (
    GitHubAPIException,
    InvalidGitHubURLError,
    RepositoryNotFoundError,
    RateLimitExceededError,
    GitHubClient
)
from app.models.repository import RepoAnalysisResponse, AssistantAnswer
from app.analyzers.assistant_analyzer import answer_query
from app.core.config import settings

logger = logging.getLogger("repolens.api")

router = APIRouter()
orchestrator = AnalysisOrchestrator()

class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="GitHub repository URL or 'owner/repo' identifier")

class AskRequest(BaseModel):
    url: str
    question: str

class HealthCheckResponse(BaseModel):
    status: str
    version: str
    project: str
    has_github_token: bool

class SampleRepo(BaseModel):
    name: str
    owner: str
    url: str
    category: str
    description: str

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    return HealthCheckResponse(
        status="healthy",
        version=settings.VERSION,
        project=settings.PROJECT_NAME,
        has_github_token=bool(settings.GITHUB_TOKEN.strip())
    )

@router.get("/samples", response_model=List[SampleRepo])
async def get_sample_repositories():
    return [
        SampleRepo(
            name="react",
            owner="facebook",
            url="https://github.com/facebook/react",
            category="Frontend Framework",
            description="The library for web and native user interfaces."
        ),
        SampleRepo(
            name="fastapi",
            owner="fastapi",
            url="https://github.com/fastapi/fastapi",
            category="Backend / Python",
            description="High performance, easy to learn, fast to code, ready for production."
        ),
        SampleRepo(
            name="flask",
            owner="pallets",
            url="https://github.com/pallets/flask",
            category="Python Microframework",
            description="The Python micro framework for building web applications."
        ),
        SampleRepo(
            name="core",
            owner="vuejs",
            url="https://github.com/vuejs/core",
            category="Frontend Framework",
            description="Vue.js is a progressive, incrementally-adoptable JavaScript framework."
        ),
        SampleRepo(
            name="tailwindcss",
            owner="tailwindlabs",
            url="https://github.com/tailwindlabs/tailwindcss",
            category="CSS Framework",
            description="A utility-first CSS framework for rapid UI development."
        ),
        SampleRepo(
            name="three.js",
            owner="mrdoob",
            url="https://github.com/mrdoob/three.js",
            category="3D Graphics",
            description="JavaScript 3D Library."
        ),
    ]

@router.get("/rate-limit")
async def get_rate_limit():
    client = GitHubClient()
    async with httpx.AsyncClient(timeout=10.0) as http_client:
        try:
            data, headers = await client.get(http_client, "rate_limit")
            return {
                "rate": data.get("rate", {}),
                "remaining": data.get("rate", {}).get("remaining", 0),
                "limit": data.get("rate", {}).get("limit", 60),
                "reset_timestamp": data.get("rate", {}).get("reset", 0),
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "unavailable"
            }

@router.post("/analyze", response_model=RepoAnalysisResponse)
async def analyze_repo(request: AnalyzeRequest):
    if not request.url or not request.url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository URL cannot be empty."
        )

    clean_url = request.url.strip()
    logger.info(f"Received repository request: {clean_url}")
    try:
        response = await orchestrator.analyze_repository(clean_url)
        return response
    except InvalidGitHubURLError as e:
        logger.warning(f"Invalid repository input '{clean_url}': {e.message}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except RepositoryNotFoundError as e:
        logger.warning(f"Repository not found for '{clean_url}': {e.message}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found. Make sure the repository is public and the URL is correct."
        )
    except RateLimitExceededError as e:
        logger.warning(f"Rate limit reached during request for '{clean_url}': {e.message}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="GitHub API rate limit reached. Please try again later."
        )
    except GitHubAPIException as e:
        logger.error(f"GitHub API error for '{clean_url}': {e.message} (status: {e.status_code})")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error while analyzing '{clean_url}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected backend/GitHub integration error. Please try again later."
        )

@router.post("/ask", response_model=AssistantAnswer)
async def ask_repolens(request: AskRequest):
    if not request.url or not request.question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both repository URL and question are required."
        )

    clean_url = request.url.strip()
    try:
        # Re-fetch repo data
        analysis = await orchestrator.analyze_repository(clean_url)
        answer = answer_query(
            question=request.question.strip(),
            metadata=analysis.repository,
            languages=analysis.languages,
            contributors=analysis.contributors,
            commits=analysis.commits,
            structure=analysis.structure,
            dependencies=analysis.dependencies,
            issues=analysis.issues_and_prs,
            health=analysis.health
        )
        return answer
    except InvalidGitHubURLError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except RepositoryNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found. Make sure the repository is public and the URL is correct."
        )
    except RateLimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="GitHub API rate limit reached. Please try again later."
        )
    except GitHubAPIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error answering question for '{clean_url}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected backend/GitHub integration error. Please try again later."
        )
