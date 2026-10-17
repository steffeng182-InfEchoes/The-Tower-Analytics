// Real Chromium integration checks; OCR text is stubbed deliberately, image recognition is not claimed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const html=fs.readFileSync('index.html');
const report=(day=17,wave=2632)=>`Battle Report\nBattle Date Oct ${day}, 2026 10:02 PM\nReal Time 4h 51m 17s\nTier 4\nWave ${wave}\nCoins Earned 274,31M\nCoins Per Hour 56,50M\nCells Earned 1,43K`;
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const launch={headless:true};if(process.env.TOWER_CHROMIUM_EXECUTABLE){launch.executablePath=process.env.TOWER_CHROMIUM_EXECUTABLE;launch.args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-zygote'];}
 let browser;try{
 browser=await chromium.launch(launch);const page=await browser.newPage({viewport:{width:384,height:400},timezoneId:'Europe/Berlin'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}`;await page.goto(url);await page.waitForSelector('#view h1');
 const tab=async name=>{await page.locator(`#bottomnav [data-tab="${name}"]`).click();};
 for(const size of [{width:320,height:360},{width:384,height:400},{width:412,height:460}]){await page.setViewportSize(size);for(const t of ['account','dashboard','import','runs','diagnostics','data']){await tab(t);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${t} at ${size.width}`);}}
 await page.setViewportSize({width:384,height:400});await tab('import');const batch=Array.from({length:30},(_,i)=>report(17-i%15,2632+i)).join('\n\n');await page.locator('#batch-raw').fill(batch);await page.locator('#batch-import').click();await page.getByText(/30 neu, 0 doppelt/).waitFor();
 await page.reload();await page.waitForSelector('#view h1');assert.equal(await page.evaluate(()=>state.runs.length),30);
 await tab('import');await page.locator('#batch-raw').fill(batch);await page.locator('#batch-import').click();await page.getByText(/0 neu, 30 doppelt/).waitFor();
 await tab('runs');assert.match(await page.locator('#view').innerText(),/17.10.2026/);assert.equal(await page.evaluate(()=>state.runs[0].battleDateRaw.includes('17,')),true);
 // Prove real user dialogs are callable (regression for the former shadowed prompt function).
 page.once('dialog',d=>d.accept('2026-10-01 12:00'));await page.locator('[data-dateedit]').first().click();await page.getByText('✓ Run-Datum aktualisiert.').waitFor();
 await tab('account');await page.locator('#entry-category').selectOption({label:'Ultimate Weapons'});await page.locator('#entry-name').fill('Golden Tower');await page.locator('#entry-value').fill('3');await page.locator('#entry-save').click();await page.getByText('✓ Account-Wert gespeichert.').waitFor();
 page.once('dialog',d=>d.accept('4'));await page.locator('[data-editentry]').click();await page.getByText('✓ Änderung als neuer Verlaufseintrag gespeichert.').waitFor();assert.equal(await page.evaluate(()=>state.entries.length),2);
 await page.reload();await page.waitForSelector('#view h1');assert.equal(await page.evaluate(()=>state.entries.length),2);assert.equal(await page.evaluate(()=>state.runs.length),30);
 // Stub OCR engine output, exercise actual image input, matching UI and atomic save in Chromium.
 await tab('runs');await page.evaluate(()=>{window.Tesseract={createWorker:async()=>({recognize:async()=>({data:{text:'Tier 4 Wave 2633\nOct 16, 2026\nCoins: 274.31M\nCoins/Hour: 56.50M\nCells: 1.43K'}}),terminate:async()=>{}})};});
 await page.locator('#history-shot').setInputFiles({name:'history.jpg',mimeType:'image/jpeg',buffer:fs.readFileSync('tests/fixtures/history-compact.jpg')});
 const apply=page.getByRole('button',{name:'Geprüfte Zuordnungen übernehmen'});await apply.waitFor();assert.equal(await apply.isEnabled(),false);await page.locator('[data-approved]').check();assert.equal(await apply.isEnabled(),true);page.once('dialog',d=>d.accept());await apply.click();await page.getByText(/1 geprüfte History-Zuordnungen gespeichert/).waitFor();
 assert.equal(await page.evaluate(()=>state.runs.find(r=>r.wave===2633).historySource),'screenshot-ocr');
 await tab('account');await page.screenshot({path:'/tmp/tower-account-verified.png',fullPage:true});await tab('runs');await page.screenshot({path:'/tmp/tower-runs-verified.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('Chromium passed: 3 mobile sizes × 6 tabs, 30-report import/reimport, reload persistence, historical sorting, date dialogs, append-only account edits, OCR-text matching/save UI.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
