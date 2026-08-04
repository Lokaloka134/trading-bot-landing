const https = require('https');

function makeRequest(url, method, headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        ...headers,
        'User-Agent': 'NodeJS-Test-Script'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('1. Creating object on restful-api.dev...');
    const createData = {
      name: 'tx_test_123',
      data: {
        status: 'pending',
        userName: 'Prince Test'
      }
    };
    const createRes = await makeRequest('https://api.restful-api.dev/objects', 'POST', {
      'Content-Type': 'application/json'
    }, createData);

    console.log('Create Status:', createRes.statusCode);
    console.log('Create Body:', createRes.body);
    
    const obj = JSON.parse(createRes.body);
    const objId = obj.id;
    console.log('Generated Object ID:', objId);

    console.log('\n2. Reading object back...');
    const readRes = await makeRequest(`https://api.restful-api.dev/objects/${objId}`, 'GET');
    console.log('Read Status:', readRes.statusCode);
    console.log('Read Body:', readRes.body);

    console.log('\n3. Updating object (PUT)...');
    const updateData = {
      name: 'tx_test_123',
      data: {
        status: 'approved',
        userName: 'Prince Test'
      }
    };
    const updateRes = await makeRequest(`https://api.restful-api.dev/objects/${objId}`, 'PUT', {
      'Content-Type': 'application/json'
    }, updateData);
    
    console.log('Update Status:', updateRes.statusCode);
    console.log('Update Body:', updateRes.body);

    console.log('\n4. Reading updated object back...');
    const readUpdatedRes = await makeRequest(`https://api.restful-api.dev/objects/${objId}`, 'GET');
    console.log('Read Updated Status:', readUpdatedRes.statusCode);
    console.log('Read Updated Body:', readUpdatedRes.body);

  } catch (e) {
    console.error('Error:', e);
  }
}

run();
