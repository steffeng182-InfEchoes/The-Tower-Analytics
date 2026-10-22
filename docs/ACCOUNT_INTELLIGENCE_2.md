# Account Intelligence 2.0 — acceptance log

Branch `feature/account-intelligence-2`, based on production main `769732b`. Guild PR #6 is not modified. No merge or production deployment.

## A — Labs: implemented and browser verified

Application commits `d4e746e`, `ce03a1a`, `cbdeb24d`. Successful complete CI: https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39830924684 . All 60 existing tests, six new core tests, original mobile regression, both real OCR suites and the new account browser flow passed.

The new Account panel actually uses Tesseract Worker/WASM, shows editable unchecked proposals, accepts explicit batch confirmation, appends account history atomically in the existing accountEntries store, recomputes bonuses and survives reload. The database name/version/stores remain unchanged. No source images are uploaded. Existing reports and manually recorded account values were compared unchanged in the browser test. Repeat confirmed observations do not create history duplicates. Backup/reimport preserves new fields and skips existing IDs.

Image evidence: three-row reconstructed dark game-style raster (Orb Speed Lv20/+2.00, Critical Factor Lv28/x1.84, Lab Speed Lv40/x1.80), corrected to Lv41/x1.82 through UI; another raster updates Lab Speed to42/x1.84. Real public Game Speed Lv7/Rush screenshot from the existing SOURCES.md is also recognized, with target7 and **unknown completed level**. No OCR text/output is mocked. Reconstructed images prove the multi-row pixel pipeline; they are not actual user account screenshots. More real multi-row layouts and physical Android use remain unverified.

Seven lab formulas are supported: Lab Speed, Attack Speed, Coins/Kill (1+.02L), Critical Factor and Health (1+.03L), Damage (1+.02L), Orbs Speed (+.1L). Source: pinned TheTowerSDK 6a6d3bc9101d68ad65b355122c6fe66af0a4610f, labs/catalog.data.ts; the source base/value fields were inspected. Orb Speed alias maps to catalog Orbs Speed. Unknown lab formulas including DW Health are shown as unknown; its level is still captured/stored. A conflicting confirmed visible effect is preserved and excluded from calculation. The engine never treats the partial lab factor as the full combat stat.

## B — Relics

Implemented and complete pipeline passed on commit `1f838430`, CI run [39833283155](https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39833283155).

Real public multi-relic shop screenshot: Falling Apple, Haunted Mirror, 3 Body Solution and Crop Circle were recognized by actual Tesseract Worker/WASM. Ownership stayed unknown until explicitly selected. Separate reconstructed name lists and a symbol-only raster made from real Flux/Lumin/Pulse art passed batch ownership confirmation, persisted after reload, fed the same bonus engine, and did not double-count overlapping imports. Unknown visual cells, blank screenshots and damaged images did not change stored entries. Final Labs/Relics backup restored in a genuinely fresh browser database and survived reload.

Twelve pinned visual references are maintained in `account/relic-vision.js`; see THIRD_PARTY_LICENSES.md. Symbol screenshots need an explicitly selected, square-cell grid crop. Matching checks absolute similarity, best/runner-up error ratio and margin; every match remains an unchecked proposal. Unmatched symbols can be manually assigned or left unresolved. This does not claim automatic segmentation or recognition of the complete game relic collection. Different device scaling/backgrounds and physical Android symbol layouts still need broader real-image testing.

Relic percent aggregation supports Coins, Health, Damage, Orb Speed, Lab Speed, Attack Speed and Critical Factor. Same-type relic percentages sum before multiplication with the corresponding supported lab factor. Coins/Kill lab is displayed separately from the broad Coins relic factor, without claiming a full yield model. Orb Speed lab flat additions and relic percentages remain separate because the workshop base and other modifiers are unknown. Unsupported types (e.g. Wall Rebuild seconds, Super Critical Chance) remain explicitly unknown; the engine never applies a guessed generic formula to them. Sources are the pinned SDK data and the cited Relics stacking description. Nine core tests plus all existing browser/OCR/data tests passed.

## C — Other systems

Deferred until Labs/Relics are complete. Existing manual legacy records remain readable. Workshop level inversion is not implemented. No new incomplete subsystem importer is promoted.

## D/E — Shared engine and dashboard

The working Labs flow already renders confirmed counts, source-labelled partial bonuses, unknown factors, contradictions, append-only history and as-of account values for a selected actual report. Further Relic contributions follow in milestone B. No causal or account-strength claim.
