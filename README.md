# Tower Analytics · Alpha 0.13.0

Single-file, mobile-first analytics app for The Tower. Production entry point: `index.html`. Runtime data stays in the existing IndexedDB `tower-analytics-alpha`, version 2. No build step, login, Supabase, or cloud data upload is introduced.

## Development and verification

```sh
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

`npm test` runs parser, date, deduplication, History matching, restore/transaction, version-1 database upgrade and full DOM interaction regression tests. `npm run test:browser` runs real Chromium interactions at 320×360, 384×400 and 412×460. An existing Chromium executable can be supplied with `TOWER_CHROMIUM_EXECUTABLE`.

The browser suite deliberately stubs Tesseract output to test the file-input/matching/save path. It **does not validate recognition of real game screenshots**. No personal screenshots or production user records are included in tests.

See [milestone status and user checks](docs/ACCOUNT_INTELLIGENCE.md).
