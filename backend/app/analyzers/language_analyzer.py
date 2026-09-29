from typing import Dict, List, Optional
from app.models.repository import LanguageBreakdown, LanguageItem

LANGUAGE_COLORS = {
    "TypeScript": "#3178c6",
    "JavaScript": "#f7df1e",
    "Python": "#3572A5",
    "Rust": "#dea584",
    "Go": "#00ADD8",
    "Java": "#b07219",
    "C++": "#f34b7d",
    "C": "#555555",
    "C#": "#178600",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Dart": "#00B4AB",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "SCSS": "#c6538c",
    "Shell": "#89e051",
    "Vue": "#41b883",
    "Svelte": "#ff3e00",
    "Solidity": "#AA6746",
    "Scala": "#c22d40",
    "Elixir": "#6e4a7e",
    "Haskell": "#5e5086",
    "Lua": "#000080",
    "R": "#198CE7",
    "Jupyter Notebook": "#DA5B0B",
    "Dockerfile": "#384d54",
    "Makefile": "#427819",
    "Zig": "#ec915c",
    "Nix": "#7e7eff"
}

def analyze_languages(raw_languages: Dict[str, int]) -> LanguageBreakdown:
    total_bytes = sum(raw_languages.values())
    if total_bytes == 0:
        return LanguageBreakdown(
            total_bytes=0,
            languages=[],
            primary_language=None
        )

    languages_list: List[LanguageItem] = []
    for lang, byte_count in sorted(raw_languages.items(), key=lambda item: item[1], reverse=True):
        pct = round((byte_count / total_bytes) * 100, 2)
        color = LANGUAGE_COLORS.get(lang, "#6366f1")
        languages_list.append(
            LanguageItem(
                name=lang,
                bytes=byte_count,
                percentage=pct,
                color=color
            )
        )

    primary_language = languages_list[0].name if languages_list else None

    return LanguageBreakdown(
        total_bytes=total_bytes,
        languages=languages_list,
        primary_language=primary_language
    )
