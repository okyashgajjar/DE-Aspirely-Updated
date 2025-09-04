// Voice Assistant JavaScript
// Handles Web Speech API integration and voice interactions

let recognition = null;
let synthesis = null;
let isListening = false;
let isSpeaking = false;

// Initialize voice assistant
function initVoice() {
    // Check if user is logged in
    if (!Utils.requireAuth()) return;

    // Check browser support
    if (!checkBrowserSupport()) {
        showUnsupportedMessage();
        return;
    }

    // Initialize speech recognition and synthesis
    initSpeechRecognition();
    initSpeechSynthesis();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup animations
    setupVoiceAnimations();
}

// Check browser support for Web Speech API
function checkBrowserSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Show unsupported message
function showUnsupportedMessage() {
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (voiceStatus) {
        voiceStatus.innerHTML = `
            <div class="status-icon">⚠️</div>
            <div class="status-text">Voice features not supported in this browser</div>
        `;
    }
    
    if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.innerHTML = `
            <div class="mic-icon">🚫</div>
            <span>Not Supported</span>
        `;
    }
}

// Initialize speech recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            updateVoiceStatus('Listening...', 'listening');
            animateMicButton(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleVoiceInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            Utils.showNotification('Speech recognition error: ' + event.error, 'error');
            stopListening();
        };

        recognition.onend = () => {
            isListening = false;
            updateVoiceStatus('Click to start speaking', 'idle');
            animateMicButton(false);
        };
    }
}

// Initialize speech synthesis
function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
        synthesis = window.speechSynthesis;
    }
}

// Setup event listeners
function setupEventListeners() {
    const voiceBtn = document.getElementById('voiceBtn');
    const clearBtn = document.getElementById('clearTranscript');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const voiceSpeed = document.getElementById('voiceSpeed');
    const voicePitch = document.getElementById('voicePitch');

    // Voice button
    if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleListening);
    }

    // Clear transcript
    if (clearBtn) {
        clearBtn.addEventListener('click', clearTranscript);
    }

    // Suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            handleVoiceInput(query);
        });
    });

    // Voice speed control
    if (voiceSpeed) {
        voiceSpeed.addEventListener('input', (e) => {
            const speedValue = document.getElementById('speedValue');
            if (speedValue) {
                speedValue.textContent = e.target.value + 'x';
            }
        });
    }

    // Voice pitch control
    if (voicePitch) {
        voicePitch.addEventListener('input', (e) => {
            const pitchValue = document.getElementById('pitchValue');
            if (pitchValue) {
                pitchValue.textContent = e.target.value;
            }
        });
    }
}

// Toggle listening state
function toggleListening() {
    if (!recognition) return;

    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Start listening
function startListening() {
    if (recognition && !isListening) {
        try {
            recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            Utils.showNotification('Error starting voice recognition', 'error');
        }
    }
}

// Stop listening
function stopListening() {
    if (recognition && isListening) {
        recognition.stop();
    }
}

// Handle voice input
function handleVoiceInput(transcript) {
    addTranscriptMessage(transcript, 'user');
    
    // Get response from chatbot logic
    const response = getVoiceResponse(transcript);
    
    // Add bot response to transcript
    addTranscriptMessage(response.text, 'bot');
    
    // Speak the response
    speakText(response.text);
    
    // Show suggestions if available
    if (response.suggestions) {
        showVoiceSuggestions(response.suggestions);
    }
}

// Get voice response (reuse chat logic)
function getVoiceResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('role') || lowerInput.includes('job') || lowerInput.includes('position')) {
        return {
            text: "Based on your profile, I found several roles that match your skills. Frontend Developer has a 95% match, Full Stack Developer has 88%, and React Developer has 92%. Would you like me to show you the details for any of these positions?",
            suggestions: ['Show Frontend Developer details', 'Show Full Stack Developer details', 'What skills do I need to improve?']
        };
    } else if (lowerInput.includes('skill') || lowerInput.includes('missing') || lowerInput.includes('gap')) {
        return {
            text: "Looking at your current skills and target roles, I recommend focusing on GraphQL, Docker, and AWS. These are high-demand skills that would increase your job match percentage significantly. Would you like me to suggest specific courses for these skills?",
            suggestions: ['Show GraphQL courses', 'Show Docker courses', 'Create learning plan']
        };
    } else if (lowerInput.includes('interview') || lowerInput.includes('prepare') || lowerInput.includes('practice')) {
        return {
            text: "Great! Let's prepare you for technical interviews. I recommend practicing coding challenges, reviewing system design concepts, and preparing for behavioral questions. What type of interview would you like to practice?",
            suggestions: ['Frontend technical interview', 'System design interview', 'Behavioral questions']
        };
    } else if (lowerInput.includes('salary') || lowerInput.includes('pay') || lowerInput.includes('money')) {
        return {
            text: "Based on current market trends, Frontend Developers earn between $90k to $150k, Full Stack Developers earn $100k to $160k, and React Developers earn $85k to $140k. Your location and experience level will affect these ranges. Would you like to see detailed salary breakdowns?",
            suggestions: ['Show salary breakdown', 'Compare salaries by location', 'Salary negotiation tips']
        };
    } else {
        return {
            text: "I'm here to help with your career development! I can assist with finding job opportunities, identifying skill gaps, interview preparation, career transitions, and salary information. What would you like to know more about?",
            suggestions: ['Find roles that match my skills', 'What skills am I missing?', 'Help me prepare for interviews', 'Tell me about salary trends']
        };
    }
}

// Add message to transcript
function addTranscriptMessage(message, type) {
    const transcriptContent = document.getElementById('transcriptContent');
    if (!transcriptContent) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `transcript-message ${type}-message`;
    
    const avatar = type === 'user' ? '👤' : '🤖';
    const messageClass = type === 'user' ? 'user-message' : 'bot-message';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-text">${message}</div>
    `;

    transcriptContent.appendChild(messageDiv);
    scrollToBottom(transcriptContent);

    // Animate in
    gsap.fromTo(messageDiv, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
}

// Speak text using speech synthesis
function speakText(text) {
    if (!synthesis || isSpeaking) return;

    // Stop any current speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get voice settings
    const speed = document.getElementById('voiceSpeed')?.value || 1;
    const pitch = document.getElementById('voicePitch')?.value || 1;
    
    utterance.rate = parseFloat(speed);
    utterance.pitch = parseFloat(pitch);
    utterance.volume = 0.8;

    utterance.onstart = () => {
        isSpeaking = true;
        updateVoiceStatus('Speaking...', 'speaking');
    };

    utterance.onend = () => {
        isSpeaking = false;
        updateVoiceStatus('Click to start speaking', 'idle');
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        isSpeaking = false;
        updateVoiceStatus('Click to start speaking', 'idle');
    };

    synthesis.speak(utterance);
}

// Update voice status
function updateVoiceStatus(text, status) {
    const statusText = document.querySelector('.status-text');
    const statusIcon = document.querySelector('.status-icon');
    
    if (statusText) {
        statusText.textContent = text;
    }
    
    if (statusIcon) {
        const icons = {
            idle: '🎤',
            listening: '🔴',
            speaking: '🔊',
            error: '⚠️'
        };
        statusIcon.textContent = icons[status] || '🎤';
    }
}

// Animate microphone button
function animateMicButton(listening) {
    const micIcon = document.querySelector('.mic-icon');
    if (!micIcon) return;

    if (listening) {
        gsap.to(micIcon, {
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out",
            yoyo: true,
            repeat: -1
        });
    } else {
        gsap.to(micIcon, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    }
}

// Show voice suggestions
function showVoiceSuggestions(suggestions) {
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    suggestions.forEach((suggestion, index) => {
        if (suggestionChips[index]) {
            suggestionChips[index].textContent = suggestion;
            suggestionChips[index].setAttribute('data-query', suggestion);
        }
    });

    // Animate suggestions
    gsap.fromTo(suggestionChips,
        { opacity: 0, scale: 0.8 },
        { 
            opacity: 1, 
            scale: 1, 
            duration: 0.3, 
            stagger: 0.1,
            ease: "back.out(1.7)"
        }
    );
}

// Clear transcript
function clearTranscript() {
    const transcriptContent = document.getElementById('transcriptContent');
    if (transcriptContent) {
        transcriptContent.innerHTML = `
            <div class="transcript-message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-text">Hello! I'm your voice assistant. You can ask me about career advice, job recommendations, or skill development. Just click the microphone and start speaking!</div>
            </div>
        `;
    }
}

// Scroll to bottom
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// Setup animations
function setupVoiceAnimations() {
    // Animate voice header
    const voiceHeader = document.querySelector('.voice-header');
    if (voiceHeader) {
        gsap.fromTo(voiceHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate voice interface
    const voiceInterface = document.querySelector('.voice-interface');
    if (voiceInterface) {
        gsap.fromTo(voiceInterface,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
    }

    // Animate voice button
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        gsap.fromTo(voiceBtn,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, delay: 0.4, ease: "back.out(1.7)" }
        );
    }

    // Animate suggestions
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    if (suggestionChips.length > 0) {
        gsap.fromTo(suggestionChips,
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                delay: 0.6,
                ease: "power2.out"
            }
        );
    }

    // Animate settings
    const voiceSettings = document.querySelector('.voice-settings');
    if (voiceSettings) {
        gsap.fromTo(voiceSettings,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: "power2.out" }
        );
    }
}

// Initialize voice assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', initVoice);
