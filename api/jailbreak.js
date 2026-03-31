import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { ask } = req.body

    if (!ask) {
      return res.status(400).json({ error: 'ask is required' })
    }

    const user_id = 'guest_' + uuidv4()

    const payload = {
      user_id,
      user_level: 'free',
      model: 'gpt-4o',
      messages: [
        {
          role: "user",
          content: ask
        }
      ],
      prompt: '',
      temperature: 0.8,
      enableWebSearch: false,
      usedVoiceInput: false
    }

    const { data } = await axios.post(
      'https://chat.hackaigc.com/api/chat',
      payload,
      {
        headers: {
          "Bearer": user_id,
          "Referer": "https://chat.hackaigc.com/"
        }
      }
    )

    return res.status(200).json(data)

  } catch (e) {
    return res.status(500).json({
      error: 'Internal Error',
      message: e.message
    })
  }
}
