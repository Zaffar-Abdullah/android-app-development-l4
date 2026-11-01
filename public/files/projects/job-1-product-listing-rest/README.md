# Job 1: Product Listing App (REST API)

An Android app that downloads a product list from a public REST API and shows it in a scrolling list with images, with proper loading, error and retry states.

| | |
|---|---|
| **Time in assessment** | 1 hour |
| **Language / UI** | Kotlin, XML layouts |
| **Libraries** | Retrofit 2 + Gson converter, Glide, RecyclerView, CardView |
| **API** | `https://api.escuelajs.co/api/v1/products` (fallback: `https://fakeapi.platzi.com/en/rest/products`) |
| **Related modules** | 1 Kotlin, 3 Android basics, 5 API integration |

## Features
- `ProductActivity` with a `RecyclerView` and a custom row layout (`item_product.xml`)
- Retrofit `ApiService` returns `List<Product>`, parsed automatically by Gson
- Glide loads and caches the product images
- Progress bar while loading; error panel with a **Retry** button when the request fails (for example no internet)
- `INTERNET` permission in the manifest

## Project structure
```text
app/src/main/java/com/example/zaffar_1227_rest01/
├── ProductActivity.kt      # screen, loading / error / content states, retry
├── ProductAdapter.kt       # RecyclerView adapter
├── api/
│   ├── ApiService.kt       # GET products
│   └── RetrofitInstance.kt # Retrofit singleton (base URL + Gson)
└── models/
    ├── Product.kt
    └── Category.kt
```

## Run it
1. Open this folder in Android Studio and let Gradle sync.
2. Run on an emulator or device that has internet access.
3. To test the error state: enable airplane mode, relaunch, then disable it and tap **Retry**.

## Documents
- [Specification sheet](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md): the prompt that describes the full job (MVVM, DiffUtil, connectivity check)

## Practice ideas
This solution keeps things simple with callbacks inside the Activity. Good exercises:
- Refactor to **MVVM** (`ViewModel` + `LiveData` + Repository) as the prompt describes.
- Check connectivity with `ConnectivityManager` before calling the API (needs `ACCESS_NETWORK_STATE`).
- Use `DiffUtil`/`ListAdapter` and add a product detail screen.
