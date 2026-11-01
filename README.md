# Android Workbook

**Learn the course. See what it builds.**

A working record of the **Android Mobile Application Development (Level-4)** course by the National Skills Development Authority (NSDA), Bangladesh. It is shared for two reasons: to give the next learner something concrete to study, and to document the work completed during the course.

Live site: **https://zaffar-abdullah.github.io/android-app-development-l4/**

Official course page: <https://nsda.gov.bd/pages/files/6922da7c933eb65569e04d95>

---

## What is inside

| Folder | Contents |
|---|---|
| [`course-materials/modules`](course-materials/modules) | The 7 learning modules (688 pages): Kotlin, OOP and design patterns, Android basics, database, API integration, services and deployment, project work |
| [`assessment-prep`](assessment-prep) | Solved assessment bank, bilingual oral preparation (English and Bangla), and the three job specification sheets |
| [`projects`](projects) | The three practical jobs, each implemented several ways (8 complete Android Studio projects) with specification, AI-agent prompt and spec page images |
| [`site`](site) and [`scripts`](scripts) | Source of the interactive learning site and the tools that build it |

## The practical jobs

| Job | Task | Implementations |
|---|---|---|
| [Job 1](projects/job-1-product-listing-rest) | Product list from a REST API with Retrofit, Glide, loading and retry | `v1-packaged`, `v2-compact` |
| [Job 2](projects/job-2-user-profile-sqlite) | Profile registration with local SQLite, CRUD and MVVM | `v1-room`, `v2-sqlite-helper` |
| [Job 3](projects/job-3-location-sharing-firebase) | Location sharing with Firebase Auth, Firestore and Google Maps | `v1-mvvm-packages`, `v2-flat`, `v3-view-layer`, `v4-styled` |

Each job README explains the differences between its implementations, so you can pick the approach that fits what you want to learn.

## Suggested way to use it

1. Read a module and tick it off on the site.
2. Attempt the matching job yourself against the clock (1 hour, 1 hour, 2 hours).
3. Compare your result with the implementations and note what you would change.
4. Revise with the solved bank and the oral preparation.

## Run a project

1. Install the latest **Android Studio**.
2. Choose `File > Open` and select one implementation folder, for example `projects/job-1-product-listing-rest/v1-packaged`.
3. Wait for Gradle sync, then run on an emulator or a device.

**Job 3 needs your own keys.** Private values are not stored in this repository. Add your own `google-services.json` to the `app/` folder (see `google-services.json.example`) and put `MAPS_API_KEY=your_key` in `local.properties`. Full steps are in the [Job 3 README](projects/job-3-location-sharing-firebase/README.md).

## Preview the site locally

```bash
python3 scripts/build_site.py
python3 -m http.server -d _site 8000
# open http://localhost:8000
```

## Repository structure

```text
android-app-development-l4/
|-- README.md  LICENSE  CONTRIBUTING.md
|-- course-materials/
|   `-- modules/                       7 module PDFs
|-- assessment-prep/
|   |-- solved-assessment-bank.pdf
|   |-- oral-preparation.pdf
|   `-- job-specifications/            job 1, 2, 3 specification PDFs
|-- projects/
|   |-- README.md                      index of every implementation
|   |-- job-1-product-listing-rest/    README, docs/, v1-packaged, v2-compact
|   |-- job-2-user-profile-sqlite/     README, docs/, v1-room, v2-sqlite-helper
|   `-- job-3-location-sharing-firebase/
|                                      README, docs/, v1-mvvm-packages, v2-flat,
|                                      v3-view-layer, v4-styled
|-- site/                              interactive learning site (HTML, CSS, JS, data)
|-- scripts/                           build_site.py, gen_readmes.py
`-- .github/workflows/pages.yml        deploys the site to GitHub Pages
```

## Keeping it up to date

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: add files to the right folder, describe them once in `site/data/content.json`, commit and push. The site rebuilds itself.

## Security note

`local.properties` and `google-services.json` are git-ignored and must never be committed. If a key is ever pushed by mistake, revoke and regenerate it; deleting the file in a later commit is not enough because Git keeps history.

## Credits and licensing

- **Source code, site and scripts** (`projects/`, `site/`, `scripts/`): MIT License, see [LICENSE](LICENSE).
- **Course modules** (`course-materials/`): Competency Based Learning Material by the National Skills Development Authority (NSDA), Government of the People's Republic of Bangladesh. All rights belong to NSDA. Included here for educational reference and removed on request.
- The site bundles [highlight.js](https://highlightjs.org/) (BSD-3-Clause) and [marked](https://marked.js.org/) (MIT) in `site/vendor/`.

---

Maintained by **Zaffar Abdullah**. If this helped you, a star on the repository is appreciated.
