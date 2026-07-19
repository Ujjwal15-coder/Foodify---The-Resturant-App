const fs = require('fs');
const path = require('path');

const downloads = [
  { url: 'https://logo.clearbit.com/dominos.co.in', dest: '../client/public/assets/dominos_logo.png' },
  { url: 'https://logo.clearbit.com/barbequenation.com', dest: '../client/public/assets/bbq_logo.png' },
  { url: 'https://logo.clearbit.com/lapinozpizza.in', dest: '../client/public/assets/lapinoz_logo.png' }
];

async function download(url, dest) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!response.ok) throw new Error(`Failed to get '${url}' (${response.status})`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(path.join(__dirname, dest), buffer);
    console.log(`Successfully downloaded: ${dest}`);
  } catch (error) {
    console.error(`Error downloading ${dest}:`, error.message);
  }
}

async function main() {
  for (const d of downloads) {
    await download(d.url, d.dest);
  }
  console.log('All downloads finished!');
}

main();
