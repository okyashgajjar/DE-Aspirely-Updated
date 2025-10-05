// profile.js
const profileForm = document.getElementById('profileForm');
const saveToast = document.getElementById('saveToast');

function showToast(){
    if (!saveToast) return;
    const toast = new bootstrap.Toast(saveToast);
    toast.show();
}

function prefillProfile(){
    const user = getUserInfo();
    if (!user) return;
    const nameEl = document.getElementById('prof_name');
    const emailEl = document.getElementById('prof_email');
    if (nameEl) nameEl.value = user.name || 'John Doe';
    if (emailEl) emailEl.value = user.email || 'john@example.com';
    const educationEl = document.getElementById('prof_education');
    const expEl = document.getElementById('prof_experience');
    const roleEl = document.getElementById('prof_role');
    const salaryEl = document.getElementById('prof_salary');
    const salaryVal = document.getElementById('prof_salary_value');
    const goalsEl = document.getElementById('prof_goals');
    const secondaryEl = document.getElementById('prof_secondary');
    if (educationEl && user.education) educationEl.value = user.education;
    if (expEl) expEl.value = user.experience || 0;
    if (roleEl && user.role) roleEl.value = user.role;
    if (salaryEl) salaryEl.value = user.expectedSalaryLpa || 12;
    if (salaryVal) salaryVal.textContent = user.expectedSalaryLpa || 12;
    if (goalsEl) goalsEl.value = user.goals || '';
    if (secondaryEl) secondaryEl.value = (user.secondarySkills||[]).join(', ');
    // primary skills
    const primarySkills = new Set(user.primarySkills || user.skills || []);
    document.querySelectorAll('#prof_primary input[type="checkbox"]').forEach(cb => {
        cb.checked = primarySkills.has(cb.value);
    });
    // company size
    if (user.companySize){
        const radio = document.querySelector(`input[name="prof_size"][value="${user.companySize}"]`);
        if (radio) radio.checked = true;
    }
    // locations chips
    const locs = new Set(user.locations || []);
    document.querySelectorAll('#prof_locations .chip').forEach(ch => {
        if (locs.has(ch.dataset.value)) ch.classList.add('active'); else ch.classList.remove('active');
    });
}

if (profileForm) {
    prefillProfile();
    document.querySelectorAll('#prof_locations .chip').forEach(chip => chip.addEventListener('click', ()=> chip.classList.toggle('active')));
    const salaryEl = document.getElementById('prof_salary');
    const salaryVal = document.getElementById('prof_salary_value');
    if (salaryEl && salaryVal){ salaryEl.addEventListener('input', ()=> salaryVal.textContent = salaryEl.value); }
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getUserInfo();
        user.name = document.getElementById('prof_name').value.trim();
        user.email = document.getElementById('prof_email').value.trim();
        user.education = document.getElementById('prof_education').value;
        user.experience = Number(document.getElementById('prof_experience').value || 0);
        user.locations = Array.from(document.querySelectorAll('#prof_locations .chip.active')).map(c=>c.dataset.value);
        user.primarySkills = Array.from(document.querySelectorAll('#prof_primary input:checked')).map(i=>i.value);
        user.secondarySkills = document.getElementById('prof_secondary').value.split(',').map(s=>s.trim()).filter(Boolean);
        user.role = document.getElementById('prof_role').value;
        user.expectedSalaryLpa = Number(document.getElementById('prof_salary').value || 0);
        user.companySize = (document.querySelector('input[name="prof_size"]:checked')||{}).value;
        user.goals = document.getElementById('prof_goals').value.trim();
        user.skills = user.primarySkills;
        localStorage.setItem('user', JSON.stringify(user));
        showToast();
    });
}

