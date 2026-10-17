# Account Intelligence — stable intermediate release 0.13.0

The complete milestone is **not finished**. This release hardens the existing import and local data workflows and adds a test foundation. It is suitable for the user checks below, subject to the stated OCR limitations.

## What changed

- Explicit English/German/day-first/ISO date parsing with invalid-calendar validation. Actual play dates sort ahead of unknown dates; import timestamps never substitute for play timestamps. Calendar comparisons use browser-local days, including runs near midnight. Manual timestamps take precedence.
- Run start = end minus real duration. Day/night shares use exact local hour boundaries (night 22:00–06:00), not a coarse 15-minute sampling offset. These shares do not establish AFK strategy. Travel/timezone changes remain a limitation: game timestamps do not carry an authoritative timezone.
- Batch import supports up to 100 reports. Deduplication is scoped to the active profile and also compares timestamp + Tier + Wave + real duration + Coins + Cells when timestamps are available. Text normalization handles whitespace; semantic comparison handles number-locale changes. Undated reports only use text identity because collapsing identical results could discard distinct real runs.
- Valid prepared batches and restored Run backups write in one IndexedDB transaction. A partial batch reports which chunks failed and retains the input while refreshing successfully imported results. Invalid restore files are rejected before writing any run.
- History matches require Tier/Wave plus two supported extra fields from date/Coins/Cells. Coins/h is checked as extra evidence, not sufficient on its own. Invalid metrics, conflicting fields, tied candidates, duplicate assignments and same-line multi-column layouts cannot be applied automatically. Compact metric tolerance follows the displayed last digit. Rows cannot borrow metrics from the following card.
- History confirmation records provenance and hints. A Tier-plus marker remains a tournament candidate, not a confirmed mode. Explicit Dissonance text remains a hint. Visual trophy/Dissonance-icon classification is not implemented. Existing exact timestamps, notes, original reports and confirmed modes remain intact.
- Account categories now include Ultimate Weapons, modules, cards, relics, bots, enhancements, guardian and other systems. Values are manual category/name/value records; comprehensive system-specific schemas and screenshot parsers are still missing.
- Confirmed values, observed effects and estimates remain distinct. Estimates require a source/calculation description and never count as confirmed levels. Account changes append to the same store; edits retain a link to the prior entry and validate documented limits. The full timeline is visible. Optional effective dates support historical documentation; run details show only confirmed entries documented by that run's exact time. No account values are projected backward from a later record.
- Progression separates Tier, manual strategy, detected mode and time period, excludes tournaments and unknown play dates, and requires at least four records over more than one calendar day. It remains descriptive, with no claim that an upgrade caused a change. No speculative upgrade purchase recommendations are added.
- Removed the automatic startup backfill. Legacy rows receive a read-only compatibility adapter. DB name/version and stores are unchanged. Fixed an existing `prompt` variable shadowing bug that broke date, profile and account edit dialogs.
- Verbose account analyses are collapsible for the split-screen workflow. Touch buttons have a minimum height of 44 pixels.

## Definition of Done assessment

| Requirement | Status |
| --- | --- |
| Realistic reports without metadata | Tested with representative English Battle Report fields and German/English numbers; broader player corpus remains useful |
| Historical actual dates and sorting | Automated core/DOM/Chromium coverage; unknown dates stay unknown |
| 30+ batch and duplicate protection | 30-report repeat import tested, per-profile isolation tested; limit 100 |
| History image processing and safe reconciliation | OCR text matching/save tested; real screenshot OCR accuracy still needs validation, multi-column layouts deliberately unresolved |
| Traceable account history | Append-only history, evidence types, effective timestamps, backup compatibility implemented; richer per-system models remain open |
| First progression analysis | Weighted measured rates, segmented descriptive trends and historical account lookup present; no causal/ROI model |
| Critical automated paths | Core tests, DOM interaction tests, and real Chromium integration suite added |
| Existing local data | v1→v2 preservation tested and v2 schema unchanged; real user's device data not accessible to development environment |

## Knowledge catalogue boundary

The inherited catalogue contains source URLs and prior claimed limits/check dates. Those sources have **not been reverified in this release**. The UI now makes that status explicit instead of presenting the catalogue as newly verified. Existing numeric validation remains; observed effect values and estimates bypass level-limit validation. A genuinely current, audited mechanics catalogue with dependencies and formulas is unfinished and blocks reliable automatic upgrade recommendations.

## Remaining risks and next development work

1. Validate Tesseract with real English/German game-History screenshots, including dark backgrounds, scaling and screenshot columns. Current OCR uses English recognition; OCR library/language assets load from third-party CDNs. No recognition-quality promise is made.
2. Add explicit visual evidence extraction for trophy and Dissonance symbols, with confidence thresholds and a row-level correction/confirmation flow. Currently the user must inspect the match list before confirming all safe assignments.
3. Reverify mechanics from authoritative current sources and record rule versions, dependencies and uncertainties. Expand account-specific structures and parsers before giving upgrade ROI advice.
4. Independently confirmed standard farming modes may be missing in old reports; unlabelled runs remain `unknown`. Unknown groups may contain hidden variation. Manual `Strategie / Modus` is available in Run History.
5. The production phone's real data has not been opened or migrated by development. Export existing Run and Account backups before a phone test, as with any local-only release. Concurrent imports in separate browser tabs are not serialised across a global uniqueness index; use one tab when importing.
6. Existing separate Run and Account backup formats are retained. Run restore remains limited to the active matching profile. No full unified cross-profile backup/import format is introduced.

## User checks on Samsung S24 Ultra

1. Open the existing Pages URL in the same browser/profile as before. Confirm Alpha 0.13.0 and that old Runs and Account records are still visible. Do not clear site data. Export both backup types.
2. Import one old dated report; it should appear at its actual date, not at the top. Import it again with spacing or number decimal separator changed; it should be skipped. Confirm the newest real date stays first.
3. Paste a 30-report text batch. Inspect the added/duplicate/invalid counts; reload and confirm the saved run count persists.
4. Upload a known History screenshot. Check every suggested Tier/Wave/date/Coins/Cells match against the image before saving. Ambiguous rows should remain unresolved. Tournament-plus and Dissonance hints must not silently confirm modes.
5. Record and edit one confirmed Account level. Both timeline entries should remain. Add one observed effect and one estimate with a source; neither should be counted as a confirmed level.
6. Inspect the app beneath The Tower in 50/50 split-screen: tabs, input controls, Run cards, and collapsible analyses should remain usable without page-wide horizontal scrolling.
