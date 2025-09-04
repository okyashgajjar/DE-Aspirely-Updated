// Courses JavaScript
// Handles course recommendations and learning paths

// Fallback Utils object in case main.js doesn't load
if (typeof Utils === 'undefined') {
    window.Utils = {
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
        }
    };
}

// Mock course data
const MOCK_COURSES = [
    {
        id: 1,
        title: 'Complete React Developer Course',
        provider: 'Udemy',
        duration: '40 hours',
        difficulty: 'intermediate',
        rating: 4.7,
        price: '$89.99',
        skills: ['React', 'JavaScript', 'CSS'],
        description: 'Master React development from basics to advanced concepts including hooks, context, and testing.',
        category: 'javascript'
    },
    {
        id: 2,
        title: 'GraphQL with React',
        provider: 'Coursera',
        duration: '25 hours',
        difficulty: 'intermediate',
        rating: 4.5,
        price: '$49.99',
        skills: ['GraphQL', 'React', 'Apollo'],
        description: 'Learn to integrate GraphQL with React applications for efficient data fetching.',
        category: 'javascript'
    },
    {
        id: 3,
        title: 'Docker for Developers',
        provider: 'Pluralsight',
        duration: '15 hours',
        difficulty: 'beginner',
        rating: 4.6,
        price: '$29.99',
        skills: ['Docker', 'DevOps', 'Containers'],
        description: 'Containerize your applications with Docker for better deployment and scalability.',
        category: 'devops'
    },
    {
        id: 4,
        title: 'AWS Fundamentals',
        provider: 'AWS Training',
        duration: '30 hours',
        difficulty: 'beginner',
        rating: 4.8,
        price: 'Free',
        skills: ['AWS', 'Cloud Computing', 'DevOps'],
        description: 'Learn the fundamentals of Amazon Web Services and cloud computing.',
        category: 'devops'
    },
    {
        id: 5,
        title: 'JavaScript Testing with Jest',
        provider: 'FreeCodeCamp',
        duration: '20 hours',
        difficulty: 'intermediate',
        rating: 4.4,
        price: 'Free',
        skills: ['Jest', 'Testing', 'JavaScript'],
        description: 'Master unit testing and test-driven development with Jest framework.',
        category: 'javascript'
    },
    {
        id: 6,
        title: 'Python for Data Science',
        provider: 'edX',
        duration: '60 hours',
        difficulty: 'intermediate',
        rating: 4.6,
        price: '$199.99',
        skills: ['Python', 'Data Science', 'Pandas', 'NumPy'],
        description: 'Comprehensive course on Python programming for data science and analysis.',
        category: 'data-science'
    },
    {
        id: 7,
        title: 'Machine Learning Fundamentals',
        provider: 'Coursera',
        duration: '45 hours',
        difficulty: 'advanced',
        rating: 4.7,
        price: '$79.99',
        skills: ['Machine Learning', 'Python', 'Scikit-learn', 'TensorFlow'],
        description: 'Learn the fundamentals of machine learning and artificial intelligence.',
        category: 'machine-learning'
    },
    {
        id: 8,
        title: 'UI/UX Design Principles',
        provider: 'Skillshare',
        duration: '35 hours',
        difficulty: 'beginner',
        rating: 4.5,
        price: '$19.99',
        skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD'],
        description: 'Master the principles of user interface and user experience design.',
        category: 'design'
    },
    {
        id: 9,
        title: 'Advanced TypeScript',
        provider: 'Frontend Masters',
        duration: '28 hours',
        difficulty: 'advanced',
        rating: 4.8,
        price: '$39.99',
        skills: ['TypeScript', 'JavaScript', 'Advanced Types'],
        description: 'Deep dive into advanced TypeScript features and best practices.',
        category: 'javascript'
    },
    {
        id: 10,
        title: 'Node.js Backend Development',
        provider: 'Udemy',
        duration: '50 hours',
        difficulty: 'intermediate',
        rating: 4.6,
        price: '$94.99',
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
        description: 'Build scalable backend applications with Node.js and Express.',
        category: 'javascript'
    },
    {
        id: 11,
        title: 'Vue.js Complete Guide',
        provider: 'Vue Mastery',
        duration: '35 hours',
        difficulty: 'intermediate',
        rating: 4.8,
        price: '$59.99',
        skills: ['Vue.js', 'JavaScript', 'Vuex', 'Vue Router'],
        description: 'Master Vue.js framework for building modern web applications.',
        category: 'javascript'
    },
    {
        id: 12,
        title: 'Angular Fundamentals',
        provider: 'Pluralsight',
        duration: '45 hours',
        difficulty: 'intermediate',
        rating: 4.5,
        price: '$79.99',
        skills: ['Angular', 'TypeScript', 'RxJS', 'Angular CLI'],
        description: 'Learn Angular framework for building enterprise-level applications.',
        category: 'javascript'
    },
    {
        id: 13,
        title: 'SQL Database Design',
        provider: 'Coursera',
        duration: '25 hours',
        difficulty: 'beginner',
        rating: 4.4,
        price: '$49.99',
        skills: ['SQL', 'Database Design', 'MySQL', 'PostgreSQL'],
        description: 'Master SQL and database design principles for data management.',
        category: 'database'
    },
    {
        id: 14,
        title: 'Git & GitHub Mastery',
        provider: 'FreeCodeCamp',
        duration: '15 hours',
        difficulty: 'beginner',
        rating: 4.7,
        price: 'Free',
        skills: ['Git', 'GitHub', 'Version Control', 'Collaboration'],
        description: 'Complete guide to Git version control and GitHub collaboration.',
        category: 'tools'
    },
    {
        id: 15,
        title: 'Web Security Fundamentals',
        provider: 'edX',
        duration: '30 hours',
        difficulty: 'intermediate',
        rating: 4.6,
        price: '$89.99',
        skills: ['Security', 'HTTPS', 'Authentication', 'OWASP'],
        description: 'Learn essential web security practices and vulnerabilities.',
        category: 'security'
    }
];

// Mock learning path data
const LEARNING_PATHS = [
    {
        id: 1,
        title: 'Frontend Developer Path',
        description: 'Complete path to become a professional frontend developer with modern frameworks and tools',
        duration: '6 months',
        difficulty: 'intermediate',
        courses: [1, 2, 5, 8, 9, 11],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Testing', 'UI/UX', 'GraphQL']
    },
    {
        id: 2,
        title: 'Full Stack Developer Path',
        description: 'Master both frontend and backend development with modern technologies',
        duration: '8 months',
        difficulty: 'intermediate',
        courses: [1, 2, 3, 4, 5, 10, 13],
        skills: ['Frontend', 'Backend', 'DevOps', 'Cloud', 'Testing', 'APIs', 'Databases']
    },
    {
        id: 3,
        title: 'Data Scientist Path',
        description: 'Comprehensive data science and machine learning career path',
        duration: '10 months',
        difficulty: 'advanced',
        courses: [6, 7, 4],
        skills: ['Python', 'Data Analysis', 'Machine Learning', 'Cloud', 'Statistics', 'Visualization']
    },
    {
        id: 4,
        title: 'DevOps Engineer Path',
        description: 'Learn infrastructure, automation, and cloud deployment',
        duration: '7 months',
        difficulty: 'intermediate',
        courses: [3, 4],
        skills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Infrastructure', 'Monitoring']
    },
    {
        id: 5,
        title: 'UI/UX Designer Path',
        description: 'Master user interface and user experience design principles',
        duration: '5 months',
        difficulty: 'beginner',
        courses: [8],
        skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research']
    }
];

let filteredCourses = [...MOCK_COURSES];

// Initialize courses
function initCourses() {
    console.log('Initializing courses...');
    
    // Check if Utils is available
    if (typeof Utils === 'undefined') {
        console.error('Utils object not available, retrying in 100ms...');
        setTimeout(initCourses, 100);
        return;
    }
    
    // Check if user is logged in
    if (!Utils.requireAuth()) {
        console.log('User not authenticated, redirecting to login');
        return;
    }

    console.log('User authenticated, proceeding with initialization');

    // Load courses
    console.log('About to load courses...');
    loadCourses();
    
    // Load learning paths
    console.log('About to load learning paths...');
    loadLearningPaths();
    
    // Setup filters
    console.log('About to setup filters...');
    setupFilters();
    
    // Setup animations
    console.log('About to setup animations...');
    setupCoursesAnimations();
}

// Load courses
function loadCourses() {
    const container = document.getElementById('coursesGrid');
    if (!container) {
        console.error('Courses grid container not found!');
        return;
    }

    console.log('Loading courses...', MOCK_COURSES.length);
    container.innerHTML = '';

    // Always show all courses by default
    MOCK_COURSES.forEach((course, index) => {
        const courseCard = createCourseCard(course);
        container.appendChild(courseCard);
        
        // Animate in with stagger
        gsap.fromTo(courseCard, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "power2.out"
            }
        );
    });
}

// Create course card element
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="course-header">
            <h3 class="course-title">${course.title}</h3>
            <div class="course-rating">
                <span class="stars">${'★'.repeat(Math.floor(course.rating))}</span>
                <span class="rating-value">${course.rating}</span>
            </div>
        </div>
        <div class="course-provider">${course.provider}</div>
        <div class="course-meta">
            <span class="duration">${course.duration}</span>
            <span class="difficulty difficulty-${course.difficulty}">${course.difficulty}</span>
            <span class="price">${course.price}</span>
        </div>
        <div class="course-description">${course.description}</div>
        
        <div class="course-skills">
            <h4>Skills Covered:</h4>
            <div class="skills-tags">
                ${course.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="course-actions">
            <button class="btn btn-primary" onclick="enrollInCourse(${course.id})">Enroll Now</button>
            <button class="btn btn-secondary" onclick="viewCourseDetails(${course.id})">View Details</button>
        </div>
    `;

    // Setup hover animation
    if (typeof Animations !== 'undefined' && Animations.setupCardHover) {
        Animations.setupCardHover([card]);
    }

    return card;
}

// Load learning paths
function loadLearningPaths() {
    const container = document.getElementById('learningPath');
    if (!container) {
        console.error('Learning path container not found!');
        return;
    }

    console.log('Loading learning paths...', LEARNING_PATHS.length);
    container.innerHTML = '';

    LEARNING_PATHS.forEach((path, index) => {
        const pathCard = createLearningPathCard(path);
        container.appendChild(pathCard);
        
        // Animate in with stagger
        gsap.fromTo(pathCard, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                delay: index * 0.2,
                ease: "power2.out"
            }
        );
    });
}

// Create learning path card
function createLearningPathCard(path) {
    const card = document.createElement('div');
    card.className = 'learning-path-card';
    
    const courses = path.courses.map(id => 
        MOCK_COURSES.find(course => course.id === id)
    ).filter(Boolean);
    
    card.innerHTML = `
        <div class="path-header">
            <h3 class="path-title">${path.title}</h3>
            <div class="path-meta">
                <span class="duration">${path.duration}</span>
                <span class="difficulty difficulty-${path.difficulty}">${path.difficulty}</span>
            </div>
        </div>
        <div class="path-description">${path.description}</div>
        
        <div class="path-skills">
            <h4>Skills You'll Learn:</h4>
            <div class="skills-tags">
                ${path.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="path-courses">
            <h4>Courses in this path:</h4>
            <div class="course-list">
                ${courses.map(course => 
                    `<div class="course-item">
                        <span class="course-name">${course.title}</span>
                        <span class="course-duration">${course.duration}</span>
                    </div>`
                ).join('')}
            </div>
        </div>
        
        <div class="path-actions">
            <button class="btn btn-primary" onclick="startLearningPath(${path.id})">Start Path</button>
            <button class="btn btn-secondary" onclick="viewPathDetails(${path.id})">View Details</button>
        </div>
    `;

    // Setup hover animation
    if (typeof Animations !== 'undefined' && Animations.setupCardHover) {
        Animations.setupCardHover([card]);
    }

    return card;
}

// Setup filters
function setupFilters() {
    const skillFilter = document.getElementById('skillFilter');
    const levelFilter = document.getElementById('levelFilter');
    const durationFilter = document.getElementById('durationFilter');
    const applyFiltersBtn = document.getElementById('applyCourseFilters');
    const applyPathFiltersBtn = document.getElementById('applyPathFilters');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyCourseFilters);
    }

    if (applyPathFiltersBtn) {
        applyPathFiltersBtn.addEventListener('click', applyPathFilters);
    }
}

// Apply course filters
function applyCourseFilters() {
    console.log('Apply course filters clicked!');
    const skillFilter = document.getElementById('skillFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const durationFilter = document.getElementById('durationFilter').value;

    console.log('Filter values:', { skillFilter, levelFilter, durationFilter });

    filteredCourses = MOCK_COURSES.filter(course => {
        let matches = true;

        if (skillFilter && !course.skills.some(skill => 
            skill.toLowerCase().includes(skillFilter.toLowerCase())
        )) {
            matches = false;
        }

        if (levelFilter && course.difficulty !== levelFilter) {
            matches = false;
        }

        if (durationFilter) {
            const duration = parseInt(course.duration);
            if (durationFilter === 'short' && duration >= 10) matches = false;
            if (durationFilter === 'medium' && (duration < 10 || duration > 30)) matches = false;
            if (durationFilter === 'long' && duration <= 30) matches = false;
        }

        return matches;
    });

    loadCourses();
    Utils.showNotification(`Found ${filteredCourses.length} matching courses`, 'success');
}

// Apply learning path filters
function applyPathFilters() {
    const pathSkillFilter = document.getElementById('pathSkillFilter').value;
    const pathLevelFilter = document.getElementById('pathLevelFilter').value;
    const pathDurationFilter = document.getElementById('pathDurationFilter').value;

    let filteredPaths = LEARNING_PATHS.filter(path => {
        let matches = true;

        if (pathSkillFilter && !path.skills.some(skill => 
            skill.toLowerCase().includes(pathSkillFilter.toLowerCase())
        )) {
            matches = false;
        }

        if (pathLevelFilter && path.difficulty !== pathLevelFilter) {
            matches = false;
        }

        if (pathDurationFilter) {
            const duration = parseInt(path.duration);
            if (pathDurationFilter === 'short' && duration >= 6) matches = false;
            if (pathDurationFilter === 'medium' && (duration < 6 || duration > 8)) matches = false;
            if (pathDurationFilter === 'long' && duration <= 8) matches = false;
        }

        return matches;
    });

    // Update learning paths display
    const container = document.getElementById('learningPath');
    if (container) {
        container.innerHTML = '';
        filteredPaths.forEach((path, index) => {
            const pathCard = createLearningPathCard(path);
            container.appendChild(pathCard);
            
            // Animate in with stagger
            gsap.fromTo(pathCard, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6, 
                    delay: index * 0.2,
                    ease: "power2.out"
                }
            );
        });
    }

    Utils.showNotification(`Found ${filteredPaths.length} matching learning paths`, 'success');
}

// Course actions
function enrollInCourse(courseId) {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        Utils.showNotification(`Enrolled in ${course.title}!`, 'success');
        
        // Update course button
        const button = event.target;
        button.textContent = 'Enrolled';
        button.disabled = true;
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }
}

function viewCourseDetails(courseId) {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        Utils.showNotification(`Opening details for ${course.title}...`, 'info');
    }
}

// Learning path actions
function startLearningPath(pathId) {
    const path = LEARNING_PATHS.find(p => p.id === pathId);
    if (path) {
        Utils.showNotification(`Started learning path: ${path.title}!`, 'success');
    }
}

function viewPathDetails(pathId) {
    const path = LEARNING_PATHS.find(p => p.id === pathId);
    if (path) {
        Utils.showNotification(`Opening details for ${path.title}...`, 'info');
    }
}

// Setup animations
function setupCoursesAnimations() {
    // Animate page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.fromTo(pageHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate filters
    const filtersSection = document.querySelector('.courses-filters');
    if (filtersSection) {
        gsap.fromTo(filtersSection,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
    }

    // Animate learning path section
    const learningPathSection = document.querySelector('.learning-path');
    if (learningPathSection) {
        gsap.fromTo(learningPathSection,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
        );
    }
}

// Initialize courses when DOM is loaded
document.addEventListener('DOMContentLoaded', initCourses);
