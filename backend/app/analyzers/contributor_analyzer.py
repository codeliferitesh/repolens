from typing import List, Dict, Any
from app.models.repository import ContributorsSummary, ContributorItem

def analyze_contributors(raw_contributors: List[Dict[str, Any]]) -> ContributorsSummary:
    if not raw_contributors or not isinstance(raw_contributors, list):
        return ContributorsSummary(
            total_contributors_sampled=0,
            top_contributors=[],
            contributor_velocity="No Contributors Listed",
            bus_factor_risk="High (No public contributors found)"
        )

    total_contributions = sum(c.get("contributions", 0) for c in raw_contributors)
    contributors_list: List[ContributorItem] = []

    for c in raw_contributors[:30]:  # Top 30
        contributions = c.get("contributions", 0)
        percentage = round((contributions / total_contributions * 100), 2) if total_contributions > 0 else 0.0
        contributors_list.append(
            ContributorItem(
                login=c.get("login", "anonymous"),
                avatar_url=c.get("avatar_url", ""),
                html_url=c.get("html_url", f"https://github.com/{c.get('login', '')}"),
                contributions=contributions,
                type=c.get("type", "User"),
                percentage=percentage
            )
        )

    # Bus factor & velocity calculation
    # If the top 1 contributor made > 75% of commits or top 2 made > 90%
    top1_pct = contributors_list[0].percentage if contributors_list else 100.0
    top2_pct = sum(c.percentage for c in contributors_list[:2]) if len(contributors_list) >= 2 else top1_pct

    if len(contributors_list) == 1 or top1_pct > 80:
        bus_factor = "High Risk (Dominated by a single contributor)"
    elif top2_pct > 85 or len(contributors_list) < 4:
        bus_factor = "Moderate Risk (Concentrated among 2-3 maintainers)"
    else:
        bus_factor = "Healthy Distribution (Diverse contributor base)"

    if len(raw_contributors) >= 50:
        velocity = "High (Flourishing open-source community)"
    elif len(raw_contributors) >= 10:
        velocity = "Moderate (Active multi-member team)"
    else:
        velocity = "Focused (Small team / solo developer project)"

    return ContributorsSummary(
        total_contributors_sampled=len(raw_contributors),
        top_contributors=contributors_list,
        contributor_velocity=velocity,
        bus_factor_risk=bus_factor
    )
