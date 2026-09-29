import logging
import re
from typing import Tuple, Dict, Any, Optional, List
from urllib.parse import urlparse
import httpx
from app.core.config import settings

logger = logging.getLogger("repolens.github")

class GitHubAPIException(Exception):
    def __init__(self, message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class InvalidGitHubURLError(GitHubAPIException):
    def __init__(self, message: str = "Invalid GitHub repository URL."):
        super().__init__(message, status_code=400)

class RepositoryNotFoundError(GitHubAPIException):
    def __init__(self, message: str = "Repository not found. Make sure the repository is public and the URL is correct."):
        super().__init__(message, status_code=404)

class RateLimitExceededError(GitHubAPIException):
    def __init__(self, message: str = "GitHub API rate limit reached. Please try again later."):
        super().__init__(message, status_code=403)


def parse_github_repository_url(url_or_slug: str) -> Tuple[str, str]:
    """
    Robustly parses a GitHub repository URL, SSH slug, or 'owner/repo' identifier into (owner, repo).
    Handles:
      - https://github.com/owner/repo
      - https://github.com/owner/repo/
      - github.com/owner/repo
      - codeliferitesh/repolens
      - codeliferitesh/repolens/
      - https://github.com/owner/repo.git
      - https://github.com/owner/repo.git/
      - git@github.com:owner/repo.git
      - URLs with query parameters, fragments, or subpaths
    """
    if not url_or_slug or not isinstance(url_or_slug, str):
        raise InvalidGitHubURLError("Repository URL cannot be empty.")

    raw = url_or_slug.strip()
    if not raw:
        raise InvalidGitHubURLError("Repository URL cannot be empty.")

    # Clean SSH and git prefixes
    if raw.startswith("git@github.com:"):
        raw = raw[len("git@github.com:"):]
    elif raw.startswith("git+https://github.com/"):
        raw = raw[len("git+"): ]
    elif raw.startswith("git+http://github.com/"):
        raw = raw[len("git+"): ]
    elif raw.startswith("git://github.com/"):
        raw = "https://github.com/" + raw[len("git://github.com/"):]

    # Parse scheme/hostname if present
    if "://" in raw:
        try:
            parsed = urlparse(raw)
        except Exception:
            raise InvalidGitHubURLError(f"Invalid URL format: '{url_or_slug}'.")

        hostname = (parsed.hostname or "").lower()
        if hostname not in ("github.com", "www.github.com"):
            raise InvalidGitHubURLError(f"Unsupported host '{hostname}'. Only GitHub repositories (github.com) are supported.")
        path = parsed.path
    else:
        lower_raw = raw.lower()
        if lower_raw.startswith("github.com/"):
            path = raw[len("github.com/"):]
        elif lower_raw.startswith("www.github.com/"):
            path = raw[len("www.github.com/"):]
        elif lower_raw.startswith("http://") or lower_raw.startswith("https://"):
            raise InvalidGitHubURLError(f"Invalid URL format: '{url_or_slug}'.")
        else:
            path = raw

    # Strip query parameters and fragments
    path = path.split("?")[0].split("#")[0]
    segments = [s.strip() for s in path.split("/") if s.strip()]

    if len(segments) < 2:
        raise InvalidGitHubURLError(
            f"'{url_or_slug}' is not a valid GitHub repository URL. Expected format: https://github.com/owner/repository"
        )

    owner = segments[0]
    repo = segments[1]

    if repo.endswith(".git"):
        repo = repo[:-4]

    valid_pattern = r"^[a-zA-Z0-9_\-\.]+$"
    if not re.match(valid_pattern, owner) or not re.match(valid_pattern, repo) or not repo or not owner:
        raise InvalidGitHubURLError(
            f"Invalid repository identifier: '{owner}/{repo}'."
        )

    return owner, repo


class GitHubClient:
    def __init__(self):
        self.base_url = settings.GITHUB_API_BASE_URL.rstrip('/')
        token = settings.GITHUB_TOKEN.strip() if settings.GITHUB_TOKEN else ""
        if token and token.lower() not in ("none", "null", "undefined", "your_github_token", "token_here"):
            self.token = token
        else:
            self.token = None

    @staticmethod
    def parse_repo_url(url_or_slug: str) -> Tuple[str, str]:
        """Backward-compatible wrapper for parse_github_repository_url."""
        return parse_github_repository_url(url_or_slug)

    def get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "RepoLens-Intelligence-Platform/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def get(self, client: httpx.AsyncClient, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Tuple[Any, Dict[str, str]]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            response = await client.get(url, headers=self.get_headers(), params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)

            headers_dict = dict(response.headers)
            remaining = headers_dict.get("x-ratelimit-remaining")

            if response.status_code == 404:
                raise RepositoryNotFoundError(
                    "Repository not found. Make sure the repository is public and the URL is correct."
                )
            elif response.status_code == 401:
                logger.warning("GitHub API returned 401 Unauthorized. GITHUB_TOKEN may be invalid.")
                raise GitHubAPIException(
                    "GitHub API authentication failed. Please verify your GITHUB_TOKEN or unset it to use public access.",
                    status_code=401
                )
            elif response.status_code in (403, 429):
                if remaining == "0" or "rate limit" in response.text.lower() or response.status_code == 429:
                    logger.warning("GitHub API rate limit reached.")
                    raise RateLimitExceededError("GitHub API rate limit reached. Please try again later.")
                raise GitHubAPIException(f"GitHub access forbidden: {response.text}", status_code=403)
            elif response.status_code >= 400:
                raise GitHubAPIException(
                    f"GitHub API error ({response.status_code}): {response.text}",
                    status_code=response.status_code
                )

            return response.json(), headers_dict
        except (RepositoryNotFoundError, RateLimitExceededError, GitHubAPIException):
            raise
        except httpx.TimeoutException:
            logger.error(f"GitHub API request timed out for endpoint: {endpoint}")
            raise GitHubAPIException("GitHub API request timed out. Please try again.", status_code=504)
        except httpx.RequestError as exc:
            logger.error(f"Network error while reaching GitHub API ({endpoint}): {exc}")
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
