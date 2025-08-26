const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getChatGPTResponse(message, context = {}) {
  try {
    const prompt = `You are a helpful, courteous shopping assistant for https://caviaarmode.com/, an online fashion store. Answer customer questions about orders, shipping, returns, payments, and product info.If unsure, politely suggest contacting customer support.
     Customer says: "${message}"
   `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful store assistant for  e-commerce platform https://caviaarmode.com/, answering customer questions about orders, shipping, returns, and products." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    const reply = completion.choices?.[0]?.message?.content || "Sorry, I could not get an answer.";
    return { answer: reply, links: [] };
  } catch (error) {
    console.error("GPT API Error:", error.message);
    return null; // Fall back to static answers
  }
}

module.exports = { getChatGPTResponse };
