const https = require('https');

const urls = [
  'https://upload.wikimedia.org/wikipedia/en/9/91/Barbeque_Nation_logo.png',
  'https://b.zmtcdn.com/data/brand_creatives/logos/25695029352e89fa9bce7cb7bf77943f_1648011244.png'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${res.statusCode} for ${url}`);
  }).on('error', (e) => {
    console.error(`Error for ${url}: ${e.message}`);
  });
});
