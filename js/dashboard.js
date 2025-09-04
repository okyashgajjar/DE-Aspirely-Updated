// Dashboard JavaScript
// Handles dashboard functionality and animations

// Mock job recommendations data
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
        postedDate: '2 days ago'
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
        postedDate: '1 week ago'
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
        postedDate: '3 days ago'
    },
    {
        id: 4,
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        type: 'Remote',
        matchScore: 78,
        salary: '$95k - $125k',
        description: 'Join our data science team to analyze large datasets and build machine learning models for business insights.',
        requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'SQL'],
        missingSkills: ['TensorFlow', 'AWS'],
        postedDate: '4 days ago'
    },
    {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Chicago, IL',
        type: 'Hybrid',
        matchScore: 82,
        salary: '$105k - $135k',
        description: 'Manage cloud infrastructure and implement CI/CD pipelines for our development teams.',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
        missingSkills: ['Terraform', 'Monitoring'],
        postedDate: '6 days ago'
    }
];

// Initialize dashboard
function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Check if Utils is available
    if (typeof Utils === 'undefined') {
        console.error('Utils object not available, retrying in 100ms...');
        setTimeout(initDashboard, 100);
        return;
    }
    
    // Check if user is logged in
    if (!Utils.requireAuth()) {
        console.log('User not authenticated, redirecting to login');
        return;
    }

    console.log('User authenticated, proceeding with initialization');

    // Load user data
    loadUserData();
    
    // Load job recommendations
    loadJobRecommendations();
    
    // Setup animations
    setupDashboardAnimations();
    
    // Setup event listeners
    setupEventListeners();
}

// Load user data
function loadUserData() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const name = user.name || 'User';
        welcomeMessage.textContent = `Welcome back, ${name}!`;
    }

    // Update profile completion
    updateProfileCompletion();
    
    // Update skills count
    updateSkillsCount();
}

// Load job recommendations
function loadJobRecommendations() {
    const container = document.getElementById('jobRecommendations');
    if (!container) return;

    container.innerHTML = '';

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
            <button class="btn btn-primary">Apply Now</button>
            <button class="btn btn-secondary">Save Job</button>
        </div>
    `;

    // Setup hover animation
    Animations.setupCardHover([card]);

    return card;
}

// Update profile completion
function updateProfileCompletion() {
    const user = Utils.getCurrentUser();
    if (!user || !user.onboarding) return;

    const onboarding = user.onboarding;
    let completedFields = 0;
    const totalFields = 12;

    // Check required fields
    const requiredFields = [
        'fullName', 'country', 'state', 'city', 'education', 
        'experience', 'employmentStatus', 'desiredRoles', 
        'workType', 'relocation', 'languages'
    ];

    requiredFields.forEach(field => {
        if (onboarding[field] && onboarding[field].toString().trim()) {
            completedFields++;
        }
    });

    // Check domains
    if (onboarding.domains && onboarding.domains.length > 0) {
        completedFields++;
    }

    const percentage = Math.round((completedFields / totalFields) * 100);
    
    const progressFill = document.querySelector('.progress-fill');
    const profilePercentage = document.getElementById('profilePercentage');
    
    if (progressFill) {
        gsap.to(progressFill, {
            width: `${percentage}%`,
            duration: 1,
            ease: "power2.out"
        });
    }
    
    if (profilePercentage) {
        profilePercentage.textContent = `${percentage}%`;
    }
}

// Update skills count
function updateSkillsCount() {
    const user = Utils.getCurrentUser();
    const skillsCount = document.getElementById('skillsCount');
    
    if (skillsCount) {
        const count = user?.onboarding?.skills?.length || 0;
        skillsCount.textContent = count;
    }
}

// Setup dashboard animations
function setupDashboardAnimations() {
    // Animate dashboard header
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader) {
        gsap.fromTo(dashboardHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate action cards
    const actionCards = document.querySelectorAll('.action-card');
    if (actionCards.length > 0) {
        gsap.fromTo(actionCards,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.2,
                ease: "power2.out"
            }
        );

        // Setup hover animations
        Animations.setupCardHover(actionCards);
    }

    // Animate sidebar
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        gsap.fromTo(sidebar,
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
        );
    }
}

// Setup event listeners
function setupEventListeners() {
    // Job application buttons
    document.addEventListener('click', (e) => {
        if (e.target.textContent === 'Apply Now') {
            handleJobApplication(e.target);
        } else if (e.target.textContent === 'Save Job') {
            handleSaveJob(e.target);
        }
    });
}

// Handle job application
function handleJobApplication(button) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    
    Utils.showNotification(`Application submitted for ${jobTitle}!`, 'success');
    
    // Update button state
    button.textContent = 'Applied';
    button.disabled = true;
    button.classList.remove('btn-primary');
    button.classList.add('btn-secondary');
}

// Handle save job
function handleSaveJob(button) {
    const jobCard = button.closest('.job-card');
    const jobTitle = jobCard.querySelector('.job-title').textContent;
    
    Utils.showNotification(`${jobTitle} saved to your favorites!`, 'success');
    
    // Update button state
    button.textContent = 'Saved';
    button.disabled = true;
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
