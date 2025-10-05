// analytics.js
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') return;

    const salaryCanvas = document.getElementById('salaryChart');
    const jobDemandCanvas = document.getElementById('jobDemandChart');
    const careerGrowthCanvas = document.getElementById('careerGrowthChart');
    const jobsByCityCanvas = document.getElementById('jobsByCityChart');
    const careerBreakdownCanvas = document.getElementById('careerBreakdownChart');

    // If base charts are missing, don't proceed
    if (!salaryCanvas || !jobDemandCanvas) return;

    const salaryCtx = salaryCanvas.getContext('2d');
    const jobDemandCtx = jobDemandCanvas.getContext('2d');
    const careerGrowthCtx = careerGrowthCanvas ? careerGrowthCanvas.getContext('2d') : null;
    const jobsByCityCtx = jobsByCityCanvas ? jobsByCityCanvas.getContext('2d') : null;
    const careerBreakdownCtx = careerBreakdownCanvas ? careerBreakdownCanvas.getContext('2d') : null;

    new Chart(salaryCtx, {
    type: 'line',
    data: {
        labels: ['2019','2020','2021','2022','2023'],
        datasets: [{
            label: 'Average Salary (in $k)',
            data: [40,45,50,55,60],
            borderColor: 'rgba(0, 188, 212, 1)',
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
                fill: true,
                tension: 0.3
        }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(jobDemandCtx, {
    type: 'bar',
    data: {
        labels: ['Python', 'JavaScript', 'UI/UX', 'Data Science'],
        datasets: [{
            label: 'Job Openings',
            data: [120, 150, 90, 80],
            backgroundColor: 'rgba(0, 188, 212, 0.7)'
        }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Career Growth Trajectory (e.g., projected seniority levels over years)
    if (careerGrowthCtx) {
        new Chart(careerGrowthCtx, {
        type: 'line',
        data: {
            labels: ['Year 1','Year 2','Year 3','Year 4','Year 5'],
            datasets: [{
                label: 'Skill Proficiency Index',
                data: [20, 40, 55, 70, 85],
                borderColor: 'rgba(76, 175, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.3
            }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    // Jobs by City (city-wise distribution)
    if (jobsByCityCtx) {
        new Chart(jobsByCityCtx, {
        type: 'bar',
        data: {
            labels: ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR'],
            datasets: [{
                label: 'Open Roles',
                data: [220, 180, 140, 130, 110],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(0, 188, 212, 0.7)',
                    'rgba(103, 58, 183, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ]
            }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Career Analytics Breakdown (e.g., composition of career focus areas)
    if (careerBreakdownCtx) {
        new Chart(careerBreakdownCtx, {
        type: 'doughnut',
        data: {
            labels: ['Development', 'Data', 'Design', 'Management'],
            datasets: [{
                label: 'Focus Share',
                data: [45, 25, 15, 15],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(156, 39, 176, 0.7)'
                ],
                borderWidth: 0
            }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
});
