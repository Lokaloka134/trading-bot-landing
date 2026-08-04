const BUCKET_ID = 'apexscan_pmt_v1_d8923a'; // Unique KVDB bucket ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID || '6286421972';

exports.handler = async (event, context) => {
  // Set CORS headers
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

      const res = await fetch(`https://kvdb.io/${BUCKET_ID}/${txId}`);
      if (!res.ok) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Transaction not found' }) };
      }

      const data = await res.json();
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
      const { name, utr, amount, tgUsername } = body;

      if (!name || !utr || !amount || !tgUsername) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
      }

      // Generate a unique transaction ID
      const txId = 'tx_' + Math.random().toString(36).substring(2, 11);

      // Save pending transaction to KV store
      const pmtData = { status: 'pending', name, utr, amount, tgUsername };
      const kvRes = await fetch(`https://kvdb.io/${BUCKET_ID}/${txId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pmtData)
      });

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

        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
          })
        });

        if (!tgRes.ok) {
          console.error('Failed to notify bot admin:', await tgRes.text());
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
