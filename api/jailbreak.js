import axios from 'axios';
import { v4 } from 'uuid';

export default async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - cek status API
  if (req.method === 'GET') {
    return res.status(200).json({
      status: '✅ API RUNNING',
      endpoint: 'POST /api/chat',
      body: { ask: 'string', model: 'string (optional)' }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ask, model = 'gpt-4o', temperature = 0.8 } = req.body || {};

    if (!ask) {
      return res.status(400).json({ error: '❌ ask is required' });
    }

    const user_id = 'guest_' + v4();

    const payload = {
      user_id,
      user_level: 'free',
      model,
      messages: [{ role: 'user', content: ask }],
      prompt: '',
      temperature,
      enableWebSearch: false,
      usedVoiceInput: false
    };

    const { data } = await axios.post(
      'https://chat.hackaigc.com/api/chat',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${user_id}`,
          'Referer': 'https://chat.hackaigc.com/'
        },
        timeout: 30000
      }
    );

    return res.status(200).json({
      success: true,
      model,
      reply: data?.choices?.[0]?.message?.content || data
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.response?.data || e.message
    });
  }
}
