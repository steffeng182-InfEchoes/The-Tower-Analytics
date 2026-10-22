const {test}=require('node:test'),assert=require('node:assert/strict');const {validate}=require('../../guild/backup.js');
const backup=()=>({format:'tower-guild-full-backup',schemaVersion:1,profiles:[{id:'local-player',name:'Tower'}],runs:[{id:'x',playerId:'local-player',rawText:'Battle Report'}],accountEntries:[]});
test('full backup validates originals without changing them',()=>{const b=backup(),before=JSON.stringify(b);assert.equal(validate(b),b);assert.equal(JSON.stringify(b),before);});
test('full backup rejects orphan records and duplicate IDs before writes',()=>{const b=backup();b.runs[0].playerId='other';assert.throws(()=>validate(b),/Unknown profile/);const c=backup();c.runs.push(c.runs[0]);assert.throws(()=>validate(c),/duplicate/);});
test('sync authorization/baseline metadata cannot be restored into a different account',()=>{const b=backup();b.profiles.push({id:'__guild_sync__',recordType:'guild-sync'});assert.throws(()=>validate(b));});
