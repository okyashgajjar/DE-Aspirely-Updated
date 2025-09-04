// Profile JavaScript
// Handles user profile management and editing

// Initialize profile
function initProfile() {
    // Check if user is logged in
    if (!Utils.requireAuth()) return;

    // Load user data
    loadUserData();
    
    // Setup form handling
    setupFormHandling();
    
    // Setup animations
    setupProfileAnimations();
}

// Load user data into form
function loadUserData() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    // Update avatar initials
    updateAvatarInitials(user.name);

    // Load onboarding data if available
    if (user.onboarding) {
        populateForm(user.onboarding);
    }

    // Update profile completion
    updateProfileCompletion();

    // Update skills count
    updateSkillsCount();

    // Update member since date
    updateMemberSince(user);
}

// Populate form with user data
function populateForm(data) {
    // Personal information
    setFieldValue('fullName', data.fullName);
    setFieldValue('email', data.email || '');
    setFieldValue('country', data.country);
    setFieldValue('state', data.state);
    setFieldValue('city', data.city);

    // Professional information
    setFieldValue('education', data.education);
    setFieldValue('experience', data.experience);
    setFieldValue('fieldOfStudy', data.fieldOfStudy);

    // Career preferences
    if (data.domains && Array.isArray(data.domains)) {
        data.domains.forEach(domain => {
            const checkbox = document.querySelector(`input[name="domains"][value="${domain}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    setFieldValue('desiredRoles', data.desiredRoles);
    setFieldValue('workType', data.workType);
    setFieldValue('relocation', data.relocation);

    // Skills and expertise
    if (data.skills && Array.isArray(data.skills)) {
        populateSkillsList(data.skills);
    }

    setFieldValue('languages', data.languages);
    setFieldValue('certifications', data.certifications);
    setFieldValue('projects', data.projects);

    // Career goals
    setFieldValue('careerGoals', data.careerGoals);
    setFieldValue('salaryExpectation', data.salaryExpectation);
}

// Set field value helper
function setFieldValue(fieldName, value) {
    const field = document.getElementById(fieldName);
    if (field && value) {
        field.value = value;
    }
}

// Update avatar initials
function updateAvatarInitials(name) {
    const avatarInitials = document.getElementById('avatarInitials');
    if (avatarInitials && name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarInitials.textContent = initials;
    }
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
    
    const progressFill = document.getElementById('profileProgress');
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

// Update member since date
function updateMemberSince(user) {
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        const date = new Date(user.signupTime || user.loginTime || Date.now());
        memberSince.textContent = date.getFullYear();
    }
}

// Setup form handling
function setupFormHandling() {
    const form = document.getElementById('profileForm');
    const addSkillBtn = document.getElementById('addSkill');
    const skillInput = document.getElementById('skillInput');
    const resetBtn = document.getElementById('resetForm');

    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Add skill functionality
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkill);
    }

    if (skillInput) {
        skillInput.addEventListener('keypress', handleSkillKeypress);
    }

    // Reset form
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    // Form validation
    setupFormValidation();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {};

    // Collect form data
    for (let [key, value] of formData.entries()) {
        if (key === 'domains') {
            if (!userData[key]) userData[key] = [];
            userData[key].push(value);
        } else {
            userData[key] = value;
        }
    }

    // Get skills from the skills list
    const skillsList = document.getElementById('skillsList');
    if (skillsList) {
        const skillItems = skillsList.querySelectorAll('.skill-item span');
        userData.skills = Array.from(skillItems).map(item => item.textContent);
    }

    // Update user data
    const user = Utils.getCurrentUser();
    if (user) {
        user.onboarding = userData;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        Utils.showNotification('Profile updated successfully!', 'success');
        
        // Update profile completion
        updateProfileCompletion();
        updateSkillsCount();
    }
}

// Add skill functionality
function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skill = skillInput.value.trim();
    
    if (skill) {
        addSkillToList(skill);
        skillInput.value = '';
    }
}

// Handle skill input keypress
function handleSkillKeypress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkill();
    }
}

// Add skill to list
function addSkillToList(skill) {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return;

    // Check if skill already exists
    const existingSkills = Array.from(skillsList.querySelectorAll('.skill-item span'))
        .map(item => item.textContent);
    
    if (existingSkills.includes(skill)) {
        Utils.showNotification('Skill already added', 'error');
        return;
    }

    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.innerHTML = `
        <span>${skill}</span>
        <button type="button" class="remove-skill" data-skill="${skill}">×</button>
    `;
    
    // Add remove functionality
    const removeBtn = skillItem.querySelector('.remove-skill');
    removeBtn.addEventListener('click', () => {
        removeSkill(skill);
        skillItem.remove();
    });
    
    skillsList.appendChild(skillItem);
    
    // Animate in
    gsap.fromTo(skillItem, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
}

// Populate skills list
function populateSkillsList(skills) {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return;

    skillsList.innerHTML = '';
    skills.forEach(skill => {
        addSkillToList(skill);
    });
}

// Remove skill
function removeSkill(skill) {
    // This is handled by the remove button click event
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? This will clear all your changes.')) {
        const form = document.getElementById('profileForm');
        if (form) {
            form.reset();
            
            // Clear skills list
            const skillsList = document.getElementById('skillsList');
            if (skillsList) {
                skillsList.innerHTML = '';
            }
            
            // Reload user data
            loadUserData();
            
            Utils.showNotification('Form reset successfully', 'success');
        }
    }
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '#e5e7eb';
            }
        });
        
        input.addEventListener('input', () => {
            if (input.style.borderColor === 'rgb(239, 68, 68)') {
                input.style.borderColor = '#e5e7eb';
            }
        });
    });
}

// Setup animations
function setupProfileAnimations() {
    // Animate page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.fromTo(pageHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate profile sidebar
    const profileSidebar = document.querySelector('.profile-sidebar');
    if (profileSidebar) {
        gsap.fromTo(profileSidebar,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
    }

    // Animate profile content
    const profileContent = document.querySelector('.profile-content');
    if (profileContent) {
        gsap.fromTo(profileContent,
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
        );
    }

    // Animate form sections
    const formSections = document.querySelectorAll('.form-section');
    if (formSections.length > 0) {
        gsap.fromTo(formSections,
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

    // Animate form inputs on focus
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input, {
                scale: 1.02,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        input.addEventListener('blur', () => {
            gsap.to(input, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    });
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);
