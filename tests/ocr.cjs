// Actual Tesseract recognition + production canvas preprocessing + production reconciliation.
// No mocked OCR text. All language/engine assets are local dev dependencies.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{createWorker}=require('tesseract.js');
(async()=>{
 const options={headless:true};if(process.env.TOWER_CHROMIUM_EXECUTABLE){options.executablePath=process.env.TOWER_CHROMIUM_EXECUTABLE;options.args=['--no-sandbox','--no-zygote','--disable-dev-shm-usage'];}
 const browser=await chromium.launch(options),page=await browser.newPage();let worker;const cache=fs.mkdtempSync(path.join(os.tmpdir(),'tower-ocr-'));
 try{
  const script=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/start\(\);\s*$/,'');await page.addScriptTag({content:script});
  worker=await createWorker('eng',1,{langPath:require('@tesseract.js-data/eng').langPath,cachePath:cache});
  const cases=[{file:'tests/fixtures/history-compact.jpg',pairs:[[10,81],[1,1],[1,2791]],coins:['227430','0','4270000']},{file:'tests/fixtures/history-tall.jpg',pairs:[[18,3802]],coins:['1780000000000000000']}];
  if(process.env.TOWER_PRIVATE_HISTORY_IMAGE)cases.push({file:process.env.TOWER_PRIVATE_HISTORY_IMAGE,private:true,pairs:[[5,360],[1,33],[4,2265],[1,8038],[1,1],[1,5085]]});
  const lean=data=>({text:data.text,confidence:data.confidence,words:(data.words||[]).map(w=>({text:w.text,confidence:w.confidence,bbox:w.bbox}))});
  for(const sample of cases){const bytes=fs.readFileSync(sample.file);const input=bytes.toString('base64');const clean=await page.evaluate(async data=>{const file=await(await fetch('data:image/jpeg;base64,'+data)).blob();const prepared=await prepareOCRImage(file);return {png:prepared.canvas.toDataURL('image/png'),scale:prepared.scale};},input);
   const raw=lean((await worker.recognize(bytes)).data),processed=lean((await worker.recognize(Buffer.from(clean.png.split(',')[1],'base64'))).data);
   const rows=await page.evaluate(async({input,raw,processed,scale})=>{const file=await(await fetch('data:image/jpeg;base64,'+input)).blob(),prepared=await prepareOCRImage(file);return mergeHistoryPasses({passes:[{...raw,scale:1},{...processed,scale}],prepared});},{input,raw,processed,scale:clean.scale});
   assert.deepEqual(rows.map(r=>[r.tier,r.wave]),sample.pairs,sample.file);
   if(sample.coins)for(let i=0;i<rows.length;i++){assert.equal(await page.evaluate(v=>gameNumber(v),rows[i].coinsRaw),sample.coins[i]);assert.equal(rows[i].visualMode,undefined,'normal skins cannot be tagged as special modes');}
   if(sample.private){assert.equal(rows[0].visualMode,'tournament');assert.equal(rows[5].visualMode,'dissonance');assert.equal(rows.slice(1,5).some(r=>r.visualMode),false);}
   console.log('Actual OCR passed:',sample.private?'private screenshot (not persisted)':sample.file,rows.length,'rows');
  }
  for(const sample of [{file:'tests/fixtures/account-labs.jpg',kind:'labs'},{file:'tests/fixtures/account-workshop.jpg',kind:'workshop'}]){
   const bytes=fs.readFileSync(sample.file),input=bytes.toString('base64');const clean=await page.evaluate(async input=>{const prepared=await prepareOCRImage(await(await fetch('data:image/jpeg;base64,'+input)).blob());return {png:prepared.canvas.toDataURL('image/png'),width:prepared.width,scale:prepared.scale};},input);
   const raw=lean((await worker.recognize(bytes)).data),processed=lean((await worker.recognize(Buffer.from(clean.png.split(',')[1],'base64'))).data);
   const rows=await page.evaluate(({raw,processed,clean})=>accountCandidatesFromRecognition({passes:[{...raw,scale:1},{...processed,scale:clean.scale}],prepared:clean}),{raw,processed,clean});
   if(sample.kind==='labs'){const speed=rows.find(r=>r.name==='Game Speed');assert.ok(speed);assert.equal(speed.valueType,'observed');assert.equal(speed.researchTargetLevel,7);}
   else {assert.ok(rows.length>=8);for(const [name,value,cost,max] of [['Orb Speed','6.30','', 'max'],['Knockback Chance','30.00%','7.44K','unknown'],['Lifesteal','4.11%','40.09K','unknown'],['Defense Absolute','17.63','124K','unknown']]){const r=rows.find(r=>r.name===name);assert.ok(r,name);assert.equal(r.value,value,name);assert.equal(r.upgradeCostRaw,cost,name);assert.equal(r.maxStatus,max,name);}assert.equal(rows.every(r=>r.valueType==='observed'),true);assert.equal(rows.some(r=>r.name==='Death Defy'),false,'locked upgrade is not owned');}
   console.log('Actual Account OCR passed:',sample.file,rows.length,'editable proposals; no invented workshop level.');
  }

 }finally{if(worker)await worker.terminate();await browser.close();fs.rmSync(cache,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
