'use strict';
const defaults = { enabled: true, font: 18, width: 76, leading: 1.7 };
const el = id => document.getElementById(id);
function render(s) {
  el('enabled').checked = s.enabled !== false;
  ['font','width','leading'].forEach(k => { el(k).value = s[k]; }); labels();
}
function labels() {
  el('fontValue').textContent = `${el('font').value}px`;
  el('widthValue').textContent = `${Number(el('width').value) * 10}px`;
  el('leadingValue').textContent = `${Number(el('leading').value).toFixed(1)}×`;
}
async function save() {
  labels();
  try {
    await chrome.storage.local.set({ readerPrefs: { enabled: el('enabled').checked, font: +el('font').value, width: +el('width').value, leading: +el('leading').value } });
    el('status').textContent = 'Saved. Applied to supported pages.';
  } catch { el('status').textContent = 'Could not save settings. Please reopen this popup.'; }
}
chrome.storage.local.get('readerPrefs', data => render({ ...defaults, ...data.readerPrefs }));
document.querySelectorAll('input').forEach(input => { input.addEventListener('input', labels); input.addEventListener('change', save); });
el('reset').addEventListener('click', () => { render(defaults); save(); });
