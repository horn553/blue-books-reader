// Only these runtime files enter the store package.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { zipSync } = require('fflate');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = ['manifest.json', 'reader.js', 'reader.css', 'popup.html', 'popup.css', 'popup.js', 'LICENSE', ...Object.values(manifest.icons)].sort();
const entries = {};
for (const name of files) entries[name] = [new Uint8Array(fs.readFileSync(path.join(root, name))), { mtime: new Date('2026-01-01T00:00:00Z') }];
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const name = 'blue-books-reader-' + manifest.version + '.zip';
const zip = zipSync(entries, { level: 9 });
fs.writeFileSync(path.join(root, 'dist', name), zip);
const hash = crypto.createHash('sha256').update(zip).digest('hex');
fs.writeFileSync(path.join(root, 'dist', name + '.sha256'), hash + '  ' + name + '\n');
console.log(name + ': ' + zip.length + ' bytes; SHA-256 ' + hash);
