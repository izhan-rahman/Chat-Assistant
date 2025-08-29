// public/chat.js

const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
});
const data = await res.json();

// use data.answer







const chatDiv = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function appendMessage(content, className) {
  const msg = document.createElement('div');
  msg.className = `message ${className}`;
  msg.textContent = content;
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function appendLoadingMessage() {
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.id = 'loading';
  msg.textContent = 'Assistant is typing...';
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return msg;
}

function removeLoadingMessage() {
  const loading = document.getElementById('loading');
  if (loading) loading.remove();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  userInput.value = '';
  appendLoadingMessage();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    removeLoadingMessage();

    if (!response.ok) {
      appendMessage('Server error. Please try again.', 'bot');
      return;
    }

    const data = await response.json();
    appendMessage(data.reply, 'bot');
  } catch (error) {
    removeLoadingMessage();
    appendMessage('Connection error. Check your internet.', 'bot');
    console.error('Chat error:', error);
  }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

window.addEventListener('load', () => {
  userInput.focus();
  appendMessage("Hi! I'm your fashion shopping assistant. Ask me about products, styles, or get buying advice!", 'bot');
});
