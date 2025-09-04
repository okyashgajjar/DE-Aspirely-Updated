// Main JavaScript file for Virtual Career Advisor
// Handles common functionality and GSAP animations

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Common utilities
const Utils = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    },

    // Get current user data
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Show loading state
    showLoading(element) {
        if (element) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        }
    },

    // Hide loading state
    hideLoading(element) {
        if (element) {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    },

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
        gsap.to(notification, {
            x: 0,
            duration: 0.3,
            ease: "power2.out"
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            gsap.to(notification, {
                x: '100%',
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }
};

// Animation utilities
const Animations = {
    // Fade in animation
    fadeIn(element, delay = 0) {
        gsap.fromTo(element, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
        );
    },

    // Slide in from left
    slideInLeft(element, delay = 0) {
        gsap.fromTo(element,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.6, delay, ease: "power2.out" }
        );
    },

    // Slide in from right
    slideInRight(element, delay = 0) {
        gsap.fromTo(element,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.6, delay, ease: "power2.out" }
        );
    },

    // Scale in animation
    scaleIn(element, delay = 0) {
        gsap.fromTo(element,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, delay, ease: "back.out(1.7)" }
        );
    },

    // Stagger animation for multiple elements
    staggerIn(elements, delay = 0.1) {
        gsap.fromTo(elements,
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: delay,
                ease: "power2.out"
            }
        );
    },

    // Hover animation for cards
    setupCardHover(cards) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -5,
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }
};

// Home page animations
function initHomeAnimations() {
    // Hero section animations
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    const floatingCards = document.querySelectorAll('.floating-card');

    if (heroTitle) {
        gsap.fromTo(heroTitle, 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
    }

    if (heroDescription) {
        gsap.fromTo(heroDescription,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
        );
    }

    if (heroButtons) {
        gsap.fromTo(heroButtons,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
        );
    }

    // Floating cards animation
    floatingCards.forEach((card, index) => {
        gsap.fromTo(card,
            { opacity: 0, scale: 0.8, rotation: Math.random() * 20 - 10 },
            { 
                opacity: 1, 
                scale: 1, 
                rotation: 0,
                duration: 0.8, 
                delay: 0.6 + (index * 0.1),
                ease: "back.out(1.7)"
            }
        );
    });

    // Features section scroll animations
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
        gsap.fromTo(featureCards,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.features',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Setup hover animations
        Animations.setupCardHover(featureCards);
    }

    // About section animations
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        gsap.fromTo(aboutContent,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.about',
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    console.log('Initializing navigation...', { hamburger, navMenu });

    if (hamburger && navMenu) {
        // Remove any existing event listeners to prevent duplicates
        hamburger.removeEventListener('click', handleHamburgerClick);
        document.removeEventListener('click', handleOutsideClick);
        navMenu.removeEventListener('click', handleNavLinkClick);

        // Add event listeners
        hamburger.addEventListener('click', handleHamburgerClick);
        hamburger.addEventListener('touchend', handleHamburgerClick);
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('touchend', handleOutsideClick);
        navMenu.addEventListener('click', handleNavLinkClick);
        navMenu.addEventListener('touchend', handleNavLinkClick);

        function handleHamburgerClick(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked!');
            
            // Toggle menu
            const isActive = navMenu.classList.contains('active');
            if (isActive) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                // Remove body scroll lock
                document.body.style.overflow = '';
            } else {
                navMenu.classList.add('active');
                hamburger.classList.add('active');
                // Prevent body scroll when menu is open on mobile
                if (window.innerWidth <= 768) {
                    document.body.style.overflow = 'hidden';
                }
            }
            
            console.log('Menu active:', navMenu.classList.contains('active'));
        }

        function handleOutsideClick(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                // Restore body scroll
                document.body.style.overflow = '';
            }
        }

        function handleNavLinkClick(e) {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                // Restore body scroll
                document.body.style.overflow = '';
            }
        }
    } else {
        console.error('Navigation elements not found:', { hamburger, navMenu });
    }

    // Handle window resize to close mobile menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Initializing logout...', { logoutBtn });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout clicked!');
            localStorage.removeItem('currentUser');
            Utils.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    } else {
        console.error('Logout button not found');
    }
}

// Initialize page based on current page
function initPage() {
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    console.log('Initializing page:', currentPage);
    
    // Common initializations
    initNavigation();
    initLogout();
    
    // Re-initialize navigation after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        initNavigation();
    }, 100);

    // Page-specific initializations
    switch (currentPage) {
        case 'index':
        case '':
            initHomeAnimations();
            break;
        case 'dashboard':
            if (typeof initDashboard === 'function') initDashboard();
            break;
        case 'chat':
            if (typeof initChat === 'function') initChat();
            break;
        case 'recommendations':
            if (typeof initRecommendations === 'function') initRecommendations();
            break;
        case 'analytics':
            if (typeof initAnalytics === 'function') initAnalytics();
            break;
        case 'voice':
            if (typeof initVoice === 'function') initVoice();
            break;
        case 'courses':
            if (typeof initCourses === 'function') initCourses();
            break;
        case 'profile':
            if (typeof initProfile === 'function') initProfile();
            break;
        case 'onboarding':
            if (typeof initOnboarding === 'function') initOnboarding();
            break;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);

// Force re-initialize navigation (useful after dynamic content changes)
function reinitNavigation() {
    console.log('Re-initializing navigation...');
    initNavigation();
}

// Export utilities for use in other modules
window.Utils = Utils;
window.Animations = Animations;
window.reinitNavigation = reinitNavigation;
