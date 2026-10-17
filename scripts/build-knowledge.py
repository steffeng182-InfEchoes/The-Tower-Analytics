"""Rebuild compact, attributed catalogue from a pinned TheTowerSDK checkout (no code execution)."""
from pathlib import Path
import re,json,subprocess,sys
root=Path(sys.argv[1]); revision=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
expected='6a6d3bc9101d68ad65b355122c6fe66af0a4610f'
if revision!=expected: raise SystemExit('Unexpected source revision; explicitly review and update the pin first.')
records=[];sources={}
def src(key,path):
 sources[key]={'url':f'https://github.com/TmRxJD/TheTowerSDK/blob/{revision}/{path}','revision':revision,'checkedOn':'2026-10-17','status':'community-reference','method':'Source data inspected; not an official game specification'}
 return (root/path).read_text()
def slug(name):return re.sub(r'[^a-z0-9]+','_',name.lower()).strip('_')
def add(id,category,name,source,**extra):records.append(dict(id=id,category=category,name=name,source=source,**extra))
legacy={'labs_speed':'lab.speed','attack_speed':'lab.attack_speed','coins_kill_bonus':'lab.coins_kill','health':'lab.health','garlic_thorns':'lab.garlic_thorns'}
s=src('sdkLabs','src/data/labs/catalog.data.ts')
for m in re.finditer(r'\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",([\s\S]*?)\n\s*\],',s):
 levels=list(map(int,re.findall(r'level:\s*(\d+)',m[3])))
 if not levels:continue
 extra={'maxLevel':max(levels),'unit':'level'}
 # Expose only three simple isolated lab factors; never infer a level from an effect.
 if m[1] in ['labs_speed','attack_speed','coins_kill_bonus']:
  extra.update(base=1,step=.02,effectUnit='multiplier',dependencies=['Other bonuses are separate; this is only the lab factor.'])
 add(legacy.get(m[1],'lab.'+m[1]),'Labs',m[2],'sdkLabs',**extra)
# Preserve established app label as an alias, not a second level record.
for r in records:
 if r['id']=='lab.speed':r.update(name='Lab Speed',aliases=['Labs Speed'])
w=json.loads(src('sdkWorkshop','src/data/workshop/table.json'))
for name,levels in w.items():
 if not isinstance(levels,dict) or not levels or not all(k.isdigit() for k in levels):continue
 key=slug(name);key='health_regen' if name=='Health Regen' else key
 add('workshop.'+key,'Workshop',name,'sdkWorkshop',maxLevel=max(map(int,levels)),unit='level',dependencies=['Labs','Karten','Module','Relics','Enhancements','Run-Boni'])
s=src('sdkCards','src/data/cards/data.ts')
for m in re.finditer(r"id: '([^']+)',\s*name: '([^']+)',([\s\S]*?)levelValues: \[([^\]]+)\]",s):
 values=[float(n) for n in re.findall(r'\d+(?:\.\d+)?',m[4])]
 add('card.'+m[1],'Karten',m[2],'sdkCards',maxLevel=len(values),unit='level',effects=values)
s=src('sdkModules','src/data/modules/templates.ts')
for m in re.finditer(r"id: '([^']+)',\s*name: '([^']+)',\s*initials: '[^']+',\s*type: '([^']+)'",s):
 add('module.'+m[1],'Module',m[2],'sdkModules',unit='value',moduleType=m[3])
s=src('sdkUW','src/data/ultimate-weapons/stones.data.ts')
weapons=list(re.finditer(r"^  ([a-z_]+): \{\s*name: '([^']+)'",s,re.M))
for i,m in enumerate(weapons):
 body=s[m.end():weapons[i+1].start() if i+1<len(weapons) else len(s)]
 for st in re.finditer(r"name: '([^']+)', levels: \[([\s\S]*?)\n\s*\]",body):
  levels=[int(x) for x in re.findall(r'level: (\d+)',st[2])]
  if levels:add('uw.'+m[1]+'.'+slug(st[1]),'Ultimate Weapons',m[2]+' · '+st[1],'sdkUW',maxLevel=max(levels),unit='level',system=m[2],stat=st[1])
s=src('sdkRelics','src/data/relics/data.ts')
for line in s.splitlines():
 m=re.search(r"id: '([^']+)', name: (?:'([^']+)'|\"([^\"]+)\"), bonusType: '([^']+)', value: '([^']+)'",line)
 if m:add('relic.'+m[1],'Relics',m[2] or m[3],'sdkRelics',unit='ownership',bonusType=m[4],bonusValue=m[5])
# Unlock requirements are source-labelled, not silently treated as proof of ownership.
unlocks=json.loads(src('sdkUnlocks','fixtures/data/effective-paths-lab-unlocks.json'))['unlocks']; byName={r['name'].lower():r for r in records if r['category']=='Labs'}
for u in unlocks:
 r=byName.get(u['name'].lower())
 if r:r['unlock']={'tier':u['tier'],'wave':u['wave'],'source':'sdkUnlocks'}
assert len({r['id'] for r in records})==len(records)
entry=Path('index.html');html=entry.read_text();start='// BEGIN REFERENCE CATALOGUE';end='// END REFERENCE CATALOGUE'
block=start+'\nconst KNOWLEDGE_SOURCES='+json.dumps(sources,separators=(',',':'),ensure_ascii=False)+';\nconst REFERENCE_KNOWLEDGE='+json.dumps(records,separators=(',',':'),ensure_ascii=False)+';\n'+end
if start in html:html=html[:html.index(start)]+block+html[html.index(end)+len(end):]
else:html=html.replace('const TOWER_KNOWLEDGE=[',block+'\nconst TOWER_KNOWLEDGE_SEED=[').replace('function knownEntry(',"const TOWER_KNOWLEDGE=REFERENCE_KNOWLEDGE;\nfunction knownEntry(")
entry.write_text(html)
Path('docs/THIRD_PARTY_LICENSES.md').write_text('# TheTowerSDK reference catalogue\n\nSelected names, level limits, card factors, relic bonuses and unlock metadata are derived from TheTowerSDK at commit `'+revision+'`. The metadata is a community reference; it is not an official game specification. Rebuild with `python scripts/build-knowledge.py /path/to/pinned/checkout`.\n\n'+(root/'LICENSE').read_text())
print(json.dumps({'entries':len(records),'categories':{c:sum(r['category']==c for r in records) for c in sorted({r['category'] for r in records})}}))
