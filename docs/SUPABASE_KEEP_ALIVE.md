# Tower Analytics — active database keep-alive

Project: **Tower Analytics**, `tzgbsiwchzrkvntcnikx`, Frankfurt. Berater-CRM is excluded by an exact project URL guard and is never queried by this workflow.

`.github/workflows/cloud-health.yml` runs on default branch `main` at **00:17 and 12:17 UTC**, supports **Run workflow**, and tests itself when its implementation changes on main. This operations-only activation does not merge Guild PR #6 or change any app files. The existing Guild foundation RPC is reused; no new database objects are required.

Each invocation calls the real PostgREST `tower_public_health` database RPC. It reads the fixed non-private health row under RLS and requires `{database:true, public:true, schema:"guild-v1"}`. An HTTP-success homepage is insufficient. The existing RPC is stable, SECURITY INVOKER, with an empty search path. No private player tables, user sessions or write operations are needed.

The script contains the same intentionally public publishable URL/key already used by the Guild configuration. It never uses a service-role/secret key. No repository secrets, paid services, SMTP account or manual configuration are required. Future secret credentials must only be stored as GitHub Actions Secrets; never put them in the browser/repository. Redirects are rejected; network requests time out after20 seconds. Transient network/429/5xx errors retry at most twice. Authorization and invalid payloads fail visibly. Logs do not print credentials or remote error bodies.

Verification:

```sh
node --test tests/ops/cloud-health.test.cjs
node scripts/cloud-health.cjs
```

The tests cover real endpoint selection, exact project isolation, public-key enforcement, retries, error sanitization and invalid responses. The live workflow separately performs the actual hosted API/database read; mocks alone do not constitute its integration check.

## Monitoring and limitations

Open **Actions → Tower database health** for logs, result and manual reruns. Enable email/web failure notifications under your GitHub **Settings → Notifications → Actions**. Standard GitHub notifications follow your account settings; no custom email integration is claimed configured.

This is **best effort**, not a guarantee against Free-project pausing. Supabase currently assesses low user database activity over7 days; occasional API activity can help, but a paid plan is the documented way to avoid automatic inactivity pausing altogether. No paid upgrade was made. If Supabase pauses the project, use **Resume project** in the Tower project's dashboard; this workflow does not auto-resume it.

GitHub scheduled jobs can be delayed or dropped under load. Public repositories may have schedules automatically disabled after60 days without repository activity; re-enable the workflow in Actions if necessary. No dummy database writes or automatic empty commits are used.

Official rules checked2026-10-29:

- https://supabase.com/docs/guides/platform/free-project-pausing
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
