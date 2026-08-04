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
        'User-Agent': 'NodeJS-Verification-Script'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          body: body
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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  try {
    console.log('1. Getting Mail.gw domain...');
    const domainsRes = await makeRequest('https://api.mail.gw/domains', 'GET');
    const domainsData = JSON.parse(domainsRes.body);
    const domain = domainsData['hydra:member'][0].domain;
    console.log('Domain picked:', domain);

    const randomUser = 'kvdb_' + Math.random().toString(36).substring(2, 10);
    const email = `${randomUser}@${domain}`;
    const password = 'VerySecurePassword123!';
    console.log('Temporary Email:', email);

    console.log('2. Creating Mail.gw account...');
    const accRes = await makeRequest('https://api.mail.gw/accounts', 'POST', {
      'Content-Type': 'application/json'
    }, { address: email, password: password });
    
    if (!accRes.ok) {
      throw new Error(`Failed to create mail.gw account (Status ${accRes.statusCode}): ` + accRes.body);
    }
    console.log('Account created.');

    console.log('3. Fetching auth token...');
    const tokenRes = await makeRequest('https://api.mail.gw/token', 'POST', {
      'Content-Type': 'application/json'
    }, { address: email, password: password });
    
    const tokenData = JSON.parse(tokenRes.body);
    const token = tokenData.token;
    console.log('JWT Token retrieved.');

    console.log('4. Registering bucket on KVDB...');
    const kvdbRegisterData = `email=${encodeURIComponent(email)}`;
    const kvdbRes = await makeRequest('https://kvdb.io/', 'POST', {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(kvdbRegisterData)
    }, kvdbRegisterData);

    const bucketId = kvdbRes.body.trim();
    console.log('New Bucket ID created:', bucketId);

    console.log('5. Waiting for KVDB verification email (polling Mail.gw)...');
    let activationUrl = null;

    for (let i = 0; i < 20; i++) {
      await delay(3000);
      console.log(`Polling try ${i+1}...`);
      const msgRes = await makeRequest('https://api.mail.gw/messages', 'GET', {
        'Authorization': `Bearer ${token}`
      });

      const msgData = JSON.parse(msgRes.body);
      const messages = msgData['hydra:member'];
      if (messages.length > 0) {
        console.log('Email received! Fetching email body...');
        const msgId = messages[0].id;
        const msgDetailRes = await makeRequest(`https://api.mail.gw/messages/${msgId}`, 'GET', {
          'Authorization': `Bearer ${token}`
        });
        
        const emailDetail = JSON.parse(msgDetailRes.body);
        const html = emailDetail.html[0];
        
        // Extract link starting with https://kvdb.io/activate/
        const match = html.match(/https:\/\/kvdb\.io\/activate\/[a-zA-Z0-9]+/);
        if (match) {
          activationUrl = match[0];
          break;
        }
      }
    }

    if (!activationUrl) {
      throw new Error('Activation link not found in emails.');
    }

    console.log('6. Requesting activation URL to verify bucket:', activationUrl);
    const activateRes = await makeRequest(activationUrl, 'GET');
    console.log('Activation response status:', activateRes.statusCode);
    console.log('Response body:', activateRes.body);

    console.log('\n🎉 SUCCESS! Verified Bucket ID is:', bucketId);
  } catch (err) {
    console.error('Error in automation:', err);
  }
}

run();
