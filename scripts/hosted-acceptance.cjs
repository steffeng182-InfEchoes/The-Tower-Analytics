'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),http=require('node:http');
const {run:rls}=require('./test-rls.cjs');const {health}=require('./cloud-health.cjs');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('guild/config.js','utf8'),sandbox);const config=sandbox.window.TOWER_CLOUD_CONFIG;
if(config.url!=='https://tzgbsiwchzrkvntcnikx.supabase.co')throw Error('Wrong Tower project');
const mask=value=>{if(value)console.log('::add-mask::'+value);};
async function fixtures(body){
 const request=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);request.searchParams.set('audience','tower-analytics-hosted-acceptance');
 const response=await fetch(request,{headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('GitHub OIDC request failed: '+response.status);const {value}=await response.json();mask(value);
 const result=await fetch(config.url+'/functions/v1/guild-ci-acceptance',{method:'POST',headers:{Authorization:'Bearer '+value,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});if(!result.ok)throw Error('Hosted fixture '+body.action+' failed: HTTP '+result.status);const data=await result.json();for(const user of data.users||[])for(const key of ['password','action_link','email_otp'])mask(user[key]);for(const key of ['action_link','email_otp'])mask(data[key]);return data;
}
const report=(wave=2632,mode='Normal')=>`Battle Report\nBattle Date Oct 17, 2026 10:02 PM\nReal Time 4h 51m 17s\nTier 4\nWave ${wave}\nCoins Earned 274,31M\nCells Earned 1,43K\nRun Mode:\t${mode}`;
(async()=>{
 let users=[],browser,server;
 try{
  const anonymous=await fetch(config.url+'/functions/v1/guild-ci-acceptance',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"action":"provision"}'});assert.equal(anonymous.status,401,'Fixture administration must reject requests without GitHub identity');
  ({users}=await fixtures({action:'provision'}));assert.equal(users.length,2);
  process.env.TOWER_SUPABASE_URL=config.url;process.env.TOWER_SUPABASE_PUBLISHABLE_KEY=config.publishableKey;
  for(const [index,label] of ['A','B'].entries()){process.env['TOWER_TEST_'+label+'_EMAIL']=users[index].email;process.env['TOWER_TEST_'+label+'_PASSWORD']=users[index].password;}
  await rls();
  console.log('Hosted API: two independent authenticated accounts passed real RLS.');await health({url:config.url,key:config.publishableKey});console.log('Hosted public RLS health RPC passed.');
  server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname,file=name==='/'?'index.html':name.slice(1);if(file!=='index.html'&&file!=='guild-worker.js'&&!/^guild\/[a-z0-9]+\.js$/.test(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(file));});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:384,height:400}}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('tower-language',localStorage.getItem('tower-language')||'de'));
  const url='http://127.0.0.1:'+server.address().port;await page.goto(url);await page.waitForSelector('#view h1');const tab=name=>page.locator('#bottomnav [data-tab="'+name+'"]').click();
  async function login(user){const link=await fixtures({action:'link',id:user.id});await tab('account');await page.locator('#guild-email').fill(user.email);await page.locator('#guild-code').fill(link.action_link);await page.locator('#guild-verify').click();await page.waitForFunction(id=>window.TowerGuild?.owner===id&&!!document.querySelector('#view h1'),user.id);}
  async function importRun(text){await tab('import');await page.locator('#raw').fill(text);await page.locator('#analyze').click();await page.waitForFunction(()=>state.tab==='runs');}
  await login(users[0]);assert.equal(await page.evaluate(()=>state.runs.length),0);
  await importRun(report());await importRun(report(2633,'Tournament'));await page.evaluate(()=>TowerGuild.sync());await page.evaluate(()=>TowerGuild.sync());assert.equal(await page.evaluate(()=>state.runs.length),2);assert.equal(await page.evaluate(()=>aggregateRuns(state.runs).count),1);
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await importRun(report(2634));await page.reload();await page.waitForSelector('#view h1');assert.equal(await page.evaluate(()=>state.runs.length),3);
  await context.setOffline(false);await page.waitForFunction(()=>window.TowerGuild?.canSync&&!!document.querySelector('#view h1'));await page.evaluate(()=>TowerGuild.sync());
  await tab('account');await page.locator('#guild-logout').click();await page.waitForFunction(()=>window.TowerGuild?.scope==='guest'&&!!document.querySelector('#view h1'));assert.equal(await page.evaluate(()=>state.runs.length),0);
  await login(users[1]);assert.equal(await page.evaluate(()=>state.runs.length),0);await importRun(report());await page.evaluate(()=>TowerGuild.sync());await page.reload();await page.waitForSelector('#view h1');assert.equal(await page.evaluate(()=>state.runs.length),1);
  await tab('account');await page.locator('#guild-language').selectOption('en');await page.evaluate(()=>TowerGuild.sync());await page.reload();await page.waitForSelector('#view h1');assert.equal(await page.locator('html').getAttribute('lang'),'en');
  for(const width of [320,384,412]){await page.setViewportSize({width,height:400});for(const name of ['account','dashboard','import','runs']){await tab(name);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewport '+width);}}
  await tab('account');await page.locator('#guild-logout').click();await page.waitForFunction(()=>window.TowerGuild?.scope==='guest'&&!!document.querySelector('#view h1'));
  assert.deepEqual(errors,[]);console.log('PASS hosted beta: real Supabase SDK + Auth link verification, per-user report import, repeat sync, farming mode exclusion, offline restart/reconnect, logout/account switch, same report in separate accounts, DE/EN and mobile viewports.');
 }finally{await browser?.close();if(server)await new Promise(ok=>server.close(ok));if(users.length)await fixtures({action:'cleanup',ids:users.map(user=>user.id)});}
})().catch(error=>{console.error(error);process.exitCode=1;});
