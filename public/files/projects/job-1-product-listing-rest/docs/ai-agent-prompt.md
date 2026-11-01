# Prompt for Android Studio AI Agent (Gemini) — Job 01: Product Listing App (REST API)

Copy-paste the prompt block below into the Gemini / Android Studio AI agent chat panel. Replace `<YourRegNo>` and `<YourFullName>` before sending.

---

## PROMPT

You are an expert senior Android developer. Build a complete, runnable **Kotlin** Android Studio project that satisfies the requirements below. Do not use Java. Follow Android best practices (MVVM + Repository pattern), write clean, readable code, and make sure the app builds and runs on an emulator (API 21+) without errors.

### 1. Project Setup
- Create a new Android Studio project named **`<YourRegNo>_<YourFullName>_REST01`**.
- Language: Kotlin. Minimum SDK: API 21. Target/Compile SDK: latest stable.
- Use **View Binding** (enable in `build.gradle`).
- Package name: `com.<yourname>.rest01` (lowercase, no spaces).

### 2. Architecture
- Implement **MVVM**: `data` (model + remote), `repository`, `viewmodel`, `ui` (activity/adapter) packages.
- Use a `Repository` class to abstract the API calls from the ViewModel.
- Use `ViewModel` + `LiveData` to expose product data and loading/error states to the UI.

### 3. Dependencies (add to `build.gradle` — app module)
- **Retrofit2** + **Gson converter** (REST client library) for networking.
- **Glide** (image loading & caching library) for loading product images into ImageViews.
- **RecyclerView** and **CardView** (androidx).
- **Coroutines** (`kotlinx-coroutines-android`) for async networking, wrapped with Retrofit's `suspend` functions.
- **Lifecycle ViewModel/LiveData** (`androidx.lifecycle:lifecycle-viewmodel-ktx`, `lifecycle-livedata-ktx`).

### 4. API Integration
- Consume this REST API: `https://api.escuelajs.co/api/v1/products` (fallback: `https://fakeapi.platzi.com/en/rest/products`).
- Create a Retrofit `ApiService` interface with a `GET` endpoint returning `List<Product>`.
- Create a `Product` Kotlin **data class** matching the JSON response fields: `id`, `title`, `price`, `description`, `category`, `images` (List<String>).
- Parse the JSON response automatically via Gson into the `Product` data class — do not manually parse JSON strings.

### 5. UI Requirements — `ProductActivity`
- `ProductActivity` is the main/launcher screen.
- Layout: a `Toolbar` with app title, a `RecyclerView` (vertical list) below it.
- Show a `ProgressBar` while data is loading.
- Show an empty-state / error `TextView` + a **Retry `Button`** when the API call fails or there is no data.
- Each RecyclerView row (separate XML layout, e.g. `item_product.xml`) must show:
  - Product image (loaded via Glide, use `centerCrop`, placeholder + error drawable).
  - Product title (max 2 lines, ellipsize).
  - Product price (formatted, e.g. `$19.99`).
- Use `DiffUtil` in the `RecyclerView.Adapter` for efficient list updates.
- (Optional stretch goal) Tapping a row opens a simple `ProductDetailActivity` showing full description and larger image — implement only if time allows, keep it simple.

### 6. Internet Connectivity Handling
- Before calling the API, check network connectivity using `ConnectivityManager`.
- If there is **no internet connection**: do not attempt the API call; immediately show the error state with the message "No internet connection" and the Retry button.
- If the API call fails for any other reason (timeout, server error, malformed JSON): catch the exception, show a generic error message ("Something went wrong. Please try again.") and the Retry button.
- Clicking **Retry** re-checks connectivity and re-triggers the API call through the ViewModel.

### 7. Permissions
- Add `<uses-permission android:name="android.permission.INTERNET" />` to `AndroidManifest.xml`.
- Add `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />` for connectivity checks.

### 8. Deliverable / Acceptance Criteria
- App launches directly into `ProductActivity`.
- Products load from the live API and display image, title, and price correctly.
- Turning off the emulator's internet (or using airplane mode) and relaunching shows the error + Retry UI, and tapping Retry successfully reloads data once internet is restored.
- No hardcoded API responses — must be a real network call.
- Code compiles without warnings, no deprecated APIs unless unavoidable.
- Add short KDoc comments on `ApiService`, `Repository`, and `ViewModel` classes explaining their responsibility.

### 9. Final Steps
- After building, run the app on an emulator or real device to confirm it works end-to-end.
- Clean the project (`Build > Clean Project`) before final export.
- Zip the whole project folder (excluding `.gradle` and `build` directories) for submission.

---

### Notes for you (the developer) before running this prompt
- If Gemini asks for the exact wireframe layout of `ProductActivity`, tell it: "simple vertical list, one product per row, image on the left, title and price stacked on the right — standard Material list design."
- If Glide/Retrofit dependency versions cause Gradle sync errors, ask the agent to use the **latest stable versions** compatible with the project's Kotlin/Gradle version.
- Remember to swap in your own `<YourRegNo>_<YourFullName>` for the project name and folder naming convention required by the job sheet.
