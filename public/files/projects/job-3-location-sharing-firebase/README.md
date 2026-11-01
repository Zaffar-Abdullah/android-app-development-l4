# Job 3: Location Sharing App (Firebase + Google Maps)

Users register and log in, their live location is saved to Cloud Firestore, and everyone can be seen in a list and as markers on Google Maps.

| | |
|---|---|
| **Time in assessment** | 2 hours |
| **Language / UI** | Kotlin, XML layouts, ViewBinding |
| **Architecture** | MVVM: AppUser model → UserRepository → ViewModels (LiveData) → Activities |
| **Services** | Firebase Authentication (email/password), Cloud Firestore, Google Maps SDK, Fused Location Provider |
| **Related modules** | 5 API integration (Firebase), 6 Background service & deployment, 7 Project work |

## Features
- `AuthActivity`: sign up and log in with email and password
- Location permission request, then live location updates (about every 10 s) saved to Firestore
- `FriendListActivity`: all users in a RecyclerView with an options menu (**My Profile**, **Show users on Map**, **Logout**)
- `GoogleMapActivity`: a marker for every user. The title is the display name, the info window shows the phone number, and your own marker is green
- `MyProfileActivity`: update your display name and phone number

## ⚠️ Setup: this project needs your own keys
Two private values are intentionally **not** in this repository.

### 1. Firebase (`google-services.json`)
1. Create a project at <https://console.firebase.google.com>.
2. Add an **Android app** with the package name `com.example.locationsharingapp`.
3. Enable **Authentication ▸ Email/Password** and create a **Cloud Firestore** database.
4. Download `google-services.json` and place it in the `app/` folder. (`app/google-services.json.example` shows the expected shape.)

### 2. Google Maps API key
1. In Google Cloud Console enable **Maps SDK for Android** and create an API key.
2. **Restrict the key** to Android apps (package name + your SHA-1) and to the Maps SDK.
3. Add this line to `local.properties` (the file is git-ignored):
   ```properties
   MAPS_API_KEY=your_key_here
   ```
   `app/build.gradle.kts` injects it into the manifest as `${MAPS_API_KEY}`.

### 3. Firestore security rules (suggested)
Users live in the `AppUsers` collection. Everyone signed in can read; each user can only write their own document:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /AppUsers/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Project structure
```text
app/src/main/java/com/example/locationsharingapp/
├── model/AppUser.kt                 # userId, userEmail, displayName, phoneNumber, latitude, longitude
├── repository/UserRepository.kt     # Auth + Firestore operations
├── viewmodel/                       # Auth / FriendList / Map / Profile ViewModels
└── ui/                              # AuthActivity, FriendListActivity, GoogleMapActivity,
                                     # MyProfileActivity, UserAdapter
```

## Run it
1. Complete the setup above, open this folder in Android Studio and let Gradle sync.
2. Run on a device or an emulator **with Google Play services** and a location set.
3. Register two accounts (on two devices or one after another) to see multiple markers.

## Documents
- [Specification sheet](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md)
