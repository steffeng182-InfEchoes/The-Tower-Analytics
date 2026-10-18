# Account Intelligence — Alpha 0.15.0

**Aktueller Nachtrag:** [Import-Finalisierung und Android-Abnahme](IMPORT_FINALIZATION.md). Die folgenden Alpha-0.14-Grundlagen werden durch diesen Nachtrag ergänzt und dort korrigiert, insbesondere History zuerst, Ein-Klick-Import und reale Account-OCR.

**Status: first milestone implemented and technically ready for acceptance testing.** The eight technical acceptance paths are covered below. This is an Alpha release, not a claim that every future game version or screenshot layout is recognised without error.

## Acceptance evidence

| Definition of Done | Delivered behavior and verification |
| --- | --- |
| 1. Realistic Battle Reports without required metadata | English report labels with German/English quantities, explicit English/German/day-first/ISO dates, Tier/Wave, exact integer storage, real/game durations, calculated rates, start/end and day/night shares. Explicit Tier-plus marks a tournament; absent mode evidence stays unknown. Invalid dates warn rather than invent a time. |
| 2. Historical actual dates | Browser-local calendar comparisons, manual time precedence and date-only precision. Import timestamps never substitute for play dates. Unknown days sort last. The chart uses weighted daily points within one comparable group, so unknown intra-day order is not drawn as exact chronology. |
| 3. 30+ batch and reliable duplicate handling | Up to 100 reports. 30-report import/reimport and independent profiles tested. Text normalization and dated semantic identity are shared by single/batch/restore paths. Duplicate checks run inside the write transaction, preventing concurrent import races. |
| 4. History screenshots and safe report reconciliation | Real Tesseract, original/processed image passes, bounded canvas size, source-row geometry, German/English quantities, slash-date candidates, compact suffixes, Tier-plus + trophy-shape and purple-badge proposals. Actual public image fixtures and the user's own private image were recognised locally; the private image produced six full rows and the expected tournament/Dissonance proposals without tagging the normal rows. Public real Worker/WASM OCR is part of CI. Matching requires Tier/Wave and two extra supporting fields; ties, conflicts, multiple columns and duplicate assignments stay unresolved. Every applied row must be explicitly reviewed. |
| 5. Traceable Account history | Labs, Workshop, UWs, modules, cards, relics and additional systems. Searchable catalogue, free entries, optional rarity/slot/sub-effect metadata, explicit Level/observed/estimate distinction, source/calculation field, append-only edits and optional effective dates. OCR suggestions and batch text can be corrected and saved selectively. The timeline and existing backup formats retain provenance. |
| 6. First data-driven progression | Weighted rates segmented by Tier, strategy, mode and period; tournaments excluded. Day/night comparison needs two runs per side; trends need four dated runs over more than one calendar day. Account recordings in the same interval are visible, and run details only show confirmed account values documented by that exact time. Isolated lab-factor checks disclose their scope and source; no unsupported purchase ranking or causal claim. |
| 7. Automated critical paths | Regression tests, DOM interactions, real Chromium integration, actual Node/WASM OCR plus production browser canvas processing, and actual browser Worker/WASM recognition. These run in GitHub Actions. |
| 8. Existing data accessible | DB name, version 2, stores and keys unchanged. No startup backfill or destructive migration. Version-1 upgrade retention, no-write legacy adaptation, atomic rollback, global ID collision protection and legacy restore behavior are tested. |

Technical test readiness is distinct from the owner's final acceptance on the physical Samsung device. No development tool has read or migrated the production phone's IndexedDB.

## What is considered evidence

- A copied report remains the source of its numeric results. History reconciliation adds provenance/date/mode context; it never overwrites original Coins, Cells, duration, notes or report text with OCR values.
- A History match needs Tier/Wave plus two supported extra fields from date/Coins/Cells. Reported Coins/h is used when available; re-dividing a coarsely rounded Coins total is not used to reject a more precise reported rate.
- Ambiguous slash dates retain both calendar possibilities until an existing report or explicit correction resolves them. An unresolved date is never converted to an exact midnight timestamp.
- A possible `8`→`B` compact-suffix repair is shown as an OCR resolution against independent report features. It does not rewrite the report and is excluded from the “mark uncorrected safe matches” shortcut. Such rows still need individual review.
- Tier-plus and a matching gold cup profile propose Tournament. A purple badge between Tier and Wave proposes Dissonance. They are image proposals until the selected mode and row are confirmed in the review UI. Other skins or purple UI elsewhere are not mode evidence.
- Account OCR proposes confirmed levels only for explicit `Lv`, `Level` or `Stufe` labels. Bare effects remain observed values; a visible relic name does not establish ownership. The user can correct every proposed value and evidence type before checking it.
- Knowledge is a **community reference**, not an official patch guarantee. Every catalogue record identifies a source file at an immutable TheTowerSDK revision. Maxima, card effects, relic bonuses and lab unlock metadata are traceable. The three exposed simple lab factors are isolated factors only, not full-account output models. Workshop factors are never inverted into levels.

## Scope boundaries and remaining limits

1. Recognition was checked against two public game screenshots and one private user screenshot. Different languages, fonts, UI changes, crops, severe compression or unfamiliar icon layouts may remain unresolved. This is why row corrections and explicit selection are part of the import flow, rather than an optional safety screen after automatic writes.
2. Same-line multi-column cards stay unresolved. Partial rows without a header are ignored. A History row without a matching report is not turned into a fabricated full Battle Report or guessed real duration.
3. Initial production OCR use downloads the pinned Tesseract library/engine/language assets from CDNs. A failed download shows a recoverable error; direct OCR-text input and normal report/account entry remain available. Pictures are processed locally and not uploaded or stored in IndexedDB. The OCR tests serve those same assets locally for deterministic verification.
4. Night means 22:00–06:00 in the browser timezone. It does not establish AFK play. Game timestamps without an offset do not establish a historical timezone when the device travels. Unknown strategy or mode groups may contain hidden variation.
5. ROI-ranked purchase advice, a full simulator, cloud accounts/guild sync, automatic star/rarity inference and save-file decoding are outside the first milestone. Additional free structured fields remain available where the catalogue does not cover a system. No guessed game value fills a missing field.
6. Run and Account backups remain separate and backward compatible. Run restore targets the matching active profile. New restores cannot overwrite another profile through a global record-ID collision. Imports and History context writes use atomic transactions and current-data revalidation.

## Phone acceptance checks — whenever convenient

1. Open the existing Pages URL in the same browser/profile. Alpha 0.15.0 is also displayed in Diagnose when the short viewport hides the header badge. Existing Runs and Account records should remain present; export both backups before a broad acceptance session. Do not clear site data.
2. Import one old dated report and then a spacing/decimal-separator variant. Check its actual position and the duplicate message. Paste a 30-report batch, reload, and inspect counts and dates.
3. Upload the known History screenshot. Inspect Tier 5+ / Wave 360 and the purple-badge row; correct any uncertain fields, check the relevant rows and save. Check that existing report results and notes remain unchanged. A conflicting row must stay unapproved.
4. Use the Account shortcuts to capture a screenshot or enter values. Record and edit a level; both timeline entries should remain. An observed effect and an estimate must not increase the confirmed-level count. Try a module/card/UW/relic entry and its source.
5. Open the Account Intelligence analysis details after sufficient reports are available. Inspect comparable groups, date ranges, day/night rates, account context and the scope of each upgrade check. Empty states should explain the missing evidence.
6. In 50/50 split-screen, test the bottom navigation, corrected History fields, Account shortcuts and collapsible analysis cards. Page-wide horizontal scrolling should not be necessary.

## Source provenance

The reference catalogue is derived from `TmRxJD/TheTowerSDK` at commit `6a6d3bc9101d68ad65b355122c6fe66af0a4610f`, inspected on 2026-10-17. The rebuild script refuses other revisions until the pin is explicitly reviewed. Attribution and MIT terms are in `THIRD_PARTY_LICENSES.md`. Public image provenance is in `tests/fixtures/SOURCES.md`; no private user image or actual account backup is committed.
