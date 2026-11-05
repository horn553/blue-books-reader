const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {article}=require(path.join(root,'tests/reader.cjs'));
const cell='<table id="sample"><tbody style="font:10px/12px Times New Roman"><tr><th>Group</th><th>Description</th></tr><tr><td><p class="TableText"><span id="imported" style="font-family:Times New Roman!important;font-size:9pt!important;line-height:10pt!important"><strong>Alpha</strong></span><sup>2</sup></p></td><td><p class="TableText"><em>Original emphasis</em> and a footnote remain intact.</p></td></tr><tr><td colspan="2">A merged cell remains a merged cell.</td></tr></tbody></table>';
const testScript=`
const delay=()=>new Promise(r=>setTimeout(r,220));
const results=[];const check=(name,ok)=>{results.push((ok?'PASS ':'FAIL ')+name);document.querySelector('#results').textContent=results.join('\\n');};
const update=async prefs=>{window.qaListeners.forEach(f=>f({readerPrefs:{newValue:prefs}},'local'));await delay();};
(async()=>{
 await delay();
 for(const prefs of [{font:18,leading:1.5,family:'sans'},{font:24,leading:1.9,family:'serif'}]){
  await update(prefs);
  const table=document.querySelector('#sample'),span=document.querySelector('#imported'),s=getComputedStyle(span),expected=prefs.font*.92;
  check(prefs.family+' table text size',Math.abs(parseFloat(s.fontSize)-expected)<.02);
  check(prefs.family+' table line spacing',Math.abs(parseFloat(s.lineHeight)-expected*prefs.leading)<.03);
  check(prefs.family+' table typeface',s.fontFamily.includes(prefs.family==='serif'?'BBR Noto Serif':'BBR Noto Sans'));
  check('Emphasis and script sizing',getComputedStyle(span.querySelector('strong')).fontWeight==='700'&&parseFloat(getComputedStyle(document.querySelector('sup')).fontSize)<expected);
  check('Merged cells preserved',table.querySelector('[colspan]').colSpan===2);
 }
 const p=document.querySelector('#imported');p.style.setProperty('font-size','8pt','important');await delay();
 check('Source style mutation reapplied',p.style.fontSize==='inherit');
 await update({enabled:false});check('Disable restores latest source style',p.style.fontSize==='8pt'&&!document.querySelector('.wr-text'));
 await update({font:20,leading:1.8,family:'serif'});
 check('No document horizontal overflow',document.documentElement.scrollWidth<=innerWidth+1);
 document.querySelector('#summary').textContent=results.some(r=>r.startsWith('FAIL'))?'FAILED':'All '+results.length+' browser checks passed';
})().catch(e=>document.querySelector('#summary').textContent='FAILED '+e.message);
`;
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:8766'),route=url.pathname;
 const send=(type,data)=>{res.setHeader('Content-Type',type);res.end(data)};
 if(route==='/reader.js')return send('text/javascript',fs.readFileSync(path.join(root,'reader.js'),'utf8').replace("const ORIGIN = 'https://tumourclassification.iarc.who.int';","const ORIGIN = 'http://127.0.0.1:8766';"));
 if(route==='/qa.js')return send('text/javascript',testScript);
 if(route==='/reader.css'||route==='/fonts.css')return send('text/css',fs.readFileSync(path.join(root,route.slice(1))));
 if(/^\/fonts\/[a-z0-9-]+\.woff2$/.test(route))return send('font/woff2',fs.readFileSync(path.join(root,route.slice(1))));
 if(!['/chaptercontent/72/19','/attachment/72/101'].includes(route)){res.writeHead(404);return res.end();}
 const attachment=route.startsWith('/attachment');
 const body=attachment?'<app-attachment><h1>Attachment table</h1>'+cell+'</app-attachment>':article({title:'Reader typography verification',sections:[['1','Tables and imported text','<p>Settings now reach imported table text, including source font overrides.</p>'+cell]],media:false}).replace(/<span title="Add To My Favourite">.*?<\/span>/,'').replace('<div class="modal" id="viewierModal"><p>Original viewer</p></div>','<div class="modal" id="viewierModal"><div class="modal-body"><h3>Table viewer</h3>'+cell.replaceAll('id="sample"','id="modal-sample"').replaceAll('id="imported"','id="modal-imported"')+'</div></div>');
 send('text/html; charset=utf-8','<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reader 0.2.5 typography checks</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7f8;color:#243342;font:16px Arial}header{padding:20px 30px;background:#174a70;color:white}#summary{font-size:22px;font-weight:bold}.row{display:flex}.col-sm-2{width:16.66%}.col-sm-8{width:66.66%}.modal{display:none}.TableText{font:11px/12px Times New Roman}.description span{font-family:Times New Roman;font-size:13px}.chapcon-nav-tabs{list-style:none;padding:0}table{border-collapse:collapse}.contentDesign,dl{display:none}#results{padding:20px 30px;white-space:pre-wrap;font:14px/1.7 monospace}header small{display:block;margin-top:6px}</style><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/reader.css"></head><body><header><div id="summary">Running browser checks…</div><small>Blue Books Reader 0.2.5 · Synthetic content only</small></header><div id="bookapproot">'+body+'</div><pre id="results"></pre><script>window.qaListeners=[];window.chrome={storage:{local:{get:(k,cb)=>cb({})},onChanged:{addListener:f=>qaListeners.push(f)}}};</script><script src="/reader.js"></script><script src="/qa.js"></script></body></html>');
}).listen(8766,'127.0.0.1',()=>console.log('Typography QA: http://127.0.0.1:8766/chaptercontent/72/19'));
