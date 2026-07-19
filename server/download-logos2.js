const fs = require('fs');
const path = require('path');

const downloads = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Domino%27s_pizza_logo.svg', dest: '../client/public/assets/dominos_logo.svg' },
  { url: 'https://upload.wikimedia.org/wikipedia/en/9/91/Barbeque_Nation_logo.png', dest: '../client/public/assets/bbq_logo.png' },
  { url: 'https://upload.wikimedia.org/wikipedia/en/4/47/La_Pino%27z_Pizza_logo.png', dest: '../client/public/assets/lapinoz_logo.png' }
];

async function download(url, dest) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
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
