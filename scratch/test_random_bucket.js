const https = require('https');

const data = JSON.stringify({ status: 'pending', name: 'Test' });

// Generate a random 22-character base62 bucket ID
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let randomBucket = '';
for (let i = 0; i < 22; i++) {
  randomBucket += chars.charAt(Math.floor(Math.random() * chars.length));
}

console.log('Testing Bucket:', randomBucket);

const options = {
  hostname: 'kvdb.io',
  path: `/${randomBucket}/test_key`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Body:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
