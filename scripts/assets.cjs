// Original, code-drawn artwork. No publisher marks or third-party assets.
const fs = require('node:fs'), path = require('node:path'), sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const book = '<path d="M29 37 Q46 29 62 39 L62 93 Q46 83 29 91 Z" fill="#fff"/><path d="M66 39 Q82 29 99 37 L99 91 Q82 83 66 93 Z" fill="#cbe7f5"/><path d="M37 46 L54 46 M37 55 L54 55 M37 64 L54 64 M74 46 L91 46 M74 55 L91 55 M74 64 L87 64" stroke="#256184" stroke-width="3" stroke-linecap="round"/>';
const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="16" y="16" width="96" height="96" rx="22" fill="#174a70"/>' + book + '</svg>';
const promo = '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280"><rect width="440" height="280" fill="#103853"/><circle cx="370" cy="40" r="160" fill="#1b5375"/><rect x="198" y="54" width="203" height="179" rx="14" fill="#f6fafc"/><rect x="210" y="69" width="44" height="148" rx="5" fill="#d5e7f0"/><g stroke="#74a5bf" stroke-width="5" stroke-linecap="round"><path d="M221 88 H242 M221 107 H238 M221 126 H240 M221 145 H235"/></g><g stroke="#51768c" stroke-width="5" stroke-linecap="round"><path d="M273 87 H380 M273 111 H380 M273 128 H369 M273 145 H380 M273 177 H380 M273 194 H364"/></g><g transform="translate(20,55) scale(1.5)"><rect x="16" y="16" width="96" height="96" rx="22" fill="#247699"/>' + book + '</g></svg>';
(async () => {
 fs.mkdirSync(path.join(root,'icons'),{recursive:true});
 fs.mkdirSync(path.join(root,'store/assets'),{recursive:true});
 fs.writeFileSync(path.join(root,'store/assets/icon.svg'),icon);
 fs.writeFileSync(path.join(root,'store/assets/promo.svg'),promo);
 for(const size of [16,32,48,128]) await sharp(Buffer.from(icon)).resize(size,size).png().toFile(path.join(root,'icons/icon-'+size+'.png'));
 await sharp(Buffer.from(promo)).png().toFile(path.join(root,'store/assets/promo-440x280.png'));
 console.log('Original icons and 440x280 promo generated.');
})().catch(e=>{console.error(e);process.exitCode=1;});
