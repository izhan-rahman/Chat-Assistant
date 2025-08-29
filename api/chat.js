// api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message required" });

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for caviaarmode.com." },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const answer = completion.choices?.?.message?.content || "Sorry, I couldn't answer.";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Chat function error:", err?.response?.data || err?.message || err);
    const status = err?.status === 401 ? 500 : 500;
    const error = err?.status === 401 ? "Invalid API key" : "Server error";
    return res.status(status).json({ error });
  }
}
