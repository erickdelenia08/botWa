import key from '../config.js';
const API_KEY_OPEN_AI=key.API_KEY_OPEN_AI

import OpenAIApi from 'openai';
const openai = new OpenAIApi({apiKey: API_KEY_OPEN_AI});
// const response = await openai.listEngines();

const ChatAIHandler = async (text, msg) => {
    
    const cmd = text.split('/');

    if (cmd.length < 2) {
        return msg.reply('Format Salah. ketik *#ask/your question*');
    }

    msg.reply('sedang diproses, tunggu bentar ya.');

    const question = cmd[1];
    // const response = await ChatGPTRequest(question)
    await ChatGPTRequest(question)

    // if (!response.success) {
    //     return msg.reply(response.message);
    // }

    // return msg.reply(response.data);
}


const ChatGPTRequest = async (text) => {

    const result = {
        success: false,
        data: "Aku gak tau",
        message: "",
    }

    const completion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: text,
        max_tokens: 7,
        temperature: 0,
    });
    console.log(completion);
}

export{
    ChatAIHandler
}