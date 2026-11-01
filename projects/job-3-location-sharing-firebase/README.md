# Job 3: Location Sharing

**Firebase, Firestore and Maps** &middot; assessment time: 2 hours

Users register and log in, their location is saved to Cloud Firestore, and everyone appears in a list and as markers on Google Maps.

## What the job asks for

- Email and password authentication
- Location permission and current location
- AppUser stored in Cloud Firestore
- Friend list with options menu
- Google Map with a marker for every user
- My Profile and Logout

## Implementations

This job is built 4 different ways. Every folder is a complete Android Studio project: open it, sync Gradle and run.

| Folder | Name | Approach | Kotlin files | Lines | Gradle |
|---|---|---|---|---|---|
| [`v1-mvvm-packages`](v1-mvvm-packages/) | MVVM packages | model / repository / viewmodel / ui, ViewBinding, Firestore snapshot listener | 11 | 579 | Kotlin DSL |
| [`v2-flat`](v2-flat/) | Flat | Single package, ViewBinding, Separate RegisterActivity | 10 | 451 | Kotlin DSL |
| [`v3-view-layer`](v3-view-layer/) | View layer | model / repository / view / viewmodel, Firestore snapshot listener, DataBinding enabled | 13 | 604 | Kotlin DSL |
| [`v4-styled`](v4-styled/) | Styled | data / ui / util packages, Kotlin coroutines, Resource sealed class | 13 | 878 | Groovy |

### MVVM packages: Model, repository, viewmodel, ui

A classic MVVM layout with one package per responsibility and a real-time snapshot listener for the friend list.

- UserRepository wraps all Auth and Firestore calls
- Four ViewModels: auth, friend list, map, profile
- Location updates saved to Firestore

Read this if you want the textbook MVVM structure.

### Flat: Everything in one package

The simplest structure to type under time pressure. Registration is a separate screen, and the Firestore rules are included.

- Auth, register, friend list, map and profile activities side by side
- Requests location permission, then saves the user
- firestore.rules allows signed-in users only

Read this if you are racing the clock and want the fewest moving parts.

### View layer: model, repository, view, viewmodel

MVVM with an explicit view package, a launcher MainActivity and a live Firestore listener behind the friend list.

- MainActivity routes to AuthActivity
- Map marker title is the email, snippet is the display name
- Latest Android Studio template and Gradle version catalog

Read this if you prefer naming the UI layer view and want a live-updating list.

### Styled: Polished UI with coroutines

The most complete build: a styled interface, coroutine-based location lookup and a Resource wrapper for loading, success and error states.

- LocationHelper exposes suspend functions for the current and last known location
- Resource.Loading, Success and Error drive the screens
- Custom drawables for gradient backgrounds, buttons, chips and input fields

Read this if you want a presentation-quality UI and modern async patterns.

## Setup before you run it

This job needs two private values that are intentionally not in the repository: your own google-services.json in the app folder (copy google-services.json.example as a guide) and a line MAPS_API_KEY=your_key in local.properties. Both are git-ignored.

1. Create a Firebase project and add an Android app with the package name `com.example.locationsharingapp`.
2. Enable Email/Password sign-in and create a Cloud Firestore database.
3. Download `google-services.json` into the `app/` folder of the variant you open. `app/google-services.json.example` shows the shape.
4. Create a Google Maps API key (Maps SDK for Android), restrict it to your app, and add this line to `local.properties`:
   ```properties
   MAPS_API_KEY=your_key_here
   ```
5. Firestore rules: v2 ships a `firestore.rules` file. A tighter alternative that works with the other variants (collection `AppUsers`):
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

## How to run

1. Complete the setup below (your own Firebase config and Maps key).
2. Open one variant folder in Android Studio and let Gradle sync.
3. Run on a device or an emulator with Google Play services.
4. Register two accounts to see more than one marker.

## Documents

- [Specification (PDF)](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md)
- Specification pages as images: `docs/spec-pages/`

## Related modules

- Module 5: API Integration
- Module 6: Services and Deployment
- Module 7: Project Work
