// Onboarding wizard JavaScript
// Handles multi-step form with GSAP animations

let currentStep = 1;
const totalSteps = 12;
let formData = {};

// Initialize onboarding
function initOnboarding() {
    // Check if user is logged in
    if (!Utils.requireAuth()) return;

    const form = document.getElementById('onboardingForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    const addSkillBtn = document.getElementById('addSkill');
    const skillInput = document.getElementById('skillInput');

    // Load existing data if available
    loadExistingData();

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', previousStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (finishBtn) finishBtn.addEventListener('click', finishOnboarding);
    if (addSkillBtn) addSkillBtn.addEventListener('click', addSkill);
    if (skillInput) skillInput.addEventListener('keypress', handleSkillKeypress);

    // Initialize first step
    showStep(1);
    updateProgress();
    updateStepIndicator();

    // Setup form validation
    setupFormValidation();
}

// Show specific step with animation
function showStep(step) {
    const steps = document.querySelectorAll('.step');
    const currentStepElement = document.querySelector(`[data-step="${step}"]`);
    
    // Hide all steps
    steps.forEach(stepEl => {
        stepEl.classList.remove('active');
        gsap.set(stepEl, { opacity: 0, x: 50 });
    });

    // Show current step with animation
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        gsap.to(currentStepElement, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // Update button states
    updateButtonStates();
}

// Next step
function nextStep() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
            updateStepIndicator();
        }
    }
}

// Previous step
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
        updateStepIndicator();
    }
}

// Finish onboarding
function finishOnboarding() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        saveOnboardingData();
        
        Utils.showNotification('Profile completed successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// Validate current step
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });

    // Special validation for step 4 (domains)
    if (currentStep === 4) {
        const domainCheckboxes = currentStepElement.querySelectorAll('input[name="domains"]:checked');
        if (domainCheckboxes.length === 0) {
            Utils.showNotification('Please select at least one target domain', 'error');
            isValid = false;
        }
    }

    if (!isValid) {
        Utils.showNotification('Please fill in all required fields', 'error');
    }

    return isValid;
}

// Save current step data
function saveCurrentStepData() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!formData[input.name]) formData[input.name] = [];
                if (!formData[input.name].includes(input.value)) {
                    formData[input.name].push(input.value);
                }
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

// Save onboarding data to localStorage
function saveOnboardingData() {
    const user = Utils.getCurrentUser();
    if (user) {
        user.onboarding = formData;
        user.onboardingCompleted = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// Load existing data
function loadExistingData() {
    const user = Utils.getCurrentUser();
    if (user && user.onboarding) {
        formData = user.onboarding;
        populateForm();
    }
}

// Populate form with existing data
function populateForm() {
    Object.keys(formData).forEach(key => {
        const elements = document.querySelectorAll(`[name="${key}"]`);
        
        elements.forEach(element => {
            if (element.type === 'checkbox') {
                if (Array.isArray(formData[key]) && formData[key].includes(element.value)) {
                    element.checked = true;
                }
            } else {
                element.value = formData[key];
            }
        });
    });

    // Populate skills list
    if (formData.skills) {
        const skillsList = document.getElementById('skillsList');
        if (skillsList) {
            skillsList.innerHTML = '';
            formData.skills.forEach(skill => {
                addSkillToList(skill);
            });
        }
    }
}

// Update progress bar
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progress = (currentStep / totalSteps) * 100;
        gsap.to(progressFill, {
            width: `${progress}%`,
            duration: 0.5,
            ease: "power2.out"
        });
    }
}

// Update step indicator
function updateStepIndicator() {
    const currentStepSpan = document.getElementById('currentStep');
    const totalStepsSpan = document.getElementById('totalSteps');
    
    if (currentStepSpan) currentStepSpan.textContent = currentStep;
    if (totalStepsSpan) totalStepsSpan.textContent = totalSteps;
}

// Update button states
function updateButtonStates() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 1;
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    }
    
    if (finishBtn) {
        finishBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }
}

// Add skill functionality
function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skill = skillInput.value.trim();
    
    if (skill) {
        if (!formData.skills) formData.skills = [];
        if (!formData.skills.includes(skill)) {
            formData.skills.push(skill);
            addSkillToList(skill);
            skillInput.value = '';
        } else {
            Utils.showNotification('Skill already added', 'error');
        }
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

// Remove skill
function removeSkill(skill) {
    if (formData.skills) {
        const index = formData.skills.indexOf(skill);
        if (index > -1) {
            formData.skills.splice(index, 1);
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

// Initialize onboarding when DOM is loaded
document.addEventListener('DOMContentLoaded', initOnboarding);
