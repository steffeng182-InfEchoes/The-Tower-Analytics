const { test } = require('node:test');
const assert = require('node:assert/strict');
const { health } = require('../../scripts/cloud-health.cjs');
const ok = () => new Response(JSON.stringify({ database: true, schema: 'guild-v1', public: true }));

test('reads the actual DB RPC using only a public key and no login or writes', async () => {
  let calls = 0;
  const result = await health({ fetcher: async (url, options) => {
    calls++;
    assert.equal(url, 'https://tzgbsiwchzrkvntcnikx.supabase.co/rest/v1/rpc/tower_public_health');
    assert.equal(options.method, 'POST');
    assert.equal(options.body, '{}');
    assert.equal(options.redirect, 'error');
    assert.ok(options.headers.apikey.startsWith('sb_publishable_'));
    assert.equal(options.headers.Authorization, undefined);
    return ok();
  } });
  assert.deepEqual(result, { database: true, schema: 'guild-v1', attempts: 1 });
  assert.equal(calls, 1);
});

test('never contacts Berater-CRM or another project', async () => {
  let calls = 0;
  await assert.rejects(health({ url: 'https://oxaisrilkngxlwudruhn.supabase.co',
    fetcher: async () => { calls++; return ok(); } }), /Only the separate/);
  assert.equal(calls, 0);
});

test('rejects privileged keys before network access', async () => {
  await assert.rejects(health({ key: 'sb_secret_forbidden', fetcher: () => assert.fail() }), /publishable/);
});

test('authorization failures fail immediately without retries', async () => {
  let calls = 0;
  await assert.rejects(health({ fetcher: async () => { calls++; return new Response('', { status: 401 }); },
    wait: () => assert.fail('must not retry invalid authorization') }), /HTTP 401/);
  assert.equal(calls, 1);
});

test('temporary server failure retries and verifies the successful payload', async () => {
  let calls = 0, waits = 0;
  const result = await health({ fetcher: async () => ++calls === 1 ? new Response('', { status: 503 }) : ok(),
    wait: async () => { waits++; } });
  assert.equal(result.attempts, 2);
  assert.equal(waits, 1);
});

test('connection errors are bounded and do not log credential-bearing error details', async () => {
  let calls = 0;
  await assert.rejects(health({ fetcher: async () => { calls++; throw Error('sensitive error detail'); },
    wait: async () => {} }), error => error.message === 'Tower database connection failed after 3 attempts.');
  assert.equal(calls, 3);
});

test('HTTP success alone does not count as a successful database health check', async () => {
  for (const body of ['<html>OK</html>', 'null', '{}', '{"database":false,"public":true,"schema":"guild-v1"}']) {
    await assert.rejects(health({ fetcher: async () => new Response(body) }), /Invalid|Unexpected/);
  }
});
