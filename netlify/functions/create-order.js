/**
 * Razorpay Order Creation - Netlify Serverless Function
 * Creates order server-side for secure payment capture
 */

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Netlify env.' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const amount = parseInt(body.amount, 10); // in paise (610 = ₹6.10, 61000 = ₹610)
    const receipt = (body.receipt || 'pp-' + Date.now()).substring(0, 40);

    if (!amount || amount < 100) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid amount' })
      };
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64')
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'INR',
        receipt: receipt,
        notes: body.notes || {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: data.error?.description || 'Razorpay order creation failed' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        orderId: data.id,
        keyId: keyId,
        amount: data.amount,
        currency: data.currency
      })
    };
  } catch (err) {
    console.error('create-order error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
