'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'dist');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'guild'),{recursive:true});
for(const name of ['index.html','guild-worker.js'])fs.copyFileSync(path.join(root,name),path.join(output,name));
for(const name of fs.readdirSync(path.join(root,'guild')))if(name.endsWith('.js'))fs.copyFileSync(path.join(root,'guild',name),path.join(output,'guild',name));
console.log('Static Guild beta packaged; no database credentials or server functions included.');
