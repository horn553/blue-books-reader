/* Unofficial presentation-only enhancement. No fetch, XHR, remote code or crawl. */
(() => {
  'use strict';
  const ORIGIN = 'https://tumourclassification.iarc.who.int';
  if (location.origin !== ORIGIN) return;
  const DEFAULTS = { enabled: true, font: 18, width: 76, leading: 1.7 };
  let prefs = { ...DEFAULTS }, timer, observer, currentPath = '', frame = 0;
  let entries = [], lastActive;
  const marked = new Map(), attributes = new Map(), inlineStyles = new Map(), generated = new Set();
  let accordionStates = new WeakMap();
  const validRoute = () => /^\/(chapters|chaptercontent|chaptercontents|attachment)\/\d+(?:\/\d+)*\/?$/.test(location.pathname);
  const active = () => prefs.enabled && validRoute();
  const cleanText = e => (e?.textContent || '').replace(/\s+/g, ' ').trim();
  function mark(e, name) {
    if (!e) return;
    if (!marked.has(e)) marked.set(e, new Set());
    if (!e.classList.contains(name)) { e.classList.add(name); marked.get(e).add(name); }
  }
  function patch(e, name, value) {
    if (!e) return;
    if (!attributes.has(e)) attributes.set(e, new Map());
    const map = attributes.get(e);
    if (!map.has(name)) map.set(name, { before: e.getAttribute(name), last: null });
    const item = map.get(name);
    if (e.getAttribute(name) !== String(value)) e.setAttribute(name, String(value));
    item.last = String(value);
  }
  function own(e) { e.setAttribute('data-wr-generated', ''); generated.add(e); return e; }
  function inline(e, name, value) {
    if (!inlineStyles.has(e)) inlineStyles.set(e, new Map());
    const map = inlineStyles.get(e);
    if (!map.has(name)) map.set(name, { value: e.style.getPropertyValue(name), priority: e.style.getPropertyPriority(name), last: value });
    e.style.setProperty(name, value, 'important'); map.get(name).last = value;
  }
  function reset() {
    generated.forEach(e => e.remove()); generated.clear();
    attributes.forEach((attrs, e) => attrs.forEach(({ before, last }, name) => {
      if (e.getAttribute(name) === last) {
        if (before === null) e.removeAttribute(name); else e.setAttribute(name, before);
      }
    })); attributes.clear();
    inlineStyles.forEach((props, e) => props.forEach((saved, name) => {
      if (e.style.getPropertyValue(name) === saved.last && e.style.getPropertyPriority(name) === 'important') {
        if (saved.value) e.style.setProperty(name, saved.value, saved.priority); else e.style.removeProperty(name);
      }
    })); inlineStyles.clear();
    marked.forEach((names, e) => names.forEach(n => e.classList.remove(n))); marked.clear();
    document.documentElement.removeAttribute('data-wr-enabled');
    document.documentElement.removeAttribute('data-wr-version');
    ['--wr-font', '--wr-width', '--wr-leading'].forEach(n => document.documentElement.style.removeProperty(n));
    entries = []; lastActive = null; accordionStates = new WeakMap();
  }
  function prune() {
    [marked, attributes, inlineStyles].forEach(map => map.forEach((_, e) => { if (!e.isConnected) map.delete(e); }));
    generated.forEach(e => { if (!e.isConnected) generated.delete(e); });
  }
  function stylePreferences() {
    const root = document.documentElement;
    root.setAttribute('data-wr-enabled', '');
    root.setAttribute('data-wr-version', '0.2.1');
    root.style.setProperty('--wr-font', `${prefs.font}px`);
    // Retain existing stored slider values, but use a font-independent CSS-pixel width.
    root.style.setProperty('--wr-width', `${prefs.width * 10}px`);
    root.style.setProperty('--wr-leading', prefs.leading);
  }
  function semanticHeading(e, level) {
    if (!e || !cleanText(e)) return;
    mark(e, 'wr-heading'); patch(e, 'role', 'heading'); patch(e, 'aria-level', level);
    patch(e, 'data-wr-level', level);
  }
  function tableKind(table) {
    const rows = [...table.rows];
    // Layout tables in the inspected TNM page have exactly one cell per outer row.
    // Never flatten a table or alter a cell/span/footnote, even in this case.
    const layout = rows.length > 0 && rows.every(r => r.cells.length === 1 && r.cells[0].colSpan === 1)
      && [...table.querySelectorAll('h1')].some(h => h.closest('table') === table);
    return layout ? 'wr-layout-table' : 'wr-data-table';
  }
  function enhanceTables(root) {
    root.querySelectorAll('table').forEach(table => {
      const kind = tableKind(table);
      ['wr-layout-table', 'wr-data-table'].forEach(c => { if (c !== kind) table.classList.remove(c); });
      mark(table, kind);
      if (kind === 'wr-data-table') patch(table, 'tabindex', '0');
    });
  }
  function enhanceAbbreviations(article) {
    // Deliberately restricted to the inspected volume/page and a strict alternating shape.
    if (!/^\/chaptercontents?\/72\/286\/?$/.test(location.pathname)) return;
    if (cleanText(article.querySelector('.content-heading > span')) !== 'List of abbreviations') return;
    article.querySelectorAll('div.description > span.description').forEach(body => {
      const children = [...body.children];
      const looseText = [...body.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (looseText || children.length < 4 || children.length % 2 || children.some(p => p.tagName !== 'P' || !cleanText(p))) return;
      if (children.some((p, i) => i % 2 === 0 && (cleanText(p).length > 40 || p.querySelector('br,table')))) return;
      mark(body, 'wr-abbreviations');
    });
  }
  function buildNavigation(article, nav) {
    const items = [...nav.children].filter(e => !e.hasAttribute('data-wr-generated'));
    const sections = [...article.querySelectorAll(':scope > div.description')];
    const next = [];
    sections.forEach((section, index) => {
      const heading = section.querySelector(':scope > p[id]');
      if (!heading) return;
      semanticHeading(heading, 2);
      const label = cleanText(heading);
      const item = items.find(li => cleanText(li.querySelector('a > span')) === label)
        || (items.length === sections.length ? items[index] : null);
      if (!item) return; // Unknown site variant: keep native navigation untouched.
      const link = item.querySelector('a');
      if (!link) return;
      patch(link, 'role', 'button'); patch(link, 'tabindex', '0');
      // The source has inline padding:0!important; ordinary stylesheet rules cannot override it.
      inline(link, 'padding', '8px 10px');
      next.push({ target: heading, button: link, parent: item, label, level: 2 });
      const subheads = [...section.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => cleanText(h));
      const ranks = [...new Set(subheads.map(h => Number(h.tagName[1])))].sort((a,b) => a-b);
      subheads.forEach(h => {
        const level = Math.min(6, 3 + ranks.indexOf(Number(h.tagName[1])));
        semanticHeading(h, level);
        next.push({ target: h, parent: item, label: cleanText(h), level });
      });
    });
    const same = next.length === entries.length && next.every((v,i) => {
      const old = entries[i];
      return old.target === v.target && old.label === v.label && old.parent === v.parent && old.level === v.level;
    });
    if (same) return;
    nav.querySelectorAll('[data-wr-generated]').forEach(e => { generated.delete(e); e.remove(); });
    const lists = new Map(), groups = new Map();
    const groupLongOutline = next.filter(e => !e.button).length > 35;
    next.forEach(entry => {
      if (entry.button) return;
      if (!lists.has(entry.parent)) {
        const list = own(document.createElement('ul')); list.className = 'wr-subnav';
        entry.parent.append(list); lists.set(entry.parent, list);
      }
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.textContent = entry.label;
      button.setAttribute('data-wr-depth', entry.level - 3);
      entry.button = button;
      if (groupLongOutline && entry.level === 3) {
        const bar = document.createElement('div'), disclosure = document.createElement('button'), children = document.createElement('ul');
        bar.className = 'wr-groupbar'; children.className = 'wr-nav-children'; children.hidden = true;
        disclosure.type = 'button'; disclosure.className = 'wr-disclosure'; disclosure.textContent = '+';
        disclosure.setAttribute('aria-expanded', 'false'); disclosure.setAttribute('aria-label', `Toggle subheadings: ${entry.label}`);
        bar.append(button, disclosure); li.append(bar, children); lists.get(entry.parent).append(li); groups.set(entry.parent, children);
      } else {
        li.append(button);
        (groupLongOutline && entry.level > 3 && groups.get(entry.parent) || lists.get(entry.parent)).append(li);
      }
    });
    entries = next; lastActive = null; updateCurrent();
  }
  function enhanceArticle() {
    const article = document.querySelector('app-chaptercontent .scrollRow');
    if (!article) return;
    const main = article.parentElement, grid = main.parentElement;
    const nav = grid.querySelector('.chapcon-nav-tabs');
    if (!nav || grid.children.length !== 3) return;
    mark(article, 'wr-article'); mark(main, 'wr-main'); mark(grid, 'wr-grid');
    mark(grid.parentElement, 'wr-page'); mark(grid.children[0], 'wr-sidebar'); mark(grid.children[2], 'wr-media');
    mark(nav, 'wr-nav');
    article.querySelectorAll('.content-heading').forEach(e => semanticHeading(e.closest('h4'), 1));
    buildNavigation(article, nav); enhanceTables(article); enhanceAbbreviations(article);
    const gallery = grid.querySelector('#myAttachments');
    if (gallery) {
      mark(gallery, 'wr-gallery');
      // Remove height/absolute layout only along the known attachment container chain.
      let p = gallery.parentElement;
      while (p && p !== grid.children[2]) { mark(p, 'wr-gallery-shell'); p = p.parentElement; }
    } else {
      mark(grid, 'wr-no-media'); // Keep the empty-state message, place it below the article.
    }
    const hasMedia = gallery?.querySelector('[title="View Attachment"], [title="View tables and boxes"], img');
    if (hasMedia) grid.classList.remove('wr-no-media'); else mark(grid, 'wr-no-media');
    grid.children[0].querySelectorAll('dl').forEach(e => mark(e, 'wr-authors'));
  }
  function enhanceChapters() {
    const root = document.querySelector('app-chapter');
    if (!root) return;
    mark(root, 'wr-chapters');
    root.querySelectorAll('.panel.card').forEach(card => {
      const panel = card.querySelector(':scope > [role="tabpanel"]');
      const toggle = card.querySelector('.accordion-toggle');
      if (!panel || !toggle) return;
      if (!accordionStates.has(card)) accordionStates.set(card, toggle.getAttribute('aria-expanded') === 'true');
      mark(card, 'wr-card'); patch(toggle, 'tabindex', '0');
      setAccordion(card, accordionStates.get(card));
    });
    root.querySelectorAll('.panel-body > p').forEach(p => {
      const padding = Number.parseFloat(p.style.paddingLeft);
      if (Number.isFinite(padding)) patch(p, 'data-wr-indent', Math.max(0, Math.min(6, Math.round(padding / 20))));
      if (!p.querySelector('a') && cleanText(p)) mark(p, 'wr-category');
    });
  }
  function setAccordion(card, open) {
    accordionStates.set(card, open); patch(card, 'data-wr-open', open);
    patch(card.querySelector('.accordion-toggle'), 'aria-expanded', open);
    patch(card.querySelector(':scope > [role="tabpanel"]'), 'aria-hidden', !open);
  }
  function bookCards(trigger) {
    const list = trigger.closest('ul');
    return list ? [...list.querySelectorAll('.wr-card')].filter(card => card.closest('ul') === list) : [];
  }
  function syncBookToggles() {
    document.querySelectorAll('.wr-chapters .accordion-book-toggle').forEach(icon => {
      const trigger = icon.closest('li');
      if (!trigger || !bookCards(trigger).length) return;
      mark(trigger, 'wr-book-toggle');
      patch(trigger, 'role', 'button'); patch(trigger, 'tabindex', '0');
      patch(trigger, 'aria-expanded', bookCards(trigger).every(card => accordionStates.get(card)));
    });
  }
  function enhanceAttachments() {
    if (/^\/attachment\//.test(location.pathname)) {
      const app = [...document.querySelectorAll('#bookapproot *')].find(e => e.tagName.startsWith('APP-') && e.querySelector('table'));
      if (app) { mark(app, 'wr-attachment-page'); enhanceTables(app); }
    }
    // Group existing ID and caption visually, keeping their order and original actions.
    document.querySelectorAll('.modal').forEach(modal => {
      if (modal.querySelector('a[href^="/attachment/"]')) mark(modal, 'wr-table-modal');
    });
  }
  function updateCurrent() {
    frame = 0;
    if (!active() || !entries.length) return;
    const visible = entries.filter(e => e.target.isConnected);
    let entry = visible[0];
    for (const candidate of visible) {
      if (candidate.target.getBoundingClientRect().top <= 110) entry = candidate;
    }
    if (!entry || entry === lastActive) return;
    if (lastActive?.button) { lastActive.button.classList.remove('wr-current'); lastActive.button.removeAttribute('aria-current'); }
    mark(entry.button, 'wr-current'); patch(entry.button, 'aria-current', 'location');
    const group = entry.button.closest('.wr-nav-children');
    if (group?.hidden) setGroup(group, true);
    mark(entry.button, 'wr-nav-target'); lastActive = entry;
  }
  function savePosition() {
    if (!active()) return;
    try { sessionStorage.setItem(`wr-position:${location.pathname}`, JSON.stringify({ y: scrollY, at: Date.now() })); } catch {}
  }
  let restorePending = false;
  function restorePosition() {
    if (!restorePending || !active()) return;
    try {
      const value = JSON.parse(sessionStorage.getItem(`wr-position:${location.pathname}`) || 'null');
      if (!value || Date.now() - value.at > 4 * 60 * 60 * 1000 || location.hash) { restorePending = false; return; }
      if (document.documentElement.scrollHeight >= value.y + innerHeight - 2) {
        scrollTo({ top: value.y, behavior: 'instant' }); restorePending = false;
      }
    } catch { restorePending = false; }
  }
  function apply() {
    timer = null;
    observer.disconnect();
    try {
      if (currentPath !== location.pathname) {
        reset(); currentPath = location.pathname;
      }
      if (!active()) { reset(); return; }
      prune(); stylePreferences(); enhanceArticle(); enhanceChapters(); syncBookToggles(); enhanceAttachments();
      restorePosition();
    } finally { observer.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(apply, 100); }
  function jump(entry) {
    entry.target.scrollIntoView({ block: 'start', behavior: 'instant' });
    patch(entry.target, 'tabindex', '-1'); entry.target.focus({ preventScroll: true });
    updateCurrent();
  }
  function setGroup(children, open) {
    children.hidden = !open;
    const disclosure = children.parentElement.querySelector('.wr-disclosure');
    disclosure.setAttribute('aria-expanded', String(open)); disclosure.textContent = open ? '−' : '+';
  }
  function activate(event) {
    if (!active()) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const book = target.closest('.wr-book-toggle');
    if (book && !target.closest('a[href],input,select,textarea')) {
      event.preventDefault(); event.stopImmediatePropagation();
      const cards = bookCards(book), open = !cards.every(card => accordionStates.get(card));
      cards.forEach(card => setAccordion(card, open)); syncBookToggles(); return;
    }
    const disclosure = target.closest('.wr-disclosure');
    if (disclosure) {
      event.preventDefault(); event.stopImmediatePropagation();
      const children = disclosure.parentElement.nextElementSibling;
      setGroup(children, children.hidden); return;
    }
    const card = target.closest('.wr-chapters .wr-card');
    if (card && target.closest('.accordion-toggle')) {
      event.preventDefault(); event.stopImmediatePropagation();
      setAccordion(card, !accordionStates.get(card)); syncBookToggles(); return;
    }
    const entry = entries.find(e => e.button === target || e.button.contains(target));
    if (entry) { event.preventDefault(); event.stopImmediatePropagation(); jump(entry); }
  }
  document.addEventListener('click', activate, true);
  document.addEventListener('keydown', activate, true);
  document.addEventListener('click', event => {
    // Let the site's original font handler run, and honor its displayed pixel value.
    const fontControl = event.target.closest?.('app-chaptercontent a.smallfonttxt, app-chaptercontent a.mediumfonttxt, app-chaptercontent a.largefonttxt');
    if (active() && fontControl) {
      const font = Number(fontControl.getAttribute('title'));
      if (font >= 10 && font <= 24) {
        const next = { ...prefs, font }; setPrefs(next);
        if (typeof chrome !== 'undefined') chrome.storage?.local?.set?.({ readerPrefs: next });
      }
    }
    const a = event.target.closest?.('a[href]');
    if (a && a.origin === ORIGIN) savePosition();
    schedule(); // SPA navigation may change the URL without replacing the document.
  });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateCurrent); }, { passive: true });
  addEventListener('pagehide', savePosition);
  addEventListener('popstate', () => { restorePending = true; schedule(); });
  addEventListener('pageshow', e => { if (e.persisted) { restorePending = true; schedule(); } });
  addEventListener('wheel', () => { restorePending = false; }, { passive: true });
  addEventListener('touchstart', () => { restorePending = false; }, { passive: true });
  const number = (v, fallback, min, max) => Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback;
  function setPrefs(value) {
    const s = value || {};
    prefs = { enabled: s.enabled !== false, font: number(s.font,18,10,24), width: number(s.width,76,64,90), leading: number(s.leading,1.7,1.5,1.9) };
    schedule();
  }
  observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  const back = performance.getEntriesByType?.('navigation')[0]?.type === 'back_forward';
  restorePending = !!back;
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get('readerPrefs', data => setPrefs(data.readerPrefs));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.readerPrefs) setPrefs(changes.readerPrefs.newValue);
    });
  } else setPrefs(DEFAULTS);
})();
