// dashboard.js
function renderDashboard() {
    const user = getUserInfo();
    const nameEl = document.getElementById('userName');
    const completionEl = document.getElementById('profileCompletion');
    const progressBar = document.getElementById('profileProgressBar');
    const activityFeed = document.getElementById('activityFeed');

    if (nameEl) nameEl.textContent = user.name || 'Guest';
    if (completionEl || progressBar) {
        const pct = user.completedSteps ? Math.min(100, Math.round(user.completedSteps * 8.33)) : (user.name ? 100 : 0);
        if (completionEl) completionEl.textContent = pct + '%';
        if (progressBar) progressBar.style.width = pct + '%';
    }
    if (activityFeed) {
        const dummy = [
            'Chatted with Aspirely about JS roles',
            'Viewed 5 recommended jobs',
            'Explored salary trends in Analytics',
            'Saved 2 courses to learn list'
        ];
        activityFeed.innerHTML = '';
        dummy.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.className = 'activity-item fade-in';
            activityFeed.appendChild(li);
        });
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

renderDashboard();

// Charts: run after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') return;
    const pieCanvas = document.getElementById('networkPie');
    const barCanvas = document.getElementById('industriesBar');
    if (pieCanvas) {
        new Chart(pieCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Exploring', 'Idle'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(0, 188, 212, 0.8)',
                        'rgba(158, 158, 158, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }
    if (barCanvas) {
        new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Software', 'FinTech', 'EdTech', 'Healthcare', 'E-commerce', 'AI'],
                datasets: [{
                    label: 'Openings',
                    data: [220, 180, 150, 120, 100, 95],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)'
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    // Quick engagement counters (demo values)
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('statApplications', 7);
    setText('statViews', 128);
    setText('statInvites', 3);
    setText('statSaved', 12);
});

