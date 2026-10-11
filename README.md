<div align="center">

# 📱 Android Mobile Application Development (Level-4)

**Course modules · Solved assessments · Oral preparation · Three complete Kotlin projects**

![Kotlin](https://img.shields.io/badge/Kotlin-Android-7F52FF?logo=kotlin&logoColor=white)
![Modules](https://img.shields.io/badge/Modules-7-0d9f6e)
![Projects](https://img.shields.io/badge/Projects-3-4f46e5)
![License](https://img.shields.io/badge/License-MIT-blue)

### 🌐 [Open the interactive learning hub](https://zaffar-abdullah.github.io/android-app-development-l4/)

</div>

---

## About

This repository collects everything I used while completing the **Android Mobile Application Development (Level-4)** training (NSDA, Bangladesh): the learning modules, my assessment preparation, and the three practical jobs I built. It is organised so that anyone can **learn from it, reuse the resources, and follow the same path**, and I keep updating it over time.

> Official course page: <https://nsda.gov.bd/pages/files/6922da7c933eb65569e04d95>

## What you will find

| Section | What it contains |
|---|---|
| 📚 [`course-materials/modules`](course-materials/modules) | The 7 CBLM modules as PDFs (688 pages): Kotlin, OOP & design patterns, Android basics, databases, API integration, services & deployment, project work |
| 🎯 [`assessment-prep`](assessment-prep) | Solved assessment bank (jobs, MCQs, short answers, oral), bilingual oral preparation (English + বাংলা), and the three job specification sheets |
| 🛠 [`projects`](projects) | Three working Android Studio projects with their specification and the AI-agent prompt used to scaffold each one |
| 🌐 [`site`](site) + [`scripts`](scripts) | Source of the interactive learning hub (GitHub Pages) |

## Learning path

```
Module 1  Kotlin Basics
   ↓
Module 2  OOP & Design Patterns ──► MVVM, Repository
   ↓
Module 3  Android Basics ─────────► Activities, layouts, RecyclerView
   ↓
Module 4  Managing Database ──────► SQLite / Room            ──► Job 2
   ↓
Module 5  API Integration ────────► Retrofit, Firebase       ──► Job 1, Job 3
   ↓
Module 6  Services & Deployment ──► Broadcast, services, TDD, signing
   ↓
Module 7  Project Work ───────────► User stories, presentation
```

## Projects

| Job | Project | Time | Main topics | Folder |
|---|---|---|---|---|
| 1 | **Product Listing App** | 1 h | Retrofit, Gson, Glide, RecyclerView, error + retry handling | [`job-1-product-listing-rest`](projects/job-1-product-listing-rest) |
| 2 | **User Profile Registration** | 1 h | Room (SQLite), CRUD, MVVM, LiveData, ViewBinding | [`job-2-user-profile-sqlite`](projects/job-2-user-profile-sqlite) |
| 3 | **Location Sharing App** | 2 h | Firebase Auth, Cloud Firestore, Google Maps, Fused Location, MVVM | [`job-3-location-sharing-firebase`](projects/job-3-location-sharing-firebase) |

Each project folder is a complete Android Studio project and contains its own `README.md`, `docs/specification.pdf` and `docs/ai-agent-prompt.md`.

## Quick start

### Use the learning hub
Open the hosted site (link at the top). It lets you read the modules, tick off your progress, search everything, browse and copy source files, and download each project as a ZIP.

### Run a project
1. Install the latest **Android Studio**.
2. `File ▸ Open` and choose one project folder (for example `projects/job-1-product-listing-rest`).
3. Wait for Gradle sync, then run on an emulator or a real device.

> **Job 3 needs your own keys** (Firebase `google-services.json` and a Google Maps API key). Setup is explained in [its README](projects/job-3-location-sharing-firebase/README.md).

### Preview the site locally
```bash
python3 scripts/build_site.py
python3 -m http.server -d _site 8000   # open http://localhost:8000
```

## Repository structure

```text
android-app-development-l4/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── course-materials/
│   └── modules/                  # 7 module PDFs
├── assessment-prep/
│   ├── solved-assessment-bank.pdf
│   ├── oral-preparation.pdf
│   └── job-specifications/       # job-1/2/3 specification PDFs
├── projects/
│   ├── job-1-product-listing-rest/
│   ├── job-2-user-profile-sqlite/
│   └── job-3-location-sharing-firebase/
├── site/                         # interactive hub (HTML, CSS, JS, data)
├── scripts/build_site.py         # builds the static site + project ZIPs
└── .github/workflows/pages.yml   # auto-deploys the site to GitHub Pages
```

## Publish it on GitHub (once)

```bash
cd android-app-development-l4
git init -b main
git add .
git commit -m "Initial commit: Android App Development L4 resources"
git remote add origin https://github.com/Zaffar-Abdullah/android-app-development-l4.git
git push -u origin main
```

Then on GitHub: **Settings ▸ Pages ▸ Build and deployment ▸ Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and deploys the site on every push to `main`. Your site will be live at `https://zaffar-abdullah.github.io/android-app-development-l4/`.

After the first push, set the repository's **About ▸ Website** (the gear icon on the repo page) to the live site URL.

## Keeping it up to date
See [CONTRIBUTING.md](CONTRIBUTING.md). In short: drop new files into the right folder, add one entry to `site/data/content.json`, commit and push, and the site updates itself.

## Security note
Private values are **not** stored here. `local.properties` and `google-services.json` are git-ignored; use the provided `*.example` file and your own keys. Never commit API keys.

## Credits and licensing
- **Source code and site** (`projects/`, `site/`, `scripts/`): MIT License, see [LICENSE](LICENSE).
- **Course modules** (`course-materials/`): Competency Based Learning Material by the **National Skills Development Authority (NSDA), Prime Minister's Office, Government of the People's Republic of Bangladesh**. All rights belong to NSDA. Included here for educational reference, and removed on request.
- Highlighting and Markdown rendering in the site use [highlight.js](https://highlightjs.org/) (BSD-3-Clause) and [marked](https://marked.js.org/) (MIT), bundled in `site/vendor/`.

---

<div align="center">

Made with ☕ by **Zaffar Abdullah** · If this helped you, please ⭐ the repository.

</div>
