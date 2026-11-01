#!/usr/bin/env python3
"""Regenerate the per-job README.md files and the projects index from site/data/content.json.

Usage: python3 scripts/gen_readmes.py
Edit content.json (the single source of truth), run this, commit. Kotlin file and line counts
come from build_site.py's measurements, so they are recomputed here directly from the code.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = json.loads((ROOT / "site/data/content.json").read_text(encoding="utf-8"))
SKIP = {"build", ".gradle", ".idea", ".git", ".kotlin"}


def stats(v: Path):
    kt = [p for p in v.rglob("*.kt") if "src/main" in p.as_posix() and not (set(p.parts) & SKIP)]
    lines = sum(len(p.read_text(encoding="utf-8", errors="ignore").splitlines()) for p in kt)
    dsl = "Kotlin DSL" if (v / "app/build.gradle.kts").exists() else "Groovy"
    return len(kt), lines, dsl


def mod_name(i):
    return next(m["short"] for m in D["modules"] if m["id"] == i)


index_rows = []
for j in D["jobs"]:
    jd = ROOT / "projects" / j["slug"]
    rows = []
    for v in j["variants"]:
        n, l, dsl = stats(jd / v["id"])
        rows.append(f"| [`{v['id']}`]({v['id']}/) | {v['label']} | {', '.join(v['approach'][:3])} | {n} | {l} | {dsl} |")
        index_rows.append(f"| Job {j['job']} | [{v['label']}]({j['slug']}/{v['id']}/) | {v['title']} | {n} | {l} |")
    md = [f"# Job {j['job']}: {j['title']}", "", f"**{j['subtitle']}** &middot; assessment time: {j['time']}", "", j["summary"], ""]
    md += ["## What the job asks for", ""] + [f"- {r}" for r in j["requirements"]]
    if j.get("api"):
        md += ["", f"API used: `{j['api']}`"]
    md += ["", "## Implementations", "",
           f"This job is built {len(j['variants'])} different ways. Every folder is a complete Android Studio project: open it, sync Gradle and run.", "",
           "| Folder | Name | Approach | Kotlin files | Lines | Gradle |", "|---|---|---|---|---|---|"] + rows + [""]
    for v in j["variants"]:
        md += [f"### {v['label']}: {v['title']}", "", v["summary"], ""] + [f"- {h}" for h in v["highlights"]] + ["", f"Read this if {v['readIf']}", ""]
    if j.get("setup"):
        md += ["## Setup before you run it", "", j["setup"], ""]
        if j["job"] == 3:
            md += ["1. Create a Firebase project and add an Android app with the package name `com.example.locationsharingapp`.",
                   "2. Enable Email/Password sign-in and create a Cloud Firestore database.",
                   "3. Download `google-services.json` into the `app/` folder of the variant you open. `app/google-services.json.example` shows the shape.",
                   "4. Create a Google Maps API key (Maps SDK for Android), restrict it to your app, and add this line to `local.properties`:",
                   "   ```properties", "   MAPS_API_KEY=your_key_here", "   ```",
                   "5. Firestore rules: v2 ships a `firestore.rules` file. A tighter alternative that works with the other variants (collection `AppUsers`):",
                   "   ```", "   rules_version = '2';", "   service cloud.firestore {", "     match /databases/{database}/documents {",
                   "       match /AppUsers/{userId} {", "         allow read: if request.auth != null;",
                   "         allow write: if request.auth != null && request.auth.uid == userId;", "       }", "     }", "   }", "   ```", ""]
    md += ["## How to run", ""] + [f"{i}. {s}" for i, s in enumerate(j["run"], 1)] + ["",
           "## Documents", "", "- [Specification (PDF)](docs/specification.pdf)", "- [AI-agent prompt](docs/ai-agent-prompt.md)", "- Specification pages as images: `docs/spec-pages/`", "",
           "## Related modules", ""] + [f"- Module {i}: {mod_name(i)}" for i in j["related"]] + [""]
    (jd / "README.md").write_text("\n".join(md), encoding="utf-8")

idx = ["# Projects", "",
       "Three practical jobs from the course, each implemented several ways. Pick a job, read its README, then open any implementation folder in Android Studio.", "",
       "| Job | Implementation | Idea | Kotlin files | Lines |", "|---|---|---|---|---|"] + index_rows + ["",
       "Folders named `v1`, `v2`... are complete Gradle projects. The `docs/` folder inside each job holds the specification, the AI-agent prompt and the specification page images.", ""]
(ROOT / "projects" / "README.md").write_text("\n".join(idx), encoding="utf-8")
print("READMEs written")
