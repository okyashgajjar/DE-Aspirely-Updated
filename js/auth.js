// Authentication JavaScript
// Handles login, signup, and demo authentication

// Utils object for authentication pages
const Utils = {
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.to(notification, {
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            notification.style.transform = 'translateX(0)';
        }

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (typeof gsap !== 'undefined') {
                gsap.to(notification, {
                    x: '100%',
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }
                });
            } else {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    },

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }
};

// Demo accounts
const DEMO_ACCOUNTS = {
    'demo@career.ai': {
        password: 'Demo@123',
        name: 'Demo User',
        role: 'user'
    },
    'admin@career.ai': {
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin'
    }
};

// Initialize authentication
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const demoLoginBtn = document.getElementById('demoLogin');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form handling
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        
        // Password confirmation validation
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
        }
    }

    // Demo login button
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', handleDemoLogin);
    }

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }

    // Check if user is already logged in
    if (Utils.isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');

    // Validate credentials
    if (validateCredentials(email, password)) {
        const user = DEMO_ACCOUNTS[email];
        const userData = {
            email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        // Store user session
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Show success message
        Utils.showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        Utils.showNotification('Invalid email or password', 'error');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const terms = formData.get('terms');

    // Validate form
    if (!validateSignupForm(fullName, email, password, confirmPassword, terms)) {
        return;
    }

    // Check if email already exists
    if (DEMO_ACCOUNTS[email]) {
        Utils.showNotification('Email already exists. Please use a different email or try logging in.', 'error');
        return;
    }

    // Create new user
    const userData = {
        email,
        name: fullName,
        role: 'user',
        signupTime: new Date().toISOString()
    };

    // Store user data
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem(`user_${email}`, JSON.stringify({
        fullName,
        email,
        password, // In real app, this would be hashed
        signupTime: new Date().toISOString()
    }));

    // Show success message
    Utils.showNotification('Account created successfully! Redirecting to onboarding...', 'success');
    
    // Redirect to onboarding
    setTimeout(() => {
        window.location.href = 'onboarding.html';
    }, 1000);
}

// Handle demo login
function handleDemoLogin() {
    const email = 'demo@career.ai';
    const password = 'Demo@123';
    
    // Auto-fill form
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
        
        // Trigger form submission
        const form = document.getElementById('loginForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
}

// Validate login credentials
function validateCredentials(email, password) {
    if (!email || !password) {
        return false;
    }

    const user = DEMO_ACCOUNTS[email];
    return user && user.password === password;
}

// Validate signup form
function validateSignupForm(fullName, email, password, confirmPassword, terms) {
    if (!fullName || !email || !password || !confirmPassword) {
        Utils.showNotification('Please fill in all required fields', 'error');
        return false;
    }

    if (!isValidEmail(email)) {
        Utils.showNotification('Please enter a valid email address', 'error');
        return false;
    }

    if (password.length < 6) {
        Utils.showNotification('Password must be at least 6 characters long', 'error');
        return false;
    }

    if (password !== confirmPassword) {
        Utils.showNotification('Passwords do not match', 'error');
        return false;
    }

    if (!terms) {
        Utils.showNotification('Please accept the terms and conditions', 'error');
        return false;
    }

    return true;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        document.getElementById('confirmPassword').style.borderColor = '#ef4444';
        return false;
    } else {
        document.getElementById('confirmPassword').style.borderColor = '#e5e7eb';
        return true;
    }
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;

    let strength = 0;
    let strengthClass = '';
    let strengthLabel = '';

    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    switch (strength) {
        case 0:
        case 1:
            strengthClass = 'weak';
            strengthLabel = 'Weak';
            break;
        case 2:
            strengthClass = 'fair';
            strengthLabel = 'Fair';
            break;
        case 3:
            strengthClass = 'good';
            strengthLabel = 'Good';
            break;
        case 4:
        case 5:
            strengthClass = 'strong';
            strengthLabel = 'Strong';
            break;
    }

    strengthFill.className = `strength-fill ${strengthClass}`;
    strengthText.textContent = strengthLabel;
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);
