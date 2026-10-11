# Contributing / Updating this repository

Thanks for helping make this resource better. Suggestions, corrections and new material are welcome.

## Ways to contribute
- Fix a typo or an unclear explanation (open a pull request).
- Add an improved solution, a refactor (for example Job 1 with MVVM) or tests.
- Add notes, cheat sheets or extra practice questions under `assessment-prep/`.
- Report a broken link or file by opening an issue.

## Adding new content (maintainer guide)
| I want to add… | Put it in… | Then also… |
|---|---|---|
| A new module PDF | `course-materials/modules/` | add an entry to `modules` in `site/data/content.json` |
| A new assessment document | `assessment-prep/` | add an entry to `assessment` in `site/data/content.json` |
| A new project | `projects/<slug>/` (a full Android Studio project, with a `README.md` and `docs/`) | add an entry to `projects` in `site/data/content.json` |

The file browser, search index and ZIP downloads for projects are generated automatically.

## Preview the site locally
```bash
python3 scripts/build_site.py
python3 -m http.server -d _site 8000
# open http://localhost:8000
```
Run `build_site.py` again after every change (it rebuilds `_site/`, which is git-ignored).

## Golden rule: never commit secrets
Do **not** commit `local.properties`, `google-services.json`, API keys, keystores or passwords.
Use the placeholder files (`*.example`) and `local.properties` instead. If a key is ever pushed by mistake, revoke and regenerate it right away, deleting the file in a later commit is not enough because git keeps history.

## Commit style
Short, present-tense messages, for example `Add Job 4 spec`, `Fix Retrofit base URL in README`.
