const https = require('https');

function makeRequest(url, method) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-Verification-Script'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function run() {
  try {
    console.log('1. Fetching App Key...');
    const keyRes = await makeRequest('https://keyvalue.immanuel.co/api/KeyVal/GetAppKey', 'GET');
    console.log('GetAppKey Status:', keyRes.statusCode);
    const appKey = JSON.parse(keyRes.body);
    console.log('App Key:', appKey);

    console.log('2. Writing value...');
    const writeUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${appKey}/test_key/hello_world`;
    const writeRes = await makeRequest(writeUrl, 'POST');
    console.log('UpdateValue Status:', writeRes.statusCode);
    console.log('UpdateValue Body:', writeRes.body);

    console.log('3. Reading value...');
    const readUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${appKey}/test_key`;
    const readRes = await makeRequest(readUrl, 'GET');
    console.log('GetValue Status:', readRes.statusCode);
    console.log('GetValue Body:', readRes.body);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
