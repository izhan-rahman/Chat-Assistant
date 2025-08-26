require('dotenv').config();
console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Import service modules
const { getStaticAnswer } = require('./services/staticFaq');
const { getLiveDataAnswer } = require('./services/liveData');
const { getChatGPTResponse } = require('./services/gptApi');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// Add this route to serve the demo page
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../demo/index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// Main chat endpoint with modular response handling
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const userId = req.body.userId || null; // Future: get from authentication
    
    let response = null;

    // Priority 1: Try live data integration (future)
    if (userId) {
      response = await getLiveDataAnswer(userId, userMessage);
    }

    // Priority 2: Try ChatGPT 4.0 integration (future)
    if (!response) {
      response = await getChatGPTResponse(userMessage, { userId });
    }

    // Priority 3: Fallback to static FAQ (current working system)
    if (!response) {
      response = getStaticAnswer(userMessage);
    }

    // Ensure response has proper structure
    if (!response || !response.answer) {
      response = {
        answer: "I'm sorry, I couldn't understand that. Please contact our support team.",
        links: [{ text: 'Contact Support', url: 'https://caviaarmode.com/contact' }]
      };
    }

    res.json({ 
      reply: response.answer,
      links: response.links || []
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      reply: 'Sorry, there was an error processing your request.',
      links: [{ text: 'Contact Support', url: 'https://caviaarmode.com/contact' }]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
