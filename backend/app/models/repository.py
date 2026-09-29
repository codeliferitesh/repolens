from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RepoIdentifier(BaseModel):
    owner: str
    repo: str
    full_name: str
    url: str

class RepoMetadata(BaseModel):
    name: str
    owner: str
    owner_avatar_url: Optional[str] = None
    full_name: str
    description: Optional[str] = None
    html_url: str
    homepage: Optional[str] = None
    stars: int = 0
    forks: int = 0
    watchers: int = 0
    open_issues: int = 0
    default_branch: str = "main"
    created_at: str
    updated_at: str
    pushed_at: Optional[str] = None
    license: Optional[str] = None
    license_spdx: Optional[str] = None
    is_fork: bool = False
    is_archived: bool = False
    is_template: bool = False
    size_kb: int = 0
    topics: List[str] = Field(default_factory=list)
    visibility: str = "public"
    has_wiki: bool = False
    has_pages: bool = False
    has_discussions: bool = False

class LanguageItem(BaseModel):
    name: str
    bytes: int
    percentage: float
    color: Optional[str] = None

class LanguageBreakdown(BaseModel):
    total_bytes: int
    languages: List[LanguageItem]
    primary_language: Optional[str] = None

class ContributorItem(BaseModel):
    login: str
    avatar_url: str
    html_url: str
    contributions: int
    type: str = "User"
    percentage: float = 0.0

class ContributorsSummary(BaseModel):
    total_contributors_sampled: int
    top_contributors: List[ContributorItem]
    contributor_velocity: str  # e.g., "High", "Moderate", "Single Maintainer"
    bus_factor_risk: str  # e.g., "Low", "Medium", "High"

class CommitAuthor(BaseModel):
    name: str
    email: Optional[str] = None
    date: str

class CommitItem(BaseModel):
    sha: str
    short_sha: str
    message: str
    author_name: str
    author_avatar: Optional[str] = None
    date: str
    html_url: str

class CommitCadence(BaseModel):
    period: str
    count: int

class CommitsAnalysis(BaseModel):
    recent_commits_count: int
    recent_commits: List[CommitItem]
    activity_timeline: List[CommitCadence]
    last_commit_date: Optional[str] = None
    commit_frequency_label: str  # e.g., "Very Active (<7 days)", "Active", "Dormant"
    unique_recent_authors_count: int

class FileNode(BaseModel):
    name: str
    path: str
    type: str  # "file" or "dir"
    size: Optional[int] = None
    category: Optional[str] = None  # "manifest", "ci", "docker", "test", "doc", "config", "source"
    children: Optional[List['FileNode']] = None

FileNode.model_rebuild()

class StructureAnalysis(BaseModel):
    root_directories: List[str]
    important_files_detected: Dict[str, bool]
    key_file_locations: Dict[str, Optional[str]]
    total_files_sampled: int
    tree: List[FileNode]
    has_tests: bool
    has_ci_cd: bool
    has_docker: bool
    has_readme: bool
    has_contributing_guide: bool
    has_license: bool
    has_code_of_conduct: bool
    has_security_policy: bool
    has_env_example: bool
    architecture_pattern_hint: str

class DependencyItem(BaseModel):
    name: str
    version: Optional[str] = None
    category: str = "production"  # "production", "development", "toolchain"
    manifest_source: str

class ManifestInfo(BaseModel):
    filename: str
    ecosystem: str  # "npm/Node.js", "Python/PyPI", "Rust/Cargo", "Go/Modules", "Java/Maven", etc.
    dependencies_count: int
    dev_dependencies_count: int = 0
    dependencies: List[DependencyItem]

class DependenciesAnalysis(BaseModel):
    manifests_found: List[str]
    ecosystems_detected: List[str]
    total_dependencies_count: int
    manifest_details: List[ManifestInfo]
    highlighted_frameworks: List[str]

class PullRequestInfo(BaseModel):
    id: int
    number: int
    title: str
    state: str
    created_at: str
    user: str
    user_avatar: Optional[str] = None
    is_draft: bool = False
    html_url: str

class IssuesAndPRsAnalysis(BaseModel):
    open_issues_count: int
    closed_issues_sample_count: int
    open_prs_count: int
    recent_prs: List[PullRequestInfo]
    issue_closure_rate_hint: str
    collaboration_health: str

class BranchItem(BaseModel):
    name: str
    is_default: bool
    protected: bool

class BranchesAnalysis(BaseModel):
    total_branches_count: int
    default_branch: str
    branches: List[BranchItem]

class HealthDimension(BaseModel):
    name: str
    score: int  # 0 to 100
    weight: float
    description: str
    positive_signals: List[str]
    improvement_areas: List[str]
    formula_explanation: str

class HealthScore(BaseModel):
    overall_score: int  # 0 to 100
    grade: str  # "A+", "A", "B", "C", "D"
    status_label: str  # "Exceptional", "Healthy & Well-Maintained", "Moderate Maintenance", "Needs Attention"
    dimensions: List[HealthDimension]
    summary_verdict: str
    calculation_methodology: str

class AssistantAnswer(BaseModel):
    question: str
    answer: str
    key_takeaways: List[str]
    evidence_metrics: Dict[str, Any]

class RepoAnalysisResponse(BaseModel):
    success: bool
    repository: RepoMetadata
    health: HealthScore
    languages: LanguageBreakdown
    contributors: ContributorsSummary
    commits: CommitsAnalysis
    structure: StructureAnalysis
    dependencies: DependenciesAnalysis
    issues_and_prs: IssuesAndPRsAnalysis
    branches: BranchesAnalysis
    assistant_previews: List[AssistantAnswer]
    analyzed_at: str
    rate_limit_remaining: Optional[int] = None
