// recommendations.js
const skillFilter = document.getElementById('skillFilter');
const expFilter = document.getElementById('expFilter');
const locFilter = document.getElementById('locFilter');
const jobList = document.querySelectorAll('#jobList .job');

function applyJobFilters(){
    const s = skillFilter ? skillFilter.value : 'all';
    const e = expFilter ? expFilter.value : 'all';
    const l = locFilter ? locFilter.value : 'all';

    jobList.forEach(job => {
        const matchSkill = s === 'all' || job.dataset.skill === s;
        const matchExp = e === 'all' || job.dataset.exp === e;
        const matchLoc = l === 'all' || job.dataset.loc === l;
        const show = matchSkill && matchExp && matchLoc;
        job.style.display = show ? 'block' : 'none';
        job.classList.toggle('fade-in', show);
    });
}

[skillFilter, expFilter, locFilter].forEach(sel => sel && sel.addEventListener('change', applyJobFilters));

applyJobFilters();
