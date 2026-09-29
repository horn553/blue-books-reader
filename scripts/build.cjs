// Only these runtime files enter the store package.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { zipSync } = require('fflate');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = ['manifest.json', 'reader.js', 'reader.css', 'popup.html', 'popup.css', 'popup.js', 'LICENSE', ...Object.values(manifest.icons)].sort();
const entries = {};
for (const name of files) {
 const raw = fs.readFileSync(path.join(root, name));
 // Normalize checkout line endings and ZIP wall-clock time across Windows/Linux.
 const data = name.endsWith('.png') ? raw : Buffer.from(raw.toString('utf8').replace(/\r\n/g, '\n'));
 entries[name] = [new Uint8Array(data), { mtime: new Date(2026, 0, 1, 0, 0, 0) }];
}
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const name = 'blue-books-reader-' + manifest.version + '.zip';
const zip = zipSync(entries, { level: 9 });
fs.writeFileSync(path.join(root, 'dist', name), zip);
const hash = crypto.createHash('sha256').update(zip).digest('hex');
fs.writeFileSync(path.join(root, 'dist', name + '.sha256'), hash + '  ' + name + '\n');
console.log(name + ': ' + zip.length + ' bytes; SHA-256 ' + hash);
