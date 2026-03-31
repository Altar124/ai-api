import axios from 'axios';
import { v4 } from 'uuid';

async function jailbreak(ask) {
    const user_id = 'guest_' + v4();
    
    const payload = {
        user_id,
        user_level: 'free',
        model: 'gpt-4o',
        messages: [{
            role: "user",
            content: ask
        }],
        prompt: '',
        temperature: 0.8,
        enableWebSearch: false,
        usedVoiceInput: false
    };

    const { data } = await axios.post(
        'https://chat.hackaigc.com/api/chat',
        payload,
        {
            headers: {
                "Authorization": `Bearer ${user_id}`, // ✅ FIXED
                "Referer": "https://chat.hackaigc.com/"
            }
        }
    ).catch(e => e.response);

    if (!data) return false;
    return data;
}

const result = await jailbreak("tools hacking");
console.log(result);
