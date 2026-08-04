const https = require('https');

const options = {
  hostname: 'www.jsonstore.io',
  path: '/get-token',
  method: 'GET'
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
