import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('keys.json','utf8'));
const keys = data.Contents.map(o => o.Key);

// Keep only .ssc/.sm keys
const charts = keys.filter(k => k.endsWith('.ssc') || k.endsWith('.sm'));

// Prefer .ssc if both exist in same folder
const byFolder = new Map();
for (const key of charts) {
  const folder = key.slice(0, key.lastIndexOf('/')); // Songs/Pack/Song
  const prev = byFolder.get(folder);
  if (!prev || key.endsWith('.ssc')) byFolder.set(folder, key);
}

// Build entries: pack=2nd segment, song=3rd segment
const entries = [];
for (const [folder, chartKey] of byFolder.entries()) {
  const parts = folder.split('/');
  const pack = parts[1];
  const song = parts[2];
  const urlBase = `https://smfiles-smedit.s3.us-east-2.amazonaws.com/`;
  const url = urlBase + encodeURI(chartKey);
  const entry = { pack, song };
  if (chartKey.endsWith('.ssc')) entry.ssc = url; else entry.sm = url;
  entries.push(entry);
}

entries.sort((a,b) => (a.pack.localeCompare(b.pack) || a.song.localeCompare(b.song)));
fs.writeFileSync('songs.json', JSON.stringify(entries, null, 2));
console.log(`Wrote songs.json with ${entries.length} entries`);
