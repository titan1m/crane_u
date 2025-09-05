<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>All Cranes</title>

  <style>

    body {

      font-family: Arial, sans-serif;

      padding: 20px;

      background: #f8f8f8;

    }

    .crane-card {

      background: white;

      border-radius: 10px;

      padding: 15px;

      margin: 10px 0;

      box-shadow: 0 2px 5px rgba(0,0,0,0.1);

    }

    h1 {

      color: #333;

    }

  </style>

</head>

<body>

  <h1>All Cranes Data</h1>



  <!-- Data will be injected here -->

  <div id="craneData"></div>



  <script>

  async function loadCranes() {

    try {

      const res = await fetch("/api/cranes"); // Backend API call

      const data = await res.json();

      console.log(data);



      let container = document.getElementById("craneData");

      container.innerHTML = data.map(c => `

        <div class="crane-card">

          <h3>${c.model} (${c.code})</h3>

          <p>${c.description}</p>

        </div>

      `).join("");

    } catch (err) {

      console.error("Error loading cranes:", err);

    }

  }

  window.onload = loadCranes;

  </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

            --danger: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: #f5f7fa;

            color: var(--dark);

        }

        

        .header {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            padding: 1.5rem;

            display: flex;

            justify-content: space-between;

            align-items: center;

            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

            position: sticky;

            top: 0;

            z-index: 100;

        }

        

        .logo {

            display: flex;

            align-items: center;

        }

        

        .logo-icon {

            width: 40px;

            height: 40px;

            background: var(--primary);

            border-radius: 10px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            color: white;

            font-size: 18px;

            font-weight: bold;

        }

        

        .nav-links {

            display: flex;

            gap: 1rem;

        }

        

        .nav-link {

            padding: 8px 16px;

            border-radius: 50px;

            text-decoration: none;

            color: var(--dark);

            font-weight: 500;

            transition: all 0.3s ease;

        }

        

        .nav-link:hover, .nav-link.active {

            background: var(--primary);

            color: white;

        }

        

        .container {

            max-width: 1400px;

            margin: 0 auto;

            padding: 2rem;

        }

        

        .dashboard-header {

            display: flex;

            justify-content: space-between;

            align-items: center;

            margin-bottom: 2rem;

            flex-wrap: wrap;

        }

        

        h1 {

            font-size: 2rem;

            color: var(--primary);

            margin-bottom: 0.5rem;

        }

        

        .subtitle {

            color: #6c757d;

            font-size: 1rem;

        }

        

        .date-filter {

            display: flex;

            align-items: center;

            gap: 1rem;

            background: white;

            padding: 10px 15px;

            border-radius: 50px;

            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

        }

        

        .stats-grid {

            display: grid;

            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

            gap: 1.5rem;

            margin-bottom: 2rem;

        }

        

        .stat-card {

            background: white;

            border-radius: 15px;

            padding: 1.5rem;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

            transition: all 0.3s ease;

        }

        

        .stat-card:hover {

            transform: translateY(-5px);

            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

        }

        

        .stat-card.critical {

            border-top: 4px solid var(--danger);

        }

        

        .stat-card.warning {

            border-top: 4px solid var(--warning);

        }

        

        .stat-card.success {

            border-top: 4px solid var(--success);

        }

        

        .stat-card.primary {

            border-top: 4px solid var(--primary);

        }

        

        .stat-title {

            font-size: 0.9rem;

            color: #6c757d;

            margin-bottom: 0.5rem;

            display: flex;

            align-items: center;

            gap: 0.5rem;

        }

        

        .stat-value {

            font-size: 2rem;

            font-weight: 700;

            margin-bottom: 0.5rem;

        }

        

        .stat-change {

            font-size: 0.8rem;

            display: flex;

            align-items: center;

            gap: 0.3rem;

        }

        

        .stat-change.positive {

            color: #28a745;

        }

        

        .stat-change.negative {

            color: var(--danger);

        }

        

        .charts-grid {

            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 1.5rem;

            margin-bottom: 2rem;

        }

        

        @media (max-width: 992px) {

            .charts-grid {

                grid-template-columns: 1fr;

            }

        }

        

        .chart-card {

            background: white;

            border-radius: 15px;

            padding: 1.5rem;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

        }

        

        .chart-container {

            position: relative;

            height: 300px;

            width: 100%;

        }

        

        .critical-errors {

            background: white;

            border-radius: 15px;

            padding: 1.5rem;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

            margin-bottom: 2rem;

        }

        

        .error-table {

            width: 100%;

            border-collapse: collapse;

            margin-top: 1rem;

        }

        

        .error-table th, .error-table td {

            padding: 12px 15px;

            text-align: left;

            border-bottom: 1px solid #e9ecef;

        }

        

        .error-table th {

            font-weight: 600;

            color: var(--primary);

            background: #f8f9fa;

        }

        

        .error-table tr:hover {

            background: #f8f9fa;

        }

        

        .severity-badge {

            display: inline-block;

            padding: 4px 10px;

            border-radius: 50px;

            font-size: 0.8rem;

            font-weight: 600;

        }

        

        .severity-high {

            background: rgba(247, 37, 133, 0.1);

            color: var(--danger);

        }

        

        .severity-medium {

            background: rgba(255, 193, 7, 0.1);

            color: #ffc107;

        }

        

        .severity-low {

            background: rgba(40, 167, 69, 0.1);

            color: #28a745;

        }

        

        .btn {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            padding: 10px 20px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 0.9rem;

            gap: 8px;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-outline {

            background: transparent;

            color: var(--primary);

            border: 2px solid var(--primary);

        }

        

        .btn-outline:hover {

            background: var(--primary);

            color: white;

        }

        

        .loader {

            display: inline-block;

            width: 20px;

            height: 20px;

            border: 3px solid rgba(67, 97, 238, 0.3);

            border-radius: 50%;

            border-top-color: var(--primary);

            animation: spin 1s ease-in-out infinite;

            margin-right: 10px;

        }

        

        @keyframes spin {

            to { transform: rotate(360deg); }

        }

    </style>

</head>

<body>

    <div class="header">

        <div class="logo">

            <div class="logo-icon">CE</div>

            <h2>CraneError Pro</h2>

        </div>

        <div class="nav-links">

            <a href="dashboard.html" class="nav-link active">📊 Dashboard</a>

            <a href="entry-mode.html" class="nav-link">🔍 Error Lookup</a>

            <a href="reports.html" class="nav-link">📄 Reports</a>

            <a href="settings.html" class="nav-link">⚙️ Settings</a>

        </div>

    </div>

    

    <div class="container">

        <div class="dashboard-header">

            <div>

                <h1>Error Analytics Dashboard</h1>

                <p class="subtitle">Monitor crane errors and maintenance activities</p>

            </div>

            <div class="date-filter">

                <select id="timeRange" class="form-control">

                    <option value="7">Last 7 Days</option>

                    <option value="30" selected>Last 30 Days</option>

                    <option value="90">Last Quarter</option>

                    <option value="365">Last Year</option>

                    <option value="custom">Custom Range</option>

                </select>

                <button class="btn btn-primary" style="padding: 8px 15px;">

                    Apply

                </button>

            </div>

        </div>

        

        <div class="stats-grid">

            <div class="stat-card critical">

                <div class="stat-title">🚨 Critical Errors</div>

                <div class="stat-value">18</div>

                <div class="stat-change negative">

                    <span>↑ 12% from last period</span>

                </div>

            </div>

            

            <div class="stat-card warning">

                <div class="stat-title">⚠️ High Priority Errors</div>

                <div class="stat-value">42</div>

                <div class="stat-change positive">

                    <span>↓ 8% from last period</span>

                </div>

            </div>

            

            <div class="stat-card success">

                <div class="stat-title">✅ Errors Resolved</div>

                <div class="stat-value">156</div>

                <div class="stat-change positive">

                    <span>↑ 23% from last period</span>

                </div>

            </div>

            

            <div class="stat-card primary">

                <div class="stat-title">🏗️ Cranes Monitored</div>

                <div class="stat-value">27</div>

                <div class="stat-change">

                    <span>No change</span>

                </div>

            </div>

        </div>

        

        <div class="charts-grid">

            <div class="chart-card">

                <h3>Errors by Type</h3>

                <div class="chart-container">

                    <canvas id="errorTypeChart"></canvas>

                </div>

            </div>

            

            <div class="chart-card">

                <h3>Monthly Error Trend</h3>

                <div class="chart-container">

                    <canvas id="monthlyTrendChart"></canvas>

                </div>

            </div>

        </div>

        

        <div class="critical-errors">

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">

                <h3>🚨 Critical Errors Needing Attention</h3>

                <button class="btn btn-primary">Export Report</button>

            </div>

            

            <table class="error-table">

                <thead>

                    <tr>

                        <th>Crane ID</th>

                        <th>Error Code</th>

                        <th>Description</th>

                        <th>Severity</th>

                        <th>Days Open</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>CRN-2023-015</td>

                        <td>E-402</td>

                        <td>Structural stress exceeding limits</td>

                        <td><span class="severity-badge severity-high">Critical</span></td>

                        <td>14</td>

                        <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">View Details</button></td>

                    </tr>

                    <tr>

                        <td>CRN-2023-008</td>

                        <td>E-305</td>

                        <td>Hydraulic system failure</td>

                        <td><span class="severity-badge severity-high">Critical</span></td>

                        <td>9</td>

                        <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">View Details</button></td>

                    </tr>

                    <tr>

                        <td>CRN-2023-022</td>

                        <td>E-210</td>

                        <td>Brake system malfunction</td>

                        <td><span class="severity-badge severity-high">Critical</span></td>

                        <td>5</td>

                        <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">View Details</button></td>

                    </tr>

                    <tr>

                        <td>CRN-2023-003</td>

                        <td>E-501</td>

                        <td>Load sensor calibration failure</td>

                        <td><span class="severity-badge severity-high">Critical</span></td>

                        <td>3</td>

                        <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">View Details</button></td>

                    </tr>

                </tbody>

            </table>

        </div>

        

        <div class="chart-card">

            <h3>Error Resolution Time</h3>

            <div class="chart-container">

                <canvas id="resolutionTimeChart"></canvas>

            </div>

        </div>

    </div>



    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>

    <script>

        // Initialize charts

        document.addEventListener('DOMContentLoaded', function() {

            // Error Type Chart

            const errorTypeCtx = document.getElementById('errorTypeChart').getContext('2d');

            const errorTypeChart = new Chart(errorTypeCtx, {

                type: 'doughnut',

                data: {

                    labels: ['Hydraulic', 'Electrical', 'Mechanical', 'Structural', 'Sensor', 'Other'],

                    datasets: [{

                        data: [35, 28, 22, 10, 15, 5],

                        backgroundColor: [

                            '#4361ee',

                            '#4cc9f0',

                            '#4895ef',

                            '#3f37c9',

                            '#f72585',

                            '#6c757d'

                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: 'right'

                        }

                    },

                    cutout: '70%'

                }

            });

            

            // Monthly Trend Chart

            const monthlyTrendCtx = document.getElementById('monthlyTrendChart').getContext('2d');

            const monthlyTrendChart = new Chart(monthlyTrendCtx, {

                type: 'line',

                data: {

                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],

                    datasets: [

                        {

                            label: 'Total Errors',

                            data: [45, 52, 68, 74, 62, 58, 71],

                            borderColor: '#4361ee',

                            backgroundColor: 'rgba(67, 97, 238, 0.1)',

                            tension: 0.3,

                            fill: true

                        },

                        {

                            label: 'Critical Errors',

                            data: [5, 8, 12, 15, 10, 14, 18],

                            borderColor: '#f72585',

                            backgroundColor: 'rgba(247, 37, 133, 0.1)',

                            tension: 0.3,

                            fill: true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: 'top'

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            });

            

            // Resolution Time Chart

            const resolutionTimeCtx = document.getElementById('resolutionTimeChart').getContext('2d');

            const resolutionTimeChart = new Chart(resolutionTimeCtx, {

                type: 'bar',

                data: {

                    labels: ['<1 day', '1-3 days', '3-7 days', '1-2 weeks', '>2 weeks'],

                    datasets: [{

                        label: 'Resolution Time',

                        data: [65, 42, 28, 15, 8],

                        backgroundColor: [

                            '#4cc9f0',

                            '#4895ef',

                            '#4361ee',

                            '#3f37c9',

                            '#f72585'

                        ]

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            title: {

                                display: true,

                                text: 'Number of Errors'

                            }

                        },

                        x: {

                            title: {

                                display: true,

                                text: 'Time to Resolution'

                            }

                        }

                    }

                }

            });

            

            // Time range filter

            document.querySelector('.date-filter button').addEventListener('click', function() {

                const timeRange = document.getElementById('timeRange').value;

                // Show loading state

                this.innerHTML = '<span class="loader"></span> Loading...';

                

                // Simulate data loading

                setTimeout(() => {

                    this.textContent = 'Apply';

                    // In a real app, you would update the charts with new data

                    alert(`Data filtered for ${getTimeRangeText(timeRange)}`);

                }, 1000);

            });

            

            function getTimeRangeText(value) {

                switch(value) {

                    case '7': return 'Last 7 Days';

                    case '30': return 'Last 30 Days';

                    case '90': return 'Last Quarter';

                    case '365': return 'Last Year';

                    default: return 'Custom Range';

                }

            }

        });

    </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Entry Mode - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

            min-height: 100vh;

            display: flex;

            justify-content: center;

            align-items: center;

            color: var(--dark);

        }

        

        .container {

            width: 100%;

            max-width: 1000px;

            padding: 2rem;

        }

        

        .header {

            text-align: center;

            margin-bottom: 3rem;

        }

        

        .logo {

            display: inline-flex;

            align-items: center;

            margin-bottom: 1rem;

        }

        

        .logo-icon {

            width: 40px;

            height: 40px;

            background: var(--primary);

            border-radius: 10px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            color: white;

            font-size: 18px;

            font-weight: bold;

        }

        

        h1 {

            font-size: 2rem;

            font-weight: 700;

            margin-bottom: 1rem;

            color: var(--primary);

        }

        

        .subtitle {

            font-size: 1rem;

            opacity: 0.8;

            max-width: 600px;

            margin: 0 auto;

        }

        

        .options-container {

            display: flex;

            justify-content: center;

            flex-wrap: wrap;

            gap: 2rem;

        }

        

        .option-card {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            border-radius: 20px;

            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);

            padding: 2rem;

            width: 100%;

            max-width: 300px;

            text-align: center;

            transition: all 0.3s ease;

            cursor: pointer;

            position: relative;

            overflow: hidden;

        }

        

        .option-card:hover {

            transform: translateY(-10px);

            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);

        }

        

        .option-card::after {

            content: '';

            position: absolute;

            top: 0;

            left: 0;

            width: 100%;

            height: 5px;

            background: linear-gradient(90deg, var(--primary), var(--accent));

            transition: all 0.3s ease;

        }

        

        .option-card:hover::after {

            height: 10px;

        }

        

        .option-icon {

            font-size: 3rem;

            margin-bottom: 1.5rem;

            color: var(--primary);

            transition: all 0.3s ease;

        }

        

        .option-card:hover .option-icon {

            transform: scale(1.1);

        }

        

        .option-title {

            font-size: 1.3rem;

            font-weight: 600;

            margin-bottom: 1rem;

        }

        

        .option-desc {

            font-size: 0.9rem;

            opacity: 0.7;

            margin-bottom: 1.5rem;

        }

        

        .btn {

            display: inline-block;

            padding: 12px 25px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 0.9rem;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .back-btn {

            display: flex;

            align-items: center;

            justify-content: center;

            margin-top: 3rem;

            color: var(--dark);

            opacity: 0.7;

            transition: all 0.3s ease;

        }

        

        .back-btn:hover {

            opacity: 1;

            color: var(--primary);

        }

        

        @media (max-width: 768px) {

            .options-container {

                flex-direction: column;

                align-items: center;

            }

        }

    </style>

</head>

<body>

    <div class="container animate__animated animate__fadeIn">

        <div class="header">

            <div class="logo">

                <div class="logo-icon">CE</div>

                <h2>CraneError Pro</h2>

            </div>

            <h1>Select Entry Mode</h1>

            <p class="subtitle">Choose how you want to identify the crane to find error information</p>

        </div>

        

        <div class="options-container">

            <div class="option-card animate__animated animate__fadeInLeft" onclick="window.location.href='qr-scanner.html'">

                <div class="option-icon">📷</div>

                <h3 class="option-title">QR Scanner</h3>

                <p class="option-desc">Scan the crane's QR code for instant identification and error lookup</p>

                <button class="btn btn-primary">Select</button>

            </div>

            

            <div class="option-card animate__animated animate__fadeInRight" onclick="window.location.href='manual-entry.html'">

                <div class="option-icon">⌨️</div>

                <h3 class="option-title">Manual Entry</h3>

                <p class="option-desc">Enter the crane ID manually if QR code is unavailable or damaged</p>

                <button class="btn btn-primary">Select</button>

            </div>

        </div>

        

        <div class="back-btn animate__animated animate__fadeIn animate__delay-1s" onclick="window.location.href='index.html'">

            ← Back to Home

        </div>

    </div>



    <script>

        // Add hover effect with JavaScript for better performance

        document.querySelectorAll('.option-card').forEach(card => {

            card.addEventListener('mouseenter', function() {

                this.style.transform = 'translateY(-10px)';

                this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';

                this.querySelector('.option-icon').style.transform = 'scale(1.1)';

            });

            

            card.addEventListener('mouseleave', function() {

                this.style.transform = 'translateY(0)';

                this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';

                this.querySelector('.option-icon').style.transform = 'scale(1)';

            });

        });

    </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Error Information - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

            --danger: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: #f8f9fa;

            color: var(--dark);

            min-height: 100vh;

        }

        

        .header {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            padding: 1.5rem;

            display: flex;

            justify-content: space-between;

            align-items: center;

            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

            position: sticky;

            top: 0;

            z-index: 100;

        }

        

        .logo {

            display: flex;

            align-items: center;

        }

        

        .logo-icon {

            width: 40px;

            height: 40px;

            background: var(--primary);

            border-radius: 10px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            color: white;

            font-size: 18px;

            font-weight: bold;

        }

        

        .container {

            max-width: 1200px;

            margin: 0 auto;

            padding: 2rem;

        }

        

        .status-card {

            background: white;

            border-radius: 20px;

            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

            padding: 2rem;

            margin-bottom: 2rem;

            transition: all 0.3s ease;

        }

        

        .status-card:hover {

            transform: translateY(-5px);

            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);

        }

        

        .crane-header {

            display: flex;

            justify-content: space-between;

            align-items: center;

            margin-bottom: 1.5rem;

            flex-wrap: wrap;

        }

        

        h1 {

            font-size: 1.8rem;

            color: var(--primary);

            margin-bottom: 0.5rem;

        }

        

        .error-code {

            display: inline-block;

            padding: 5px 15px;

            background: var(--warning);

            color: white;

            border-radius: 50px;

            font-weight: 600;

            font-size: 0.9rem;

            margin-left: 1rem;

        }

        

        .meta-info {

            display: flex;

            gap: 1rem;

            flex-wrap: wrap;

            margin-bottom: 1.5rem;

        }

        

        .meta-item {

            display: flex;

            align-items: center;

            background: #f1f3f5;

            padding: 8px 15px;

            border-radius: 50px;

            font-size: 0.9rem;

        }

        

        .meta-item i {

            margin-right: 8px;

            opacity: 0.7;

        }

        

        .severity {

            display: inline-block;

            padding: 5px 15px;

            border-radius: 50px;

            font-weight: 600;

            font-size: 0.9rem;

        }

        

        .severity.high {

            background: rgba(247, 37, 133, 0.1);

            color: var(--danger);

        }

        

        .severity.medium {

            background: rgba(255, 193, 7, 0.1);

            color: #ffc107;

        }

        

        .severity.low {

            background: rgba(40, 167, 69, 0.1);

            color: #28a745;

        }

        

        .error-description {

            background: #f8f9fa;

            padding: 1.5rem;

            border-radius: 15px;

            margin-bottom: 2rem;

            line-height: 1.6;

        }

        

        .steps-container {

            margin-top: 2rem;

        }

        

        .step {

            display: flex;

            margin-bottom: 2rem;

            position: relative;

            padding-left: 40px;

        }

        

        .step-number {

            position: absolute;

            left: 0;

            top: 0;

            width: 30px;

            height: 30px;

            background: var(--primary);

            color: white;

            border-radius: 50%;

            display: flex;

            align-items: center;

            justify-content: center;

            font-weight: 600;

        }

        

        .step-content {

            flex: 1;

            background: white;

            border-radius: 15px;

            padding: 1.5rem;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);

        }

        

        .step-title {

            font-weight: 600;

            margin-bottom: 0.5rem;

            color: var(--primary);

        }

        

        .step-image {

            margin-top: 1rem;

            border-radius: 10px;

            overflow: hidden;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

            max-width: 100%;

            height: auto;

        }

        

        .step-image img {

            width: 100%;

            height: auto;

            display: block;

            transition: all 0.3s ease;

        }

        

        .step-image:hover img {

            transform: scale(1.03);

        }

        

        .action-buttons {

            display: flex;

            gap: 1rem;

            margin-top: 2rem;

            flex-wrap: wrap;

        }

        

        .btn {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            padding: 12px 25px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 0.95rem;

            gap: 8px;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-outline {

            background: transparent;

            color: var(--primary);

            border: 2px solid var(--primary);

        }

        

        .btn-outline:hover {

            background: var(--primary);

            color: white;

        }

        

        .btn-secondary {

            background: #e9ecef;

            color: var(--dark);

        }

        

        .btn-secondary:hover {

            background: #dee2e6;

            transform: translateY(-3px);

        }

        

        .not-found {

            text-align: center;

            padding: 4rem 2rem;

        }

        

        .not-found-icon {

            font-size: 5rem;

            color: var(--warning);

            margin-bottom: 1.5rem;

            opacity: 0.7;

        }

        

        .not-found h2 {

            font-size: 2rem;

            margin-bottom: 1rem;

            color: var(--dark);

        }

        

        .not-found p {

            font-size: 1.1rem;

            opacity: 0.8;

            margin-bottom: 2rem;

            max-width: 600px;

            margin-left: auto;

            margin-right: auto;

        }

        

        @media (max-width: 768px) {

            .container {

                padding: 1.5rem;

            }

            

            .crane-header {

                flex-direction: column;

                align-items: flex-start;

            }

            

            .error-code {

                margin-left: 0;

                margin-top: 0.5rem;

            }

            

            .step {

                padding-left: 30px;

            }

            

            .step-number {

                width: 25px;

                height: 25px;

                font-size: 0.8rem;

            }

        }

    </style>

</head>

<body>

    <div class="header animate__animated animate__fadeIn">

        <div class="logo">

            <div class="logo-icon">CE</div>

            <h2>CraneError Pro</h2>

        </div>

        <button class="btn-outline" onclick="window.location.href='entry-mode.html'">New Search</button>

    </div>

    

    <div class="container">

        <!-- Content will be dynamically loaded here -->

        <div id="content" class="animate__animated animate__fadeIn">

            <!-- Default loading state -->

            <div class="status-card">

                <div style="display: flex; justify-content: center; padding: 2rem;">

                    <div class="loader"></div>

                </div>

            </div>

        </div>

    </div>



    <script>

        // Get crane ID from URL

        const urlParams = new URLSearchParams(window.location.search);

        const craneId = urlParams.get('craneId');

        const contentDiv = document.getElementById('content');

        

        // Mock database - in a real app, you would fetch from MongoDB

        const mockDatabase = {

            "CRN-2023-001": {

                found: true,

                model: "Tower Crane X-2000",

                serial: "TCX2-001-2023",

                errorCode: "E-102",

                errorDescription: "Hydraulic pressure has dropped below the minimum operational threshold. This may be caused by a leak in the hydraulic system, low fluid levels, or a failing pump.",

                severity: "high",

                lastMaintenance: "2023-05-15",

                steps: [

                    {

                        title: "Check Hydraulic Fluid Level",

                        description: "Locate the hydraulic fluid reservoir and check the fluid level against the marked indicators. Top up if necessary with the recommended hydraulic fluid (ISO VG 46).",

                        image: "https://example.com/hydraulic-check.jpg"

                    },

                    {

                        title: "Inspect for Leaks",

                        description: "Visually inspect all hydraulic lines and connections for signs of leakage. Pay special attention to joints and areas with visible wear.",

                        image: "https://example.com/leak-inspection.jpg"

                    },

                    {

                        title: "Check Pressure Gauge",

                        description: "Monitor the hydraulic pressure gauge during operation. Normal operating pressure should be between 250-300 psi. If pressure is inconsistent, the pump may need servicing.",

                        image: "https://example.com/pressure-gauge.jpg"

                    },

                    {

                        title: "Bleed Air from System",

                        description: "If the system was recently serviced, there may be air in the lines. Follow the manufacturer's procedure to bleed air from the hydraulic system.",

                        image: "https://example.com/bleeding-system.jpg"

                    }

                ],

                additionalNotes: "If the problem persists after these steps, contact certified technician for pump inspection. Do not operate the crane if hydraulic pressure cannot be maintained."

            },

            "CRN-2023-002": {

                found: true,

                model: "Mobile Crane Y-500",

                serial: "MCY5-002-2023",

                errorCode: "E-205",

                errorDescription: "The boom angle sensor is providing inconsistent readings, which may affect load calculations and safety systems.",

                severity: "medium",

                lastMaintenance: "2023-06-20",

                steps: [

                    {

                        title: "Inspect Sensor Connections",

                        description: "Locate the boom angle sensor (typically near the boom pivot point) and check all electrical connections for corrosion or looseness.",

                        image: "https://example.com/sensor-connections.jpg"

                    },

                    {

                        title: "Clean Sensor Surface",

                        description: "Gently clean the sensor surface with a dry, lint-free cloth to ensure proper operation.",

                        image: "https://example.com/cleaning-sensor.jpg"

                    },

                    {

                        title: "Calibrate Sensor",

                        description: "Follow the manufacturer's calibration procedure to reset the sensor's zero position and verify accurate readings.",

                        image: "https://example.com/calibration.jpg"

                    }

                ],

                additionalNotes: "If calibration fails repeatedly, the sensor may need replacement. Avoid operating at maximum capacity until resolved."

            }

        };

        

        // Simulate database lookup with delay

        setTimeout(() => {

            if (craneId && mockDatabase[craneId]) {

                const data = mockDatabase[craneId];

                renderErrorInfo(craneId, data);

            } else {

                renderNotFound(craneId);

            }

        }, 1000);

        

        function renderErrorInfo(craneId, data) {

            let html = `

                <div class="status-card animate__animated animate__fadeIn">

                    <div class="crane-header">

                        <div>

                            <h1>Crane ${craneId} <span class="error-code">${data.errorCode}</span></h1>

                            <p>${data.model}</p>

                        </div>

                        <span class="severity ${data.severity}">${data.severity.toUpperCase()}</span>

                    </div>

                    

                    <div class="meta-info">

                        <div class="meta-item"><i>📅</i> Last Maintenance: ${data.lastMaintenance}</div>

                        <div class="meta-item"><i>🆔</i> Serial: ${data.serial}</div>

                    </div>

                    

                    <div class="error-description">

                        <h3>Error Description</h3>

                        <p>${data.errorDescription}</p>

                    </div>

                    

                    <div class="steps-container">

                        <h3>Troubleshooting Steps</h3>

            `;

            

            data.steps.forEach((step, index) => {

                html += `

                    <div class="step animate__animated animate__fadeIn" style="animation-delay: ${index * 0.1}s">

                        <div class="step-number">${index + 1}</div>

                        <div class="step-content">

                            <div class="step-title">${step.title}</div>

                            <p>${step.description}</p>

                            <div class="step-image">

                                <img src="${step.image}" alt="${step.title}">

                            </div>

                        </div>

                    </div>

                `;

            });

            

            html += `

                    </div>

                    

                    ${data.additionalNotes ? `

                    <div class="error-description">

                        <h3>Additional Notes</h3>

                        <p>${data.additionalNotes}</p>

                    </div>

                    ` : ''}

                    

                    <div class="action-buttons">

                        <button class="btn btn-primary" onclick="saveReport()">

                            <span>💾</span> Save Report

                        </button>

                        <button class="btn btn-outline" onclick="printReport()">

                            <span>🖨️</span> Print

                        </button>

                        <button class="btn btn-secondary" onclick="window.location.href='entry-mode.html'">

                            <span>🔍</span> New Search

                        </button>

                    </div>

                </div>

            `;

            

            contentDiv.innerHTML = html;

        }

        

        function renderNotFound(craneId) {

            contentDiv.innerHTML = `

                <div class="status-card not-found animate__animated animate__fadeIn">

                    <div class="not-found-icon">❌</div>

                    <h2>No Records Found</h2>

                    <p>We couldn't find any error information for crane <strong>${craneId || 'N/A'}</strong> in our database.</p>

                    

                    <div class="action-buttons" style="justify-content: center;">

                        <button class="btn btn-primary" onclick="window.location.href='manual-entry.html'">

                            <span>⌨️</span> Try Manual Entry

                        </button>

                        <button class="btn btn-outline" onclick="window.location.href='qr-scanner.html'">

                            <span>📷</span> Try QR Scanner

                        </button>

                        <button class="btn btn-secondary" onclick="window.location.href='entry-mode.html'">

                            <span>↩️</span> Back to Search

                        </button>

                    </div>

                </div>

            `;

        }

        

        function saveReport() {

            // In a real app, implement save functionality

            alert('Report saved to your local storage!');

            

            // Add visual feedback

            const btn = document.querySelector('.btn-primary');

            btn.innerHTML = '<span>✓</span> Saved!';

            setTimeout(() => {

                btn.innerHTML = '<span>💾</span> Save Report';

            }, 2000);

        }

        

        function printReport() {

            window.print();

        }

    </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

            min-height: 100vh;

            display: flex;

            justify-content: center;

            align-items: center;

            color: var(--dark);

        }

        

        .container {

            width: 100%;

            max-width: 1200px;

            padding: 2rem;

        }

        

        .card {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            border-radius: 20px;

            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

            overflow: hidden;

            display: flex;

            min-height: 600px;

            transition: all 0.3s ease;

        }

        

        .hero-section {

            flex: 1;

            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);

            color: white;

            padding: 3rem;

            display: flex;

            flex-direction: column;

            justify-content: center;

            position: relative;

            overflow: hidden;

        }

        

        .hero-section::before {

            content: '';

            position: absolute;

            top: -50%;

            left: -50%;

            width: 200%;

            height: 200%;

            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);

            animation: pulse 8s infinite linear;

        }

        

        @keyframes pulse {

            0% { transform: rotate(0deg); }

            100% { transform: rotate(360deg); }

        }

        

        .hero-content {

            position: relative;

            z-index: 2;

        }

        

        .logo {

            display: flex;

            align-items: center;

            margin-bottom: 2rem;

        }

        

        .logo-icon {

            width: 50px;

            height: 50px;

            background: white;

            border-radius: 12px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 15px;

            color: var(--primary);

            font-size: 24px;

            font-weight: bold;

        }

        

        h1 {

            font-size: 2.5rem;

            font-weight: 700;

            margin-bottom: 1rem;

            line-height: 1.2;

        }

        

        .subtitle {

            font-size: 1.1rem;

            opacity: 0.9;

            margin-bottom: 2rem;

            line-height: 1.6;

        }

        

        .action-section {

            flex: 1;

            padding: 3rem;

            display: flex;

            flex-direction: column;

            justify-content: center;

        }

        

        .btn {

            display: inline-block;

            padding: 15px 30px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            text-align: center;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 1rem;

            margin: 0.5rem 0;

            width: 100%;

            max-width: 300px;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-outline {

            background: transparent;

            color: var(--primary);

            border: 2px solid var(--primary);

        }

        

        .btn-outline:hover {

            background: var(--primary);

            color: white;

            transform: translateY(-3px);

        }

        

        .crane-icon {

            position: absolute;

            bottom: -50px;

            right: -50px;

            opacity: 0.1;

            font-size: 300px;

            z-index: 1;

        }

        

        .features {

            display: flex;

            margin-top: 2rem;

            flex-wrap: wrap;

        }

        

        .feature {

            flex: 1;

            min-width: 150px;

            margin: 0.5rem;

            padding: 1rem;

            background: rgba(255, 255, 255, 0.2);

            border-radius: 10px;

            text-align: center;

            backdrop-filter: blur(5px);

        }

        

        .feature-icon {

            font-size: 1.5rem;

            margin-bottom: 0.5rem;

        }

        

        @media (max-width: 992px) {

            .card {

                flex-direction: column;

            }

            

            .hero-section {

                padding: 2rem;

            }

            

            .action-section {

                padding: 2rem;

            }

        }

    </style>

</head>

<body>

    <div class="container animate__animated animate__fadeIn">

        <div class="card">

            <div class="hero-section">

                <div class="hero-content">

                    <div class="logo">

                        <div class="logo-icon">CE</div>

                        <h2>CraneError Pro</h2>

                    </div>

                    <h1>Advanced Crane Diagnostics</h1>

                    <p class="subtitle">Identify, troubleshoot, and resolve crane issues with our comprehensive error finding system. Streamline your maintenance workflow with instant access to technical solutions.</p>

                    

                    <div class="features">

                        <div class="feature animate__animated animate__fadeInUp animate__delay-1s">

                            <div class="feature-icon">🔍</div>

                            <div>Quick Search</div>

                        </div>

                        <div class="feature animate__animated animate__fadeInUp animate__delay-2s">

                            <div class="feature-icon">📱</div>

                            <div>QR Scanning</div>

                        </div>

                        <div class="feature animate__animated animate__fadeInUp animate__delay-3s">

                            <div class="feature-icon">📊</div>

                            <div>Detailed Reports</div>

                        </div>

                    </div>

                </div>

                <div class="crane-icon">🏗️</div>

            </div>

            

            <div class="action-section">

                <h2 class="animate__animated animate__fadeIn">Get Started</h2>

                <p class="subtitle animate__animated animate__fadeIn animate__delay-1s">Login for full access or continue as guest</p>

                

                <div class="animate__animated animate__fadeIn animate__delay-2s">

                    <a href="login.html" class="btn btn-primary">Login</a>

                    <button onclick="guestAccess()" class="btn btn-outline">Guest Access</button>

                </div>

            </div>

        </div>

    </div>



    <script>

        function guestAccess() {

            localStorage.setItem('auth', 'guest');

            // Add animation before redirect

            document.querySelector('.card').classList.add('animate__animated', 'animate__fadeOut');

            setTimeout(() => {

                window.location.href = 'entry-mode.html';

            }, 500);

        }

    </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Login - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

            min-height: 100vh;

            display: flex;

            justify-content: center;

            align-items: center;

            color: var(--dark);

        }

        

        .login-container {

            width: 100%;

            max-width: 400px;

            padding: 2rem;

        }

        

        .login-card {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            border-radius: 20px;

            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

            overflow: hidden;

            padding: 2.5rem;

            transform: perspective(1000px) rotateX(0deg);

            transition: transform 0.5s ease, box-shadow 0.5s ease;

        }

        

        .login-card:hover {

            transform: perspective(1000px) rotateX(5deg);

            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

        }

        

        .logo {

            display: flex;

            align-items: center;

            justify-content: center;

            margin-bottom: 2rem;

        }

        

        .logo-icon {

            width: 50px;

            height: 50px;

            background: var(--primary);

            border-radius: 12px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 15px;

            color: white;

            font-size: 24px;

            font-weight: bold;

        }

        

        h2 {

            font-size: 1.8rem;

            font-weight: 700;

            margin-bottom: 2rem;

            text-align: center;

            color: var(--primary);

        }

        

        .form-group {

            margin-bottom: 1.5rem;

            position: relative;

        }

        

        .form-group label {

            display: block;

            margin-bottom: 0.5rem;

            font-weight: 500;

            color: var(--dark);

        }

        

        .form-control {

            width: 100%;

            padding: 15px 20px;

            border: 2px solid #e9ecef;

            border-radius: 10px;

            font-size: 1rem;

            transition: all 0.3s ease;

            background: #f8f9fa;

        }

        

        .form-control:focus {

            border-color: var(--primary);

            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);

            outline: none;

            background: white;

        }

        

        .btn {

            display: inline-block;

            padding: 15px 30px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            text-align: center;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 1rem;

            width: 100%;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-link {

            background: none;

            color: var(--primary);

            text-decoration: underline;

            padding: 0;

            margin-top: 1rem;

            display: inline-block;

        }

        

        .btn-link:hover {

            color: var(--secondary);

        }

        

        .back-btn {

            display: flex;

            align-items: center;

            justify-content: center;

            margin-top: 1.5rem;

            color: var(--dark);

            opacity: 0.7;

            transition: all 0.3s ease;

        }

        

        .back-btn:hover {

            opacity: 1;

            color: var(--primary);

        }

        

        .input-icon {

            position: absolute;

            right: 20px;

            top: 50%;

            transform: translateY(-50%);

            color: #adb5bd;

        }

        

        .floating {

            animation: floating 3s ease-in-out infinite;

        }

        

        @keyframes floating {

            0% { transform: translateY(0px); }

            50% { transform: translateY(-10px); }

            100% { transform: translateY(0px); }

        }

    </style>

</head>

<body>

    <div class="login-container">

        <div class="login-card animate__animated animate__fadeIn">

            <div class="logo">

                <div class="logo-icon floating animate__animated animate__bounceIn">CE</div>

                <h1>CraneError Pro</h1>

            </div>

            

            <h2 class="animate__animated animate__fadeIn">Welcome Back</h2>

            

            <form id="loginForm" class="animate__animated animate__fadeIn animate__delay-1s">

                <div class="form-group">

                    <label for="username">Username</label>

                    <input type="text" id="username" class="form-control" placeholder="Enter your username" required>

                    <span class="input-icon">👤</span>

                </div>

                

                <div class="form-group">

                    <label for="password">Password</label>

                    <input type="password" id="password" class="form-control" placeholder="Enter your password" required>

                    <span class="input-icon">🔒</span>

                </div>

                

                <button type="submit" class="btn btn-primary">Login</button>

                

                <div style="text-align: center; margin-top: 1rem;">

                    

                </div>

                <div style="text-align: center; margin-top: 1rem;">

                <div style="text-align: center; margin-top: 1rem;">

    <a href="#" class="btn-link">Forgot password?</a>

</div>



<div style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem;">

    Don't have an account? 

    <a href="signup.html" style="color: var(--primary); text-decoration: underline;">

        Register here

    </a>

</div>





            </form>

            

            <div class="back-btn animate__animated animate__fadeIn animate__delay-2s" onclick="window.location.href='index.html'">

                ← Back to Home

            </div>

        </div>

    </div>



   <!-- Your full styled HTML remains the same up to the script tag -->



<script>

    document.getElementById('loginForm').addEventListener('submit', async function (e) {

        e.preventDefault();



        const username = document.getElementById('username').value.trim();

        const password = document.getElementById('password').value.trim();

        const btn = this.querySelector('button[type="submit"]');

        btn.innerHTML = '<span class="loader"></span> Authenticating...';

        btn.disabled = true;



        try {

            const res = await fetch('/api/auth/login', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ username, password })

            });



            const data = await res.json();



            if (res.ok) {

                localStorage.setItem('authToken', data.token);

                document.querySelector('.login-card').classList.add('animate__animated', 'animate__fadeOutUp');

                setTimeout(() => {

                    window.location.href = 'entry-mode.html';

                }, 500);

            } else {

                alert(data.message || 'Invalid credentials');

            }

        } catch (err) {

            alert('Server error. Please try again later.');

            console.error(err);

        } finally {

            btn.innerHTML = 'Login';

            btn.disabled = false;

        }

    });



    // Floating effect

    document.querySelectorAll('.form-control').forEach(input => {

        input.addEventListener('focus', function () {

            this.parentElement.style.transform = 'translateY(-5px)';

        });



        input.addEventListener('blur', function () {

            this.parentElement.style.transform = 'translateY(0)';

        });

    });

</script>



</body>

</html>k<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Manual Entry - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

            min-height: 100vh;

            display: flex;

            flex-direction: column;

        }

        

        .header {

            background: rgba(255, 255, 255, 0.9);

            backdrop-filter: blur(10px);

            padding: 1.5rem;

            display: flex;

            justify-content: space-between;

            align-items: center;

            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

        }

        

        .logo {

            display: flex;

            align-items: center;

        }

        

        .logo-icon {

            width: 40px;

            height: 40px;

            background: var(--primary);

            border-radius: 10px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            color: white;

            font-size: 18px;

            font-weight: bold;

        }

        

        .container {

            flex: 1;

            display: flex;

            justify-content: center;

            align-items: center;

            padding: 2rem;

        }

        

        .entry-card {

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(10px);

            border-radius: 20px;

            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

            padding: 3rem;

            width: 100%;

            max-width: 500px;

            transform-style: preserve-3d;

            transform: perspective(1000px);

        }

        

        h1 {

            font-size: 2rem;

            font-weight: 700;

            margin-bottom: 1.5rem;

            color: var(--primary);

            text-align: center;

        }

        

        .form-group {

            margin-bottom: 1.5rem;

            position: relative;

        }

        

        .form-group label {

            display: block;

            margin-bottom: 0.5rem;

            font-weight: 500;

            color: var(--dark);

        }

        

        .form-control {

            width: 100%;

            padding: 15px 20px;

            border: 2px solid #e9ecef;

            border-radius: 12px;

            font-size: 1rem;

            transition: all 0.3s ease;

            background: #f8f9fa;

            font-family: 'Poppins', sans-serif;

        }

        

        .form-control:focus {

            border-color: var(--primary);

            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);

            outline: none;

            background: white;

            transform: translateZ(10px);

        }

        

        .input-icon {

            position: absolute;

            right: 20px;

            top: 50%;

            transform: translateY(-50%);

            color: #adb5bd;

        }

        

        .btn {

            display: inline-block;

            padding: 15px 30px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            text-align: center;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 1rem;

            width: 100%;

            margin-top: 1rem;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px) translateZ(5px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-outline {

            background: transparent;

            color: var(--primary);

            border: 2px solid var(--primary);

        }

        

        .btn-outline:hover {

            background: var(--primary);

            color: white;

            transform: translateY(-3px);

        }

        

        .action-buttons {

            display: flex;

            gap: 1rem;

            margin-top: 2rem;

        }

        

        .action-buttons .btn {

            flex: 1;

        }

        

        .floating {

            animation: floating 3s ease-in-out infinite;

        }

        

        @keyframes floating {

            0% { transform: translateY(0px) translateZ(0); }

            50% { transform: translateY(-10px) translateZ(10px); }

            100% { transform: translateY(0px) translateZ(0); }

        }

        

        @media (max-width: 768px) {

            .entry-card {

                padding: 2rem;

            }

            

            .action-buttons {

                flex-direction: column;

            }

        }



        /* Loader */

        .loader {

            border: 3px solid #f3f3f3;

            border-top: 3px solid var(--primary);

            border-radius: 50%;

            width: 16px;

            height: 16px;

            animation: spin 1s linear infinite;

            display: inline-block;

            margin-right: 8px;

        }

        @keyframes spin {

            0% { transform: rotate(0deg); }

            100% { transform: rotate(360deg); }

        }



        .result-box {

            margin-top: 20px; 

            padding: 15px; 

            border-radius: 12px; 

            background: #f8f9fa; 

            border: 1px solid #e9ecef;

        }

    </style>

</head>

<body>

    <div class="header animate_animated animate_fadeIn">

        <div class="logo">

            <div class="logo-icon">CE</div>

            <h2>CraneError Pro</h2>

        </div>

        <button class="btn-outline" onclick="window.location.href='qr-scanner.html'">QR Scanner</button>

    </div>

    

    <div class="container">

        <div class="entry-card animate_animated animate_zoomIn">

            <h1>Enter Crane Details</h1>

            

            <form id="craneForm">

                <div class="form-group animate_animated animatefadeIn animate_delay-1s">

                    <label for="craneId">Crane Identification Number</label>

                    <input type="text" id="craneId" class="form-control floating" placeholder="e.g. CRN-2023-001" required>

                    <span class="input-icon">🏗</span>

                </div>

                

                <div class="form-group animate_animated animatefadeIn animate_delay-2s">

                    <label for="craneModel">Crane Model (Optional)</label>

                    <input type="text" id="craneModel" class="form-control" placeholder="e.g. Tower Crane X-2000">

                    <span class="input-icon">ℹ</span>

                </div>

                

                <button type="submit" class="btn btn-primary animate_animated animatefadeIn animate_delay-3s">

                    Search Error Database

                </button>

            </form>



            <!-- Results will be shown here -->

            <div id="result"></div>

            

            <div class="action-buttons animate_animated animatefadeIn animate_delay-4s">

                <button class="btn btn-outline" onclick="window.location.href='entry-mode.html'">Back</button>

                <button class="btn btn-outline" onclick="window.location.href='index.html'">Home</button>

            </div>

        </div>

    </div>



   <script>

document.getElementById('craneForm').addEventListener('submit', async function(e) {

    e.preventDefault();



    const code = document.getElementById('craneId').value.trim();

    if (!code) {

        alert("Please enter a Crane ID or Error Code");

        return;

    }



    const btn = this.querySelector('button[type="submit"]');

    btn.innerHTML = '🔎 Searching...';

    btn.disabled = true;



    // Result box (same page)

    let resultBox = document.getElementById("result");

    if (!resultBox) {

        resultBox = document.createElement("div");

        resultBox.id = "result";

        resultBox.style.marginTop = "20px";

        resultBox.style.textAlign = "left";

        document.querySelector(".entry-card").appendChild(resultBox);

    }

    resultBox.innerHTML = ""; // Clear old result



    try {

        // ✅ Correct fetch syntax

        const res = await fetch(/api/crane/${encodeURIComponent(code)});

        const data = await res.json();



        if (res.ok) {

            resultBox.innerHTML = `

                <h3 style="color:var(--primary)">Error Details</h3>

                <p><b>Crane ID:</b> ${data._id}</p>

                <p><b>Model:</b> ${data.model || 'N/A'}</p>

                <p><b>Error Code:</b> ${data.code}</p>

                <p><b>Description:</b> ${data.description}</p>

                <p><b>Severity:</b> ${data.severity || 'N/A'}</p>

                <p><b>Last Maintenance:</b> ${data.lastMaintenance || 'N/A'}</p>

                <h4>Steps to Resolve:</h4>

                <ul>

                    ${(data.steps || []).map(s => <li><b>${s.title}</b>: ${s.description}</li>).join('')}

                </ul>

            `;

        } else {

            resultBox.innerHTML = <p style="color:red">${data.message || "No matching data found"}</p>;

        }

    } catch (err) {

        console.error(err);

        resultBox.innerHTML = <p style="color:red">❌ Server error, please try again later.</p>;

    } finally {

        btn.innerHTML = 'Search Error Database';

        btn.disabled = false;

    }

});

</script>

    

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>QR Scanner - Crane Error Finder Pro</title>

    <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

    <style>

        :root {

            --primary: #4361ee;

            --secondary: #3f37c9;

            --accent: #4895ef;

            --light: #f8f9fa;

            --dark: #212529;

            --success: #4cc9f0;

            --warning: #f72585;

        }

        

        * {

            margin: 0;

            padding: 0;

            box-sizing: border-box;

        }

        

        body {

            font-family: 'Poppins', sans-serif;

            background: var(--dark);

            color: white;

            min-height: 100vh;

            display: flex;

            flex-direction: column;

        }

        

        .header {

            background: rgba(0, 0, 0, 0.7);

            backdrop-filter: blur(10px);

            padding: 1.5rem;

            display: flex;

            justify-content: space-between;

            align-items: center;

            position: fixed;

            width: 100%;

            z-index: 100;

        }

        

        .logo {

            display: flex;

            align-items: center;

        }

        

        .logo-icon {

            width: 40px;

            height: 40px;

            background: var(--primary);

            border-radius: 10px;

            display: flex;

            align-items: center;

            justify-content: center;

            margin-right: 10px;

            color: white;

            font-size: 18px;

            font-weight: bold;

        }

        

        .scanner-container {

            flex: 1;

            display: flex;

            flex-direction: column;

            justify-content: center;

            align-items: center;

            padding: 2rem;

            padding-top: 100px;

        }

        

        .scanner-frame {

            width: 100%;

            max-width: 500px;

            height: 500px;

            border-radius: 20px;

            overflow: hidden;

            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

            position: relative;

            margin-bottom: 2rem;

        }

        

        #scanner {

            width: 100%;

            height: 100%;

            object-fit: cover;

        }

        

        .scan-animation {

            position: absolute;

            top: 0;

            left: 0;

            width: 100%;

            height: 10px;

            background: linear-gradient(to right, transparent, var(--accent), transparent);

            animation: scan 2s linear infinite;

            box-shadow: 0 0 10px var(--accent);

        }

        

        @keyframes scan {

            0% { top: 0; opacity: 0; }

            10% { opacity: 1; }

            90% { opacity: 1; }

            100% { top: 100%; opacity: 0; }

        }

        

        .scanner-guide {

            text-align: center;

            margin-bottom: 2rem;

            max-width: 500px;

        }

        

        h1 {

            font-size: 1.8rem;

            margin-bottom: 1rem;

        }

        

        .subtitle {

            opacity: 0.8;

            font-size: 1rem;

        }

        

        .btn {

            display: inline-block;

            padding: 15px 30px;

            border-radius: 50px;

            font-weight: 600;

            text-decoration: none;

            text-align: center;

            cursor: pointer;

            transition: all 0.3s ease;

            border: none;

            font-size: 1rem;

            margin: 0.5rem;

        }

        

        .btn-primary {

            background: var(--primary);

            color: white;

            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);

        }

        

        .btn-primary:hover {

            background: var(--secondary);

            transform: translateY(-3px);

            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);

        }

        

        .btn-outline {

            background: transparent;

            color: white;

            border: 2px solid white;

        }

        

        .btn-outline:hover {

            background: white;

            color: var(--dark);

        }

        

        .result-overlay {

            position: fixed;

            top: 0;

            left: 0;

            width: 100%;

            height: 100%;

            background: rgba(0, 0, 0, 0.9);

            display: flex;

            flex-direction: column;

            justify-content: center;

            align-items: center;

            z-index: 200;

            opacity: 0;

            pointer-events: none;

            transition: all 0.5s ease;

        }

        

        .result-overlay.active {

            opacity: 1;

            pointer-events: all;

        }

        

        .result-card {

            background: white;

            color: var(--dark);

            border-radius: 20px;

            padding: 2rem;

            max-width: 500px;

            width: 90%;

            text-align: center;

            transform: scale(0.9);

            transition: all 0.3s ease;

        }

        

        .result-overlay.active .result-card {

            transform: scale(1);

        }

        

        .result-icon {

            font-size: 3rem;

            margin-bottom: 1rem;

        }

        

        .success {

            color: var(--success);

        }

        

        .error {

            color: var(--warning);

        }

        

        .action-buttons {

            display: flex;

            justify-content: center;

            flex-wrap: wrap;

            margin-top: 1.5rem;

        }

        

        @media (max-width: 768px) {

            .scanner-frame {

                height: 400px;

            }

        }

    </style>

</head>

<body>

    <div class="header animate__animated animate__fadeIn">

        <div class="logo">

            <div class="logo-icon">CE</div>

            <h2>CraneError Pro</h2>

        </div>

        <button class="btn btn-outline" onclick="window.location.href='manual-entry.html'">Manual Entry</button>

    </div>

    

    <div class="scanner-container">

        <div class="scanner-guide animate__animated animate__fadeIn">

            <h1>Scan Crane QR Code</h1>

            <p class="subtitle">Position the QR code within the frame to automatically scan</p>

        </div>

        

        <div class="scanner-frame animate__animated animate__zoomIn">

            <video id="scanner" playsinline></video>

            <div class="scan-animation"></div>

        </div>

        

        <div class="action-buttons animate__animated animate__fadeIn animate__delay-1s">

            <button class="btn btn-primary" onclick="window.location.href='entry-mode.html'">Back</button>

            <button class="btn btn-outline" onclick="window.location.href='index.html'">Home</button>

        </div>

    </div>

    

    <div class="result-overlay" id="resultOverlay">

        <div class="result-card">

            <div class="result-icon success">✓</div>

            <h2 id="resultTitle">QR Code Scanned</h2>

            <p id="resultText">Crane ID: <span id="craneIdResult"></span></p>

            <div class="action-buttons">

                <button class="btn btn-primary" id="continueBtn">Continue</button>

                <button class="btn btn-outline" onclick="hideResult()">Scan Again</button>

            </div>

        </div>

    </div>



    <script>

        const video = document.getElementById('scanner');

        const resultOverlay = document.getElementById('resultOverlay');

        const craneIdResult = document.getElementById('craneIdResult');

        const resultTitle = document.getElementById('resultTitle');

        const resultText = document.getElementById('resultText');

        const continueBtn = document.getElementById('continueBtn');

        let scannerActive = true;

        let scannedCode = null;



        // Access camera

        navigator.mediaDevices.getUserMedia({ 

            video: { 

                facingMode: "environment",

                width: { ideal: 1280 },

                height: { ideal: 720 }

            } 

        })

        .then(function(stream) {

            video.srcObject = stream;

            video.setAttribute("playsinline", true);

            video.play();

            requestAnimationFrame(tick);

        })

        .catch(function(err) {

            showError("Camera Error", "Could not access camera: " + err);

        });



        function tick() {

            if (!scannerActive) return;

            

            if (video.readyState === video.HAVE_ENOUGH_DATA) {

                const canvas = document.createElement('canvas');

                canvas.width = video.videoWidth;

                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                const code = jsQR(imageData.data, imageData.width, imageData.height);

                

                if (code) {

                    scannedCode = code.data;

                    showResult(scannedCode);

                }

            }

            

            requestAnimationFrame(tick);

        }



        function showResult(code) {

            scannerActive = false;

            craneIdResult.textContent = code;

            resultOverlay.classList.add('active');

            

            // Stop camera stream

            const stream = video.srcObject;

            if (stream) {

                stream.getTracks().forEach(track => track.stop());

            }

            

            continueBtn.onclick = function() {

                window.location.href = 'error-info.html?craneId=' + encodeURIComponent(code);

            };

        }



        function showError(title, message) {

            resultTitle.textContent = title;

            resultText.textContent = message;

            document.querySelector('.result-icon').className = 'result-icon error';

            document.querySelector('.result-icon').textContent = '✗';

            resultOverlay.classList.add('active');

        }



        function hideResult() {

            resultOverlay.classList.remove('active');

            setTimeout(() => {

                scannerActive = true;

                // Restart camera

                navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })

                    .then(function(stream) {

                        video.srcObject = stream;

                        video.play();

                        requestAnimationFrame(tick);

                    });

            }, 500);

        }

    </script>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Reports - Crane Error Finder Pro</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>

        /* Reuse styles from dashboard with additions */

        

        .reports-container {

            display: grid;

            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

            gap: 1.5rem;

            margin-top: 2rem;

        }

        

        .report-card {

            background: white;

            border-radius: 15px;

            padding: 1.5rem;

            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

            transition: all 0.3s ease;

            display: flex;

            flex-direction: column;

        }

        

        .report-card:hover {

            transform: translateY(-5px);

            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

        }

        

        .report-header {

            display: flex;

            justify-content: space-between;

            align-items: center;

            margin-bottom: 1rem;

        }

        

        .report-title {

            font-weight: 600;

            color: var(--primary);

        }

        

        .report-date {

            font-size: 0.8rem;

            color: #6c757d;

        }

        

        .report-stats {

            display: flex;

            gap: 1rem;

            margin-top: auto;

            padding-top: 1rem;

        }

        

        .report-stat {

            text-align: center;

            flex: 1;

        }

        

        .stat-number {

            font-weight: 700;

            font-size: 1.2rem;

        }

        

        .stat-label {

            font-size: 0.7rem;

            color: #6c757d;

        }

        

        .report-actions {

            display: flex;

            gap: 0.5rem;

            margin-top: 1rem;

        }

        

        .btn-sm {

            padding: 5px 10px;

            font-size: 0.8rem;

            flex: 1;

        }

    </style>

</head>

<body>

    <div class="header">

        <div class="logo">

            <div class="logo-icon">CE</div>

            <h2>CraneError Pro</h2>

        </div>

        <div class="nav-links">

            <a href="dashboard.html" class="nav-link">📊 Dashboard</a>

            <a href="entry-mode.html" class="nav-link">🔍 Error Lookup</a>

            <a href="reports.html" class="nav-link active">📄 Reports</a>

            <a href="settings.html" class="nav-link">⚙️ Settings</a>

        </div>

    </div>

    

    <div class="container">

        <div class="dashboard-header">

            <div>

                <h1>Monthly Error Reports</h1>

                <p class="subtitle">Historical error analysis and resolution reports</p>

            </div>

            <button class="btn btn-primary">

                + Generate New Report

            </button>

        </div>

        

        <div class="date-filter">

            <select id="reportYear" class="form-control">

                <option value="2023" selected>2023</option>

                <option value="2022">2022</option>

                <option value="2021">2021</option>

            </select>

            <button class="btn btn-primary" style="padding: 8px 15px;">

                Filter

            </button>

        </div>

        

        <div class="reports-container">

            <!-- June 2023 Report -->

            <div class="report-card">

                <div class="report-header">

                    <div class="report-title">June 2023 Report</div>

                    <div class="report-date">Generated: Jul 2, 2023</div>

                </div>

                <p>Monthly error analysis for all cranes with resolution metrics and maintenance recommendations.</p>

                

                <div class="report-stats">

                    <div class="report-stat">

                        <div class="stat-number">71</div>

                        <div class="stat-label">Total Errors</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">18</div>

                        <div class="stat-label">Critical</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">92%</div>

                        <div class="stat-label">Resolved</div>

                    </div>

                </div>

                

                <div class="report-actions">

                    <button class="btn btn-primary btn-sm">View</button>

                    <button class="btn btn-outline btn-sm">PDF</button>

                    <button class="btn btn-outline btn-sm">Excel</button>

                </div>

            </div>

            

            <!-- May 2023 Report -->

            <div class="report-card">

                <div class="report-header">

                    <div class="report-title">May 2023 Report</div>

                    <div class="report-date">Generated: Jun 3, 2023</div>

                </div>

                <p>Monthly error analysis showing improved resolution times after new procedures implemented.</p>

                

                <div class="report-stats">

                    <div class="report-stat">

                        <div class="stat-number">62</div>

                        <div class="stat-label">Total Errors</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">10</div>

                        <div class="stat-label">Critical</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">95%</div>

                        <div class="stat-label">Resolved</div>

                    </div>

                </div>

                

                <div class="report-actions">

                    <button class="btn btn-primary btn-sm">View</button>

                    <button class="btn btn-outline btn-sm">PDF</button>

                    <button class="btn btn-outline btn-sm">Excel</button>

                </div>

            </div>

            

            <!-- April 2023 Report -->

            <div class="report-card">

                <div class="report-header">

                    <div class="report-title">April 2023 Report</div>

                    <div class="report-date">Generated: May 1, 2023</div>

                </div>

                <p>First month with new monitoring system showing higher error detection rates.</p>

                

                <div class="report-stats">

                    <div class="report-stat">

                        <div class="stat-number">74</div>

                        <div class="stat-label">Total Errors</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">15</div>

                        <div class="stat-label">Critical</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">88%</div>

                        <div class="stat-label">Resolved</div>

                    </div>

                </div>

                

                <div class="report-actions">

                    <button class="btn btn-primary btn-sm">View</button>

                    <button class="btn btn-outline btn-sm">PDF</button>

                    <button class="btn btn-outline btn-sm">Excel</button>

                </div>

            </div>

            

            <!-- Q1 2023 Summary -->

            <div class="report-card">

                <div class="report-header">

                    <div class="report-title">Q1 2023 Summary</div>

                    <div class="report-date">Generated: Apr 5, 2023</div>

                </div>

                <p>Quarterly summary showing seasonal patterns in crane errors and maintenance needs.</p>

                

                <div class="report-stats">

                    <div class="report-stat">

                        <div class="stat-number">165</div>

                        <div class="stat-label">Total Errors</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">25</div>

                        <div class="stat-label">Critical</div>

                    </div>

                    <div class="report-stat">

                        <div class="stat-number">91%</div>

                        <div class="stat-label">Resolved</div>

                    </div>

                </div>

                

                <div class="report-actions">

                    <button class="btn btn-primary btn-sm">View</button>

                    <button class="btn btn-outline btn-sm">PDF</button>

                    <button class="btn btn-outline btn-sm">Excel</button>

                </div>

            </div>

        </div>

    </div>

</body>

</html><!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>Sign Up - Crane Error Detection</title>

  <style>

    body {

      font-family: Arial, sans-serif;

      background: linear-gradient(135deg, #0f172a, #1e293b);

      color: #fff;

      display: flex;

      justify-content: center;

      align-items: center;

      height: 100vh;

      margin: 0;

    }



    .container {

      background: #1e293b;

      padding: 2rem;

      border-radius: 1rem;

      box-shadow: 0 0 15px rgba(0,0,0,0.3);

      width: 100%;

      max-width: 400px;

    }



    h2 {

      text-align: center;

      margin-bottom: 1rem;

    }



    input {

      width: 100%;

      padding: 0.8rem;

      margin: 0.5rem 0;

      border: none;

      border-radius: 0.5rem;

      font-size: 1rem;

    }



    button {

      width: 100%;

      padding: 0.8rem;

      background: #38bdf8;

      border: none;

      border-radius: 0.5rem;

      font-size: 1rem;

      color: #000;

      font-weight: bold;

      cursor: pointer;

      transition: 0.3s ease;

    }



    button:hover {

      background: #0ea5e9;

    }



    .message {

      margin-top: 1rem;

      text-align: center;

      font-size: 0.9rem;

    }



    a {

      color: #38bdf8;

      text-decoration: none;

    }



    a:hover {

      text-decoration: underline;

    }

  </style>

</head>

<body>

  <div class="container">

    <h2>Sign Up</h2>

    <form id="signupForm">

      <input type="text" id="username" placeholder="Email or Username" required />

      <input type="password" id="password" placeholder="Password (min 6 chars)" required />

      <button type="submit">Register</button>

      <div class="message" id="message"></div>

      <div class="message">Already have an account? <a href="login.html">Login here</a></div>

    </form>

  </div>



  <script>

    document.getElementById('signupForm').addEventListener('submit', async (e) => {

      e.preventDefault();



      const username = document.getElementById('username').value.trim();

      const password = document.getElementById('password').value.trim();

      const msgBox = document.getElementById('message');



      if (password.length < 6) {

        msgBox.style.color = 'salmon';

        msgBox.innerText = '❌ Password must be at least 6 characters';

        return;

      }



      try {

        const res = await fetch('/api/auth/signup', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ username, password })

        });



        const data = await res.json();



        if (res.status === 201) {

          msgBox.style.color = 'lightgreen';

          msgBox.innerText = '✅ Registered successfully. Redirecting...';

          setTimeout(() => window.location.href = 'login.html', 1500);

        } else {

          msgBox.style.color = 'salmon';

          msgBox.innerText = `❌ ${data.message}`;

        }

      } catch (error) {

        msgBox.style.color = 'salmon';

        msgBox.innerText = `❌ Server error. Please try again later.`;

        console.error('Signup Exception:', error);

      }

    });

  </script>

</body>

</html>ya mera front end hai ui ux ghai ya mera ok aur ya meraREADME.md# crane_u aur ya mera package.json {

  "name": "crane-error-pro",

  "version": "1.0.0",

  "description": "Crane Error Finder Pro - Fullstack App",

  "main": "server.js",

  "type": "module",

  "scripts": {

    "start": "node server.js",

    "dev": "nodemon server.js"

  },

  "dependencies": {

    "body-parser": "^1.20.2",

    "dotenv": "^16.4.1",

    "express": "^4.18.2",

    "mongoose": "^7.5.0"

  },

  "devDependencies": {

    "nodemon": "^3.0.3"

  },

  "engines": {

    "node": ">=18.0.0"

  }

} code hai aur ya mera sever.js ka code hai import express from "express";

import mongoose from "mongoose";

import bodyParser from "body-parser";

import { fileURLToPath } from "url";

import dotenv from "dotenv";

import path from "path";

import cors from "cors";



dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;



// ---------- Middleware ----------

app.use(cors());

app.use(bodyParser.json());



// __dirname (ESM)

const __filename = fileURLToPath(import.meta.url);

const _dirname = path.dirname(_filename);



// Static (serve your frontend from /public)

app.use(express.static(path.join(__dirname, "public")));



// ---------- MongoDB Connect then Start ----------

mongoose

  .connect(process.env.MONGO_URI, {

    // Mongoose v8 ignores old options but keeping them won't break

    useNewUrlParser: true,

    useUnifiedTopology: true

  })

  .then(() => {

    console.log("MongoDB Connected");

    app.listen(PORT, () => {

      // No emoji here to avoid Render parse issues

      console.log("Server running on port " + PORT);

    });

  })

  .catch((err) => console.error("MongoDB Error:", err));



// ---------- Schemas (no breaking changes) ----------

// USERS

const UserSchema = new mongoose.Schema(

  {

    username: { type: String, unique: true },

    password: String

  },

  { strict: true } // unknown fields ignored (no data mutation)

);



// CRANES

const CraneSchema = new mongoose.Schema(

  {

    model: String,           // e.g. "HIAB T-HiDuo 018"

    code: String,            // e.g. "E009"

    description: String,     // text

    severity: String,        // optional: "Low" | "Medium" | "High"

    lastMaintenance: String, // optional date string

    steps: [

      {

        title: String,

        description: String

      }

    ],

    createdAt: { type: Date, default: Date.now }

  },

  { strict: true }           // safe: won't rewrite existing docs

);



// ---------- Models (fixed collection names) ----------

const User = mongoose.model("User", UserSchema, "users");

const Crane = mongoose.model("Crane", CraneSchema, "cranes");



// ---------- Helpers ----------

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");



// ---------- Routes ----------



// Health check

app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));



// ----- Auth -----

app.post("/api/auth/signup", async (req, res, next) => {

  try {

    const { username, password } = req.body || {};

    if (!username || !password) {

      return res.status(400).json({ message: "username & password required" });

    }

    const exists = await User.findOne({ username }).lean();

    if (exists) return res.status(400).json({ message: "User already exists" });



    const user = new User({ username, password });

    await user.save();

    return res.status(201).json({ message: "Registered successfully" });

  } catch (err) {

    next(err);

  }

});



app.post("/api/auth/login", async (req, res, next) => {

  try {

    const { username, password } = req.body || {};

    if (!username || !password) {

      return res.status(400).json({ message: "username & password required" });

    }

    const user = await User.findOne({ username, password }).lean();

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    return res.status(200).json({ message: "Login successful" });

  } catch (err) {

    next(err);

  }

});



// ----- Cranes -----

// Create / Save crane (non-destructive; adds new document)

app.post("/api/crane", async (req, res, next) => {

  try {

    const crane = new Crane(req.body || {});

    await crane.save();

    return res.status(201).json({ message: "Crane data saved", id: crane._id });

  } catch (err) {

    next(err);

  }

});



// Get single by code OR model (case-insensitive exact match)

app.get("/api/crane/:code", async (req, res, next) => {

  try {

    const raw = decodeURIComponent(req.params.code || "");

    const rx = new RegExp("^" + escapeRegex(raw) + "$", "i");

    const crane = await Crane.findOne({ $or: [{ code: rx }, { model: rx }] }).lean();



    if (!crane) {

      return res

        .status(404)

        .json({ message: "No data found for this model or error code" });

    }

    return res.status(200).json(crane);

  } catch (err) {

    next(err);

  }

});



// List all cranes (with optional pagination: ?page=1&limit=20)

app.get("/api/cranes", async (req, res, next) => {

  try {

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);

    const skip = (page - 1) * limit;



    const [items, total] = await Promise.all([

      Crane.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),

      Crane.countDocuments()

    ]);



    return res.status(200).json({

      page,

      limit,

      total,

      items

    });

  } catch (err) {

    next(err);

  }

});



// Optional: flexible search via query params (?q=E009 or ?model=HIAB ...)

app.get("/api/crane", async (req, res, next) => {

  try {

    const { q, model, code } = req.query || {};

    const ors = [];

    if (q) {

      const rx = new RegExp(escapeRegex(String(q)), "i");

      ors.push({ model: rx }, { code: rx }, { description: rx });

    }

    if (model) ors.push({ model: new RegExp(escapeRegex(String(model)), "i") });

    if (code) ors.push({ code: new RegExp(escapeRegex(String(code)), "i") });



    if (!ors.length) {

      return res.status(400).json({ message: "Provide q or model or code" });

    }



    const items = await Crane.find({ $or: ors }).limit(100).lean();

    return res.status(200).json(items);

  } catch (err) {

    next(err);

  }

});



// ---------- 404 & Error Handling ----------

app.use((req, res) => {

  res.status(404).json({ message: "Route not found" });

});



app.use((err, req, res, next) => {

  console.error("API Error:", err);

  res.status(500).json({ message: "Server error", detail: err?.message || "" });

});
