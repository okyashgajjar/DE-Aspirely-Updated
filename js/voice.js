// voice.js - minimal mic + waveform UI
const micButton = document.getElementById('micButton');
const waveContainer = document.getElementById('waveContainer');
const transcriptText = document.getElementById('transcriptText');
const hintText = document.getElementById('hintText');

let listening = false;
let recognition;

// Build 24 animated bars to mimic waveform
function ensureWaveBars() {
    if (!waveContainer || waveContainer.children.length) return;
    const bars = 24;
    for (let i = 0; i < bars; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.animationDelay = `${(i % 12) * 0.05}s`;
        bar.style.height = `${12 + (i % 6) * 6}px`;
        waveContainer.appendChild(bar);
    }
}

function setListening(state) {
    listening = state;
    if (micButton) micButton.classList.toggle('listening', state);
    if (waveContainer) waveContainer.classList.toggle('listening', state);
    if (hintText) hintText.textContent = state ? 'Listening… tap to stop' : 'Tap the mic and start speaking';
}

// Setup SpeechRecognition if available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
        }
        if (transcriptText) transcriptText.textContent = text.trim();
    };

    recognition.onend = () => setListening(false);
}

// Click handler
if (micButton) {
    ensureWaveBars();
    micButton.addEventListener('click', () => {
        if (!recognition) {
            setListening(true);
            if (transcriptText) transcriptText.textContent = 'Speech API not supported. Showing sample…';
            setTimeout(() => {
                setListening(false);
                if (transcriptText) transcriptText.textContent = 'Sample: "Find remote frontend roles in Bengaluru"';
            }, 1600);
            return;
        }
        if (!listening) {
            setListening(true);
            recognition.start();
        } else {
            recognition.stop();
            setListening(false);
        }
    });
}