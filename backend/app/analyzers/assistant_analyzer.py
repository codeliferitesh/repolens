from typing import List, Dict, Any, Optional
from app.models.repository import (
    RepoMetadata,
    LanguageBreakdown,
    ContributorsSummary,
    CommitsAnalysis,
    StructureAnalysis,
    DependenciesAnalysis,
    IssuesAndPRsAnalysis,
    HealthScore,
    AssistantAnswer
)

def answer_query(
    question: str,
    metadata: RepoMetadata,
    languages: LanguageBreakdown,
    contributors: ContributorsSummary,
    commits: CommitsAnalysis,
    structure: StructureAnalysis,
    dependencies: DependenciesAnalysis,
    issues: IssuesAndPRsAnalysis,
    health: HealthScore
) -> AssistantAnswer:
    q_lower = question.lower()

    # 1. Technologies & Dependencies
    if any(k in q_lower for k in ["tech", "stack", "framework", "language", "depend"]):
        lang_names = [l.name for l in languages.languages[:5]]
        fw_names = dependencies.highlighted_frameworks
        dep_count = dependencies.total_dependencies_count
        ecosystems = dependencies.ecosystems_detected

        answer = (
            f"**{metadata.name}** primary programming language is **{languages.primary_language or 'Not detected'}** "
            f"({languages.languages[0].percentage if languages.languages else 0}% of codebase). "
            f"Other languages detected: {', '.join(lang_names[1:]) if len(lang_names) > 1 else 'None'}.\n\n"
        )
        if fw_names:
            answer += f"**Key Frameworks & Libraries Detected:** {', '.join(fw_names)}.\n"
        if ecosystems:
            answer += f"**Package Ecosystems:** {', '.join(ecosystems)} with {dep_count} total scanned package dependencies across {len(dependencies.manifest_details)} manifest file(s)."
        
        return AssistantAnswer(
            question=question,
            answer=answer,
            key_takeaways=[
                f"Primary: {languages.primary_language or 'Unknown'}",
                f"Frameworks: {', '.join(fw_names[:3]) if fw_names else 'Standard runtime'}",
                f"Manifests: {', '.join(dependencies.manifests_found) if dependencies.manifests_found else 'None found'}"
            ],
            evidence_metrics={
                "primary_language": languages.primary_language,
                "languages_count": len(languages.languages),
                "frameworks": fw_names,
                "dependencies_count": dep_count
            }
        )

    # 2. Contributors & Community
    elif any(k in q_lower for k in ["contributor", "author", "who", "maintainer", "bus factor", "team"]):
        top_3 = contributors.top_contributors[:3]
        top_names = [f"**{c.login}** ({c.contributions} commits, ~{c.percentage}%)" for c in top_3]
        answer = (
            f"The repository has **{contributors.total_contributors_sampled}** sampled contributors. "
            f"The community velocity is categorized as **{contributors.contributor_velocity}**.\n\n"
            f"**Top Maintainers:**\n" + "\n".join([f"- {name}" for name in top_names]) + "\n\n"
            f"**Bus Factor Assessment:** {contributors.bus_factor_risk}."
        )
        return AssistantAnswer(
            question=question,
            answer=answer,
            key_takeaways=[
                f"Total contributors sampled: {contributors.total_contributors_sampled}",
                f"Top lead: {top_3[0].login if top_3 else 'N/A'}",
                f"Bus-factor risk: {contributors.bus_factor_risk}"
            ],
            evidence_metrics={
                "total_contributors": contributors.total_contributors_sampled,
                "top_maintainers": [c.login for c in top_3],
                "bus_factor": contributors.bus_factor_risk
            }
        )

    # 3. Activity & Commits
    elif any(k in q_lower for k in ["active", "activity", "commit", "cadence", "fresh", "recent"]):
        answer = (
            f"Commit freshness status: **{commits.commit_frequency_label}**.\n\n"
            f"Last commit was recorded on **{commits.last_commit_date or 'Unknown'}**. "
            f"In the recent sampled history, **{commits.recent_commits_count} commits** were authored by **{commits.unique_recent_authors_count} distinct developer(s)**.\n"
            f"The repository has **{metadata.open_issues} open issues** and **{issues.open_prs_count} open pull requests**."
        )
        return AssistantAnswer(
            question=question,
            answer=answer,
            key_takeaways=[
                f"Activity status: {commits.commit_frequency_label}",
                f"Recent commits: {commits.recent_commits_count}",
                f"Unique active authors: {commits.unique_recent_authors_count}"
            ],
            evidence_metrics={
                "last_commit_date": commits.last_commit_date,
                "frequency_label": commits.commit_frequency_label,
                "open_issues": metadata.open_issues,
                "open_prs": issues.open_prs_count
            }
        )

    # 4. Documentation & Governance
    elif any(k in q_lower for k in ["doc", "readme", "guide", "license", "contributing", "policy"]):
        docs_present = []
        docs_missing = []
        for doc_name, present in structure.important_files_detected.items():
            if present:
                docs_present.append(doc_name)
            else:
                docs_missing.append(doc_name)

        answer = (
            f"**Documentation Overview for {metadata.name}:**\n\n"
            f"**Detected Governance & Docs:** {', '.join(docs_present) if docs_present else 'None'}.\n"
            f"**License:** {metadata.license or 'No open source license detected'}.\n"
            f"**Missing Items:** {', '.join(docs_missing) if docs_missing else 'All standard documentation present.'}."
        )
        return AssistantAnswer(
            question=question,
            answer=answer,
            key_takeaways=[
                f"README: {'Present' if structure.has_readme else 'Missing'}",
                f"License: {metadata.license or 'None'}",
                f"Contributing guide: {'Present' if structure.has_contributing_guide else 'Missing'}"
            ],
            evidence_metrics={
                "has_readme": structure.has_readme,
                "license": metadata.license,
                "has_contributing": structure.has_contributing_guide,
                "has_security": structure.has_security_policy
            }
        )

    # 5. Automation & CI/CD & Docker
    elif any(k in q_lower for k in ["ci", "cd", "action", "docker", "pipeline", "automation", "workflow", "test"]):
        answer = (
            f"**Automation & DevOps Infrastructure:**\n\n"
            f"- **CI/CD Pipelines:** {'Configured (Workflows detected)' if structure.has_ci_cd else 'Not detected'}\n"
            f"- **Containerization:** {'Configured (Dockerfile / Compose present)' if structure.has_docker else 'No Docker setup detected'}\n"
            f"- **Automated Tests:** {'Test suite directories/files present' if structure.has_tests else 'No explicit test directory identified'}\n"
            f"- **Environment Config:** {'Template (.env.example) present' if structure.has_env_example else 'No .env.example'}"
        )
        return AssistantAnswer(
            question=question,
            answer=answer,
            key_takeaways=[
                f"CI/CD: {'Active' if structure.has_ci_cd else 'None'}",
                f"Docker: {'Present' if structure.has_docker else 'None'}",
                f"Tests: {'Present' if structure.has_tests else 'None'}"
            ],
            evidence_metrics={
                "ci_cd": structure.has_ci_cd,
                "docker": structure.has_docker,
                "tests": structure.has_tests
            }
        )

    # Default / General Architecture & Characteristics
    top_dim = max(health.dimensions, key=lambda d: d.score)
    weak_dim = min(health.dimensions, key=lambda d: d.score)
    answer = (
        f"**{metadata.full_name}** is a **{metadata.visibility}** repository created on **{metadata.created_at[:10]}**.\n\n"
        f"- **Architecture Pattern:** {structure.architecture_pattern_hint}\n"
        f"- **Primary Stack:** {languages.primary_language or 'Multi-language'} ({dependencies.ecosystems_detected})\n"
        f"- **RepoLens Health Score:** **{health.overall_score}/100 ({health.grade})** — {health.status_label}\n"
        f"- **Key Strength:** {top_dim.name} ({top_dim.score}/100)\n"
        f"- **Area for Improvement:** {weak_dim.name} ({weak_dim.score}/100)\n"
        f"- **Popularity Metrics:** {metadata.stars:,} stars, {metadata.forks:,} forks, {metadata.watchers:,} watchers."
    )
    return AssistantAnswer(
        question=question,
        answer=answer,
        key_takeaways=[
            f"Pattern: {structure.architecture_pattern_hint}",
            f"Health: {health.overall_score}/100 ({health.grade})",
            f"Stars: {metadata.stars:,} | Forks: {metadata.forks:,}"
        ],
        evidence_metrics={
            "stars": metadata.stars,
            "forks": metadata.forks,
            "health_score": health.overall_score,
            "pattern": structure.architecture_pattern_hint
        }
    )

def generate_preset_previews(
    metadata: RepoMetadata,
    languages: LanguageBreakdown,
    contributors: ContributorsSummary,
    commits: CommitsAnalysis,
    structure: StructureAnalysis,
    dependencies: DependenciesAnalysis,
    issues: IssuesAndPRsAnalysis,
    health: HealthScore
) -> List[AssistantAnswer]:
    preset_questions = [
        "What technologies and frameworks does this project use?",
        "Who are the top contributors and what is the bus factor risk?",
        "How active is this repository and what is the commit cadence?",
        "What documentation and governance policies exist?",
        "What automation, testing, and CI/CD infrastructure exists?",
        "What are the repository's main architectural characteristics?"
    ]
    return [
        answer_query(q, metadata, languages, contributors, commits, structure, dependencies, issues, health)
        for q in preset_questions
    ]
