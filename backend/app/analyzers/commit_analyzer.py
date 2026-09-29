from typing import List, Dict, Any
from datetime import datetime, timezone
from collections import defaultdict
from app.models.repository import CommitsAnalysis, CommitItem, CommitCadence

def analyze_commits(raw_commits: List[Dict[str, Any]]) -> CommitsAnalysis:
    if not raw_commits or not isinstance(raw_commits, list):
        return CommitsAnalysis(
            recent_commits_count=0,
            recent_commits=[],
            activity_timeline=[],
            last_commit_date=None,
            commit_frequency_label="No Accessible Commits",
            unique_recent_authors_count=0
        )

    parsed_commits: List[CommitItem] = []
    cadence_map = defaultdict(int)
    unique_authors = set()

    for item in raw_commits:
        sha = item.get("sha", "")
        commit_data = item.get("commit", {})
        author_info = commit_data.get("author", {})
        committer_info = item.get("author") or {}
        
        message = commit_data.get("message", "").split("\n")[0]  # First line
        author_name = author_info.get("name") or committer_info.get("login") or "Unknown"
        date_str = author_info.get("date") or ""
        avatar = committer_info.get("avatar_url")
        html_url = item.get("html_url", f"https://github.com/commit/{sha}")

        unique_authors.add(author_name)

        # Parse date for cadence grouping (e.g. "YYYY-MM" or "MM/DD")
        if date_str:
            try:
                # Group by month or 2-week period
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                period_key = dt.strftime("%b %d, %Y")
                cadence_map[period_key] += 1
            except Exception:
                pass

        parsed_commits.append(
            CommitItem(
                sha=sha,
                short_sha=sha[:7] if sha else "",
                message=message[:120],
                author_name=author_name,
                author_avatar=avatar,
                date=date_str,
                html_url=html_url
            )
        )

    # Activity timeline list (chronological if possible)
    timeline: List[CommitCadence] = [
        CommitCadence(period=period, count=count)
        for period, count in list(cadence_map.items())[:15]
    ]

    last_commit_date = parsed_commits[0].date if parsed_commits else None
    
    # Calculate frequency status
    frequency_label = "Active"
    if last_commit_date:
        try:
            last_dt = datetime.fromisoformat(last_commit_date.replace("Z", "+00:00"))
            now_dt = datetime.now(timezone.utc)
            days_ago = (now_dt - last_dt).days
            if days_ago <= 7:
                frequency_label = f"Hyper-Active (Latest commit {days_ago}d ago)"
            elif days_ago <= 30:
                frequency_label = f"Actively Maintained ({days_ago}d ago)"
            elif days_ago <= 90:
                frequency_label = f"Moderate Activity ({days_ago}d ago)"
            elif days_ago <= 365:
                frequency_label = f"Low Recent Activity ({days_ago // 30} months ago)"
            else:
                frequency_label = f"Dormant / Archive Status (>1 year ago)"
        except Exception:
            frequency_label = "Recent Activity Logged"

    return CommitsAnalysis(
        recent_commits_count=len(parsed_commits),
        recent_commits=parsed_commits[:20],
        activity_timeline=timeline,
        last_commit_date=last_commit_date,
        commit_frequency_label=frequency_label,
        unique_recent_authors_count=len(unique_authors)
    )
