// Analytics JavaScript
// Handles career analytics and chart animations

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

// Mock analytics data
const ANALYTICS_DATA = {
    jobDemand: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Frontend Developer',
                data: [120, 135, 150, 140, 160, 175, 180, 190, 185, 200, 210, 225],
                color: '#6366f1'
            },
            {
                label: 'Full Stack Developer',
                data: [80, 90, 95, 110, 125, 140, 145, 155, 150, 165, 170, 180],
                color: '#10b981'
            },
            {
                label: 'React Developer',
                data: [60, 70, 85, 90, 100, 115, 120, 130, 125, 140, 145, 155],
                color: '#f59e0b'
            },
            {
                label: 'Data Scientist',
                data: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
                color: '#8b5cf6'
            },
            {
                label: 'DevOps Engineer',
                data: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
                color: '#ef4444'
            }
        ]
    },
    salaryTrends: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        datasets: [
            {
                label: 'Frontend Developer',
                data: [85000, 92000, 98000, 105000, 112000],
                color: '#6366f1'
            },
            {
                label: 'Full Stack Developer',
                data: [95000, 102000, 108000, 115000, 122000],
                color: '#10b981'
            },
            {
                label: 'React Developer',
                data: [80000, 87000, 93000, 100000, 107000],
                color: '#f59e0b'
            },
            {
                label: 'Data Scientist',
                data: [90000, 98000, 105000, 112000, 120000],
                color: '#8b5cf6'
            },
            {
                label: 'DevOps Engineer',
                data: [100000, 108000, 115000, 122000, 130000],
                color: '#ef4444'
            }
        ]
    },
    skillDemand: {
        labels: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'TypeScript', 'Machine Learning', 'Kubernetes', 'MongoDB', 'PostgreSQL'],
        data: [95, 88, 82, 78, 75, 70, 65, 60, 55, 50, 45, 40]
    }
};

// Initialize analytics
function initAnalytics() {
    console.log('Initializing analytics...');
    
    // Check if Utils is available
    if (typeof Utils === 'undefined') {
        console.error('Utils object not available, retrying in 100ms...');
        setTimeout(initAnalytics, 100);
        return;
    }
    
    // Check if user is logged in
    if (!Utils.requireAuth()) {
        console.log('User not authenticated, redirecting to login');
        return;
    }

    console.log('User authenticated, proceeding with initialization');

    // Load charts
    loadCharts();
    
    // Load metrics
    loadMetrics();
    
    // Setup filters
    setupFilters();
    
    // Setup animations
    setupAnalyticsAnimations();
}

// Load all charts
function loadCharts() {
    // Animate the simple charts
    animateSimpleCharts();
}

// Animate simple charts
function animateSimpleCharts() {
    // Animate skill bars
    const skillBars = document.querySelectorAll('.skill-fill');
    skillBars.forEach((bar, index) => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        gsap.to(bar, {
            width: width,
            duration: 1.5,
            delay: index * 0.2,
            ease: "power2.out"
        });
    });

    // Animate bars
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0%';
        
        gsap.to(bar, {
            height: height,
            duration: 1.2,
            delay: index * 0.1,
            ease: "power2.out"
        });
    });

    // Animate progress metrics
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach((metric, index) => {
        const finalValue = parseInt(metric.textContent);
        metric.textContent = '0';
        
        gsap.to({ value: 0 }, {
            value: finalValue,
            duration: 2,
            delay: index * 0.3,
            ease: "power2.out",
            onUpdate: function() {
                metric.textContent = Math.round(this.targets[0].value);
            }
        });
    });
}

// Load job demand chart
function loadDemandChart() {
    const canvas = document.getElementById('demandChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = ANALYTICS_DATA.jobDemand;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    // X-axis labels
    data.labels.forEach((label, index) => {
        const x = padding + (index * (chartWidth / (data.labels.length - 1)));
        ctx.fillText(label, x, canvas.height - padding + 20);
    });

    // Y-axis labels
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * i);
        const y = canvas.height - padding - (i * (chartHeight / 5));
        ctx.textAlign = 'right';
        ctx.fillText(value.toString(), padding - 10, y + 4);
    }

    // Draw lines for each dataset
    data.datasets.forEach((dataset, datasetIndex) => {
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        dataset.data.forEach((value, index) => {
            const x = padding + (index * (chartWidth / (data.labels.length - 1)));
            const y = canvas.height - padding - ((value / maxValue) * chartHeight);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = dataset.color;
        dataset.data.forEach((value, index) => {
            const x = padding + (index * (chartWidth / (data.labels.length - 1)));
            const y = canvas.height - padding - ((value / maxValue) * chartHeight);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    });

    // Animate chart
    animateChart(canvas, data);
}

// Load salary trends chart
function loadSalaryChart() {
    const canvas = document.getElementById('salaryChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = ANALYTICS_DATA.salaryTrends;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    // X-axis labels
    data.labels.forEach((label, index) => {
        const x = padding + (index * (chartWidth / (data.labels.length - 1)));
        ctx.fillText(label, x, canvas.height - padding + 20);
    });

    // Y-axis labels
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * i);
        const y = canvas.height - padding - (i * (chartHeight / 5));
        ctx.textAlign = 'right';
        ctx.fillText('$' + value.toLocaleString(), padding - 10, y + 4);
    }

    // Draw bars for each dataset
    const barWidth = (chartWidth / data.labels.length) / data.datasets.length;
    
    data.datasets.forEach((dataset, datasetIndex) => {
        ctx.fillStyle = dataset.color;
        
        dataset.data.forEach((value, index) => {
            const x = padding + (index * (chartWidth / data.labels.length)) + (datasetIndex * barWidth);
            const barHeight = (value / maxValue) * chartHeight;
            const y = canvas.height - padding - barHeight;
            
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    });

    // Animate chart
    animateChart(canvas, data);
}

// Load skills demand chart
function loadSkillsChart() {
    const canvas = document.getElementById('skillsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = ANALYTICS_DATA.skillDemand;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    const barWidth = chartWidth / data.labels.length;
    const maxValue = Math.max(...data.data);

    data.labels.forEach((label, index) => {
        const value = data.data[index];
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + (index * barWidth);
        const y = canvas.height - padding - barHeight;

        // Bar color based on value
        const intensity = value / maxValue;
        const color = `hsl(${120 * intensity}, 70%, 50%)`;
        
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // Label
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });

    // Animate chart
    animateChart(canvas, data);
}

// Animate chart drawing
function animateChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    
    // Create a temporary canvas for animation
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Copy current canvas to temp
    tempCtx.drawImage(canvas, 0, 0);

    // Animate by gradually revealing the chart
    gsap.fromTo({ progress: 0 }, 
        { 
            progress: 1, 
            duration: 2, 
            ease: "power2.out",
            onUpdate: function() {
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                canvas.getContext('2d').drawImage(tempCanvas, 0, 0);
            }
        }
    );
}

// Load metrics
function loadMetrics() {
    const profileViews = document.getElementById('profileViews');
    const applications = document.getElementById('applications');
    const skillsAdded = document.getElementById('skillsAdded');
    const coursesCompleted = document.getElementById('coursesCompleted');

    // Animate counters
    if (profileViews) {
        gsap.to({ value: 0 }, {
            value: 45,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                profileViews.textContent = Math.round(this.targets[0].value);
            }
        });
    }

    if (applications) {
        gsap.to({ value: 0 }, {
            value: 12,
            duration: 2,
            ease: "power2.out",
            delay: 0.2,
            onUpdate: function() {
                applications.textContent = Math.round(this.targets[0].value);
            }
        });
    }

    if (skillsAdded) {
        const user = Utils.getCurrentUser();
        const skillsCount = user?.onboarding?.skills?.length || 0;
        
        gsap.to({ value: 0 }, {
            value: skillsCount,
            duration: 2,
            ease: "power2.out",
            delay: 0.4,
            onUpdate: function() {
                skillsAdded.textContent = Math.round(this.targets[0].value);
            }
        });
    }

    if (coursesCompleted) {
        gsap.to({ value: 0 }, {
            value: 3,
            duration: 2,
            ease: "power2.out",
            delay: 0.6,
            onUpdate: function() {
                coursesCompleted.textContent = Math.round(this.targets[0].value);
            }
        });
    }
}

// Setup filters
function setupFilters() {
    const regionFilter = document.getElementById('regionFilter');
    const timeframeFilter = document.getElementById('timeframeFilter');
    const updateChartsBtn = document.getElementById('updateCharts');

    if (updateChartsBtn) {
        updateChartsBtn.addEventListener('click', updateCharts);
    }
}

// Update charts based on filters
function updateCharts() {
    console.log('Update charts clicked!');
    const regionFilter = document.getElementById('regionFilter').value;
    const timeframeFilter = document.getElementById('timeframeFilter').value;

    console.log('Filter values:', { regionFilter, timeframeFilter });

    // Show loading state
    Utils.showNotification('Updating charts...', 'info');

    // Simulate data update based on filters
    setTimeout(() => {
        // Update data based on region filter
        if (regionFilter === 'north-america') {
            // Increase values for North America
            ANALYTICS_DATA.jobDemand.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 1.2));
            });
            ANALYTICS_DATA.salaryTrends.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 1.15));
            });
        } else if (regionFilter === 'europe') {
            // Slightly lower values for Europe
            ANALYTICS_DATA.jobDemand.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 0.9));
            });
            ANALYTICS_DATA.salaryTrends.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 0.85));
            });
        } else if (regionFilter === 'asia') {
            // Different values for Asia
            ANALYTICS_DATA.jobDemand.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 1.1));
            });
            ANALYTICS_DATA.salaryTrends.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(value => Math.round(value * 0.7));
            });
        }

        // Update data based on timeframe filter
        if (timeframeFilter === '6-months') {
            // Show only last 6 months
            ANALYTICS_DATA.jobDemand.labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            ANALYTICS_DATA.jobDemand.datasets.forEach(dataset => {
                dataset.data = dataset.data.slice(6);
            });
        } else if (timeframeFilter === '3-months') {
            // Show only last 3 months
            ANALYTICS_DATA.jobDemand.labels = ['Oct', 'Nov', 'Dec'];
            ANALYTICS_DATA.jobDemand.datasets.forEach(dataset => {
                dataset.data = dataset.data.slice(9);
            });
        }

        // Update chart data based on filters
        updateChartData(regionFilter, timeframeFilter);
        animateSimpleCharts();
        Utils.showNotification('Charts updated successfully!', 'success');
    }, 1000);
}

// Update chart data based on filters
function updateChartData(regionFilter, timeframeFilter) {
    // Update job demand bars
    const demandBars = document.querySelectorAll('#demandChart .bar');
    if (demandBars.length > 0) {
        const baseValues = [120, 80, 60, 40, 30];
        const multiplier = regionFilter === 'north-america' ? 1.2 : 
                         regionFilter === 'europe' ? 0.9 : 
                         regionFilter === 'asia' ? 1.1 : 1;
        
        demandBars.forEach((bar, index) => {
            const newValue = Math.round(baseValues[index] * multiplier);
            bar.style.height = `${(newValue / 200) * 100}%`;
            bar.setAttribute('data-value', newValue);
        });
    }

    // Update salary bars
    const salaryBars = document.querySelectorAll('#salaryChart .bar');
    if (salaryBars.length > 0) {
        const baseValues = [85000, 95000, 80000];
        const multiplier = regionFilter === 'north-america' ? 1.15 : 
                         regionFilter === 'europe' ? 0.85 : 
                         regionFilter === 'asia' ? 0.7 : 1;
        
        salaryBars.forEach((bar, index) => {
            const newValue = Math.round(baseValues[index] * multiplier);
            bar.style.height = `${(newValue / 150000) * 100}%`;
            bar.setAttribute('data-value', `$${newValue.toLocaleString()}`);
        });
    }

    // Update skill demand
    const skillBars = document.querySelectorAll('#skillsChart .skill-fill');
    if (skillBars.length > 0) {
        const baseValues = [95, 88, 82, 78, 75];
        const multiplier = regionFilter === 'north-america' ? 1.1 : 
                         regionFilter === 'europe' ? 0.9 : 
                         regionFilter === 'asia' ? 1.05 : 1;
        
        skillBars.forEach((bar, index) => {
            const newValue = Math.round(baseValues[index] * multiplier);
            bar.style.width = `${newValue}%`;
            bar.parentElement.nextElementSibling.textContent = `${newValue}%`;
        });
    }
}

// Setup animations
function setupAnalyticsAnimations() {
    // Animate page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        gsap.fromTo(pageHeader,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
    }

    // Animate chart cards
    const chartCards = document.querySelectorAll('.chart-card');
    if (chartCards.length > 0) {
        gsap.fromTo(chartCards,
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.2,
                delay: 0.3,
                ease: "power2.out"
            }
        );
    }

    // Animate insights cards
    const insightCards = document.querySelectorAll('.insight-card');
    if (insightCards.length > 0) {
        gsap.fromTo(insightCards,
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                delay: 0.8,
                ease: "power2.out"
            }
        );

        // Setup hover animations
        Animations.setupCardHover(insightCards);
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnalytics);
