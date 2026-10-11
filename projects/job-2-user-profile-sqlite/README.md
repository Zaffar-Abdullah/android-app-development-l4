# Job 2: User Profile Registration (SQLite / Room)

A local profile manager. Users add their profile, see everyone in a list, open a profile, then edit or delete it. Data is stored on the device in a SQLite database through **Room**.

| | |
|---|---|
| **Time in assessment** | 1 hour |
| **Language / UI** | Kotlin, XML layouts, ViewBinding |
| **Architecture** | MVVM: Entity → DAO → Repository → ViewModel (LiveData) → Activity |
| **Libraries** | Room (runtime, ktx, compiler via KSP), Lifecycle ViewModel / LiveData |
| **Related modules** | 2 OOP & patterns, 3 Android basics, 4 Managing database |

## Features
- `WelcomeActivity` (launcher) with a button to the profile list
- `ProfileListActivity`: RecyclerView of all saved profiles
- `AddProfileActivity`: name, email, date of birth, district, mobile
- `SingleProfileActivity`: full details with **Edit** and **Delete**
- Full CRUD (create, read, update, delete) on a Room database

## Project structure
```text
app/src/main/java/com/example/userprofileregistration/
├── UserProfile.kt            # @Entity (id, name, email, dob, district, mobile)
├── UserProfileDao.kt         # @Insert @Update @Delete @Query
├── UserDatabase.kt           # RoomDatabase singleton
├── UserProfileRepository.kt
├── UserProfileViewModel.kt
├── WelcomeActivity.kt
├── ProfileListActivity.kt  + ProfileAdapter.kt
├── AddProfileActivity.kt
└── SingleProfileActivity.kt
```

## Run it
1. Open this folder in Android Studio and let Gradle sync.
2. Run on an emulator or device (no internet needed).
3. Add a profile, open it from the list, then try Edit and Delete.

## Documents
- [Specification sheet](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md)
