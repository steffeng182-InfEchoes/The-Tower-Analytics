# Guild Edition – implementation contract

**Branch:** `feature/guild-supabase-foundation` (not live). Existing GitHub Pages app and browser IndexedDB are unchanged.

## Scope
1. Create a **separate** Supabase project for Tower Analytics.
2. Apply and test `supabase/migrations/20261022082239_guild_foundation.sql`.
3. Supabase Auth using email magic link / OTP, with GitHub Pages redirect URLs allowlisted.
4. Each signed-in player sees only their own runs. RLS must be tested with TWO accounts (cross-user read, insert, update and delete all denied).
5. Keep the existing IndexedDB data readable offline. Migration requires explicit consent and JSON backup; upsert cloud runs by `(user_id, client_run_id)`, verify counts/hashes and support retry without duplication.
6. Implement UI translations through keyed strings; existing user default language German, new users can choose English. Keep game stat label mapping language-independent.
7. Stage behind explicit cloud opt-in; never deploy credentials or service role secrets to Pages. Only publishable/anon key in browser with enforced RLS.
8. Deploy a scheduled GitHub Actions health check against a **dedicated authenticated/RLS-restricted** lightweight SQL/read endpoint, secret values stored as GitHub Actions secrets. A 12-hour check is best effort, not a guarantee against Free-project pausing. Alert on repeated failures. Do not write dummy rows or expose service credentials.
9. Avoid shipping half-configured login to main; run smoke tests in staging and check existing phone runs preserved before merging.

## Acceptance
- Email sign-up/sign-in/out and persisted session (with deliberate security controls).
- Two players import same report independently; each sees only their own history.
- Neither player can query, change or delete the other's records.
- Backup/restore and repeat migration do not erase or duplicate local data.
- Language switches DE/EN; first owner's browser continues in DE.
- Keep-alive task health failures visible.
- Mobile 50/50 split-screen works.

