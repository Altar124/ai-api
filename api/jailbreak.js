export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      status: '✅ API RUNNING',
      endpoint: 'POST /api/jailbreak',
      body: {
        ask: 'string (required)',
        model: 'string (optional)',
        temperature: 'number (optional)'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ask, model = 'gpt-4o', temperature = 0.8 } = req.body || {};

    if (!ask) {
      return res.status(400).json({ error: '❌ Parameter ask wajib diisi' });
    }

    // ✅ Pakai crypto bawaan Node.js, tidak perlu import
    const user_id = 'guest_' + crypto.randomUUID();

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

    // ✅ Pakai fetch bawaan Node.js, tidak perlu axios
    const response = await fetch('https://chat.hackaigc.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user_id}`,
        'Referer': 'https://chat.hackaigc.com/'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || data;

    return res.status(200).json({
      success: true,
      model,
      reply
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message
    });
  }
}
