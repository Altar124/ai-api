/*
*[ HACKAIGC API ]*
> AI With response outside rules 
*- Request by :* Member Tongdev
*- Creator :* Admin Tongdev
*- The Tongdev :*
https://chat.whatsapp.com/GCmAstx0XyLCPQNjaPe7qS?mode=wwt
*/

import axios from 'axios';
import { v4 } from 'uuid';

// @ list model cek di: hackaigc.com

async function jailbreak(ask) {
       const user_id = 'guest_' + v4();
       const playound = {
           user_id,
           user_level: 'free',
           model: 'gpt-4o',
           messages: [{
              role: "user",
              content: ask
       }],
           prompt: '', //bisa di custom kek nya
           temperature: 0.8,
           enableWebSearch: false, // or false
           usedVoiceInput: false // nes taim
    }
    const { data } = await axios.post('https://chat.hackaigc.com/api/chat', playound, {
        headers:  {
             "Bearer": user_id, 
             "Referer": "https://chat.hackaigc.com/"
       }
    }).catch(e => e.response);
   if (!data) return false 
   return data
}

const result = await jailbreak("buatkan tools ddos gacor king");
console.log(result);
