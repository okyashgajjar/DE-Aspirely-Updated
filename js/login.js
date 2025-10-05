// login.js
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login_email').value.trim();
        const password = document.getElementById('login_password').value.trim();
        if (!email || !password) return;
        // accept demo creds or any non-empty for now
        const name = email.split('@')[0].replace(/\./g, ' ');
        localStorage.setItem('user', JSON.stringify({ name: name || 'User', email, completedSteps: 0, skills: [] }));
        window.location.href = 'dashboard.html';
    });
}

