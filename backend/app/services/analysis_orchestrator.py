import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import httpx
from app.services.github_client import (
    GitHubClient,
    GitHubAPIException,
    InvalidGitHubURLError,
    RepositoryNotFoundError,
    RateLimitExceededError,
    parse_github_repository_url
)
from app.models.repository import RepoAnalysisResponse
from app.analyzers.metadata_analyzer import analyze_metadata
from app.analyzers.language_analyzer import analyze_languages
from app.analyzers.contributor_analyzer import analyze_contributors
from app.analyzers.commit_analyzer import analyze_commits
from app.analyzers.structure_analyzer import analyze_structure
from app.analyzers.dependency_analyzer import analyze_dependencies
from app.analyzers.health_analyzer import calculate_health_score
from app.analyzers.assistant_analyzer import generate_preset_previews
from app.models.repository import PullRequestInfo, IssuesAndPRsAnalysis, BranchesAnalysis, BranchItem

logger = logging.getLogger("repolens.orchestrator")

class AnalysisOrchestrator:
    def __init__(self):
        self.client = GitHubClient()

    async def analyze_repository(self, url_or_slug: str) -> RepoAnalysisResponse:
        logger.info(f"Received repository request: {url_or_slug}")
        owner, repo = parse_github_repository_url(url_or_slug)
        logger.info(f"Resolved repository: {owner}/{repo}")

        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # 1. Fetch main repo metadata
            logger.info(f"Fetching repository metadata for {owner}/{repo}")
            raw_repo, repo_headers = await self.client.get(http_client, f"repos/{owner}/{repo}")
            logger.info(f"Repository successfully loaded: {owner}/{repo}")
            default_branch = raw_repo.get("default_branch", "main")
            remaining_limit = None
            if "x-ratelimit-remaining" in repo_headers:
                try:
                    remaining_limit = int(repo_headers["x-ratelimit-remaining"])
                except Exception:
                    pass

            # 2. Fetch parallel endpoints
            async def safe_fetch(endpoint: str, params: Optional[Dict[str, Any]] = None):
                try:
                    data, _ = await self.client.get(http_client, endpoint, params)
                    return data
                except Exception:
                    return None

            languages_task = safe_fetch(f"repos/{owner}/{repo}/languages")
            contributors_task = safe_fetch(f"repos/{owner}/{repo}/contributors", {"per_page": 30})
            commits_task = safe_fetch(f"repos/{owner}/{repo}/commits", {"per_page": 30})
            tree_task = safe_fetch(f"repos/{owner}/{repo}/git/trees/{default_branch}", {"recursive": "1"})
            prs_task = safe_fetch(f"repos/{owner}/{repo}/pulls", {"state": "all", "per_page": 10})
            branches_task = safe_fetch(f"repos/{owner}/{repo}/branches", {"per_page": 10})

            (
                raw_languages,
                raw_contributors,
                raw_commits,
                raw_tree_data,
                raw_prs,
                raw_branches
            ) = await asyncio.gather(
                languages_task,
                contributors_task,
                commits_task,
                tree_task,
                prs_task,
                branches_task
            )

            # Fallback for tree if git/trees/ fails
            tree_items = []
            if raw_tree_data and isinstance(raw_tree_data, dict) and "tree" in raw_tree_data:
                tree_items = raw_tree_data["tree"]
            else:
                # Try contents API for top-level
                contents = await safe_fetch(f"repos/{owner}/{repo}/contents")
                if contents and isinstance(contents, list):
                    for item in contents:
                        tree_items.append({
                            "path": item.get("name", ""),
                            "type": "tree" if item.get("type") == "dir" else "blob",
                            "size": item.get("size")
                        })

            # Detect manifest files to download
            manifest_candidates = [
                "package.json", "requirements.txt", "pyproject.toml", "Cargo.toml", "go.mod",
                "frontend/package.json", "backend/requirements.txt", "backend/pyproject.toml",
                "client/package.json", "server/package.json"
            ]

            manifest_paths_to_fetch = []
            for item in tree_items:
                path = item.get("path", "")
                if path in manifest_candidates or any(path.endswith("/" + m) for m in ["package.json", "requirements.txt", "Cargo.toml", "go.mod"]):
                    if len(manifest_paths_to_fetch) < 5:  # Limit to 5 manifests max
                        manifest_paths_to_fetch.append(path)

            # Fetch manifest files
            manifest_contents: Dict[str, str] = {}
            if manifest_paths_to_fetch:
                manifest_tasks = [
                    self.client.get_raw_file(http_client, owner, repo, default_branch, m_path)
                    for m_path in manifest_paths_to_fetch
                ]
                results = await asyncio.gather(*manifest_tasks, return_exceptions=True)
                for path, content in zip(manifest_paths_to_fetch, results):
                    if isinstance(content, str) and content:
                        manifest_contents[path] = content

            # 3. Execute Analyzers
            metadata = analyze_metadata(raw_repo)
            languages = analyze_languages(raw_languages or {})
            contributors = analyze_contributors(raw_contributors or [])
            commits = analyze_commits(raw_commits or [])
            structure = analyze_structure(tree_items)
            dependencies = analyze_dependencies(manifest_contents)

            # Pull requests & issues analysis
            recent_prs_list: List[PullRequestInfo] = []
            open_prs_count = 0
            if raw_prs and isinstance(raw_prs, list):
                for pr in raw_prs:
                    if pr.get("state") == "open":
                        open_prs_count += 1
                    user_info = pr.get("user") or {}
                    recent_prs_list.append(
                        PullRequestInfo(
                            id=pr.get("id", 0),
                            number=pr.get("number", 0),
                            title=pr.get("title", ""),
                            state=pr.get("state", "open"),
                            created_at=pr.get("created_at", ""),
                            user=user_info.get("login", "Unknown"),
                            user_avatar=user_info.get("avatar_url"),
                            is_draft=pr.get("draft", False),
                            html_url=pr.get("html_url", "")
                        )
                    )

            issues_and_prs = IssuesAndPRsAnalysis(
                open_issues_count=metadata.open_issues,
                closed_issues_sample_count=0,
                open_prs_count=open_prs_count,
                recent_prs=recent_prs_list[:10],
                issue_closure_rate_hint="Active Issue Stream" if metadata.open_issues > 0 else "Clean Backlog",
                collaboration_health="High Community Engagement" if open_prs_count > 0 else "Streamlined Maintenance"
            )

            # Branches analysis
            branches_list: List[BranchItem] = []
            if raw_branches and isinstance(raw_branches, list):
                for b in raw_branches:
                    b_name = b.get("name", "")
                    branches_list.append(
                        BranchItem(
                            name=b_name,
                            is_default=(b_name == default_branch),
                            protected=b.get("protected", False)
                        )
                    )

            branches = BranchesAnalysis(
                total_branches_count=len(branches_list),
                default_branch=default_branch,
                branches=branches_list
            )

            # Health Calculation
            health = calculate_health_score(metadata, structure, contributors, commits, issues_and_prs)

            # Pre-computed Assistant Previews
            assistant_previews = generate_preset_previews(
                metadata, languages, contributors, commits, structure, dependencies, issues_and_prs, health
            )

            return RepoAnalysisResponse(
                success=True,
                repository=metadata,
                health=health,
                languages=languages,
                contributors=contributors,
                commits=commits,
                structure=structure,
                dependencies=dependencies,
                issues_and_prs=issues_and_prs,
                branches=branches,
                assistant_previews=assistant_previews,
                analyzed_at=datetime.now(timezone.utc).isoformat(),
                rate_limit_remaining=remaining_limit
            )
