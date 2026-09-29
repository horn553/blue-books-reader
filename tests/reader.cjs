const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname,'..');
const source = fs.readFileSync(path.join(root,'reader.js'),'utf8');
const origin = 'https://tumourclassification.iarc.who.int';
const sleep = ms => new Promise(r => setTimeout(r,ms));
const report = [];
function section(id, name, body) {
 return `<div class="description" id="${id}" style="margin-bottom:15px"><p id="#${id}" class="mediumfontstyle"><span>${name}</span> &nbsp;</p><span class="description mediumfontstyle">${body}</span></div>`;
}
function article({title='Example article',sections=[['1','Definition','<p>Original <em>emphasis</em>, X<sup>2</sup> and α ≥ 2; None.</p>'],['2','Histopathology','<h5>Original subheading</h5><p>Source text <a href="/chaptercontent/72/19">section</a> <a href="https://example.org/pubmed/1">1</a>.</p>']],media=true}={}) {
 return `<app-chaptercontent><div class="contentDesign"><ol class="breadcrumb"><li>Original breadcrumb</li></ol></div><div class="container-fluid"><div class="row"><div class="col-sm-2"><div><ul class="chapcon-nav-tabs">${sections.map(s=>`<li title="${s[1]}"><a><span>${s[1]}</span></a></li>`).join('')}</ul><a data-bs-target="#noteTemplate">Add Personal Note</a><a data-bs-target="#commentModal">Send us Feedback</a></div><dl><dt>Authors</dt><dd>Original author</dd></dl></div><div class="col-sm-8" style="min-height:70vh"><div class="row scrollRow" style="overflow:auto;max-height:90vh"><div><h4><span class="content-heading"><span>${title}</span><span title="Add To My Favourite"><img src="/assets/favourite.png"></span></span></h4></div>${sections.map(s=>section(...s)).join('')}</div></div><div class="col-sm-2">${media?'<div style="height:449px"><div id="myAttachments" style="position:absolute"><div class="item"><div title="View Attachment"><a data-bs-toggle="modal" data-bs-target="#viewierModal"><img src="/static/figure.jpg" alt="Original image"><p>#101</p></a><p>Original caption</p></div></div></div></div>':'<button>No attachments found</button>'}</div></div></div><div class="modal" id="noteTemplate"><textarea>Original note</textarea></div><div class="modal" id="viewierModal"><p>Original viewer</p></div></app-chaptercontent>`;
}
const tnm = `<table class="MsoTableGrid"><tbody><tr><td><h1>Original organ</h1></td></tr><tr><td><h2>Original classification</h2><p>Original explanation.</p><h3>Original subgroup</h3><table id="data"><tbody><tr><td rowspan="2">A</td><td>B<sup>a</sup></td></tr><tr><td>C</td></tr><tr><td colspan="2">Footnote <em>a</em></td></tr></tbody></table></td></tr></tbody></table>`;
function chapters() {
 return '<app-chapter>'+[true,false].map((open,i)=>`<div class="panel card"><div role="tab"><div class="accordion-toggle" role="button" aria-expanded="${open}"><h5>Chapter ${i+1}<span class="accordion-chapter-toggle fa fa-angle-down"></span></h5></div></div><div role="tabpanel" aria-hidden="${!open}" style="display:${open?'block':'none'}"><div class="panel-body"><p style="padding-left:60px"><span>Original category</span></p><p style="padding-left:80px"><a href="/chaptercontent/72/${i+1}">Original entity ${i+1}</a></p></div></div></div>`).join('')+'</app-chapter>';
}
function snapshot(d) {
 const root = d.querySelector('#bookapproot');
 const walker = d.createTreeWalker(root, 4); const texts=[];
 let n; while(n=walker.nextNode()) if(!n.parentElement.closest('[data-wr-generated]')) texts.push(n.textContent);
 return JSON.stringify({texts, links:[...root.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),images:[...root.querySelectorAll('img')].map(i=>[i.getAttribute('src'),i.getAttribute('alt')]),cells:[...root.querySelectorAll('td,th')].map(c=>[c.tagName,c.getAttribute('rowspan'),c.getAttribute('colspan'),c.textContent]),modals:[...root.querySelectorAll('[data-bs-target]')].map(e=>e.getAttribute('data-bs-target'))});
}
async function create(route, body, customOrigin=origin) {
 const dom = new JSDOM(`<html><head><title>Fixture</title></head><body><div id="bookapproot">${body}</div></body></html>`, {url:customOrigin+route,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window, listeners=[];
 w.HTMLElement.prototype.scrollIntoView=function(){w.__jump=this;}; w.scrollTo=()=>{};
 w.chrome={storage:{local:{get:(key,cb)=>cb({})},onChanged:{addListener:f=>listeners.push(f)}}};
 const before=snapshot(w.document); w.eval(source); await sleep(160);
 return {dom,w,d:w.document,before,update:async value=>{listeners.forEach(f=>f({readerPrefs:{newValue:value}},'local')); await sleep(160);}};
}
async function test(name, fn) {await fn(); report.push({name,result:'PASS'}); console.log('PASS '+name);}
if (require.main === module) (async()=>{
 await test('Source text, links, images, footnotes and existing action nodes preserved; disable restores attributes',async()=>{
  const t=await create('/chaptercontent/72/19',article());
  assert.equal(snapshot(t.d),t.before); assert(t.d.querySelector('.wr-article')); assert.equal(t.d.querySelectorAll('.wr-subnav button').length,1);
  const note=t.d.querySelector('[data-bs-target="#noteTemplate"]'); let calls=0;note.addEventListener('click',()=>calls++);note.click();assert.equal(calls,1);
  const button=t.d.querySelector('.wr-subnav button');button.click();assert.equal(t.w.__jump.textContent,'Original subheading');
  await t.update({enabled:false}); assert.equal(snapshot(t.d),t.before);assert.equal(t.d.querySelectorAll('[data-wr-generated],.wr-heading,.wr-current,[data-wr-level]').length,0);assert(!t.d.documentElement.hasAttribute('data-wr-enabled'));
  assert.equal(t.d.querySelector('h4').getAttribute('role'),null); assert.equal(t.d.querySelector('.chapcon-nav-tabs a').getAttribute('tabindex'),null);t.dom.window.close();
 });
 await test('TNM layout tables and nested data tables distinguished without changing cell geometry',async()=>{
  const t=await create('/chaptercontent/72/289',article({title:'TNM staging',sections:[['950','TNM staging',tnm]],media:false}));
  assert.equal(snapshot(t.d),t.before);assert.equal(t.d.querySelectorAll('.wr-layout-table').length,1);assert.equal(t.d.querySelectorAll('.wr-data-table').length,1);assert.equal(t.d.querySelectorAll('.wr-subnav button').length,3);assert.equal(t.d.querySelector('h1').getAttribute('aria-level'),'3');assert.equal(t.d.querySelector('#data [rowspan]').getAttribute('rowspan'),'2');assert(t.d.querySelector('.wr-no-media'));t.dom.window.close();
 });
 await test('Delayed article load and added headings observed without duplicate navigation',async()=>{
  const t=await create('/chaptercontent/72/289','');
  t.d.querySelector('#bookapproot').innerHTML=article({title:'TNM staging',sections:[['950','TNM staging',tnm]]});await sleep(180);
  assert.equal(t.d.querySelectorAll('.wr-subnav button').length,3);
  const p=t.d.createElement('h2');p.textContent='Late section';t.d.querySelector('span.description').append(p);await sleep(180);assert.equal(t.d.querySelectorAll('.wr-subnav button').length,4);
  const marker=t.d.createTextNode(' ');t.d.body.append(marker);await sleep(180);assert.equal(t.d.querySelectorAll('.wr-subnav button').length,4);t.dom.window.close();
 });
 await test('Multiple chapter panels stay open; keyboard operates independently; disabling restores native states',async()=>{
  const t=await create('/chapters/72',chapters());const cards=[...t.d.querySelectorAll('.wr-card')], toggles=[...t.d.querySelectorAll('.accordion-toggle')];
  toggles[1].click();assert.equal(cards[0].getAttribute('data-wr-open'),'true');assert.equal(cards[1].getAttribute('data-wr-open'),'true');assert.equal(snapshot(t.d),t.before);
  toggles[0].dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(cards[0].getAttribute('data-wr-open'),'false');assert.equal(cards[1].getAttribute('data-wr-open'),'true');
  await t.update({enabled:false});assert.equal(toggles[0].getAttribute('aria-expanded'),'true');assert.equal(toggles[1].getAttribute('aria-expanded'),'false');t.dom.window.close();
 });
 await test('Abbreviations paired only for the inspected route with validated alternating paragraphs',async()=>{
  const content=article({title:'List of abbreviations',sections:[['950','List of abbreviations','<p>ABC</p><p>Original explanation</p><p>DEF</p><p>Another explanation</p>']],media:false});
  const t=await create('/chaptercontent/72/286',content);assert(t.d.querySelector('.wr-abbreviations'));assert.equal(snapshot(t.d),t.before);t.dom.window.close();
  const other=await create('/chaptercontent/73/286',content);assert(!other.d.querySelector('.wr-abbreviations'));other.dom.window.close();
  const odd=await create('/chaptercontent/72/286',content.replace('<p>DEF</p>',''));assert(!odd.d.querySelector('.wr-abbreviations'));odd.dom.window.close();
 });
 await test('SPA transitions remove stale enhancements and skip account routes',async()=>{
  const t=await create('/chaptercontent/72/19',article());t.w.history.pushState({},'', '/chapters/72');t.d.querySelector('#bookapproot').innerHTML=chapters();await sleep(180);assert.equal(t.d.querySelectorAll('.wr-card').length,2);assert(!t.d.querySelector('.wr-subnav'));
  t.w.history.pushState({},'', '/account');t.d.querySelector('#bookapproot').innerHTML='<p>Account content</p>';await sleep(180);assert(!t.d.documentElement.hasAttribute('data-wr-enabled'));t.dom.window.close();
 });
 await test('Settings change layout variables and repeated enable/disable is reversible',async()=>{
  const t=await create('/chaptercontent/72/19',article());await t.update({enabled:true,font:20,width:80,leading:1.8});assert.equal(t.d.documentElement.style.getPropertyValue('--wr-font'),'20px');await t.update({enabled:false});await t.update({enabled:true});assert.equal(t.d.querySelectorAll('.wr-subnav button').length,1);assert.equal(snapshot(t.d),t.before);t.dom.window.close();
 });
 await test('Unrelated origins and unsupported paths receive no changes',async()=>{
  const t=await create('/chaptercontent/72/19',article(),'https://example.org');assert.equal(snapshot(t.d),t.before);assert(!t.d.documentElement.hasAttribute('data-wr-enabled'));t.dom.window.close();
  const u=await create('/search-new',article());assert(!u.d.documentElement.hasAttribute('data-wr-enabled'));u.dom.window.close();
 });
 await test('Manifest contains no network, tabs, scripting, cookies or remote-code capabilities',async()=>{
  const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));assert.deepEqual(m.permissions,['storage']);assert.deepEqual(m.content_scripts[0].matches,[origin+'/*']);assert.equal(m.manifest_version,3);assert(!/\bfetch\s*\(|XMLHttpRequest\s*\(|WebSocket\s*\(/.test(source));
 });
 await test('Native font-size controls keep their displayed pixel meanings and original events',async()=>{
  const t=await create('/chaptercontent/72/19',article());const control=t.d.createElement('a');control.className='smallfonttxt';control.title='10';control.textContent='A';t.d.querySelector('app-chaptercontent').append(control);let called=0;control.addEventListener('click',()=>called++);control.click();await sleep(160);assert.equal(called,1);assert.equal(t.d.documentElement.style.getPropertyValue('--wr-font'),'10px');t.dom.window.close();
 });
 await test('Source inline-important navigation spacing is overridden and restored exactly',async()=>{
  const t=await create('/chaptercontent/72/19',article().replace('<a><span>Definition','<a style="padding:0px!important;color:blue"><span>Definition'));
  const a=t.d.querySelector('.chapcon-nav-tabs a');assert.equal(a.style.padding,'8px 10px');await t.update({enabled:false});assert.equal(a.style.padding,'0px');assert.equal(a.style.getPropertyPriority('padding'),'important');assert.equal(a.style.color,'blue');t.dom.window.close();
 });
 await test('An existing gallery with only an empty-state message uses compact no-media layout',async()=>{
  const body=article().replace(/<div class="item">[\s\S]*?<\/div><\/div><\/div><\/div>/,'<button>No attachments found</button></div></div>');
  const t=await create('/chaptercontent/72/289',body);assert(t.d.querySelector('#myAttachments'));assert(t.d.querySelector('.wr-no-media'));assert.equal(snapshot(t.d),t.before);t.dom.window.close();
 });
 await test('Long TNM outlines group existing headings without losing jump targets',async()=>{
  const t=await create('/chaptercontent/72/289',article({title:'TNM staging',sections:[['950','TNM staging',tnm.repeat(13)]]}));
  assert.equal(t.d.querySelectorAll('.wr-disclosure').length,13);assert.equal(t.d.querySelectorAll('.wr-subnav button:not(.wr-disclosure)').length,39);assert.equal(snapshot(t.d),t.before);
  const button=t.d.querySelector('.wr-disclosure');button.click();assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(button.parentElement.nextElementSibling.hidden,false);await t.update({enabled:false});assert.equal(snapshot(t.d),t.before);t.dom.window.close();
 });
 await test('Font changes leave the independent pixel width unchanged; saved width settings still work',async()=>{
  const t=await create('/chaptercontent/72/19',article());
  for(const font of [10,18,24]) {
   await t.update({font,width:76});
   assert.equal(t.d.documentElement.style.getPropertyValue('--wr-width'),'760px');
   assert.equal(t.d.documentElement.style.getPropertyValue('--wr-font'),font+'px');
  }
  await t.update({font:24,width:90});
  assert.equal(t.d.documentElement.style.getPropertyValue('--wr-width'),'900px');
  assert.equal(snapshot(t.d),t.before);t.dom.window.close();
 });
 await test('Book-wide controls share individual chapter state, support keyboard, stay scoped and restore',async()=>{
  const book = label => '<ul><li><div>'+label+'<span class="accordion-book-toggle fa fa-angle-double-down"></span></div></li>'+chapters().replace(/<\/?app-chapter>/g,'')+'</ul>';
  const t=await create('/chapters/72','<app-chapter>'+book('Book A')+book('Book B')+'</app-chapter>');
  const triggers=[...t.d.querySelectorAll('.wr-book-toggle')],cards=[...t.d.querySelectorAll('.wr-card')];
  const state=()=>cards.map(c=>c.dataset.wrOpen);
  let nativeCalls=0;triggers[0].addEventListener('click',()=>nativeCalls++);
  triggers[0].querySelector('span').click();assert.deepEqual(state(),['true','true','true','false']);assert.equal(nativeCalls,0);assert.equal(triggers[0].getAttribute('aria-expanded'),'true');
  cards[0].querySelector('.accordion-toggle').click();assert.equal(triggers[0].getAttribute('aria-expanded'),'false');
  triggers[0].dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.deepEqual(state(),['true','true','true','false']);
  triggers[0].dispatchEvent(new t.w.KeyboardEvent('keydown',{key:' ',bubbles:true}));assert.deepEqual(state(),['false','false','true','false']);
  await t.update({font:24});assert.deepEqual(state(),['false','false','true','false']);assert.equal(snapshot(t.d),t.before);
  await t.update({enabled:false});assert.equal(triggers[0].getAttribute('role'),null);assert.equal(triggers[0].getAttribute('tabindex'),null);assert.equal(snapshot(t.d),t.before);
  triggers[0].click();assert.equal(nativeCalls,1);t.dom.window.close();
 });
 fs.writeFileSync(path.join(root,'test-results.json'),JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={article,chapters,tnm};
