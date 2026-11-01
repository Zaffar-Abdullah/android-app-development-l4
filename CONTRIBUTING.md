# Contributing and updating

Corrections, improvements and new material are welcome.

## Ways to contribute
- Fix a typo or an unclear explanation (open a pull request).
- Add another implementation of a job, a refactor, or tests.
- Add notes, cheat sheets or practice questions under `assessment-prep/`.
- Report a broken link or file by opening an issue.

## Adding content (maintainer guide)

| To add | Put it in | Then |
|---|---|---|
| A module PDF | `course-materials/modules/` | add an entry to `modules` in `site/data/content.json` |
| An assessment document | `assessment-prep/` | add an entry to `assessment` in `site/data/content.json` |
| Another implementation of a job | `projects/<job>/<new-folder>/` (a full Android Studio project) | add a variant under that job in `site/data/content.json`, then run `python3 scripts/gen_readmes.py` |
| A new job | `projects/<new-job>/` with `docs/` and implementation folders | add a job in `site/data/content.json`, then run `python3 scripts/gen_readmes.py` |

The file browser, search index, line counts and ZIP downloads are generated automatically from the folders.

## Preview locally
```bash
python3 scripts/build_site.py
python3 -m http.server -d _site 8000
```
Run `build_site.py` again after every change. `_site/` is git-ignored.

## Never commit secrets
Do not commit `local.properties`, `google-services.json`, API keys, keystores or passwords. Use the `*.example` files and `local.properties`. If a key is pushed by mistake, revoke and regenerate it immediately.

## Commit messages
Short and in the present tense: `Add Job 2 Room variant`, `Fix Retrofit base URL in README`.
