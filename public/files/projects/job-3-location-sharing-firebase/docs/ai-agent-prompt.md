# Prompt for Android Studio AI Agent (Gemini) — Job 03: Location Sharing Application (Firebase + Google Maps)

Copy-paste the prompt block below into the Gemini / Android Studio AI agent chat panel.

> **Note:** The job sheet photo you have only shows steps 15–24 of the specification (the AppUser/Firestore/FriendList/Map/Logout part). Steps 1–14 (which almost certainly cover Firebase Authentication login/registration and requesting location permission) were not visible in the photos. The prompt below fills in those earlier steps with the standard, examiner-expected implementation. **If your actual spec sheet for steps 1–14 says something different, tell the agent that explicitly before it starts.**

---

## PROMPT

You are an expert senior Android developer. Build a complete, runnable **Kotlin** Android Studio project named **`LocationSharingApp`** that satisfies the requirements below. Do not use Java. Make sure the app builds and runs on an emulator with Google Play Services (API 21+) without errors.

### 1. Project Setup
- Create a new Android Studio project, name it **`<YourRegNo>_<YourFullName>_LocationSharing`**.
- Language: Kotlin. Minimum SDK: API 21.
- Package name: `com.<yourname>.locationsharing`.
- Connect the project to **Firebase** (Authentication + Cloud Firestore) using the Firebase Assistant / `google-services.json`.
- Enable **Google Maps SDK for Android** — I will provide a Maps API key; add the placeholder `<MAPS_API_KEY>` in `AndroidManifest.xml` for now.

### 2. Dependencies
- `com.google.firebase:firebase-auth-ktx`
- `com.google.firebase:firebase-firestore-ktx`
- `com.google.android.gms:play-services-maps`
- `com.google.android.gms:play-services-location` (for `FusedLocationProviderClient`)
- `androidx.recyclerview:recyclerview`
- Coroutines for async Firebase calls where useful.

### 3. Data Model
Create a Kotlin **data class** exactly as specified:
```kotlin
data class AppUser(
    val userId: String = "",
    val userEmail: String = "",
    val displayName: String? = null,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)
```
(Include a no-arg-default constructor style as shown, so Firestore can deserialize documents automatically.)

### 4. Screens & Flow

**a) `LoginActivity`** (launcher activity)
- Email + password fields, "Login" and "Register" (or a toggle) using **Firebase Authentication**.
- On successful login/registration: request **location permission** (`ACCESS_FINE_LOCATION`) if not already granted, get the current location via `FusedLocationProviderClient`, then create an `AppUser` object with `userId` (Firebase Auth UID), `userEmail`, `displayName = null`, and the retrieved `latitude`/`longitude`.
- Save this `AppUser` to Cloud Firestore under the **`AppUsers`** collection (document ID = `userId`).
- After saving, navigate to `FriendListActivity`.

**b) `FriendListActivity`**
- Query Firestore's `AppUsers` collection and display **all users** in a `RecyclerView`.
- Each row shows:
  - The user's **display name** if it is not null.
  - If `displayName` is null, show a default placeholder text (e.g. **"No name set"**).
  - The user's **email address** below/beside the name.
- Add a **Floating Action Button (FAB)** that opens a floating **options menu / popup menu** with exactly three items:
  1. **My Profile**
  2. **Show Users on Map**
  3. **Logout**

**c) "My Profile" (`MyProfileActivity`)**
- Reached from the FAB menu's "My Profile" item.
- Shows the currently logged-in user's own `AppUser` info (email, display name if set, location).
- Includes a **button to update the display name** (since it starts out `null`): tapping it shows an input dialog or navigates to an edit screen, then updates the `displayName` field on the corresponding Firestore document for that `userId`.
- After updating, the change should be reflected the next time `FriendListActivity`'s list is refreshed.

**d) "Show Users on Map" (`UsersMapActivity`)**
- Reached from the FAB menu's "Show Users on Map" item.
- Loads a `SupportMapFragment` (Google Maps).
- Fetches all `AppUser` documents from Firestore and adds a **Marker** on the map for each user at their `latitude`/`longitude`.
- Clicking a marker shows the corresponding **user's name** (use the marker's title, falling back to email if `displayName` is null).
- Zoom/center the camera to fit all markers reasonably (e.g. using `LatLngBounds.Builder`).

**e) Logout**
- Selecting "Logout" from the FAB menu: sign out via `FirebaseAuth.getInstance().signOut()` and navigate back to `LoginActivity`, clearing the back stack (`Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK`).

### 5. Permissions
- `<uses-permission android:name="android.permission.INTERNET" />`
- `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`
- `<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />`
- Request `ACCESS_FINE_LOCATION` at **runtime** (not just in the manifest) before fetching location, and handle the case where the user denies permission (show a rationale message and disable location-dependent features gracefully rather than crashing).

### 6. Deliverable / Acceptance Criteria
- A user can register/log in, and their location + email get saved as an `AppUser` document in Firestore under `AppUsers`.
- `FriendListActivity` correctly lists all registered users, correctly falling back to placeholder text when `displayName` is null.
- The FAB menu shows exactly the three required items and each navigates correctly.
- Updating the display name in "My Profile" persists to Firestore and is visible afterward.
- The map screen shows a marker per user at the correct coordinates, and tapping a marker reveals the user's name.
- Logout correctly signs the user out and returns to the login screen with no way to go "back" into the app via the back button.
- Code is organized into logical packages (`ui`, `model`, `repository` or `data`), uses Kotlin idioms (data classes, coroutines/callbacks cleanly handled, no blocking calls on the main thread).

### 7. Final Steps
- Test on an emulator with Google Play Services and a signed-in Google account (needed for Maps to render).
- Test with at least 2 different registered accounts to confirm both appear correctly in the friend list and on the map.
- Clean the project and zip it (excluding `.gradle`/`build` folders and your real `google-services.json`/API keys if submitting publicly) for submission.

---

### Notes for you (the developer) before running this prompt
- You will need your own Firebase project (`google-services.json`) and a Google Maps API key — the agent cannot generate these for you; get them from the Firebase Console and Google Cloud Console first.
- If your actual spec sheet's steps 1–14 describe a different login flow (e.g. Google Sign-In instead of email/password, or a different initial screen), tell the agent that specific detail before it starts scaffolding the project, since it changes the `LoginActivity` implementation.
