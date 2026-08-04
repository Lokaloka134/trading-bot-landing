const https = require('https');
const BUCKET_ID = 'apexscan_pmt_v1_d8923a';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID || '6286421972';

// Promise-based HTTPS request helper for compatibility (no external dependencies)
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
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const update = JSON.parse(event.body);

    // Check if this is a callback query (button click)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const senderId = callbackQuery.from.id.toString();
      const callbackData = callbackQuery.data; // e.g., 'approve_tx_12345'
      const messageId = callbackQuery.message.message_id;
      const callbackQueryId = callbackQuery.id;

      // Security: Only allow the owner to click buttons
      if (senderId !== OWNER_CHAT_ID) {
        // Send alert back to Telegram client
        await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, 'POST', {
          'Content-Type': 'application/json'
        }, {
          callback_query_id: callbackQueryId,
          text: '🚫 Unauthorized: You are not the administrator.',
          show_alert: true
        });
        return { statusCode: 200, headers, body: 'Unauthorized click' };
      }

      // Parse action and transaction ID
      const isApprove = callbackData.startsWith('approve_');
      const txId = callbackData.replace('approve_', '').replace('reject_', '');

      // Fetch transaction from KV store
      const kvGetUrl = `https://kvdb.io/${BUCKET_ID}/${txId}`;
      const kvRes = await makeRequest(kvGetUrl, 'GET');
      if (!kvRes.ok) {
        await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, 'POST', {
          'Content-Type': 'application/json'
        }, {
          callback_query_id: callbackQueryId,
          text: '❌ Transaction not found or expired.',
          show_alert: true
        });
        return { statusCode: 200, headers, body: 'Transaction not found' };
      }

      const txData = JSON.parse(kvRes.body);
      txData.status = isApprove ? 'approved' : 'rejected';

      // Save updated status back to KV store
      await makeRequest(kvGetUrl, 'POST', {
        'Content-Type': 'application/json'
      }, txData);

      // Answer Telegram to clear loading state
      await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, 'POST', {
        'Content-Type': 'application/json'
      }, {
        callback_query_id: callbackQueryId,
        text: isApprove ? '✅ Approved' : '❌ Rejected'
      });

      // Update Telegram message text to lock it in and remove buttons
      const newText = `🚨 *PAYMENT ACTION REGISTERED* 🚨\n\n` +
        `👤 *Name:* ${txData.name}\n` +
        `🔢 *UTR:* ${txData.utr}\n` +
        `💰 *Amount:* ₹${txData.amount}\n` +
        `📱 *Telegram:* ${txData.tgUsername}\n\n` +
        `-------------------------\n` +
        `📢 *Status:* ${isApprove ? '🟢 APPROVED (Redirected)' : '🔴 REJECTED (Access Denied)'}`;

      await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, 'POST', {
        'Content-Type': 'application/json'
      }, {
        chat_id: OWNER_CHAT_ID,
        message_id: messageId,
        text: newText,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [] } // Clear buttons
      });
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  } catch (error) {
    console.error('Error in telegram-webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
