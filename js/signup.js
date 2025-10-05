// signup.js (multi-step with onboarding fields)
const signupForm = document.getElementById('signupForm');
const stepsEls = document.querySelectorAll('.signup-step');
const btnPrev = document.getElementById('signupPrev');
const btnNext = document.getElementById('signupNext');
const progressEl = document.getElementById('signupProgress');

let stepIndex = 0;

function updateProgress(){
  const pct = Math.round(((stepIndex + 1) / stepsEls.length) * 100);
  if (progressEl) progressEl.style.width = pct + '%';
  if (btnPrev) btnPrev.classList.toggle('disabled', stepIndex === 0);
  if (btnNext) btnNext.textContent = stepIndex === stepsEls.length - 1 ? 'Create Account' : 'Next';
}

function showStep(idx){
  stepsEls.forEach((el,i)=> el.classList.toggle('d-none', i !== idx));
  updateProgress();
}

function getSignupData(){
  const locations = Array.from(document.querySelectorAll('[data-step="2"] .chip.active')).map(c=>c.dataset.value);
  const industries = Array.from(document.querySelectorAll('[data-step="4"] .chip.active')).map(c=>c.dataset.value);
  const primarySkills = Array.from(document.querySelectorAll('[data-step="3"] input[type="checkbox"]:checked')).map(i=>i.value);
  const secondarySkills = (document.getElementById('ob_secondary')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  const companySize = (document.querySelector('input[name="size"]:checked')||{}).value;
  return {
    name: document.getElementById('signup_name')?.value.trim(),
    email: document.getElementById('signup_email')?.value.trim(),
    education: document.getElementById('ob_education')?.value,
    experience: Number(document.getElementById('ob_experience')?.value || 0),
    locations,
    primarySkills,
    secondarySkills,
    industries,
    role: document.getElementById('ob_role')?.value,
    expectedSalaryLpa: Number(document.getElementById('ob_salary')?.value || 0),
    companySize,
    goals: document.getElementById('ob_goals')?.value.trim(),
  };
}

function validateCurrentStep(){
  // basic required checks on step 1
  if (stepIndex === 0){
    const name = document.getElementById('signup_name');
    const email = document.getElementById('signup_email');
    const password = document.getElementById('signup_password');
    let ok = true;
    [name,email,password].forEach(inp=>{
      if (!inp.value.trim()) { inp.classList.add('is-invalid'); ok=false; } else { inp.classList.remove('is-invalid'); }
    });
    return ok;
  }
  return true;
}

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

const salarySlider = document.getElementById('ob_salary');
const salaryValue = document.getElementById('salaryValue');
if (salarySlider && salaryValue){
  salarySlider.addEventListener('input', ()=> salaryValue.textContent = salarySlider.value);
}

if (btnNext && btnPrev && stepsEls.length){
  showStep(stepIndex);
  btnNext.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    if (stepIndex < stepsEls.length - 1){
      stepIndex += 1;
      showStep(stepIndex);
    } else {
      const data = getSignupData();
      const user = { ...data, skills: data.primarySkills, completedSteps: 12 };
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    }
  });
  btnPrev.addEventListener('click', () => {
    if (stepIndex > 0){ stepIndex -= 1; showStep(stepIndex); }
  });
}

