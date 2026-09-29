import os
from typing import List, Dict, Any, Optional
from app.models.repository import StructureAnalysis, FileNode

def categorize_file(path: str) -> str:
    lower = path.lower()
    base = os.path.basename(lower)
    
    if ".github/workflows" in lower or "gitlab-ci" in base or "jenkins" in base or "circleci" in lower:
        return "ci"
    if "docker" in base or "containerfile" in base:
        return "docker"
    if base in ["package.json", "requirements.txt", "pyproject.toml", "cargo.toml", "go.mod", "pom.xml", "build.gradle", "gemfile", "composer.json", "pipfile"]:
        return "manifest"
    if "test" in lower or "spec" in lower:
        return "test"
    if "readme" in base or "contributing" in base or "changelog" in base or "license" in base or "security" in base or "code_of_conduct" in base or lower.startswith("docs/"):
        return "doc"
    if base.startswith(".env") or base.endswith((".config.js", ".config.ts", ".config.mjs", ".yaml", ".yml", ".toml", ".ini")):
        return "config"
    return "source"

def build_tree_nodes(tree_items: List[Dict[str, Any]], max_depth: int = 3, max_items: int = 100) -> List[FileNode]:
    """
    Builds a nested FileNode hierarchy from flat git tree paths.
    """
    root_nodes: Dict[str, Any] = {}

    def get_or_create_dir(path_parts: List[str], current_dict: Dict[str, Any]) -> Dict[str, Any]:
        curr = current_dict
        for part in path_parts:
            if part not in curr:
                curr[part] = {"__meta__": {"name": part, "type": "dir", "children": {}}}
            curr = curr[part]["__meta__"]["children"]
        return curr

    # Take items up to max_items limit to maintain snappy rendering
    sorted_items = sorted(tree_items[:max_items], key=lambda x: x.get("path", ""))

    for item in sorted_items:
        path = item.get("path", "")
        item_type = "dir" if item.get("type") == "tree" else "file"
        parts = path.split("/")
        
        if len(parts) > max_depth + 1:
            continue
            
        if item_type == "file":
            parent_dir = get_or_create_dir(parts[:-1], root_nodes)
            file_name = parts[-1]
            parent_dir[file_name] = {
                "__meta__": {
                    "name": file_name,
                    "path": path,
                    "type": "file",
                    "size": item.get("size"),
                    "category": categorize_file(path)
                }
            }
        else:
            get_or_create_dir(parts, root_nodes)

    def convert_dict_to_nodes(d: Dict[str, Any], current_path: str = "") -> List[FileNode]:
        nodes: List[FileNode] = []
        for name, content in d.items():
            meta = content.get("__meta__", {})
            node_type = meta.get("type", "file")
            node_path = meta.get("path") or (f"{current_path}/{name}".lstrip("/"))
            category = meta.get("category") or ("source" if node_type == "file" else None)
            
            children_nodes = None
            if node_type == "dir" and "children" in meta:
                children_nodes = convert_dict_to_nodes(meta["children"], node_path)
                
            nodes.append(
                FileNode(
                    name=name,
                    path=node_path,
                    type=node_type,
                    size=meta.get("size"),
                    category=category,
                    children=children_nodes
                )
            )
        # Sort directories first, then files
        return sorted(nodes, key=lambda n: (0 if n.type == "dir" else 1, n.name.lower()))

    return convert_dict_to_nodes(root_nodes)

def analyze_structure(tree_items: List[Dict[str, Any]]) -> StructureAnalysis:
    if not tree_items:
        return StructureAnalysis(
            root_directories=[],
            important_files_detected={},
            key_file_locations={},
            total_files_sampled=0,
            tree=[],
            has_tests=False,
            has_ci_cd=False,
            has_docker=False,
            has_readme=False,
            has_contributing_guide=False,
            has_license=False,
            has_code_of_conduct=False,
            has_security_policy=False,
            has_env_example=False,
            architecture_pattern_hint="Standard Single Package"
        )

    paths = [item.get("path", "") for item in tree_items]
    lower_paths = [p.lower() for p in paths]

    # Detect presence of key files
    has_readme = any("readme" in p for p in lower_paths)
    has_tests = any("test" in p or "spec" in p for p in lower_paths)
    has_ci_cd = any(".github/workflows" in p or "gitlab-ci" in p or "jenkinsfile" in p or ".circleci" in p for p in lower_paths)
    has_docker = any("dockerfile" in p or "docker-compose" in p or "containerfile" in p for p in lower_paths)
    has_contributing = any("contributing" in p for p in lower_paths)
    has_license = any("license" in p or "licence" in p for p in lower_paths)
    has_coc = any("code_of_conduct" in p for p in lower_paths)
    has_security = any("security" in p for p in lower_paths)
    has_env = any(".env.example" in p or ".env.sample" in p for p in lower_paths)

    # Find root directories
    root_dirs = set()
    for p in paths:
        if "/" in p:
            root_dirs.add(p.split("/")[0])
    
    important_files_map = {
        "README": has_readme,
        "CI / Workflows": has_ci_cd,
        "Tests": has_tests,
        "Docker / Container": has_docker,
        "Contributing Guide": has_contributing,
        "License": has_license,
        "Code of Conduct": has_coc,
        "Security Policy": has_security,
        "Environment Example": has_env,
    }

    key_locations = {}
    for key, flag in [
        ("readme", has_readme),
        ("license", has_license),
        ("contributing", has_contributing),
        ("dockerfile", has_docker),
        ("ci", has_ci_cd),
    ]:
        if flag:
            match = next((p for p in paths if key in p.lower()), None)
            key_locations[key] = match
        else:
            key_locations[key] = None

    # Determine architecture pattern hint
    r_dirs_lower = {d.lower() for d in root_dirs}
    if "frontend" in r_dirs_lower and "backend" in r_dirs_lower:
        pattern = "Monorepo (Frontend + Backend Decoupled)"
    elif "packages" in r_dirs_lower or "apps" in r_dirs_lower or "workspaces" in r_dirs_lower:
        pattern = "Monorepo Multi-Package Workspace"
    elif "src" in r_dirs_lower and "tests" in r_dirs_lower:
        pattern = "Standard Modular Architecture (Clean separation of src/ & tests/)"
    elif "cmd" in r_dirs_lower or "pkg" in r_dirs_lower:
        pattern = "Idiomatic Go Application (CLI / Daemon Structure)"
    elif "app" in r_dirs_lower or "components" in r_dirs_lower:
        pattern = "Modern Web Application (Framework-driven Component Architecture)"
    else:
        pattern = "Modular Single-Package Repository"

    tree_nodes = build_tree_nodes(tree_items)

    return StructureAnalysis(
        root_directories=sorted(list(root_dirs)),
        important_files_detected=important_files_map,
        key_file_locations=key_locations,
        total_files_sampled=len(tree_items),
        tree=tree_nodes,
        has_tests=has_tests,
        has_ci_cd=has_ci_cd,
        has_docker=has_docker,
        has_readme=has_readme,
        has_contributing_guide=has_contributing,
        has_license=has_license,
        has_code_of_conduct=has_coc,
        has_security_policy=has_security,
        has_env_example=has_env,
        architecture_pattern_hint=pattern
    )
