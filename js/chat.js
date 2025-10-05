// chat.js
const chatBox = document.getElementById('chatBox');

function sendMessage() {
    const message = document.getElementById('userMessage').value.trim();
    if (!message) return;

    appendMessage('You', message);
    document.getElementById('userMessage').value = '';

    // Dummy AI response
    setTimeout(() => {
        const aiResponse = getAIResponse(message);
        appendMessage('Aspirely', aiResponse);
    }, 500);
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(sender === 'You' ? 'msg-user' : 'msg-ai');
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getAIResponse(message) {
    const responses = {
        'python': 'You have strong Python skills. Consider backend or data science roles.',
        'javascript': 'You have good JavaScript skills. Frontend or fullstack roles suit you.',
        'default': 'Interesting! Aspirely suggests exploring career paths related to your question.'
    };
    message = message.toLowerCase();
    if (message.includes('python')) return responses.python;
    if (message.includes('javascript')) return responses.javascript;
    return responses.default;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'userMessage') {
        sendMessage();
    }
});
