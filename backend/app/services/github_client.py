import re
from typing import Tuple, Dict, Any, Optional, List
import httpx
from app.core.config import settings

class GitHubAPIException(Exception):
    def __init__(self, message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class InvalidGitHubURLError(GitHubAPIException):
    def __init__(self, message: str = "Invalid GitHub repository URL format"):
        super().__init__(message, status_code=400)

class RepositoryNotFoundError(GitHubAPIException):
    def __init__(self, message: str = "GitHub repository not found or may be private"):
        super().__init__(message, status_code=404)

class RateLimitExceededError(GitHubAPIException):
    def __init__(self, message: str = "GitHub API rate limit exceeded. Provide a GITHUB_TOKEN or try again later."):
        super().__init__(message, status_code=429)

class GitHubClient:
    def __init__(self):
        self.base_url = settings.GITHUB_API_BASE_URL.rstrip('/')
        self.token = settings.GITHUB_TOKEN.strip() if settings.GITHUB_TOKEN else None

    def get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "RepoLens-Intelligence-Platform/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    @staticmethod
    def parse_repo_url(url_or_slug: str) -> Tuple[str, str]:
        """
        Parses GitHub URL, SSH format, or 'owner/repo' slug into (owner, repo).
        """
        raw = url_or_slug.strip()
        # Clean git prefixes/suffixes
        raw = re.sub(r"^git@github\.com:", "https://github.com/", raw)
        raw = re.sub(r"\.git$", "", raw)

        # Match standard url or slug
        # Examples:
        # https://github.com/facebook/react
        # github.com/facebook/react/tree/main
        # facebook/react
        pattern = r"(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)"
        match = re.search(pattern, raw)
        if match:
            owner = match.group(1)
            repo = match.group(2)
            return owner, repo

        slug_pattern = r"^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$"
        slug_match = re.match(slug_pattern, raw)
        if slug_match:
            return slug_match.group(1), slug_match.group(2)

        raise InvalidGitHubURLError(
            f"'{url_or_slug}' is not a valid GitHub repository URL. Expected format: https://github.com/owner/repository"
        )

    async def get(self, client: httpx.AsyncClient, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Tuple[Any, Dict[str, str]]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            response = await client.get(url, headers=self.get_headers(), params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)
            
            headers_dict = dict(response.headers)
            remaining = headers_dict.get("x-ratelimit-remaining")
            
            if response.status_code == 404:
                raise RepositoryNotFoundError(f"Resource at '{endpoint}' not found (404).")
            elif response.status_code == 403 or response.status_code == 429:
                if remaining == "0" or "rate limit" in response.text.lower():
                    raise RateLimitExceededError(
                        f"GitHub API rate limit reached (Remaining: {remaining}). Add a GITHUB_TOKEN in backend/.env to get 5,000 req/hr."
                    )
                raise GitHubAPIException(f"Access forbidden: {response.text}", status_code=403)
            elif response.status_code >= 400:
                raise GitHubAPIException(f"GitHub API returned error {response.status_code}: {response.text}", status_code=response.status_code)

            return response.json(), headers_dict
        except httpx.TimeoutException:
            raise GitHubAPIException("GitHub API request timed out. Please try again.", status_code=504)
        except httpx.RequestError as exc:
            raise GitHubAPIException(f"Network error while reaching GitHub: {str(exc)}", status_code=502)

    async def get_raw_file(self, client: httpx.AsyncClient, owner: str, repo: str, branch: str, path: str) -> Optional[str]:
        """
        Fetches raw file content from GitHub raw content URL or contents API.
        """
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path.lstrip('/')}"
        try:
            resp = await client.get(raw_url, headers=self.get_headers(), timeout=10.0)
            if resp.status_code == 200:
                return resp.text
        except Exception:
            pass

        # Fallback to API contents
        try:
            endpoint = f"repos/{owner}/{repo}/contents/{path}"
            data, _ = await self.get(client, endpoint, params={"ref": branch})
            if isinstance(data, dict) and data.get("encoding") == "base64" and data.get("content"):
                import base64
                return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        except Exception:
            pass

        return None
