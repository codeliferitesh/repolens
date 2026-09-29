from typing import Dict, Any
from app.models.repository import RepoMetadata

def analyze_metadata(raw_repo: Dict[str, Any]) -> RepoMetadata:
    owner_info = raw_repo.get("owner", {})
    license_info = raw_repo.get("license") or {}
    
    return RepoMetadata(
        name=raw_repo.get("name", "Unknown"),
        owner=owner_info.get("login", "Unknown"),
        owner_avatar_url=owner_info.get("avatar_url"),
        full_name=raw_repo.get("full_name", f"{owner_info.get('login')}/{raw_repo.get('name')}"),
        description=raw_repo.get("description"),
        html_url=raw_repo.get("html_url", ""),
        homepage=raw_repo.get("homepage"),
        stars=raw_repo.get("stargazers_count", 0),
        forks=raw_repo.get("forks_count", 0),
        watchers=raw_repo.get("watchers_count", 0),
        open_issues=raw_repo.get("open_issues_count", 0),
        default_branch=raw_repo.get("default_branch", "main"),
        created_at=raw_repo.get("created_at", ""),
        updated_at=raw_repo.get("updated_at", ""),
        pushed_at=raw_repo.get("pushed_at"),
        license=license_info.get("name"),
        license_spdx=license_info.get("spdx_id"),
        is_fork=raw_repo.get("fork", False),
        is_archived=raw_repo.get("archived", False),
        is_template=raw_repo.get("is_template", False),
        size_kb=raw_repo.get("size", 0),
        topics=raw_repo.get("topics", []),
        visibility=raw_repo.get("visibility", "public"),
        has_wiki=raw_repo.get("has_wiki", False),
        has_pages=raw_repo.get("has_pages", False),
        has_discussions=raw_repo.get("has_discussions", False),
    )
