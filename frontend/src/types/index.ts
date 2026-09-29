export interface RepoMetadata {
  name: string;
  owner: string;
  owner_avatar_url?: string;
  full_name: string;
  description?: string;
  html_url: string;
  homepage?: string;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
  license?: string;
  license_spdx?: string;
  is_fork: boolean;
  is_archived: boolean;
  is_template: boolean;
  size_kb: number;
  topics: string[];
  visibility: string;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
}

export interface LanguageItem {
  name: string;
  bytes: number;
  percentage: number;
  color?: string;
}

export interface LanguageBreakdown {
  total_bytes: number;
  languages: LanguageItem[];
  primary_language?: string;
}

export interface ContributorItem {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
  percentage: number;
}

export interface ContributorsSummary {
  total_contributors_sampled: number;
  top_contributors: ContributorItem[];
  contributor_velocity: string;
  bus_factor_risk: string;
}

export interface CommitItem {
  sha: string;
  short_sha: string;
  message: string;
  author_name: string;
  author_avatar?: string;
  date: string;
  html_url: string;
}

export interface CommitCadence {
  period: string;
  count: number;
}

export interface CommitsAnalysis {
  recent_commits_count: number;
  recent_commits: CommitItem[];
  activity_timeline: CommitCadence[];
  last_commit_date?: string;
  commit_frequency_label: string;
  unique_recent_authors_count: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  category?: 'manifest' | 'ci' | 'docker' | 'test' | 'doc' | 'config' | 'source';
  children?: FileNode[];
}

export interface StructureAnalysis {
  root_directories: string[];
  important_files_detected: Record<string, boolean>;
  key_file_locations: Record<string, string | null>;
  total_files_sampled: number;
  tree: FileNode[];
  has_tests: boolean;
  has_ci_cd: boolean;
  has_docker: boolean;
  has_readme: boolean;
  has_contributing_guide: boolean;
  has_license: boolean;
  has_code_of_conduct: boolean;
  has_security_policy: boolean;
  has_env_example: boolean;
  architecture_pattern_hint: string;
}

export interface DependencyItem {
  name: string;
  version?: string;
  category: 'production' | 'development' | 'toolchain';
  manifest_source: string;
}

export interface ManifestInfo {
  filename: string;
  ecosystem: string;
  dependencies_count: number;
  dev_dependencies_count: number;
  dependencies: DependencyItem[];
}

export interface DependenciesAnalysis {
  manifests_found: string[];
  ecosystems_detected: string[];
  total_dependencies_count: number;
  manifest_details: ManifestInfo[];
  highlighted_frameworks: string[];
}

export interface PullRequestInfo {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: string;
  user_avatar?: string;
  is_draft: boolean;
  html_url: string;
}

export interface IssuesAndPRsAnalysis {
  open_issues_count: number;
  closed_issues_sample_count: number;
  open_prs_count: number;
  recent_prs: PullRequestInfo[];
  issue_closure_rate_hint: string;
  collaboration_health: string;
}

export interface BranchItem {
  name: string;
  is_default: boolean;
  protected: boolean;
}

export interface BranchesAnalysis {
  total_branches_count: number;
  default_branch: string;
  branches: BranchItem[];
}

export interface HealthDimension {
  name: string;
  score: number;
  weight: number;
  description: string;
  positive_signals: string[];
  improvement_areas: string[];
  formula_explanation: string;
}

export interface HealthScore {
  overall_score: number;
  grade: string;
  status_label: string;
  dimensions: HealthDimension[];
  summary_verdict: string;
  calculation_methodology: string;
}

export interface AssistantAnswer {
  question: string;
  answer: string;
  key_takeaways: string[];
  evidence_metrics: Record<string, any>;
}

export interface RepoAnalysisResponse {
  success: boolean;
  repository: RepoMetadata;
  health: HealthScore;
  languages: LanguageBreakdown;
  contributors: ContributorsSummary;
  commits: CommitsAnalysis;
  structure: StructureAnalysis;
  dependencies: DependenciesAnalysis;
  issues_and_prs: IssuesAndPRsAnalysis;
  branches: BranchesAnalysis;
  assistant_previews: AssistantAnswer[];
  analyzed_at: string;
  rate_limit_remaining?: number;
}

export interface SampleRepo {
  name: string;
  owner: string;
  url: string;
  category: string;
  description: string;
}
