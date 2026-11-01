# Job 1: Product Listing

**Consume a REST API** &middot; assessment time: 1 hour

Download a product list from a public REST API and show it in a scrolling list with images, with loading, error and retry states.

## What the job asks for

- Project named Name_ID_REST01
- ProductActivity matching the wireframe
- REST client and image-loading library
- Parse the JSON and bind it to RecyclerView rows
- INTERNET permission
- Handle connectivity and implement Retry

API used: `https://api.escuelajs.co/api/v1/products`

## Implementations

This job is built 2 different ways. Every folder is a complete Android Studio project: open it, sync Gradle and run.

| Folder | Name | Approach | Kotlin files | Lines | Gradle |
|---|---|---|---|---|---|
| [`v1-packaged`](v1-packaged/) | Packaged | api/ and models/ packages, RetrofitInstance singleton, Glide in the adapter | 6 | 164 | Kotlin DSL |
| [`v2-compact`](v2-compact/) | Compact | Flat package, Retrofit built inside the Activity, Glide in the adapter | 4 | 157 | Kotlin DSL |

### Packaged: Separated network layer

The API client lives in its own package, away from the screen. The cleanest of the two to read and extend.

- ApiService and RetrofitInstance are separate from ProductActivity
- Product and Category models in their own package
- Progress bar, error panel and a working Retry button

Read this if you want to see how to keep networking out of the Activity.

### Compact: Assessment-ready, minimal files

Follows the specification naming exactly (name_id_rest01) with the fewest files. Built to be reproduced inside the one-hour limit.

- Four Kotlin files in one package
- Retrofit enqueue callback with success and failure paths
- Loading, error and Retry handled in a few small functions

Read this if you need the quickest path that still satisfies every line of the spec.

## How to run

1. Open one variant folder in Android Studio and let Gradle sync.
2. Run on an emulator or a device with internet access.
3. To see the error state, turn on airplane mode, relaunch, then turn it off and tap Retry.

## Documents

- [Specification (PDF)](docs/specification.pdf)
- [AI-agent prompt](docs/ai-agent-prompt.md)
- Specification pages as images: `docs/spec-pages/`

## Related modules

- Module 1: Kotlin Basics
- Module 3: Android Basics
- Module 5: API Integration
