# Job 2: User Profile Registration

**Local database and CRUD** &middot; assessment time: 1 hour

A local profile manager: welcome screen, profile list, add, view, update and delete. Data stays on the device in SQLite, organised with MVVM.

## What the job asks for

- WelcomeActivity as launcher
- ProfileListActivity with all profiles
- AddProfileActivity: name, email, date of birth, district, mobile
- SingleProfileActivity with edit and delete
- MVVM with Android Jetpack components

## Implementations

This job is built 2 different ways. Every folder is a complete Android Studio project: open it, sync Gradle and run.

| Folder | Name | Approach | Kotlin files | Lines | Gradle |
|---|---|---|---|---|---|
| [`v1-room`](v1-room/) | Room | Room Entity, DAO, Database, KSP annotation processing, Repository and ViewModel with LiveData | 10 | 330 | Kotlin DSL |
| [`v2-sqlite-helper`](v2-sqlite-helper/) | SQLiteOpenHelper | SQLiteOpenHelper, Hand-written CREATE TABLE and queries, Repository and ViewModel | 10 | 399 | Kotlin DSL |

### Room: Room on top of SQLite

Uses the Room persistence library, which generates the SQLite code for you. The modern, recommended approach.

- DAO with insert, update, delete and query methods
- Database singleton
- Activities observe LiveData from the ViewModel

Read this if you want the standard Jetpack way to persist data.

### SQLiteOpenHelper: Plain SQLite with no extra libraries

Writes the SQL by hand with SQLiteOpenHelper, ContentValues and cursors, then wraps it in a Repository and ViewModel.

- DatabaseHelper creates the table and implements add, read all, update and delete
- No Room dependency, only AndroidX and Material
- Shows exactly what Room generates behind the scenes

Read this if the spec says SQLite literally, or you want to understand what Room hides.

## How to run

1. Open one variant folder in Android Studio and let Gradle sync.
2. Run on an emulator or device (no internet needed).
3. Add a profile, open it from the list, then try edit and delete.

## Documents

- [Specification (PDF)](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md)
- Specification pages as images: `docs/spec-pages/`

## Related modules

- Module 2: OOP and Design Patterns
- Module 3: Android Basics
- Module 4: Managing Database
