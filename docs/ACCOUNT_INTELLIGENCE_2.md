# Account Intelligence 2.0 — acceptance log

Branch `feature/account-intelligence-2`, based on production main `769732b`. Guild PR #6 is not modified. No merge or production deployment.

## A — Labs: implemented and browser verified

Application commits `d4e746e`, `ce03a1a`, `cbdeb24d`. Successful complete CI: https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39830924684 . All 60 existing tests, six new core tests, original mobile regression, both real OCR suites and the new account browser flow passed.

The new Account panel actually uses Tesseract Worker/WASM, shows editable unchecked proposals, accepts explicit batch confirmation, appends account history atomically in the existing accountEntries store, recomputes bonuses and survives reload. The database name/version/stores remain unchanged. No source images are uploaded. Existing reports and manually recorded account values were compared unchanged in the browser test. Repeat confirmed observations do not create history duplicates. Backup/reimport preserves new fields and skips existing IDs.

Image evidence: three-row reconstructed dark game-style raster (Orb Speed Lv20/+2.00, Critical Factor Lv28/x1.84, Lab Speed Lv40/x1.80), corrected to Lv41/x1.82 through UI; another raster updates Lab Speed to42/x1.84. Real public Game Speed Lv7/Rush screenshot from the existing SOURCES.md is also recognized, with target7 and **unknown completed level**. No OCR text/output is mocked. Reconstructed images prove the multi-row pixel pipeline; they are not actual user account screenshots. More real multi-row layouts and physical Android use remain unverified.

Seven lab formulas are supported: Lab Speed, Attack Speed, Coins/Kill (1+.02L), Critical Factor and Health (1+.03L), Damage (1+.02L), Orbs Speed (+.1L). Source: pinned TheTowerSDK 6a6d3bc9101d68ad65b355122c6fe66af0a4610f, labs/catalog.data.ts; the source base/value fields were inspected. Orb Speed alias maps to catalog Orbs Speed. Unknown lab formulas including DW Health are shown as unknown; its level is still captured/stored. A conflicting confirmed visible effect is preserved and excluded from calculation. The engine never treats the partial lab factor as the full combat stat.

## B — Relics

Pending implementation after the successful Labs acceptance above.

## C — Other systems

Deferred until Labs/Relics are complete. Existing manual legacy records remain readable. Workshop level inversion is not implemented. No new incomplete subsystem importer is promoted.

## D/E — Shared engine and dashboard

The working Labs flow already renders confirmed counts, source-labelled partial bonuses, unknown factors, contradictions, append-only history and as-of account values for a selected actual report. Further Relic contributions follow in milestone B. No causal or account-strength claim.
