// Chat JavaScript
// Handles AI chatbot functionality with typing animations

// Mock responses for different queries
const CHAT_RESPONSES = {
    'find roles': {
        response: "Based on your profile, here are some roles that match your skills:\n\n• Frontend Developer (95% match)\n• Full Stack Developer (88% match)\n• React Developer (92% match)\n\nWould you like me to show you detailed job descriptions for any of these roles?",
        suggestions: ['Show Frontend Developer details', 'Show Full Stack Developer details', 'What skills do I need to improve?']
    },
    'skill gaps': {
        response: "Looking at your current skills and target roles, here are the key areas to focus on:\n\n**High Priority:**\n• GraphQL - Required by 60% of your target roles\n• Docker - Essential for modern development\n• AWS - Cloud deployment knowledge\n\n**Medium Priority:**\n• Jest/Testing - Quality assurance skills\n• Next.js - React framework knowledge\n\nWould you like me to recommend specific courses for any of these skills?",
        suggestions: ['Show GraphQL courses', 'Show Docker courses', 'Create learning plan']
    },
    'interview prep': {
        response: "Great! Let's prepare you for technical interviews. Here's a comprehensive approach:\n\n**Technical Questions:**\n• Practice coding challenges on LeetCode\n• Review system design concepts\n• Prepare for behavioral questions\n\n**Mock Interview Options:**\n• Frontend development scenarios\n• Full-stack problem solving\n• System design discussions\n\nWhat type of interview would you like to practice?",
        suggestions: ['Frontend technical interview', 'System design interview', 'Behavioral questions']
    },
    'career change': {
        response: "Career changes can be exciting! Let me help you navigate this transition:\n\n**Assessment Questions:**\n• What's driving your career change?\n• What new field interests you most?\n• What transferable skills do you have?\n\n**Transition Strategy:**\n• Identify skill gaps\n• Build relevant experience\n• Network in the new field\n• Consider side projects\n\nWhat field are you considering transitioning to?",
        suggestions: ['Data Science transition', 'Product Management transition', 'Design transition']
    },
    'default': {
        response: "I'm here to help with your career development! I can assist with:\n\n• Finding job opportunities that match your skills\n• Identifying skill gaps and improvement areas\n• Interview preparation and practice\n• Career transition planning\n• Salary negotiation advice\n• Industry insights and trends\n\nWhat would you like to know more about?",
        suggestions: ['Find roles that match my skills', 'What skills am I missing?', 'Help me prepare for interviews', 'Career change advice']
    }
};

// Initialize chat
function initChat() {
    // Check if user is logged in
    if (!Utils.requireAuth()) return;

    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');

    // Event listeners
    if (messageInput) {
        messageInput.addEventListener('keypress', handleKeyPress);
        messageInput.addEventListener('input', handleInputChange);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Suggestion buttons
    suggestionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            sendMessage(query);
        });
    });

    // Setup animations
    setupChatAnimations();
}

// Handle key press
function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Handle input change
function handleInputChange(e) {
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = !e.target.value.trim();
    }
}

// Send message
function sendMessage(message = null) {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionButtons = document.getElementById('suggestionButtons');
    
    const messageText = message || messageInput.value.trim();
    if (!messageText) return;

    // Clear input
    if (messageInput) {
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input'));
    }

    // Add user message
    addUserMessage(messageText, chatMessages);

    // Hide suggestion buttons
    if (suggestionButtons) {
        gsap.to(suggestionButtons, {
            opacity: 0,
            height: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    // Show typing indicator
    showTypingIndicator(chatMessages);

    // Get bot response after delay
    setTimeout(() => {
        hideTypingIndicator(chatMessages);
        const response = getBotResponse(messageText);
        addBotMessage(response.response, chatMessages);
        
        // Show new suggestions
        if (response.suggestions) {
            showSuggestions(response.suggestions);
        }
    }, 1500);
}

// Add user message
function addUserMessage(message, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;

    container.appendChild(messageDiv);
    scrollToBottom(container);

    // Animate in
    gsap.fromTo(messageDiv, 
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
    );
}

// Add bot message
function addBotMessage(message, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    // Format message with line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>${formattedMessage}</p>
        </div>
    `;

    container.appendChild(messageDiv);
    scrollToBottom(container);

    // Animate in
    gsap.fromTo(messageDiv, 
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
    );
}

// Show typing indicator
function showTypingIndicator(container) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    container.appendChild(typingDiv);
    scrollToBottom(container);

    // Animate in
    gsap.fromTo(typingDiv, 
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
    );
}

// Hide typing indicator
function hideTypingIndicator(container) {
    const typingMessage = container.querySelector('.typing-message');
    if (typingMessage) {
        gsap.to(typingMessage, {
            opacity: 0,
            x: -50,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                typingMessage.remove();
            }
        });
    }
}

// Get bot response
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords
    if (lowerMessage.includes('role') || lowerMessage.includes('job') || lowerMessage.includes('position')) {
        return CHAT_RESPONSES['find roles'];
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('missing') || lowerMessage.includes('gap')) {
        return CHAT_RESPONSES['skill gaps'];
    } else if (lowerMessage.includes('interview') || lowerMessage.includes('prepare') || lowerMessage.includes('practice')) {
        return CHAT_RESPONSES['interview prep'];
    } else if (lowerMessage.includes('change') || lowerMessage.includes('transition') || lowerMessage.includes('switch')) {
        return CHAT_RESPONSES['career change'];
    } else {
        return CHAT_RESPONSES['default'];
    }
}

// Show suggestions
function showSuggestions(suggestions) {
    const suggestionButtons = document.getElementById('suggestionButtons');
    if (!suggestionButtons) return;

    suggestionButtons.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = suggestion;
        btn.setAttribute('data-query', suggestion);
        
        btn.addEventListener('click', () => {
            sendMessage(suggestion);
        });
        
        suggestionButtons.appendChild(btn);
    });

    // Animate in
    gsap.fromTo(suggestionButtons, 
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.3, ease: "power2.out" }
    );
}

// Scroll to bottom
function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

// Setup chat animations
function setupChatAnimations() {
    // Animate chat header
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        gsap.fromTo(chatHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate initial message
    const initialMessage = document.querySelector('.message.bot-message');
    if (initialMessage) {
        gsap.fromTo(initialMessage,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
        );
    }

    // Animate suggestion buttons
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    if (suggestionButtons.length > 0) {
        gsap.fromTo(suggestionButtons,
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                delay: 0.5,
                ease: "power2.out"
            }
        );
    }

    // Animate chat input
    const chatInput = document.querySelector('.chat-input-container');
    if (chatInput) {
        gsap.fromTo(chatInput,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.7, ease: "power2.out" }
        );
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);
