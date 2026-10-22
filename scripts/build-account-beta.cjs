const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('dist/account',{recursive:true});
fs.copyFileSync('index.html','dist/index.html');
for(const file of fs.readdirSync('account'))if(file.endsWith('.js'))fs.copyFileSync(path.join('account',file),path.join('dist/account',file));
console.log('Static Account Intelligence build: dist/ (index.html + account/*.js)');
