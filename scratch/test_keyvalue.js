const https = require('https');

const options = {
  hostname: 'api.keyvalue.xyz',
  path: '/new',
  method: 'POST',
  headers: {
    'Content-Length': 0
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Body:', body.trim());
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
