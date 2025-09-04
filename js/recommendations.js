// Recommendations JavaScript
// Handles job recommendations and course suggestions

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

// Mock job data
const MOCK_JOBS = [
    {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Remote',
        matchScore: 95,
        salary: '$120k - $150k',
        description: 'We are looking for a senior frontend developer with expertise in React, TypeScript, and modern web technologies. You will work on building scalable web applications and mentor junior developers.',
        requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'GraphQL'],
        missingSkills: ['GraphQL', 'Jest'],
        postedDate: '2 days ago',
        experience: 'senior',
        salaryRange: '100k-150k'
    },
    {
        id: 2,
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'Hybrid',
        matchScore: 88,
        salary: '$100k - $130k',
        description: 'Join our growing team as a full-stack developer working on cutting-edge web applications. You will be responsible for both frontend and backend development.',
        requiredSkills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express', 'Docker'],
        missingSkills: ['Docker', 'AWS'],
        postedDate: '1 week ago',
        experience: 'mid',
        salaryRange: '100k-150k'
    },
    {
        id: 3,
        title: 'React Developer',
        company: 'Digital Agency Co.',
        location: 'Austin, TX',
        type: 'Onsite',
        matchScore: 92,
        salary: '$90k - $120k',
        description: 'We need a passionate React developer to join our creative team and build amazing user experiences for our clients.',
        requiredSkills: ['React', 'Redux', 'JavaScript', 'CSS', 'Git', 'Testing'],
        missingSkills: ['Next.js', 'Testing'],
        postedDate: '3 days ago',
        experience: 'mid',
        salaryRange: '70k-100k'
    },
    {
        id: 4,
        title: 'Frontend Engineer',
        company: 'Innovation Labs',
        location: 'Seattle, WA',
        type: 'Remote',
        matchScore: 90,
        salary: '$110k - $140k',
        description: 'Build scalable frontend applications using modern JavaScript frameworks and tools. Work with a team of experienced engineers.',
        requiredSkills: ['Vue.js', 'JavaScript', 'CSS', 'HTML', 'Webpack'],
        missingSkills: ['Vue.js', 'Webpack'],
        postedDate: '5 days ago',
        experience: 'mid',
        salaryRange: '100k-150k'
    },
    {
        id: 5,
        title: 'JavaScript Developer',
        company: 'CodeCraft',
        location: 'Denver, CO',
        type: 'Hybrid',
        matchScore: 85,
        salary: '$80k - $110k',
        description: 'Work on exciting projects using vanilla JavaScript and modern frameworks. Great opportunity for career growth.',
        requiredSkills: ['JavaScript', 'jQuery', 'CSS', 'HTML', 'Bootstrap'],
        missingSkills: ['jQuery', 'Bootstrap'],
        postedDate: '1 week ago',
        experience: 'entry',
        salaryRange: '50k-70k'
    },
    {
        id: 6,
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        type: 'Remote',
        matchScore: 78,
        salary: '$95k - $125k',
        description: 'Join our data science team to analyze large datasets and build machine learning models for business insights.',
        requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'SQL'],
        missingSkills: ['TensorFlow', 'AWS'],
        postedDate: '4 days ago',
        experience: 'mid',
        salaryRange: '70k-100k'
    },
    {
        id: 7,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Chicago, IL',
        type: 'Hybrid',
        matchScore: 82,
        salary: '$105k - $135k',
        description: 'Manage cloud infrastructure and implement CI/CD pipelines for our development teams.',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
        missingSkills: ['Terraform', 'Monitoring'],
        postedDate: '6 days ago',
        experience: 'mid',
        salaryRange: '100k-150k'
    },
    {
        id: 8,
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'Los Angeles, CA',
        type: 'Onsite',
        matchScore: 75,
        salary: '$70k - $95k',
        description: 'Design beautiful and intuitive user interfaces for web and mobile applications.',
        requiredSkills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
        missingSkills: ['Framer', 'After Effects'],
        postedDate: '1 week ago',
        experience: 'mid',
        salaryRange: '50k-70k'
    }
];

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

let filteredJobs = [...MOCK_JOBS];
let filteredCourses = [...MOCK_COURSES];

// Initialize recommendations
function initRecommendations() {
    console.log('Initializing recommendations...');
    
    // Check if Utils is available
    if (typeof Utils === 'undefined') {
        console.error('Utils object not available, retrying in 100ms...');
        setTimeout(initRecommendations, 100);
        return;
    }
    
    // Check if user is logged in
    if (!Utils.requireAuth()) {
        console.log('User not authenticated, redirecting to login');
        return;
    }

    console.log('User authenticated, proceeding with initialization');

    // Load job recommendations
    loadJobRecommendations();
    
    // Load course recommendations
    loadCourseRecommendations();
    
    // Setup filters
    setupFilters();
    
    // Setup animations
    setupRecommendationsAnimations();
}

// Load job recommendations
function loadJobRecommendations() {
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;

    container.innerHTML = '';

    // Show all jobs by default, not just filtered ones
    MOCK_JOBS.forEach((job, index) => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
        
        // Animate in with stagger
        gsap.fromTo(jobCard, 
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

// Create job card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
        <div class="job-header">
            <h3 class="job-title">${job.title}</h3>
            <span class="match-score">${job.matchScore}% Match</span>
        </div>
        <div class="job-company">${job.company}</div>
        <div class="job-location">${job.location} • ${job.type} • ${job.salary}</div>
        <div class="job-description">${job.description}</div>
        
        <div class="skills-section">
            <h4>Required Skills:</h4>
            <div class="skills-tags">
                ${job.requiredSkills.map(skill => 
                    `<span class="skill-tag required">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="skills-section">
            <h4>Missing Skills:</h4>
            <div class="skills-tags">
                ${job.missingSkills.map(skill => 
                    `<span class="skill-tag missing">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="job-actions">
            <button class="btn btn-primary" onclick="applyToJob(${job.id})">Apply Now</button>
            <button class="btn btn-secondary" onclick="saveJob(${job.id})">Save Job</button>
        </div>
    `;

    // Setup hover animation
    Animations.setupCardHover([card]);

    return card;
}

// Load course recommendations
function loadCourseRecommendations() {
    const container = document.getElementById('coursesGrid');
    if (!container) return;

    container.innerHTML = '';

    // Always show all courses, not just filtered ones
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
            <span class="difficulty">${course.difficulty}</span>
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
    Animations.setupCardHover([card]);

    return card;
}

// Setup filters
function setupFilters() {
    console.log('Setting up filters...');
    const locationFilter = document.getElementById('locationFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const salaryFilter = document.getElementById('salaryFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');

    console.log('Filter elements found:', { locationFilter, experienceFilter, salaryFilter, applyFiltersBtn });

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
        console.log('Filter button event listener added');
    } else {
        console.error('Apply filters button not found!');
    }
}

// Apply filters
function applyFilters() {
    console.log('Apply filters clicked!');
    const locationFilter = document.getElementById('locationFilter').value;
    const experienceFilter = document.getElementById('experienceFilter').value;
    const salaryFilter = document.getElementById('salaryFilter').value;

    console.log('Filter values:', { locationFilter, experienceFilter, salaryFilter });

    filteredJobs = MOCK_JOBS.filter(job => {
        let matches = true;

        if (locationFilter && job.type.toLowerCase() !== locationFilter.toLowerCase()) {
            matches = false;
        }

        if (experienceFilter && job.experience !== experienceFilter) {
            matches = false;
        }

        if (salaryFilter && job.salaryRange !== salaryFilter) {
            matches = false;
        }

        return matches;
    });

    console.log('Filtered jobs:', filteredJobs.length);
    
    // Load filtered jobs
    const container = document.getElementById('recommendationsGrid');
    if (container) {
        container.innerHTML = '';

        filteredJobs.forEach((job, index) => {
            const jobCard = createJobCard(job);
            container.appendChild(jobCard);
            
            // Animate in with stagger
            gsap.fromTo(jobCard, 
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
    
    Utils.showNotification(`Found ${filteredJobs.length} matching jobs`, 'success');
}

// Apply course filters
function applyCourseFilters() {
    const skillFilter = document.getElementById('skillFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const durationFilter = document.getElementById('durationFilter').value;

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

    // Load filtered courses
    const container = document.getElementById('coursesGrid');
    if (container) {
        container.innerHTML = '';

        filteredCourses.forEach((course, index) => {
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
    
    Utils.showNotification(`Found ${filteredCourses.length} matching courses`, 'success');
}

// Job actions
function applyToJob(jobId) {
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (job) {
        Utils.showNotification(`Application submitted for ${job.title}!`, 'success');
    }
}

function saveJob(jobId) {
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (job) {
        Utils.showNotification(`${job.title} saved to your favorites!`, 'success');
    }
}

// Course actions
function enrollInCourse(courseId) {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        Utils.showNotification(`Enrolled in ${course.title}!`, 'success');
    }
}

function viewCourseDetails(courseId) {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        Utils.showNotification(`Opening details for ${course.title}...`, 'info');
    }
}

// Setup animations
function setupRecommendationsAnimations() {
    // Animate page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.fromTo(pageHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate filters
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        gsap.fromTo(filtersSection,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
    }
}

// Initialize recommendations when DOM is loaded
document.addEventListener('DOMContentLoaded', initRecommendations);
