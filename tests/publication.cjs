const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom'), {unzipSync}=require('fflate');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{
 const m=JSON.parse(read('manifest.json')),pkg=JSON.parse(read('package.json'));
 assert.equal(m.version,pkg.version);assert(read('reader.js').includes("'"+m.version+"'"));
 assert(m.description.length<=132);assert.equal(m.manifest_version,3);assert.deepEqual(m.permissions,['storage']);
 assert.deepEqual(m.content_scripts[0].matches,['https://tumourclassification.iarc.who.int/*']);
 assert(!m.background&&!m.host_permissions&&!m.web_accessible_resources);
 for(const [size,p] of Object.entries(m.icons)){
  const b=fs.readFileSync(path.join(root,p));assert.equal(b.readUInt32BE(16),+size);assert.equal(b.readUInt32BE(20),+size);
 }
 for(const [p,width,height] of [['promo-440x280.png',440,280],['screenshot-reading-1280x800.png',1280,800],['screenshot-settings-1280x800.png',1280,800]]){
  const b=fs.readFileSync(path.join(root,'store/assets',p));assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),width);assert.equal(b.readUInt32BE(20),height);
 }
 for(const p of ['popup.html','popup.js','reader.js','README.md','PRIVACY.md']) assert(!/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(read(p)),p+' must use English');
 const dom=new JSDOM(read('popup.html'),{runScripts:'outside-only',url:'https://example.invalid/popup.html'}),w=dom.window;
 let saved,fail=false;
 w.chrome={storage:{local:{get:(key,cb)=>cb({readerPrefs:{font:20,width:80}}),set:async value=>{if(fail)throw Error('test');saved=value;}}}};
 w.eval(read('popup.js'));
 assert.equal(w.document.documentElement.lang,'en');assert.equal(w.document.querySelector('#fontValue').textContent,'20px');
 assert.equal(w.document.querySelector('#widthValue').textContent,'800px');
 w.document.querySelector('#reset').click();await new Promise(r=>setTimeout(r,0));
 assert.deepEqual(JSON.parse(JSON.stringify(saved.readerPrefs)),{enabled:true,font:18,width:76,leading:1.7});
 assert.match(w.document.querySelector('#status').textContent,/Saved/);
 fail=true;w.document.querySelector('#enabled').click();await new Promise(r=>setTimeout(r,0));
 assert.match(w.document.querySelector('#status').textContent,/Could not save/);dom.window.close();
 execFileSync(process.execPath,[path.join(root,'scripts/build.cjs')],{stdio:'inherit'});
 const zipPath=path.join(root,'dist/blue-books-reader-'+m.version+'.zip');
 const first=fs.readFileSync(zipPath);
 const entries=unzipSync(first);
 const expected=['manifest.json','reader.js','reader.css','popup.html','popup.css','popup.js','LICENSE',...Object.values(m.icons)].sort();
 assert.deepEqual(Object.keys(entries).sort(),expected);
 assert.equal(JSON.parse(Buffer.from(entries['manifest.json']).toString()).version,m.version);
 execFileSync(process.execPath,[path.join(root,'scripts/build.cjs')],{stdio:'pipe'});
 assert.deepEqual(fs.readFileSync(zipPath),first,'Build must be deterministic');
 console.log('PASS English popup, preferences, manifest, PNG dimensions, ZIP allowlist and deterministic build');
})().catch(e=>{console.error(e);process.exitCode=1;});
