#!/usr/bin/env python3
"""Build the static site into ./_site

Usage:
    python3 scripts/build_site.py
    python3 -m http.server -d _site 8000     # then open http://localhost:8000

It copies the site/ UI, the course PDFs and the project sources into _site/,
generates data/tree.json (file trees for the code viewer) and a downloadable
ZIP for every project. Run it again whenever you add or change files.
"""
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
CONTENT_DIRS = ["course-materials", "assessment-prep", "projects"]
SKIP_DIRS = {"build", ".gradle", ".idea", ".git", ".kotlin", "__pycache__"}
SKIP_FILES = {"local.properties", "google-services.json", ".DS_Store"}
TEXT_EXT = {".kt", ".kts", ".xml", ".toml", ".properties", ".md", ".txt", ".json", ".pro",
            ".keep", ".example", ".gradle", ".gitignore", ".yml", ".yaml", ""}


def keep(path: Path) -> bool:
    return not (set(path.parts) & SKIP_DIRS) and path.name not in SKIP_FILES and path.suffix != ".iml"


def is_text(path: Path) -> bool:
    if path.suffix.lower() in TEXT_EXT or path.name in {"gradlew"}:
        return True
    return False


def walk(base: Path):
    for p in sorted(base.rglob("*")):
        if p.is_file() and keep(p.relative_to(base)):
            yield p


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "site", OUT)

    files_root = OUT / "files"
    for d in CONTENT_DIRS:
        src = ROOT / d
        if not src.exists():
            continue
        for p in walk(src):
            dest = files_root / d / p.relative_to(src)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dest)

    trees, downloads = {}, OUT / "downloads"
    downloads.mkdir(exist_ok=True)
    proj_root = ROOT / "projects"
    for proj in sorted(x for x in proj_root.iterdir() if x.is_dir()):
        entries = []
        for p in walk(proj):
            rel = p.relative_to(proj).as_posix()
            entries.append({"path": rel, "size": p.stat().st_size, "text": is_text(p)})
        trees[proj.name] = entries
        with zipfile.ZipFile(downloads / f"{proj.name}.zip", "w", zipfile.ZIP_DEFLATED) as z:
            for p in walk(proj):
                z.write(p, Path(proj.name) / p.relative_to(proj))

    (OUT / "data").mkdir(exist_ok=True)
    (OUT / "data" / "tree.json").write_text(json.dumps(trees, indent=1), encoding="utf-8")
    (OUT / ".nojekyll").write_text("")
    print(f"Built site in {OUT} ({sum(len(v) for v in trees.values())} project files indexed)")


if __name__ == "__main__":
    main()
