/**
 * Submit Order - Netlify Serverless Function
 * Replaces Formspree: saves to Supabase + sends email via Resend
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ORDER_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL;

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

function jsonResponse(status, body) {
  return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function buildOrderPayload(data) {
  const address = [data.address_line1, data.address_line2, data.city, data.district, data.state, data.pincode]
    .filter(Boolean).join(', ');
  return {
    order_id: data.order_id,
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    address: address,
    address_line1: data.address_line1 || '',
    address_line2: data.address_line2 || '',
    city: data.city || '',
    district: data.district || '',
    state: data.state || '',
    pincode: data.pincode || '',
    quantity: parseInt(data.quantity, 10) || 1,
    total_amount: parseInt(data.total_amount, 10) || 0,
    payment_method: data.payment_method || 'cod',
    utm_source: data.utm_source || null,
    utm_medium: data.utm_medium || null,
    utm_campaign: data.utm_campaign || null
  };
}

function buildEmailHtml(order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order</title></head>
<body style="font-family:sans-serif;padding:20px;">
  <h2>New Order: ${order.order_id}</h2>
  <p><strong>Payment:</strong> ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
  <p><strong>Amount:</strong> ₹${order.total_amount}</p>
  <p><strong>Quantity:</strong> ${order.quantity}</p>
  <hr>
  <p><strong>Customer:</strong> ${order.name}</p>
  <p><strong>Phone:</strong> ${order.phone}</p>
  <p><strong>Email:</strong> ${order.email || '-'}</p>
  <hr>
  <p><strong>Address:</strong><br>${order.address.replace(/,/g, ', ')}</p>
  ${order.utm_source ? `<p><strong>UTM:</strong> ${order.utm_source} / ${order.utm_medium || '-'} / ${order.utm_campaign || '-'}</p>` : ''}
</body>
</html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return jsonResponse(500, { error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify env.' });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!data.order_id || !data.name || !data.phone) {
    return jsonResponse(400, { error: 'Missing required fields: order_id, name, phone' });
  }

  const order = buildOrderPayload(data);

  try {
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(order)
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Supabase insert error:', errText);
      return jsonResponse(500, { error: 'Failed to save order' });
    }
  } catch (err) {
    console.error('Supabase error:', err);
    return jsonResponse(500, { error: 'Failed to save order' });
  }

  if (RESEND_API_KEY && ORDER_EMAIL) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ORDER_EMAIL,
          subject: `New Order ${order.order_id} - ₹${order.total_amount}`,
          html: buildEmailHtml(order)
        })
      });
      if (!emailRes.ok) {
        const errData = await emailRes.json();
        console.error('Resend error:', errData);
      }
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return jsonResponse(200, { ok: true });
};
