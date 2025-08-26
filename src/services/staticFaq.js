const fs = require('fs');
const path = require('path');

// Load questions data
const questionsFilePath = path.join(__dirname, '../../data/questions.json');
const questionsData = JSON.parse(fs.readFileSync(questionsFilePath, 'utf-8'));

// Keywords categories to identify issues
const categories = [
  {
    name: 'order',
    keywords: ['order', 'tracking', 'track', 'purchase', 'shipment', 'delivery'],
  },
  {
    name: 'payment',
    keywords: ['payment', 'pay', 'billing', 'invoice', 'card', 'paypal'],
  },
  {
    name: 'return',
    keywords: ['return', 'refund', 'exchange', 'replace', 'cancel'],
  },
  {
    name: 'shipping',
    keywords: ['shipping', 'ship', 'delivery', 'logistics', 'carrier'],
  }
];

// Customer care fallback response
const customerCareResponse = {
  answer: 'For further assistance, please contact our Customer Care at +1-800-123-4567.',
  links: [
    { text: 'Contact Support', url: 'https://caviaarmode.com/contact' },
  ]
};

function containsKeywords(text, keywords) {
  text = text.toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

function getStaticAnswer(userQuestion) {
  const text = userQuestion.toLowerCase();

  // Check for known categories first
  for (const category of categories) {
    if (containsKeywords(text, category.keywords)) {
      // Find matching entries related to this category
      const filtered = questionsData.filter(item =>
        category.keywords.some(k => item.question.toLowerCase().includes(k))
      );
      if (filtered.length) {
        // Choose the best match by keyword overlap
        let maxMatches = 0;
        let bestAnswer = filtered[0];
        for (const item of filtered) {
          const questionWords = item.question.toLowerCase().split(/\W+/);
          const userWords = text.split(/\W+/);
          const commonCount = questionWords.filter(qw => userWords.includes(qw)).length;
          if (commonCount > maxMatches) {
            maxMatches = commonCount;
            bestAnswer = item;
          }
        }
        return { answer: bestAnswer.answer, links: bestAnswer.links || [] };
      }
    }
  }

  // Fallback: try general match from whole database
  let maxMatches = 0;
  let bestAnswer = null;
  const userWords = text.split(/\W+/);

  for (const item of questionsData) {
    const questionWords = item.question.toLowerCase().split(/\W+/);
    const commonCount = questionWords.filter(qw => userWords.includes(qw)).length;
    if (commonCount > maxMatches) {
      maxMatches = commonCount;
      bestAnswer = item;
    }
  }

  // If no meaningful match found, return customer care fallback
  if (!bestAnswer || maxMatches < 1) {
    return customerCareResponse;
  }

  return { answer: bestAnswer.answer, links: bestAnswer.links || [] };
}

module.exports = { getStaticAnswer };
