const { OpenAI } = require('openai');
const path = require('path');
const faqLinks = require(path.join(__dirname, '../../data/questions.json'));
const siteInfo = require(path.join(__dirname, '../../data/siteInfo.json'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Find best FAQ match by checking if question words appear in user input
function findFAQMatch(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (const faq of faqLinks) {
    if (lowerMsg.includes(faq.question.toLowerCase())) {
      return faq;
    }
  }
  return null;
}

// Format answer as numbered points only if multi-sentence and not a simple greeting
function formatAnswerSmart(text) {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 3);
  const isGreeting = /^(hi|hello|hey|thanks|thank you|goodbye|how can i help)/i.test(sentences[0]?.toLowerCase() || '');

  if (sentences.length <= 2 || isGreeting) {
    // Return plain text for short or greeting responses
    return text.trim();
  }

  // Numbered points for longer, multi-step answers
  return sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
}

async function getChatGPTResponse(message, context = {}) {
  try {
    // 1. Check FAQ first
    const faq = findFAQMatch(message);
    if (faq) {
      return {
        answer: formatAnswerSmart(faq.answer),
        links: faq.links || []
      };
    }

    // 2. If no FAQ, use GPT with site info context
    const systemPrompt = `
You are a helpful assistant for ${siteInfo.siteName}, a fashion e-commerce website.

Site summary: ${siteInfo.pages.home.summary}
About us: ${siteInfo.pages.about.summary}
Contact information: Email - ${siteInfo.contactInfo.email}, Phone - ${siteInfo.contactInfo.phone}
Policies: 
- Terms and Conditions: ${siteInfo.pages.terms.url}
- Privacy Policy: ${siteInfo.pages.privacy.url}
- Cancellation and Refund Policy: ${siteInfo.pages.refund.url}
Shipping info: ${siteInfo.pages.shipping.url}

Respond clearly and concisely, using numbered points if multiple steps or instructions. 
If you cannot provide an answer, suggest contacting customer support kindly as last resort.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    let reply = completion.choices?.[0]?.message?.content || "Sorry, I could not get an answer.";

    reply = formatAnswerSmart(reply);

    // 3. Append customer support links if reply includes such suggestion
    const supportRegex = /support@caviaarmode\.com|\+1-800-123-4567/i;
    const includesSupport = supportRegex.test(reply);
    const links = includesSupport ? [{ text: "Contact Support", url: siteInfo.pages.contact.url }] : [];

    return { answer: reply, links };
  } catch (err) {
    console.error("GPT API error:", err);
    return {
      answer: "Sorry, something went wrong. Please contact support at support@caviaarmode.com or +1-800-123-4567.",
      links: [{ text: "Contact Support", url: siteInfo.pages.contact.url }]
    };
  }
}

module.exports = { getChatGPTResponse };
