import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {

  // 🔥 handle GET biar gak crash
  if (req.method === 'GET') {
    return res.status(200).json({
      status: "API RUNNING",
      usage: "POST { ask: 'text' }"
    })
  }

  try {
    const { ask } = req.body || {}

    if (!ask) {
      return res.status(400).json({ error: 'ask is required' })
    }

    const user_id = 'guest_' + uuidv4()

    const { data } = await axios.post(
      'https://chat.hackaigc.com/api/chat',
      {
        user_id,
        user_level: 'free',
        model: 'gpt-4o',
        messages: [{ role: "user", content: ask }],
        prompt: '',
        temperature: 0.8
      },
      {
        headers: {
          "Authorization": `Bearer ${user_id}`, // 🔥 FIX
          "Referer": "https://chat.hackaigc.com/"
        }
      }
    )

    return res.status(200).json(data)

  } catch (e) {
    console.log(e.response?.data || e.message) // 🔥 debug

    return res.status(500).json({
      error: "FAILED",
      message: e.response?.data || e.message
    })
  }
}
