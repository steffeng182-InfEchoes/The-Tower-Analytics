# Tower Analytics · Alpha 0.14.0

Single-file, mobile-first Account Intelligence for The Tower. `index.html` is the deployable app, with no build step. Existing data stays in IndexedDB `tower-analytics-alpha`, version 2. No Supabase, login or data upload is introduced.

- Battle Reports: actual dates, real durations, day/night shares, 100-report batch limit, per-profile transactional duplicate prevention, including concurrent imports.
- History images: real browser OCR, light-text preprocessing, two recognition passes, visual tournament/Dissonance proposals and editable per-row review. Ambiguity never approves itself.
- Account: six catalogued systems plus free structured entries for bots/guardian/enhancements/others; append-only history with evidence types, optional system metadata and effective dates.
- Knowledge: 711 version-pinned community reference records, source links, limits, bonuses and uncertainty labels. No inverse inference of Workshop levels.
- Analysis: weighted comparable farming groups, day/night comparisons, dated progression, historical account context and narrowly scoped upgrade checks.

## Verification

```sh
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:browser
npm run test:ocr
npm run test:ocr-browser
```

`test` covers parser/date/identity/history/transaction/database compatibility/analysis and DOM interactions. `test:browser` exercises imports, reload persistence, edits and review/save in Chromium at three split-screen sizes. It stubs OCR only to isolate UI behavior. **Both OCR suites separately use actual Tesseract recognition**, with locally served engine/language assets, public game screenshots, and production preprocessing/parsing. `test:ocr-browser` runs actual browser Web Workers and WASM, not a mocked recognizer.

An existing browser can be supplied with `TOWER_CHROMIUM_EXECUTABLE`. An optional private test image can be supplied with `TOWER_PRIVATE_HISTORY_IMAGE`; it is never published or uploaded. The user's private image was also checked locally for six complete rows and both special-mode proposals. It is excluded from this repository.

[Milestone acceptance, known limits and phone checks](docs/ACCOUNT_INTELLIGENCE.md) · [Reference data licence/provenance](docs/THIRD_PARTY_LICENSES.md) · [OCR fixture sources](tests/fixtures/SOURCES.md)
