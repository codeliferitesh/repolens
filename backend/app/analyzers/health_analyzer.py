from typing import List
from datetime import datetime, timezone
from app.models.repository import (
    RepoMetadata,
    HealthScore,
    HealthDimension,
    StructureAnalysis,
    ContributorsSummary,
    CommitsAnalysis,
    IssuesAndPRsAnalysis
)

def calculate_health_score(
    metadata: RepoMetadata,
    structure: StructureAnalysis,
    contributors: ContributorsSummary,
    commits: CommitsAnalysis,
    issues_and_prs: IssuesAndPRsAnalysis
) -> HealthScore:
    dimensions: List[HealthDimension] = []

    # 1. Activity Dimension (Weight: 20%)
    activity_score = 40  # Base
    act_pos = []
    act_imp = []

    if commits.last_commit_date:
        try:
            last_dt = datetime.fromisoformat(commits.last_commit_date.replace("Z", "+00:00"))
            days = (datetime.now(timezone.utc) - last_dt).days
            if days <= 7:
                activity_score += 40
                act_pos.append(f"Recent commit within past {days} days (+40)")
            elif days <= 30:
                activity_score += 30
                act_pos.append(f"Recent commit within past month ({days} days) (+30)")
            elif days <= 90:
                activity_score += 15
                act_pos.append(f"Committed within 90 days (+15)")
            else:
                act_imp.append(f"No commits in over {days} days (-10)")
                activity_score -= 10
        except Exception:
            pass

    if commits.recent_commits_count >= 10:
        activity_score += 20
        act_pos.append(f"Steady recent commit cadence ({commits.recent_commits_count}+ accessible commits) (+20)")
    else:
        act_imp.append("Low commit velocity in sampled window")

    activity_score = max(0, min(100, activity_score))
    dimensions.append(HealthDimension(
        name="Commit & Release Activity",
        score=activity_score,
        weight=0.20,
        description="Measures commit freshness, recent commit cadence, and update cadence.",
        positive_signals=act_pos or ["Base repository activity logged"],
        improvement_areas=act_imp or ["Maintain frequent commit cadence"],
        formula_explanation="Scored based on days since last commit (+15 to +40 pts) and sample commit volume (+20 pts)."
    ))

    # 2. Documentation Dimension (Weight: 20%)
    doc_score = 0
    doc_pos = []
    doc_imp = []

    if structure.has_readme:
        doc_score += 40
        doc_pos.append("README file detected (+40)")
    else:
        doc_imp.append("Missing README file (-40)")

    if structure.has_license:
        doc_score += 25
        doc_pos.append(f"Explicit license detected ({metadata.license or 'Present'}) (+25)")
    else:
        doc_imp.append("Missing open-source LICENSE file (-25)")

    if structure.has_contributing_guide:
        doc_score += 20
        doc_pos.append("CONTRIBUTING guide available (+20)")
    else:
        doc_imp.append("Add a CONTRIBUTING.md guide for contributors")

    if structure.has_code_of_conduct or structure.has_security_policy:
        doc_score += 15
        doc_pos.append("Governance docs (Security / Code of Conduct) present (+15)")
    else:
        doc_imp.append("Consider adding SECURITY.md or CODE_OF_CONDUCT.md")

    doc_score = max(0, min(100, doc_score))
    dimensions.append(HealthDimension(
        name="Documentation & Governance",
        score=doc_score,
        weight=0.20,
        description="Assesses presence of README, LICENSE, CONTRIBUTING guidelines, and security policies.",
        positive_signals=doc_pos,
        improvement_areas=doc_imp,
        formula_explanation="README (40 pts) + Open-Source License (25 pts) + Contributing Guidelines (20 pts) + Governance/Security (15 pts)."
    ))

    # 3. Collaboration & Community (Weight: 15%)
    collab_score = 30
    collab_pos = []
    collab_imp = []

    sampled_count = contributors.total_contributors_sampled
    if sampled_count >= 10:
        collab_score += 40
        collab_pos.append(f"Strong contributor community ({sampled_count}+ sampled contributors) (+40)")
    elif sampled_count >= 3:
        collab_score += 25
        collab_pos.append(f"Multi-contributor project ({sampled_count} contributors) (+25)")
    else:
        collab_imp.append("Single/dual maintainer project (high bus-factor risk)")

    if metadata.forks > 50:
        collab_score += 20
        collab_pos.append(f"Substantial community forks ({metadata.forks} forks) (+20)")
    elif metadata.forks > 5:
        collab_score += 10
        collab_pos.append(f"Ecosystem forks detected ({metadata.forks} forks) (+10)")

    if metadata.has_discussions:
        collab_score += 10
        collab_pos.append("GitHub Discussions enabled (+10)")

    collab_score = max(0, min(100, collab_score))
    dimensions.append(HealthDimension(
        name="Collaboration & Bus-Factor",
        score=collab_score,
        weight=0.15,
        description="Evaluates contributor distribution, community involvement, and bus-factor resilience.",
        positive_signals=collab_pos or ["Base collaboration logged"],
        improvement_areas=collab_imp or ["Encourage wider open-source participation"],
        formula_explanation="Contributor distribution (+25 to +40 pts) + Fork network (+10 to +20 pts) + Community discussions (+10 pts)."
    ))

    # 4. Project Structure & Organization (Weight: 15%)
    struct_score = 30
    struct_pos = []
    struct_imp = []

    if structure.has_tests:
        struct_score += 35
        struct_pos.append("Dedicated test suite or test directory detected (+35)")
    else:
        struct_imp.append("No automated test directory detected")

    if structure.has_env_example:
        struct_score += 20
        struct_pos.append("Environment template (.env.example) present (+20)")
    else:
        struct_imp.append("No .env.example template found for configuration")

    if len(structure.root_directories) >= 2:
        struct_score += 15
        struct_pos.append(f"Modular folder structure ({', '.join(structure.root_directories[:4])}) (+15)")

    struct_score = max(0, min(100, struct_score))
    dimensions.append(HealthDimension(
        name="Project Structure & Testing",
        score=struct_score,
        weight=0.15,
        description="Assesses modular directory hierarchy, test suite presence, and environment templates.",
        positive_signals=struct_pos or ["Standard file organization"],
        improvement_areas=struct_imp or ["Maintain organized directory hierarchy"],
        formula_explanation="Test suite presence (+35 pts) + Environment configuration (+20 pts) + Modular architecture (+15 pts) + Base (30 pts)."
    ))

    # 5. Automation & CI/CD (Weight: 15%)
    ci_score = 20
    ci_pos = []
    ci_imp = []

    if structure.has_ci_cd:
        ci_score += 50
        ci_pos.append("Continuous Integration (GitHub Actions / CI workflows) detected (+50)")
    else:
        ci_imp.append("No CI/CD workflows (.github/workflows) detected")

    if structure.has_docker:
        ci_score += 30
        ci_pos.append("Containerization (Dockerfile / Compose) configured (+30)")
    else:
        ci_imp.append("No container configuration found (Dockerfile)")

    ci_score = max(0, min(100, ci_score))
    dimensions.append(HealthDimension(
        name="Automation & CI/CD",
        score=ci_score,
        weight=0.15,
        description="Evaluates automated workflows, continuous integration pipelines, and containerization.",
        positive_signals=ci_pos or ["Base automation readiness"],
        improvement_areas=ci_imp or ["Add automated GitHub Actions pipelines"],
        formula_explanation="GitHub Actions/CI pipeline (+50 pts) + Docker/Container setup (+30 pts) + Base readiness (20 pts)."
    ))

    # 6. Maintenance & Issue Health (Weight: 15%)
    maint_score = 50
    maint_pos = []
    maint_imp = []

    if not metadata.is_archived:
        maint_score += 20
        maint_pos.append("Active repository (not archived) (+20)")
    else:
        maint_score -= 40
        maint_imp.append("Repository is marked as ARCHIVED on GitHub (-40)")

    if issues_and_prs.open_prs_count > 0:
        maint_score += 15
        maint_pos.append(f"Active Pull Request review stream ({issues_and_prs.open_prs_count} PRs) (+15)")

    if metadata.open_issues < 100:
        maint_score += 15
        maint_pos.append(f"Manageable issue queue ({metadata.open_issues} open issues) (+15)")
    elif metadata.open_issues > 1000:
        maint_imp.append("High volume of open issues requiring triage")

    maint_score = max(0, min(100, maint_score))
    dimensions.append(HealthDimension(
        name="Maintenance Signals & Triage",
        score=maint_score,
        weight=0.15,
        description="Inspects active repository status, pull request review flow, and issue triage backlog.",
        positive_signals=maint_pos or ["Baseline maintenance signals logged"],
        improvement_areas=maint_imp or ["Keep open issue backlog triaged"],
        formula_explanation="Unarchived status (+20 pts) + Active PR triage (+15 pts) + Clean issue backlog (+15 pts) + Base (50 pts)."
    ))

    # Overall calculation
    overall = sum(d.score * d.weight for d in dimensions)
    overall_rounded = int(round(overall))

    if overall_rounded >= 88:
        grade = "A+"
        status_label = "Exceptional Health & Engineering Rigor"
    elif overall_rounded >= 78:
        grade = "A"
        status_label = "Healthy & Well-Maintained"
    elif overall_rounded >= 65:
        grade = "B"
        status_label = "Good Foundation with Minor Gaps"
    elif overall_rounded >= 50:
        grade = "C"
        status_label = "Moderate Maintenance / Growing Project"
    else:
        grade = "D"
        status_label = "Needs Engineering Attention & Governance"

    summary_verdict = (
        f"{metadata.name} achieved an overall RepoLens Health Score of {overall_rounded}/100 ({grade}). "
        f"Key strengths include {', '.join([d.name for d in sorted(dimensions, key=lambda x: x.score, reverse=True)[:2]])}."
    )

    calculation_methodology = (
        "RepoLens Health Indicators are calculated across 6 weighted dimensions (Activity 20%, "
        "Documentation 20%, Collaboration 15%, Structure 15%, Automation 15%, Maintenance 15%) "
        "derived directly from verifiable GitHub API signals and codebase manifests. Scores are transparent "
        "and reproducible with no arbitrary guessing."
    )

    return HealthScore(
        overall_score=overall_rounded,
        grade=grade,
        status_label=status_label,
        dimensions=dimensions,
        summary_verdict=summary_verdict,
        calculation_methodology=calculation_methodology
    )
