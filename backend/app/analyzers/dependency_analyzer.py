import json
import re
from typing import List, Dict, Any, Optional
from app.models.repository import DependenciesAnalysis, ManifestInfo, DependencyItem

FRAMEWORK_SIGNALS = {
    # JavaScript / TypeScript
    "react": "React",
    "vue": "Vue.js",
    "@angular/core": "Angular",
    "next": "Next.js",
    "nuxt": "Nuxt.js",
    "svelte": "Svelte",
    "express": "Express",
    "fastify": "Fastify",
    "@nestjs/core": "NestJS",
    "tailwindcss": "Tailwind CSS",
    "three": "Three.js",
    "@react-three/fiber": "React Three Fiber",
    "prisma": "Prisma ORM",
    "graphql": "GraphQL",
    "vite": "Vite",
    "astro": "Astro",
    # Python
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "pydantic": "Pydantic",
    "sqlalchemy": "SQLAlchemy",
    "numpy": "NumPy",
    "pandas": "Pandas",
    "celery": "Celery",
    "pytest": "Pytest",
    # Rust
    "actix-web": "Actix Web",
    "axum": "Axum",
    "tokio": "Tokio",
    "serde": "Serde",
    # Go
    "github.com/gin-gonic/gin": "Gin",
    "github.com/gofiber/fiber": "Fiber",
    "gorm.io/gorm": "GORM",
}

def parse_package_json(content: str, filename: str) -> ManifestInfo:
    deps: List[DependencyItem] = []
    dev_count = 0
    try:
        data = json.loads(content)
        prod_deps = data.get("dependencies", {})
        dev_deps = data.get("devDependencies", {})

        for name, ver in prod_deps.items():
            deps.append(
                DependencyItem(
                    name=name,
                    version=str(ver),
                    category="production",
                    manifest_source=filename
                )
            )

        for name, ver in dev_deps.items():
            dev_count += 1
            deps.append(
                DependencyItem(
                    name=name,
                    version=str(ver),
                    category="development",
                    manifest_source=filename
                )
            )
    except Exception:
        pass

    return ManifestInfo(
        filename=filename,
        ecosystem="Node.js / npm",
        dependencies_count=len(deps) - dev_count,
        dev_dependencies_count=dev_count,
        dependencies=deps
    )

def parse_requirements_txt(content: str, filename: str) -> ManifestInfo:
    deps: List[DependencyItem] = []
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("-r") or line.startswith("-e"):
            continue
        
        # Match name and version specification
        match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:([=><~^!]+.*))?$", line)
        if match:
            name = match.group(1)
            ver = match.group(2) if match.group(2) else None
            deps.append(
                DependencyItem(
                    name=name,
                    version=ver,
                    category="production",
                    manifest_source=filename
                )
            )

    return ManifestInfo(
        filename=filename,
        ecosystem="Python / PyPI",
        dependencies_count=len(deps),
        dev_dependencies_count=0,
        dependencies=deps
    )

def parse_cargo_toml(content: str, filename: str) -> ManifestInfo:
    deps: List[DependencyItem] = []
    in_deps = False
    in_dev_deps = False

    for line in content.splitlines():
        line = line.strip()
        if line.startswith("[dependencies]"):
            in_deps = True
            in_dev_deps = False
            continue
        elif line.startswith("[dev-dependencies]"):
            in_deps = False
            in_dev_deps = True
            continue
        elif line.startswith("["):
            in_deps = False
            in_dev_deps = False
            continue

        if (in_deps or in_dev_deps) and "=" in line:
            parts = line.split("=", 1)
            name = parts[0].strip()
            ver = parts[1].strip().strip('"\'')
            category = "development" if in_dev_deps else "production"
            deps.append(
                DependencyItem(
                    name=name,
                    version=ver,
                    category=category,
                    manifest_source=filename
                )
            )

    dev_count = sum(1 for d in deps if d.category == "development")
    return ManifestInfo(
        filename=filename,
        ecosystem="Rust / Cargo",
        dependencies_count=len(deps) - dev_count,
        dev_dependencies_count=dev_count,
        dependencies=deps
    )

def parse_go_mod(content: str, filename: str) -> ManifestInfo:
    deps: List[DependencyItem] = []
    in_require_block = False

    for line in content.splitlines():
        line = line.strip()
        if line.startswith("require ("):
            in_require_block = True
            continue
        elif in_require_block and line.startswith(")"):
            in_require_block = False
            continue

        if in_require_block or line.startswith("require "):
            clean_line = line.replace("require ", "").strip()
            parts = clean_line.split()
            if len(parts) >= 2:
                name = parts[0]
                ver = parts[1]
                deps.append(
                    DependencyItem(
                        name=name,
                        version=ver,
                        category="production",
                        manifest_source=filename
                    )
                )

    return ManifestInfo(
        filename=filename,
        ecosystem="Go / Modules",
        dependencies_count=len(deps),
        dev_dependencies_count=0,
        dependencies=deps
    )

def analyze_dependencies(manifest_files: Dict[str, str]) -> DependenciesAnalysis:
    """
    manifest_files is a dict mapping filename -> file content string
    """
    manifest_details: List[ManifestInfo] = []
    frameworks_detected = set()

    for filename, content in manifest_files.items():
        base = filename.split("/")[-1].lower()
        if base == "package.json":
            info = parse_package_json(content, filename)
            manifest_details.append(info)
        elif "requirements" in base and base.endswith(".txt"):
            info = parse_requirements_txt(content, filename)
            manifest_details.append(info)
        elif base == "cargo.toml":
            info = parse_cargo_toml(content, filename)
            manifest_details.append(info)
        elif base == "go.mod":
            info = parse_go_mod(content, filename)
            manifest_details.append(info)
        elif base == "pyproject.toml":
            info = parse_requirements_txt(content, filename)  # basic fallback
            info.ecosystem = "Python / PyProject"
            manifest_details.append(info)

    # Detect high-profile frameworks
    for m in manifest_details:
        for dep in m.dependencies:
            dep_lower = dep.name.lower()
            for key, label in FRAMEWORK_SIGNALS.items():
                if key == dep_lower or key.split("/")[-1] == dep_lower:
                    frameworks_detected.add(label)

    ecosystems = list({m.ecosystem for m in manifest_details})
    total_deps = sum(len(m.dependencies) for m in manifest_details)

    return DependenciesAnalysis(
        manifests_found=list(manifest_files.keys()),
        ecosystems_detected=ecosystems,
        total_dependencies_count=total_deps,
        manifest_details=manifest_details,
        highlighted_frameworks=sorted(list(frameworks_detected))
    )
