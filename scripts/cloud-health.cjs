'use strict';
// Reuses the Guild foundation's read-only, RLS-protected database RPC.
// Publishable configuration is public by design; no account or server secret needed.
const PROJECT_URL = 'https://tzgbsiwchzrkvntcnikx.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_zuZiLd3vzAal0wQcTQ-iXg_fT5CvvtG';

async function health({
  url = process.env.TOWER_SUPABASE_URL || PROJECT_URL,
  key = process.env.TOWER_SUPABASE_PUBLISHABLE_KEY || PUBLISHABLE_KEY,
  fetcher = fetch,
  wait = ms => new Promise(resolve => setTimeout(resolve, ms)),
  onRetry = () => {},
} = {}) {
  const parsed = new URL(url);
  if (parsed.origin !== PROJECT_URL || parsed.pathname !== '/' || parsed.search ||
      parsed.hash || parsed.username || parsed.password) {
    throw Error('Only the separate Tower Analytics project is allowed.');
  }
  if (typeof key !== 'string' || !key.startsWith('sb_publishable_')) {
    throw Error('A Tower publishable key is required; server secrets are not accepted.');
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    let response;
    try {
      response = await fetcher(PROJECT_URL + '/rest/v1/rpc/tower_public_health', {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: '{}',
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      if (attempt === 3) throw Error('Tower database connection failed after 3 attempts.');
      onRetry('Connection unavailable; retry ' + attempt + '/2.');
      await wait(2000);
      continue;
    }
    if (!response.ok) {
      if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
        onRetry('HTTP ' + response.status + '; retry ' + attempt + '/2.');
        await wait(2000);
        continue;
      }
      throw Error('Tower database health failed (HTTP ' + response.status + ').');
    }
    let data;
    try { data = await response.json(); }
    catch { throw Error('Invalid Tower database health JSON.'); }
    if (!data || data.database !== true || data.public !== true || data.schema !== 'guild-v1') {
      throw Error('Unexpected Tower database health response.');
    }
    return { database: true, schema: data.schema, attempts: attempt };
  }
}

module.exports = { health };
if (require.main === module) {
  health({ onRetry: message => console.log(message) })
    .then(result => console.log(new Date().toISOString() + ' Tower database reachable; ' +
      result.schema + ' verified; attempts=' + result.attempts + '.'))
    .catch(error => { console.error('::error::' + error.message); process.exitCode = 1; });
}
