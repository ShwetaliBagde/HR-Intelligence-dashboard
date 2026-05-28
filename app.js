// ==========================================================================
// APP STATE & CONFIGURATION
// ==========================================================================
const chartInstances = {};

// Color scheme constants
const COLORS = {
    blue: '#3B5BDB',
    blueLight: 'rgba(59, 91, 219, 0.05)',
    green: '#0CA678',
    greenLight: 'rgba(12, 166, 120, 0.05)',
    red: '#D31F1F',
    redLight: 'rgba(211, 31, 31, 0.05)',
    yellow: '#F59F00',
    yellowLight: 'rgba(245, 159, 0, 0.05)',
    orange: '#FF7043',
    orangeLight: 'rgba(255, 112, 67, 0.05)',
    purple: '#9C27B0',
    purpleLight: 'rgba(156, 39, 176, 0.05)',
    slate: '#34495E',
    muted: '#94a3b8',
    gridBorder: '#f1f5f9'
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Initialize all screens and charts
    initNavigation();
    initOverviewCharts();
    initActionButtons();
    initChatSystem();

    // Default trigger resize to ensure hidden charts size properly on load
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 200);
});
// Right panel toggle functionality
const rightPanel = document.querySelector('.right-panel');
const toggleBtn = document.getElementById('right-panel-toggle-btn');
if (rightPanel && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        rightPanel.classList.toggle('collapsed');
        const icon = toggleBtn.querySelector('i');
        if (rightPanel.classList.contains('collapsed')) {
            icon.setAttribute('data-lucide', 'chevron-right');
        } else {
            icon.setAttribute('data-lucide', 'chevron-left');
        }
        lucide.createIcons();
    });
}

// ==========================================================================
// NAVIGATION SYSTEM (SCREEN SWITCHER)
// ==========================================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-screen]');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            switchScreen(screenId);
        });
    });
}

function switchScreen(screenId) {
    // 1. Update active sidebar menu item
    document.querySelectorAll('.nav-item[data-screen]').forEach(nav => {
        if (nav.getAttribute('data-screen') === screenId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // 2. Hide all screens, show target screen
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.id === `screen-${screenId}`) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });

    // 3. Initialize screen-specific charts if not already done
    initScreenCharts(screenId);

    // 4. Scroll main content area to top
    document.querySelector('.content-container').scrollTop = 0;

    // 5. Force window resize event so ApexCharts recalculates dimension container width
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 50);
}

// Lazy load screen charts
function initScreenCharts(screenId) {
    if (screenId === 'workforce' && !chartInstances['chart-wf-forecast-large']) {
        initWorkforceCharts();
    } else if (screenId === 'attrition' && !chartInstances['chart-attrition-heat-detailed']) {
        initAttritionCharts();
    } else if (screenId === 'talent' && !chartInstances['chart-ta-funnel-large']) {
        initTalentCharts();
    } else if (screenId === 'learning' && !chartInstances['chart-ld-completion-bars']) {
        initLearningCharts();
    } else if (screenId === 'compensation' && !chartInstances['chart-comp-benchmark-lines']) {
        initCompensationCharts();
    } else if (screenId === 'engagement' && !chartInstances['chart-engagement-scatter-large']) {
        initEngagementCharts();
    } else if (screenId === 'operations' && !chartInstances['chart-ops-sla-radar']) {
        initOperationsCharts();
    } else if (screenId === 'projects' && !chartInstances['chart-projects-utilization-trend']) {
        initProjectsCharts();
    }
}

// ==========================================================================
// AI INSIGHT CONTAINER TOGGLE
// ==========================================================================
function toggleAIProjectPanel() {
    const overlay = document.getElementById('ai-panel-projects');
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

function toggleCardInsight(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const overlay = card.querySelector('.insight-overlay');
    if (!overlay) return;

    const isVisible = overlay.classList.contains('active');
    
    // Close any other open overlays in the same screen to keep tidy
    const screen = card.closest('.screen');
    screen.querySelectorAll('.insight-overlay.active').forEach(openOverlay => {
        if (openOverlay !== overlay) {
            openOverlay.classList.remove('active');
        }
    });

    if (isVisible) {
        overlay.classList.remove('active');
    } else {
        overlay.classList.add('active');
    }
}

// ==========================================================================
// CHARTS INITIALIZATION: OVERVIEW (MAIN SCREEN)
// ==========================================================================
function initOverviewCharts() {
    // 1. Top Banner Trendline Chart (Sparkline style)
    const bannerSparklineOpt = {
        series: [{ data: [30, 32, 45, 40, 52, 68, 80, 75, 92] }],
        chart: { type: 'line', height: 60, width: 150, sparkline: { enabled: true }, animations: { speed: 800 } },
        stroke: { curve: 'smooth', width: 2, colors: [COLORS.purple] },
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
    };
    chartInstances['banner-sparkline'] = new ApexCharts(document.querySelector('#banner-sparkline'), bannerSparklineOpt);
    chartInstances['banner-sparkline'].render();

    // 2. Metric Sparklines (Headcount, Attrition, Velocity, Engagement, Cost per Hire)
    const sparklineData = {
        headcount: [12500, 12550, 12620, 12680, 12750, 12842],
        attrition: [12.2, 12.8, 13.1, 13.5, 14.2, 14.7],
        velocity: [34.5, 33.1, 31.8, 30.2, 29.5, 28.6],
        engagement: [65, 67, 68, 70, 71, 73],
        cost: [4450, 4390, 4310, 4280, 4210, 4152]
    };

    renderSparkline('chart-sparkline-headcount', sparklineData.headcount, COLORS.blue);
    renderSparkline('chart-sparkline-attrition', sparklineData.attrition, COLORS.red);
    renderSparkline('chart-sparkline-velocity', sparklineData.velocity, COLORS.green);
    renderSparkline('chart-sparkline-engagement', sparklineData.engagement, COLORS.green);
    renderSparkline('chart-sparkline-costperhire', sparklineData.cost, COLORS.orange);

    // 3. Overall Risk Distribution (Donut Chart)
    const riskDonutOpt = {
        series: [14, 27, 59], // High, Medium, Low
        chart: { type: 'donut', height: '100%', width: '100%', animations: { enabled: true } },
        colors: [COLORS.red, COLORS.yellow, COLORS.green],
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '78%',
                    background: 'transparent'
                }
            }
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}% of workforce`
            }
        }
    };
    chartInstances['chart-attrition-risk'] = new ApexCharts(document.querySelector('#chart-attrition-risk'), riskDonutOpt);
    chartInstances['chart-attrition-risk'].render();

    // 4. Demand vs Supply Chart (Overview widget)
    const demandSupplyOpt = {
        series: [
            { name: 'Demand', data: [7800, 8300, 8900, 9200, 9500, 9800, 10200, 10600, 11000, 11500, 12000, 12400] },
            { name: 'Supply', data: [7600, 7800, 7900, 8100, 8300, 8400, 8600, 8800, 8900, 9100, 9300, 9500] }
        ],
        chart: { type: 'line', height: '100%', toolbar: { show: false }, animations: { enabled: true } },
        colors: [COLORS.blue, COLORS.green],
        stroke: { curve: 'smooth', width: 2 },
        markers: { size: 0 },
        grid: { borderColor: COLORS.gridBorder, strokeDashArray: 3 },
        xaxis: {
            categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            labels: { style: { colors: COLORS.slate, fontSize: '9px' } },
            axisTicks: { show: false },
            axisBorder: { show: false }
        },
        yaxis: {
            labels: { style: { colors: COLORS.slate, fontSize: '9px' } }
        },
        legend: { show: false }
    };
    chartInstances['chart-demand-supply'] = new ApexCharts(document.querySelector('#chart-demand-supply'), demandSupplyOpt);
    chartInstances['chart-demand-supply'].render();

    // 5. Engagement vs Retention Correlation (Overview widget spark scatter)
    const scatterMiniOpt = {
        series: [{
            name: 'Teams',
            data: [[0.5, 0.4], [0.6, 0.55], [0.72, 0.7], [0.8, 0.78], [0.65, 0.6], [0.55, 0.52], [0.9, 0.85], [0.75, 0.73], [0.85, 0.82], [0.68, 0.64]]
        }],
        chart: { type: 'scatter', height: '100%', sparkline: { enabled: true } },
        colors: [COLORS.blue],
        xaxis: { tickAmount: 5 },
        yaxis: { max: 1 },
        markers: { size: 3, strokeWidth: 0 }
    };
    chartInstances['chart-engagement-scatter'] = new ApexCharts(document.querySelector('#chart-engagement-scatter'), scatterMiniOpt);
    chartInstances['chart-engagement-scatter'].render();
}

function renderSparkline(elementId, dataArray, colorHex) {
    const opt = {
        series: [{ data: dataArray }],
        chart: { type: 'line', height: '100%', sparkline: { enabled: true }, animations: { speed: 600 } },
        stroke: { curve: 'smooth', width: 2, colors: [colorHex] },
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
    };
    chartInstances[elementId] = new ApexCharts(document.getElementById(elementId), opt);
    chartInstances[elementId].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 2. WORKFORCE PLANNING SCREEN
// ==========================================================================
function initWorkforceCharts() {
    // 1. Large 12-Month Demand vs Supply Chart
    const forecastOpt = {
        series: [
            { name: 'Demand (FTEs Required)', data: [8000, 8400, 8900, 9300, 9700, 10100, 10500, 11000, 11400, 11800, 12300, 12842] },
            { name: 'Supply (FTEs Available)', data: [7800, 8000, 8200, 8400, 8600, 8800, 9000, 9200, 9400, 9600, 9800, 11000] }
        ],
        chart: { type: 'area', height: 280, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.green],
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.15, opacityTo: 0.01 }
        },
        grid: { borderColor: COLORS.gridBorder, strokeDashArray: 4 },
        xaxis: {
            categories: ['Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25'],
            labels: { style: { colors: COLORS.slate } }
        },
        yaxis: { labels: { style: { colors: COLORS.slate } } },
        legend: { position: 'top', horizontalAlign: 'right' }
    };
    chartInstances['chart-wf-forecast-large'] = new ApexCharts(document.querySelector('#chart-wf-forecast-large'), forecastOpt);
    chartInstances['chart-wf-forecast-large'].render();

    // 2. Succession & Retirement Risk Chart (Bar Chart)
    const successionOpt = {
        series: [
            { name: 'Successor Ready Now', data: [12, 18, 5, 8, 22] },
            { name: 'Successor Ready 1-3 Yrs', data: [30, 22, 14, 19, 28] },
            { name: 'No Successor Identified', data: [15, 8, 26, 12, 5] }
        ],
        chart: { type: 'bar', height: 180, stacked: true, toolbar: { show: false } },
        colors: [COLORS.green, COLORS.yellow, COLORS.red],
        plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
        xaxis: { categories: ['Sales', 'Engineering', 'Finance', 'HR', 'Operations'] },
        grid: { borderColor: COLORS.gridBorder },
        legend: { position: 'bottom', horizontalAlign: 'center' }
    };
    chartInstances['chart-succession-planning'] = new ApexCharts(document.querySelector('#chart-succession-planning'), successionOpt);
    chartInstances['chart-succession-planning'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 3. ATTRITION INTELLIGENCE SCREEN
// ==========================================================================
function initAttritionCharts() {
    // 1. Detailed Heatmap Chart (Tenure vs Dept)
    const heatOpt = {
        series: [
            { name: 'Sales', data: [{ x: '< 1 Yr', y: 15 }, { x: '1-3 Yrs', y: 42 }, { x: '3-5 Yrs', y: 20 }, { x: '5+ Yrs', y: 8 }] },
            { name: 'Engineering', data: [{ x: '< 1 Yr', y: 10 }, { x: '1-3 Yrs', y: 35 }, { x: '3-5 Yrs', y: 18 }, { x: '5+ Yrs', y: 5 }] },
            { name: 'CS', data: [{ x: '< 1 Yr', y: 8 }, { x: '1-3 Yrs', y: 28 }, { x: '3-5 Yrs', y: 15 }, { x: '5+ Yrs', y: 6 }] },
            { name: 'Marketing', data: [{ x: '< 1 Yr', y: 5 }, { x: '1-3 Yrs', y: 12 }, { x: '3-5 Yrs', y: 8 }, { x: '5+ Yrs', y: 2 }] },
            { name: 'Operations', data: [{ x: '< 1 Yr', y: 7 }, { x: '1-3 Yrs', y: 14 }, { x: '3-5 Yrs', y: 9 }, { x: '5+ Yrs', y: 4 }] }
        ],
        chart: { type: 'heatmap', height: 180, toolbar: { show: false } },
        plotOptions: {
            heatmap: {
                colorScale: {
                    ranges: [
                        { from: 0, to: 10, color: '#ecfdf5', name: 'Low Risk' },
                        { from: 11, to: 25, color: '#fffbeb', name: 'Medium Risk' },
                        { from: 26, to: 100, color: '#fef2f2', name: 'Critical Risk' }
                    ]
                }
            }
        },
        dataLabels: { enabled: true, style: { colors: [COLORS.slate] } }
    };
    chartInstances['chart-attrition-heat-detailed'] = new ApexCharts(document.querySelector('#chart-attrition-heat-detailed'), heatOpt);
    chartInstances['chart-attrition-heat-detailed'].render();

    // 2. Exit interview driver trends
    const exitDriversOpt = {
        series: [{ name: 'Mention Rate %', data: [42, 28, 18, 12, 7, 5] }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: [COLORS.orange],
        plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '55%' } },
        xaxis: { categories: ['Compensation Gap', 'Manager Conflict', 'Role Fit', 'Stagnant Growth', 'Workload', 'Flexibility'] }
    };
    chartInstances['chart-exit-interview-drivers'] = new ApexCharts(document.querySelector('#chart-exit-interview-drivers'), exitDriversOpt);
    chartInstances['chart-exit-interview-drivers'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 4. TALENT ACQUISITION SCREEN
// ==========================================================================
function initTalentCharts() {
    // 1. Funnel pipeline chart
    const taFunnelOpt = {
        series: [{ name: 'Candidates', data: [18642, 6842, 2846, 1213] }],
        chart: { type: 'bar', height: 200, toolbar: { show: false } },
        colors: [COLORS.blue],
        plotOptions: { bar: { horizontal: true, barHeight: '60%', distributed: true } },
        xaxis: { categories: ['Applied', 'Screened', 'Offered', 'Joined'] },
        legend: { show: false }
    };
    chartInstances['chart-ta-funnel-large'] = new ApexCharts(document.querySelector('#chart-ta-funnel-large'), taFunnelOpt);
    chartInstances['chart-ta-funnel-large'].render();

    // 2. TA Sourcing Pie Chart
    const taSourcesOpt = {
        series: [35, 25, 20, 15, 5],
        chart: { type: 'pie', height: 200 },
        labels: ['Employee Referral', 'Job Portals', 'Direct Sourcing', 'Agencies', 'Social Media'],
        colors: [COLORS.blue, COLORS.green, COLORS.yellow, COLORS.orange, COLORS.purple],
        legend: { position: 'bottom' }
    };
    chartInstances['chart-ta-sources-large'] = new ApexCharts(document.querySelector('#chart-ta-sources-large'), taSourcesOpt);
    chartInstances['chart-ta-sources-large'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 5. LEARNING & DEVELOPMENT SCREEN
// ==========================================================================
function initLearningCharts() {
    // 1. L&D Completion bar chart
    const completionBarsOpt = {
        series: [
            { name: 'Completion Rate %', data: [94, 62, 85, 78, 90] },
            { name: 'Avg. Course Rating / 10', data: [8.8, 6.5, 7.9, 8.2, 8.5] }
        ],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.orange],
        xaxis: { categories: ['Engineering', 'Sales', 'CS', 'Marketing', 'Finance'] }
    };
    chartInstances['chart-ld-completion-bars'] = new ApexCharts(document.querySelector('#chart-ld-completion-bars'), completionBarsOpt);
    chartInstances['chart-ld-completion-bars'].render();

    // 2. Training impact ROI bubble chart
    const bubbleOpt = {
        series: [
            { name: 'Tech Programs', data: [[120, 28, 42], [80, 18, 30]] },
            { name: 'Soft Skills', data: [[90, 24, 25], [50, 12, 15]] },
            { name: 'Legal/Compliance', data: [[150, 4, 80], [30, 2, 10]] }
        ],
        chart: { type: 'bubble', height: 180, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.green, COLORS.red],
        xaxis: { title: { text: 'Program Cost ($/FTE)' }, min: 0, max: 200 },
        yaxis: { title: { text: 'Performance Rating Gain %' }, min: 0, max: 35 }
    };
    chartInstances['chart-ld-roi-bubble'] = new ApexCharts(document.querySelector('#chart-ld-roi-bubble'), bubbleOpt);
    chartInstances['chart-ld-roi-bubble'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 6. COMPENSATION INTELLIGENCE SCREEN
// ==========================================================================
function initCompensationCharts() {
    // 1. Benchmarking Lines
    const benchmarkOpt = {
        series: [
            { name: 'Market Minimum', data: [45000, 60000, 85000, 110000, 140000] },
            { name: 'Market Median', data: [55000, 75000, 105000, 135000, 175000] },
            { name: 'Market Maximum', data: [70000, 95000, 130000, 165000, 215000] },
            { name: 'Our Organization Avg', data: [52000, 69000, 92000, 129000, 172000] }
        ],
        chart: { type: 'line', height: 200, toolbar: { show: false } },
        colors: [COLORS.red, COLORS.green, COLORS.blue, COLORS.orange],
        stroke: { curve: 'straight', width: [1, 2, 1, 3], dashArray: [4, 0, 4, 0] },
        xaxis: { categories: ['Associate (L1)', 'Specialist (L2)', 'Lead (L3)', 'Manager (L4)', 'Director (L5)'] }
    };
    chartInstances['chart-comp-benchmark-lines'] = new ApexCharts(document.querySelector('#chart-comp-benchmark-lines'), benchmarkOpt);
    chartInstances['chart-comp-benchmark-lines'].render();

    // 2. Pay Equity Trends
    const equityTrendsOpt = {
        series: [{ name: 'Equity Ratio (Female:Male)', data: [0.91, 0.93, 0.95, 0.98] }],
        chart: { type: 'area', height: 200, toolbar: { show: false } },
        colors: [COLORS.green],
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: ['2021', '2022', '2023', '2024'] },
        yaxis: { min: 0.8, max: 1.0, tickAmount: 4 }
    };
    chartInstances['chart-comp-equity-trends'] = new ApexCharts(document.querySelector('#chart-comp-equity-trends'), equityTrendsOpt);
    chartInstances['chart-comp-equity-trends'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 7. ENGAGEMENT CORRELATION SCREEN
// ==========================================================================
function initEngagementCharts() {
    // Large Scatter Plot
    const scatterLargeOpt = {
        series: [
            {
                name: 'Engineering Teams',
                data: [[55, 14], [62, 11], [68, 8], [74, 5], [60, 12], [82, 3], [70, 7], [64, 10], [58, 13]]
            },
            {
                name: 'Sales Teams',
                data: [[45, 22], [52, 18], [61, 15], [72, 11], [65, 12], [80, 4], [78, 6], [59, 16], [50, 20]]
            },
            {
                name: 'Operations Teams',
                data: [[63, 10], [67, 8], [71, 6], [75, 5], [60, 11], [88, 2], [81, 3], [69, 7], [56, 12]]
            }
        ],
        chart: { type: 'scatter', height: 280, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.red, COLORS.green],
        xaxis: { title: { text: 'Quarterly Pulse Engagement Score' }, min: 40, max: 100 },
        yaxis: { title: { text: 'Annual Resignation Rate %' }, min: 0, max: 30 },
        grid: { borderColor: COLORS.gridBorder }
    };
    chartInstances['chart-engagement-scatter-large'] = new ApexCharts(document.querySelector('#chart-engagement-scatter-large'), scatterLargeOpt);
    chartInstances['chart-engagement-scatter-large'].render();

    // Sentiment Bars
    const sentimentBarsOpt = {
        series: [
            { name: 'Positive Sentiment %', data: [68, 82, 70, 61, 75] },
            { name: 'Neutral Sentiment %', data: [22, 12, 20, 24, 15] },
            { name: 'Negative Sentiment %', data: [10, 6, 10, 15, 10] }
        ],
        chart: { type: 'bar', height: 280, stacked: true, toolbar: { show: false } },
        colors: [COLORS.green, COLORS.yellow, COLORS.red],
        xaxis: { categories: ['Sales', 'Engineering', 'CS', 'Marketing', 'Operations'] }
    };
    chartInstances['chart-engagement-sentiment-bars'] = new ApexCharts(document.querySelector('#chart-engagement-sentiment-bars'), sentimentBarsOpt);
    chartInstances['chart-engagement-sentiment-bars'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 8. HR OPERATIONS SCREEN
// ==========================================================================
function initOperationsCharts() {
    // 1. Radar SLA Chart
    const radarOpt = {
        series: [
            { name: 'Target SLA %', data: [95, 95, 95, 95, 95] },
            { name: 'Current SLA %', data: [93, 90, 94, 82, 91] }
        ],
        chart: { type: 'radar', height: 180, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.orange],
        xaxis: { categories: ['Onboarding', 'Leave Approvals', 'Payroll Queries', 'Visa Petitions', 'Benefits Sync'] },
        legend: { position: 'bottom' }
    };
    chartInstances['chart-ops-sla-radar'] = new ApexCharts(document.querySelector('#chart-ops-sla-radar'), radarOpt);
    chartInstances['chart-ops-sla-radar'].render();

    // 2. Ticket Lines
    const ticketLinesOpt = {
        series: [
            { name: 'Average Resolution Time (hrs)', data: [24, 21, 18, 16.5, 15.2, 14.8] },
            { name: 'Open Ticket Backlog', data: [150, 120, 110, 85, 92, 78] }
        ],
        chart: { type: 'line', height: 180, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.red],
        xaxis: { categories: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'] }
    };
    chartInstances['chart-ops-tickets-lines'] = new ApexCharts(document.querySelector('#chart-ops-tickets-lines'), ticketLinesOpt);
    chartInstances['chart-ops-tickets-lines'].render();
}

// ==========================================================================
// CHARTS INITIALIZATION: 9. PROJECT MANAGEMENT SCREEN
// ==========================================================================
function initProjectsCharts() {
    // 1. Metric Sparklines (Active Projects, Utilization, Bench, Vacancies, SLA)
    const sparklineData = {
        active: [132, 134, 137, 138, 140, 142],
        utilization: [87.1, 87.5, 87.9, 88.0, 88.3, 88.5],
        bench: [50, 48, 44, 42, 40, 38],
        vacancies: [18, 19, 21, 20, 22, 24],
        sla: [93.2, 92.8, 92.5, 92.0, 91.5, 91.0]
    };

    renderSparkline('chart-sparkline-projects-active', sparklineData.active, COLORS.blue);
    renderSparkline('chart-sparkline-projects-utilization', sparklineData.utilization, COLORS.green);
    renderSparkline('chart-sparkline-projects-bench', sparklineData.bench, COLORS.red);
    renderSparkline('chart-sparkline-projects-vacancies', sparklineData.vacancies, COLORS.orange);
    renderSparkline('chart-sparkline-projects-sla', sparklineData.sla, COLORS.purple);

    // 2. Capacity vs Assigned vs Forecasted utilization area chart
    const trendOpt = {
        series: [
            { name: 'Capacity (Total Available FTEs)', data: [160, 160, 160, 160, 165, 165, 165, 170, 170, 170, 175, 175] },
            { name: 'Assigned (Currently Staffed)', data: [135, 138, 140, 142, 145, 146, 148, 150, 152, 154, 155, 158] },
            { name: 'AI Forecasted Demand', data: [138, 140, 143, 145, 149, 152, 156, 160, 165, 172, 180, 188] }
        ],
        chart: { type: 'area', height: 280, toolbar: { show: false } },
        colors: [COLORS.blue, COLORS.green, COLORS.orange],
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.15, opacityTo: 0.01 }
        },
        grid: { borderColor: COLORS.gridBorder, strokeDashArray: 4 },
        xaxis: {
            categories: ['Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25'],
            labels: { style: { colors: COLORS.slate } }
        },
        yaxis: { labels: { style: { colors: COLORS.slate } } },
        legend: { position: 'top', horizontalAlign: 'right' }
    };
    chartInstances['chart-projects-utilization-trend'] = new ApexCharts(document.querySelector('#chart-projects-utilization-trend'), trendOpt);
    chartInstances['chart-projects-utilization-trend'].render();
}

function updateProjectsSimulation() {
    const backlog = parseInt(document.getElementById('sim-project-backlog').value);
    const benchRelease = parseInt(document.getElementById('sim-bench-release').value);

    // Display values
    document.getElementById('val-project-backlog').innerText = `${backlog} Projects`;
    document.getElementById('val-bench-release').innerText = `${benchRelease} FTEs`;

    // Calculations
    let projectedUtil = 88.5 + (backlog - 5) * 0.8 - (benchRelease - 10) * 0.4;
    projectedUtil = Math.max(70, Math.min(100, projectedUtil));

    let benchCost = 152000 - (benchRelease - 10) * 4000;
    benchCost = Math.max(20000, benchCost);

    let sourcingNeed = (backlog * 4) - benchRelease;
    sourcingNeed = Math.max(0, sourcingNeed);

    // Output updating
    document.getElementById('val-sim-projects-utilization').innerText = `${projectedUtil.toFixed(1)}%`;
    document.getElementById('val-sim-projects-bench-cost').innerText = `$${benchCost.toLocaleString()}`;
    document.getElementById('val-sim-projects-sourcing').innerText = `${sourcingNeed} FTEs`;
}

function simulateProjectStaffing() {
    alert("🤖 AI Project Staffing Optimizer active:\n\n1. Sourced 4 Senior Backend Developers for 'NextGen Fintech Platform' from external contractor pool.\n2. Rebalanced Dev skills on 'Automated Retail Integration' to reduce junior concentration to 40%.\n3. Talent Bench allocation optimized (SLA improved by +4.5%).");
}

// ==========================================================================
// OTHER INTERACTIVE FEATURES (MODALS, DYNAMIC SIMULATORS)
// ==========================================================================
function initActionButtons() {
    const takeAction = document.getElementById('take-action-btn');
    if (takeAction) {
        takeAction.addEventListener('click', () => {
            alert("📋 Action Plan Created:\n1. 1-on-1 scheduled with West Region Sales Directors.\n2. stay interviews automated in Workday for Flight-Risk groups.\n3. Talent Acquisition priority list updated.");
        });
    }

    const toggleProjectsAI = document.getElementById('toggle-ai-projects');
    if (toggleProjectsAI) {
        toggleProjectsAI.addEventListener('click', () => {
            toggleAIProjectPanel();
        });
    }

    const searchAskPill = document.getElementById('search-ask-pill');
    if (searchAskPill) {
        searchAskPill.addEventListener('click', () => {
            openChatModal();
            addAIMessage("Hello Anita Sharma! How can I assist you with your workforce intelligence queries today?");
        });
    }

    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = searchInput.value;
                if (text.trim()) {
                    searchInput.value = '';
                    triggerAskQuery(text);
                }
            }
        });
    }

    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
}

// Scenario planning simulation (Compensation Page)
function updateCompSimulation() {
    const targetMidpoint = parseFloat(document.getElementById('sim-target-midpoint').value);
    const meritBudget = parseFloat(document.getElementById('sim-merit-budget').value) / 10;

    // Display values
    document.getElementById('val-midpoint').innerText = `${targetMidpoint}%`;
    document.getElementById('val-merit').innerText = `${meritBudget.toFixed(1)}%`;

    // Perform arithmetic calculations
    const correctionCost = Math.floor((targetMidpoint - 90) * 15300 + (meritBudget * 22400));
    const retainedCount = Math.floor((targetMidpoint - 85) * 3.4 + (meritBudget * 14.5));
    const netSavings = retainedCount * 12500 - correctionCost;

    // Formatted output injection
    document.getElementById('val-equity-correction').innerText = `$${correctionCost.toLocaleString()}`;
    document.getElementById('val-retained-count').innerText = `${retainedCount} Employees`;
    document.getElementById('val-savings-comp').innerText = `$${netSavings.toLocaleString()}`;
}

// Trigger simulated upskilling simulation alert (Workforce Page)
function simulateUpskilling() {
    alert("🧬 Upskilling Scenario Planner initiated:\nUpskilling 60 L1 developers into Data Engineering yields a Q3 supply lift of +45 FTEs. Reduces projected gap to 1,797 roles.");
}

// ==========================================================================
// ASK ICOGS (AI CHAT SYSTEM)
// ==========================================================================
const SIMULATED_RESPONSES = {
    "Show project allocation bottlenecks": `
        <p><strong>🚨 Project Staffing Bottlenecks Identified:</strong></p>
        <ul>
            <li><strong>NextGen Fintech Platform (High Risk):</strong>
                <ul>
                    <li>FTE Deficit: <strong>-4 FTEs</strong> (Requires Senior Backend Engineers with Node.js/Kubernetes expertise).</li>
                    <div class="card-body">
                        <div class="metric-value-container">
                            <span class="metric-value" id="total-projects-value">124</span>
                        </div>
                        <div class="metric-chart">
                            <div id="chart-sparkline-projects-total"></div>
                        </div>
                    </div>
                </ul>
            </li>
            <li><strong>Logistics Router Optimization (Medium Risk):</strong>
                <ul>
                    <li>FTE Deficit: <strong>-2 FTEs</strong> (Requires DevOps/SRE Lead).</li>
                    <li>Vacancy Age: 34 days open.</li>
                </ul>
            </li>
        </ul>
        <p><strong>AI Recommendation:</strong> Re-allocate 2 Senior Backend Developers from internal bench and initiate 2 fast-track contract hires for DevOps roles.</p>
    `,
    "What is the bench cost and utilization trend?": `
        <p><strong>📉 Bench Capacity & Cost Analysis:</strong></p>
        <ul>
            <li>Current Bench Strength: <strong>38 FTEs</strong> (down from 50 MTD).</li>
            <li>Monthly Cost Overhead: <strong>$152k</strong> (Projected to drop to $112k by Q3).</li>
            <li>Average Staffing Utilization: <strong>88.5%</strong> (Healthy range is 82%-88%).</li>
        </ul>
        <p><strong>AI Warning:</strong> Utilization in Engineering is approaching 94%, indicating high burnout risk. Releasing bench members to active projects is recommended to lower allocation stress.</p>
    `,
    "Why is attrition high in Engineering?": `
        <p><strong>🚨 Voluntary Attrition Alert:</strong> Attrition in Software Engineering (L2/L3) is currently <strong>16.4%</strong> (2.2% above organizational median).</p>
        <p><strong>Primary Drivers Identified:</strong></p>
        <ul>
            <li><strong>Market Compensation Gap (42% driver):</strong> Local market indexing places our L2/L3 salaries 12% below regional median.</li>
            <li><strong>Career Growth Stagnation (28% driver):</strong> 40% of exit interviews mentioned a "lack of clear path to senior levels".</li>
            <li><strong>Legacy Debt Workload (18% driver):</strong> Teams supporting Core Platform Legacy modules have 24% lower engagement scores.</li>
        </ul>
        <p><strong>Actionable Recommendations:</strong></p>
        <ol>
            <li>Allocate <strong>$150k</strong> out-of-cycle salary adjustments targetted to L2/L3 engineers.</li>
            <li>Establish a structured <strong>Tech Lead fast-track training</strong> by Q3.</li>
        </ol>
    `,
    "Which teams have low engagement but high performance?": `
        <p><strong>📊 High Productivity / Burnout Risk Cohorts:</strong></p>
        <ul>
            <li><strong>Customer Success (APAC Region):</strong>
                <div class="charts-grid">
                    <div id="chart-projects-utilization-trend" class="chart-container"></div>
                    <div id="chart-projects-resource" class="chart-container"></div>
                </div>    <li><em>Root Cause:</em> Extreme account span of control (1:14 account manager ratio vs 1:8 target).</li>
                </ul>
            </li>
            <li><strong>FinTech Product Core:</strong>
                <ul>
                    <li>Feature Delivery Velocity: <strong>96%</strong> (High)</li>
                    <li>Engagement Score: <strong>61/100</strong> (Low)</li>
                    <li><em>Root Cause:</em> Leadership confidence scores fell by 18% after Q1 re-org.</li>
                </ul>
            </li>
        </ul>
        <p><strong>Recommendation:</strong> Rebalance CS account lists immediately and initiate manager feedback reviews in FinTech.</p>
    `,
    "Show skill gaps in critical roles": `
        <p><strong>⚠️ Core Deficit Analysis:</strong> Project delivery roadmaps are heavily constrained by 3 main skills:</p>
        <ul>
            <li><strong>Data Engineering (Gap: 120 FTEs):</strong> Required: 340, Available: 220. Deficit score: <strong>92</strong> (Critical).</li>
            <li><strong>Cloud Architecture (Gap: 65 FTEs):</strong> Required: 180, Available: 115. Deficit score: <strong>86</strong> (Critical).</li>
            <li><strong>Cybersecurity (Gap: 45 FTEs):</strong> Required: 140, Available: 95. Deficit score: <strong>72</strong> (High).</li>
        </ul>
        <p><strong>Upskilling Proposal:</strong> Running an internal Cloud Bootcamp program to transfer 30 FTEs from General IT into Cloud Architecture saves <strong>$340k</strong> in agency sourcing costs.</p>
    `,
    "What is the impact of training on performance?": `
        <p><strong>📈 Training ROI Analytics (YTD):</strong> Completion of professional development courses correlates strongly with subsequent performance appraisal lift (+22% overall):</p>
        <ul>
            <li><strong>Data Analytics Specialization:</strong> Average performance appraisal rating increased by <strong>28%</strong>.</li>
            <li><strong>Leadership Essentials Program:</strong> Team voluntary attrition reduced by <strong>15%</strong> under participating managers.</li>
            <li><strong>Cloud Operations:</strong> Decreased AWS bill slippage by <strong>40%</strong>.</li>
        </ul>
        <p><strong>Recommendation:</strong> Allocate 3 hours/week of dedicated study time for active engineering courses.</p>
    `
};

function initChatSystem() {
    // Initializer
}

function openChatModal() {
    const modal = document.getElementById('ai-chat-modal');
    modal.classList.add('active');
}

function closeChatModal() {
    const modal = document.getElementById('ai-chat-modal');
    modal.classList.remove('active');
    document.getElementById('modal-chat-messages').innerHTML = '';
}

function triggerAskQuery(queryText) {
    openChatModal();
    
    // Add user message
    addUserMessage(queryText);
    
    // Show typing state, then add response
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const responseHTML = SIMULATED_RESPONSES[queryText] || `
            <p>I have queried the workforce databases regarding: <em>"${queryText}"</em>.</p>
            <p><strong>AI Observations:</strong> We found a correlation index of <strong>0.68</strong> relating to this query. Historical logs indicate that this pattern usually stabilizes after 2 quarters.</p>
            <p>Would you like to drill down into a specific department or region?</p>
        `;
        addAIMessage(responseHTML);
    }, 1200);
}

function checkChatSubmit(event) {
    if (event.key === 'Enter') {
        submitAskChat();
    }
}

function checkModalChatSubmit(event) {
    if (event.key === 'Enter') {
        submitModalChat();
    }
}

function submitAskChat() {
    const input = document.getElementById('ask-chat-input');
    const text = input.value;
    if (text.trim()) {
        input.value = '';
        triggerAskQuery(text);
    }
}

function submitModalChat() {
    const input = document.getElementById('modal-chat-input');
    const text = input.value;
    if (text.trim()) {
        input.value = '';
        addUserMessage(text);
        
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const responseText = `I have analyzed your follow-up query: "${text}". Based on current parameters, we recommend initiating a secondary feedback loop or scheduling a team sync to evaluate options. Let me know if you would like me to draft an action plan document.`;
            addAIMessage(responseText);
        }, 1000);
    }
}

function addUserMessage(messageText) {
    const messagesContainer = document.getElementById('modal-chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg msg-user';
    msgDiv.innerText = messageText;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function addAIMessage(messageHTML) {
    const messagesContainer = document.getElementById('modal-chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg msg-ai';
    msgDiv.innerHTML = messageHTML;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('modal-chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg msg-ai typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span>•</span><span>•</span><span>•</span>';
    messagesContainer.appendChild(indicator);
    
    // Animate dots slightly using CSS
    const style = document.createElement('style');
    style.id = 'typing-style';
    style.innerHTML = `
        .typing-indicator span {
            animation: blink 1.4s infinite both;
            font-size: 1.5rem;
            line-height: 0.5;
            margin: 0 1px;
            display: inline-block;
        }
        .typing-indicator span:nth-child(2) { animation-delay: .2s; }
        .typing-indicator span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink {
            0% { opacity: .2; }
            20% { opacity: 1; }
            100% { opacity: .2; }
        }
    `;
    document.head.appendChild(style);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    const style = document.getElementById('typing-style');
    if (style) style.remove();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('modal-chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ==========================================================================
// COLLAPSIBLE SIDEBAR MENU SYSTEM
// ==========================================================================
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    sidebar.classList.toggle('collapsed');
    
    // Update toggle button icon direction
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            if (sidebar.classList.contains('collapsed')) {
                icon.setAttribute('data-lucide', 'chevron-right');
            } else {
                icon.setAttribute('data-lucide', 'chevron-left');
            }
            // Re-create icons via Lucide to swap correctly
            lucide.createIcons();
        }
    }
    
    // Smoothly fire chart redraw operations while the width transitions (300ms)
    let count = 0;
    const interval = setInterval(() => {
        window.dispatchEvent(new Event('resize'));
        count++;
        if (count > 6) {
            clearInterval(interval);
        }
    }, 50);
}
