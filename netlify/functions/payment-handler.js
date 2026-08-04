const https = require('https');
const BUCKET_ID = 'apexscan_pmt_v1_d8923a'; // Unique KVDB bucket ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID || '6286421972';

// Promise-based HTTPS request helper for maximum compatibility (no external dependencies)
function makeRequest(url, method, headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        ...headers,
        'User-Agent': 'Netlify-Function'
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

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // ----------------------------------------------------
    // GET: Poll Transaction Status
    // ----------------------------------------------------
    if (event.httpMethod === 'GET') {
      const txId = event.queryStringParameters.txId;
      if (!txId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing txId' }) };
      }

      const res = await makeRequest(`https://kvdb.io/${BUCKET_ID}/${txId}`, 'GET');
      if (!res.ok) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Transaction not found' }) };
      }

      const data = JSON.parse(res.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: data.status, txId })
      };
    }

    // ----------------------------------------------------
    // POST: Initiate New Payment Submission
    // ----------------------------------------------------
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      // Support Diagnostics Test Action
      if (body.action === 'test') {
        if (!TELEGRAM_BOT_TOKEN) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN environment variable is not configured in Netlify.' }) };
        }
        
        const tgRes = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, 'POST', {
          'Content-Type': 'application/json'
        }, {
          chat_id: OWNER_CHAT_ID,
          text: `🧪 *ApexScanner Diagnostics* 🧪\n\n` +
            `✅ Connection Status: Active\n` +
            `🤖 Bot Username: @ApexVerifyyyBot\n` +
            `👤 Owner ID: ${OWNER_CHAT_ID}\n\n` +
            `If you received this, your environment variables and webhook configuration are 100% correct!`,
          parse_mode: 'Markdown'
        });

        if (!tgRes.ok) {
          let errMsg = 'Unknown error';
          try {
            const errData = JSON.parse(tgRes.body);
            errMsg = errData.description || 'Unknown error';
          } catch(e) {}
          return { statusCode: 400, headers, body: JSON.stringify({ error: `Telegram Bot API Error: "${errMsg}". Make sure you have opened @ApexVerifyyyBot on Telegram and clicked Start first.` }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Test message sent successfully! Check your Telegram.' }) };
      }

      const { name, utr, amount, tgUsername } = body;

      if (!name || !utr || !amount || !tgUsername) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
      }

      // Generate a unique transaction ID
      const txId = 'tx_' + Math.random().toString(36).substring(2, 11);

      // Save pending transaction to KV store
      const pmtData = { status: 'pending', name, utr, amount, tgUsername };
      const kvRes = await makeRequest(`https://kvdb.io/${BUCKET_ID}/${txId}`, 'POST', {
        'Content-Type': 'application/json'
      }, pmtData);

      if (!kvRes.ok) {
        throw new Error('Failed to save to KV store');
      }

      // If token is configured, alert the admin on Telegram
      if (TELEGRAM_BOT_TOKEN) {
        const text = `🚨 *NEW PAYMENT PENDING* 🚨\n\n` +
          `👤 *Name:* ${name}\n` +
          `🔢 *UTR:* ${utr}\n` +
          `💰 *Amount:* ₹${amount}\n` +
          `📱 *Telegram:* ${tgUsername}\n\n` +
          `Is this transaction real?`;

        const tgRes = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, 'POST', {
          'Content-Type': 'application/json'
        }, {
          chat_id: OWNER_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Yes (Approve)', callback_data: `approve_${txId}` },
                { text: '❌ No (Reject)', callback_data: `reject_${txId}` }
              ]
            ]
          }
        });

        if (!tgRes.ok) {
          console.error('Failed to notify bot admin:', tgRes.body);
        }
      } else {
        console.warn('TELEGRAM_BOT_TOKEN environment variable not set. Alert not sent.');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, txId, status: 'pending' })
      };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };

  } catch (error) {
    console.error('Error in payment-handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
