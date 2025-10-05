// Check for demo login
function demoLogin() {
    localStorage.setItem('user', JSON.stringify({ name: 'Demo User', skills: ['Python','JavaScript'], completedSteps: 12 }));
    alert('Logged in as Demo User');
    window.location.href = 'dashboard.html';
}

// Save onboarding step
function saveOnboardingStep(step, data) {
    let user = JSON.parse(localStorage.getItem('user')) || {};
    user[`step${step}`] = data;
    localStorage.setItem('user', JSON.stringify(user));
}

// Get user info
function getUserInfo() {
    return JSON.parse(localStorage.getItem('user')) || {};
}

// Apply top padding equal to navbar height to prevent overlap
function applyNavbarOffset() {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (!header || !main) return;
    const nav = header.querySelector('.navbar');
    if (!nav) return;
    const h = nav.getBoundingClientRect().height;
    main.style.paddingTop = h + 'px';
    document.documentElement.style.setProperty('--asp-nav-height', h + 'px');
    document.body.classList.add('with-fixed-nav');
}

// Swap navbar style after login
function renderNavbarForAuth() {
    const user = getUserInfo();
    const header = document.querySelector('header .navbar');
    if (!header) return;
    // For logged-in users: darker glass and add dashboard links if not present
    if (user && user.name) {
        header.classList.add('navbar-glass');
    } else {
        header.classList.add('navbar-glass');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderNavbarForAuth();
    // Delay to ensure correct height after fonts/layout
    setTimeout(applyNavbarOffset, 50);
    window.addEventListener('resize', applyNavbarOffset);
});

// Home charts initialization
document.addEventListener('DOMContentLoaded', () => {
    const salaryCanvas = document.getElementById('homeSalaryChart');
    const skillsCanvas = document.getElementById('homeSkillsChart');
    const cityCanvas = document.getElementById('homeCityChart');
    if (!salaryCanvas || !skillsCanvas || !cityCanvas || typeof Chart === 'undefined') return;

    const salaryCtx = salaryCanvas.getContext('2d');
    new Chart(salaryCtx, {
        type: 'line',
        data: {
            labels: ['2019','2020','2021','2022','2023'],
            datasets: [{
                label: 'Avg Salary ($k)',
                data: [40, 45, 50, 55, 60],
                borderColor: 'rgba(0, 188, 212, 1)',
                backgroundColor: 'rgba(0, 188, 212, 0.15)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
    });

    const skillsCtx = skillsCanvas.getContext('2d');
    new Chart(skillsCtx, {
        type: 'bar',
        data: {
            labels: ['Python', 'JavaScript', 'UI/UX', 'Data Science'],
            datasets: [{
                label: 'Demand',
                data: [120, 150, 90, 80],
                backgroundColor: 'rgba(33, 150, 243, 0.7)'
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const cityCtx = cityCanvas.getContext('2d');
    new Chart(cityCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR'],
            datasets: [{
                label: 'Jobs Share',
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(0, 188, 212, 0.7)',
                    'rgba(103, 58, 183, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
});
