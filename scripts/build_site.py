#!/usr/bin/env python3
"""Build the static site into ./_site

Usage:
    python3 scripts/build_site.py
    python3 -m http.server -d _site 8000     # then open http://localhost:8000

What it does:
  * copies site/ (the interface) into _site/
  * copies course PDFs and every project into _site/files/
  * finds every Android variant (a folder with settings.gradle[.kts]) and
    records its file tree and code statistics in data/tree.json
  * writes a ZIP per variant and one ZIP per job (all variants) into _site/downloads/
Run it again whenever you add or change files.
"""
import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
CONTENT_DIRS = ["course-materials", "assessment-prep"]
SKIP_DIRS = {"build", ".gradle", ".idea", ".git", ".kotlin", "__pycache__", ".artifacts"}
SKIP_FILES = {"local.properties", "google-services.json", ".DS_Store"}
TEXT_EXT = {".kt", ".kts", ".xml", ".toml", ".properties", ".md", ".txt", ".json", ".pro",
            ".keep", ".example", ".gradle", ".rules", ".yml", ".yaml", ""}


def keep(rel: Path) -> bool:
    return not (set(rel.parts) & SKIP_DIRS) and rel.name not in SKIP_FILES and rel.suffix != ".iml"


def is_text(p: Path) -> bool:
    return p.suffix.lower() in TEXT_EXT or p.name == "gradlew"


def walk(base: Path):
    for p in sorted(base.rglob("*")):
        if p.is_file() and keep(p.relative_to(base)):
            yield p


def hidden(rel: Path) -> bool:
    """Dot-files are not published by GitHub Pages artifacts, so keep them out of the site (they stay in ZIPs)."""
    return any(part.startswith(".") for part in rel.parts)


def is_variant(d: Path) -> bool:
    return d.is_dir() and ((d / "settings.gradle.kts").exists() or (d / "settings.gradle").exists())


def variant_stats(d: Path) -> dict:
    kt = [p for p in walk(d) if p.suffix == ".kt" and "src/main" in p.as_posix()]
    lines = sum(len(p.read_text(encoding="utf-8", errors="ignore").splitlines()) for p in kt)
    dsl = "Kotlin DSL" if (d / "app" / "build.gradle.kts").exists() else "Groovy"
    ns = ""
    for g in (d / "app" / "build.gradle.kts", d / "app" / "build.gradle"):
        if g.exists():
            m = re.search(r"namespace\s*=?\s*[\"']([^\"']+)", g.read_text(errors="ignore"))
            ns = m.group(1) if m else ""
            break
    return {"kotlinFiles": len(kt), "kotlinLines": lines, "gradle": dsl, "namespace": ns}


def zip_dir(dest: Path, base: Path, arc_root: str):
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
        for p in walk(base):
            z.write(p, Path(arc_root) / p.relative_to(base))


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "site", OUT)

    files_root = OUT / "files"
    for d in CONTENT_DIRS:
        src = ROOT / d
        for p in walk(src):
            rel = p.relative_to(src)
            if hidden(rel):
                continue
            dest = files_root / d / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dest)

    variants, docs = {}, {}
    downloads = OUT / "downloads"
    downloads.mkdir(exist_ok=True)
    proj_root = ROOT / "projects"
    for job in sorted(x for x in proj_root.iterdir() if x.is_dir()):
        doc_entries = []
        for p in walk(job):
            rel = p.relative_to(job)
            if rel.parts[0] == "docs" or (len(rel.parts) == 1 and p.suffix == ".md"):
                dest = files_root / "projects" / job.name / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, dest)
                doc_entries.append({"path": rel.as_posix(), "size": p.stat().st_size, "text": is_text(p)})
        docs[job.name] = doc_entries

        for v in sorted(x for x in job.iterdir() if is_variant(x)):
            entries = []
            for p in walk(v):
                rel = p.relative_to(v)
                if hidden(rel):
                    continue
                dest = files_root / "projects" / job.name / v.name / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, dest)
                entries.append({"path": rel.as_posix(), "size": p.stat().st_size, "text": is_text(p)})
            key = f"{job.name}/{v.name}"
            variants[key] = {"entries": entries, "stats": variant_stats(v)}
            zip_dir(downloads / f"{job.name}__{v.name}.zip", v, v.name)
        with zipfile.ZipFile(downloads / f"{job.name}__all-variants.zip", "w", zipfile.ZIP_DEFLATED) as z:
            for p in walk(job):
                z.write(p, Path(job.name) / p.relative_to(job))

    (OUT / "data").mkdir(exist_ok=True)
    (OUT / "data" / "tree.json").write_text(json.dumps({"variants": variants, "docs": docs}, indent=1), encoding="utf-8")
    (OUT / ".nojekyll").write_text("")
    n = sum(len(v["entries"]) for v in variants.values())
    print(f"Built site in {OUT}: {len(variants)} variants, {n} files indexed")


if __name__ == "__main__":
    main()
