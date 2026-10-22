# WORK 05 – Guild Edition: implemented, hosted backend tested

The code is on `feature/guild-supabase-foundation`, PR #6. Main / existing GitHub Pages Alpha remain unchanged. The latest source and exact Checks are linked from the PR. `tower-guild-beta` is the static release artifact produced by the successful Critical data paths workflow. `node scripts/build-beta.cjs` reproduces `dist/`; serve that directory with any HTTPS static host. Only app HTML/JS are included, never Edge administration code or server credentials.

## Completed backend

- **Project:** Tower Analytics, `tzgbsiwchzrkvntcnikx`, Free, Frankfurt (`eu-central-1`), organization Steffen Giesen.
- **API:** `https://tzgbsiwchzrkvntcnikx.supabase.co`.
- **Public config:** `guild/config.js`, with the project's publishable key. No service key is in client code or the repository.
- **Migrations applied:** `20261022082239_guild_foundation.sql` and `20261022113139_public_health_status.sql`. The prepared `20261018_guild_foundation.sql` was retained and renamed to the actual version returned by Supabase's migration history; it was not duplicated. Local CLI tests apply the same source migrations.
- **RLS:** enabled on every table; all private tables use `auth.uid()` ownership in SELECT/INSERT/UPDATE/DELETE policies. UPDATE uses both USING and WITH CHECK. Private data is unavailable to anon. Profiles, full report JSON, account document extension points, revisioned updates and soft deletions are supported.
- **Security advisor:** no findings after both migrations. The initially unused owner/date index is retained for expected future queries.
- **Berater-CRM:** untouched and rejected by configuration/health safety guards.

## Implemented app behavior

Email signup and Magic Link requests are explicit. The app also accepts the one-time email code or the complete project-specific confirmation link directly in the app. Links from other projects and recovery/email-change links are rejected. Verification uses the real Supabase SDK/Auth API; code/link errors and email delivery/rate limits receive clear DE/EN messages. Sessions restore, refresh and sign out using the SDK. Cloud operations validate the current user. A direct email link may also return to the current document through PKCE when its URL is allowlisted.

Each authenticated UUID has its own IndexedDB database. The original `tower-analytics-alpha` remains at version 2 with its original stores. Logout clears rendered data and text before switching identity, uses an empty signed-out workspace and does not select old device data automatically. The original private Masterchat link stays intact and Guild links are separately scoped per account.

Sync is explicit and retryable. A canonical report hash prevents duplicates per user, while separate owners can store the same report. Three-way comparisons preserve conflicting local and remote versions in a private conflict export. Server revisions enforce optimistic concurrency. Web Locks coordinate tabs, and writes/deletions compare current local values in the same IndexedDB transaction before changing them. Unsupported browsers retain local functionality without unsafe sync. Conflicts require manual comparison; no automatic conflict resolution is claimed.

Legacy transfer requires selecting a profile, downloading/checking a full JSON backup and explicitly consenting. Copies use stable IDs, retries are insert-only, unchanged duplicate reports are reused, differing originals stop the transfer, and actual cloud payloads are verified. Original reports and account entries remain unchanged. Full backup restore validates references and IDs before one insert-only transaction; sync authorization/baseline metadata cannot be imported from backups.

DE/EN covers the Guild UI, navigation, primary import/validation, History/context controls and farming scope. Parser/game labels and original input remain unchanged. Additional legacy diagnostics are not fully translated. Experimental Account Intelligence is hidden in authenticated workspaces; existing local tools remain available. Tournament/Dissonance/unknown modes remain excluded from normal farming aggregates.

The service worker caches only the static app shell for offline restart, never Auth, API or CDN responses. Updates activate after existing app tabs close. Bump `CACHE` in `guild-worker.js` with a release/config change. A first visit still needs a connection. The client reinitializes after reconnect when cloud initialization was unavailable offline.

## Actual acceptance evidence

Hosted workflow run **39773168159**, commit **21d234e** passed:

- Two real independently authenticated users against the NEW HOSTED Supabase project.
- Own CRUD, forged user IDs, cross-account SELECT/INSERT/UPDATE/DELETE, owner reassignment, duplicate inserts, stale revisions, profile policies and protected health RPC.
- Real browser + real Supabase SDK + real Auth confirmation-link verification; no mocked cloud adapter in this workflow.
- Per-account imports, repeated synchronization, normal farming exclusion for Tournament, offline import and full restart, reconnect/sync, logout/account switch, same report in separate accounts, DE/EN and 320/384/412 px viewports.
- Restricted public database health RPC, using only the public publishable key.
- Test accounts and records were removed after acceptance.

The normal suite additionally covers 60 existing regression/DOM tests, 19 Guild unit tests, existing mobile browser flows, the separately marked mock-cloud Guild browser suite, and two real OCR suites. The mock browser suite covers legacy consent/backup migration, unchanged source reports/account entries, full backup restore, fresh-device pulls and conflict preservation. The local Supabase RLS workflow uses real Postgres/Auth/Data API on every run. The static beta artifact is in [Critical data paths run 39773173512](https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39773173512). Current results are in PR Checks; do not infer success for a later commit from an earlier run.

The hosted fixture service accepts only cryptographically verified GitHub OIDC from the owner's exact repository, branch, workflow and approved push/manual event. Its admin operations are restricted to synthetic per-run test accounts, never ordinary members. No service key leaves the Edge runtime. It has a hard expiry and was disabled after final acceptance (HTTP 410; JWT gateway enabled; no admin code in the active function). The workflow is now manual-only to avoid running a disabled fixture service on every push. For a future hosted run, an authorized maintainer can temporarily deploy the reviewed `fixture-template.ts` with a renewed expiry, run the workflow on the feature branch, then disable it again. The normal CI continues running real local Supabase RLS tests.

Physical Android testing and real email INBOX DELIVERY were not performed. Auth tokens/links in hosted acceptance were generated through the official admin API for synthetic test users; that proves Auth verification, not SMTP delivery.

## Email delivery and hosting facts

Supabase's default SMTP service sends only to project-team addresses. External guild members require custom SMTP configured in the NEW Tower project's Auth settings. No unverified address is silently treated as registered, and email confirmation has not been disabled. The app clearly reports provider restrictions. Use a verified sender and configure email templates with the confirmation link and optionally `{{ .Token }}`. Never put SMTP credentials in this repository or browser.

[Official SMTP rules](https://supabase.com/docs/guides/auth/auth-smtp). Allowlist the exact eventual beta URL and `https://steffeng182-infechoes.github.io/The-Tower-Analytics/` in Auth URL Configuration for automatic PKCE callbacks. Direct in-app code/link confirmation is independent of a callback redirect.

The attempted separate Vercel beta project was rejected by the provider with **HTTP 403 (create project forbidden)**. No Vercel project or live URL is claimed. This session has no authenticated CLI alternative. The static artifact is complete and the hosted backend is configured; no main-branch merge or live Alpha deployment was performed.

## Database health

`cloud-health.yml` defines 00:17 and 12:17 UTC checks. The default path reads `tower_public_health`, an invoker RPC over a fixed non-private health-status row with read-only RLS. Anonymous callers cannot change that row or access private tables. This path needs no account/server secret: it loads the public URL/key from config. Optional dedicated health-account credentials, if used, belong only in GitHub Actions secrets. Auth failures, HTTP errors, unavailable DB and unexpected responses fail visibly.

Hosted acceptance actually ran the check successfully. Cron activation requires the workflow on the default branch; it is currently in the feature PR because main was deliberately preserved. GitHub Actions failure notifications can report failures. The workflow is Best Effort, not a guarantee against pausing. [Official Free project pausing rules](https://supabase.com/docs/guides/platform/free-project-pausing) describe low database activity over seven days; no paid upgrade was made.

## Android acceptance

1. On the CURRENT Alpha, save the run JSON and account JSON outside Chrome. Do not clear browser storage.
2. Open the hosted beta once available, select Deutsch and register/sign in. A new account must start empty. A different hostname cannot see Alpha's IndexedDB: explicitly restore trusted backups there; do not assume a zero count means the original data was deleted.
3. On the original origin, use the transfer assistant: select the correct original profile, save/check its full backup, consent, transfer and verify. Repeat without duplicates. Compare original reports, dates, notes and account values.
4. Import Normal/Tournament/Dissonance runs; verify only Normal enters farming totals. In airplane mode add a run and restart; reconnect and sync.
5. Logout and sign in as member B: no A data. Import the same report independently. Switch languages, restore a full backup, and inspect 50/50 split-screen.

**Release assessment:** code and hosted Auth/RLS/sync acceptance are implemented and passed. External-member email delivery and an externally accessible beta deployment are not claimed ready. Main and the real phone's current app/data were not modified.
