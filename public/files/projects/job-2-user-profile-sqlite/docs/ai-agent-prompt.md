# Prompt for Android Studio AI Agent (Gemini) — Job 02: User Profile Registration App (SQLite)

Copy-paste the prompt block below into the Gemini / Android Studio AI agent chat panel.

---

## PROMPT

You are an expert senior Android developer. Build a complete, runnable **Kotlin** Android Studio project named exactly **`UserProfileRegistration`** that satisfies the requirements below. Do not use Java. Use **MVVM architecture with Android Jetpack Components** as explicitly required. Make sure the app builds and runs on an emulator (API 21+) without errors.

### 1. Project Setup
- Create a new Android Studio project, name it **`UserProfileRegistration`**.
- Language: Kotlin. Minimum SDK: API 21.
- Enable **View Binding** and **Data Binding** in `build.gradle`.
- Package name: `com.<yourname>.userprofileregistration`.

### 2. Architecture — MVVM with Jetpack
- Use **Room** (the recommended Jetpack abstraction over raw SQLite) as the local database.
- Use **ViewModel** to hold and expose UI logic/state.
- Use **LiveData** to observe the list of profiles and single profile data reactively.
- Use **Data Binding** in XML layouts to bind ViewModel fields directly to views where practical.
- Package structure: `data/entity`, `data/dao`, `data/database`, `repository`, `viewmodel`, `ui`.

### 3. Dependencies
- `androidx.room:room-runtime`, `androidx.room:room-ktx`, `kapt androidx.room:room-compiler`.
- `androidx.lifecycle:lifecycle-viewmodel-ktx`, `lifecycle-livedata-ktx`.
- `androidx.recyclerview:recyclerview`.
- Coroutines for async DB operations.

### 4. Data Model
- Create a Room **Entity** `Profile` with fields:
  - `id: Int` (primary key, autoGenerate = true)
  - `name: String`
  - `email: String`
  - `dateOfBirth: String`
  - `district: String`
  - `mobile: String`
- Create a `ProfileDao` interface with suspend functions: `insert`, `update`, `delete`, `getAllProfiles(): LiveData<List<Profile>>`, `getProfileById(id: Int): LiveData<Profile>`.
- Create an abstract `AppDatabase : RoomDatabase()` singleton class.

### 5. Screens / Activities (implement exactly these, matching the spec)

**a) `WelcomeActivity`** (launcher activity)
- Simple welcome screen with app title/logo and a **"Profile List"** button.
- Clicking the button navigates to `ProfileListActivity`.

**b) `ProfileListActivity`**
- Shows all saved profiles in a `RecyclerView`.
- Each row shows the profile's name and email, plus:
  - An **Edit** button/icon that opens `AddProfileActivity` in "edit mode" (pre-filled with existing data, updates on save).
  - A **Delete** button/icon that removes the profile (show a confirmation `AlertDialog` before deleting).
- Tapping a row (not on edit/delete) opens `SingleProfileActivity` for that profile.
- Display the **total number of profiles** at the top of the screen (e.g. "Total Profiles: 5"), updating live via `LiveData` whenever the list changes.
- Include a Floating Action Button (FAB) or menu button to navigate to `AddProfileActivity` to add a new profile.

**c) `AddProfileActivity`**
- Form with input fields for: **Name, Email, Date of Birth (use a DatePickerDialog), District (use a Spinner or AutoCompleteTextView), Mobile**.
- Validate all fields are non-empty and email/mobile formats are valid before saving.
- Support two modes:
  - **Add mode**: inserts a new `Profile` into Room via the ViewModel/Repository.
  - **Edit mode**: receives an existing profile's `id` via Intent extras, pre-fills the form, and calls `update` instead of `insert` on save.
- On successful save, finish the activity and return to `ProfileListActivity`.

**d) `SingleProfileActivity`**
- Receives a profile `id` via Intent extras.
- Observes that single profile via `LiveData` from the ViewModel and displays all fields (name, email, date of birth, district, mobile) in a clean, read-only layout.
- Include an **Edit** button here too, which opens `AddProfileActivity` in edit mode for this profile.

### 6. Permissions
- Room/SQLite uses internal app storage, which does **not** require runtime storage permissions on modern Android. Still add a comment in the manifest explaining this, and do NOT request unnecessary `WRITE_EXTERNAL_STORAGE` permissions (this would be flagged as bad practice in review) — only add permissions actually required by the app's stated features.

### 7. Deliverable / Acceptance Criteria
- Full CRUD works end-to-end: Add → List → View single → Edit → Delete, all persisted correctly to the Room/SQLite database and surviving app restarts.
- All screens use Data Binding where the spec calls for reactive UI updates (profile count, list refresh after add/edit/delete).
- No crashes on rotation (ViewModel should survive configuration changes).
- Include a confirmation dialog before delete, and input validation with error messages (`TextInputLayout` error state) on the add/edit form.
- Clean, commented code; no unused imports or hardcoded IDs where a resource/string should be used.

### 8. Final Steps
- Run and manually verify: add 2–3 profiles, edit one, delete one, confirm the "Total Profiles" counter updates correctly at every step.
- Clean the project and zip it (excluding `.gradle`/`build` folders) for submission, following the `ID_FullName` folder naming convention from the job sheet.

---

### Notes for you (the developer) before running this prompt
- The job sheet explicitly says "SQLite database" and "Use MVVM" with ViewModel/LiveData/DataBinding — Room is the standard, examiner-accepted way to satisfy both "SQLite" and "Jetpack Components" requirements; mention this to the agent if it suggests raw `SQLiteOpenHelper` instead, since Room is cleaner and matches the required architecture components.
- If your course specifically forbids Room and wants raw `SQLiteOpenHelper`, tell the agent explicitly: "Use raw SQLiteOpenHelper instead of Room, but still wrap it behind a Repository and expose data via LiveData."
