// Utility Functions
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="message ${type}">${message}</div>`;
        setTimeout(() => {
            element.innerHTML = '';
        }, 5000);
    }
}

function showLoading(button) {
    if (!button) return () => {};
    
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading"></div> Processing...';
    button.disabled = true;
    return () => {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Authentication Functions
async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const button = document.querySelector('#loginForm button');
    const resetButton = showLoading(button);

    // Basic validation
    if (!username || !password) {
        showMessage('loginMessage', 'Please fill in all fields', 'error');
        resetButton();
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info in sessionStorage
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('username', data.user.username);
            
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage('loginMessage', data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Network error. Please try again.', 'error');
    } finally {
        resetButton();
    }
}

async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const button = document.querySelector('#signupForm button');
    const resetButton = showLoading(button);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showMessage('signupMessage', 'Please fill in all fields', 'error');
        resetButton();
        return;
    }

    if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match', 'error');
        resetButton();
        return;
    }

    if (password.length < 6) {
        showMessage('signupMessage', 'Password must be at least 6 characters long', 'error');
        resetButton();
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info in sessionStorage
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('username', data.user.username);
            
            showMessage('signupMessage', 'Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('signupMessage', data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('signupMessage', 'Network error. Please try again.', 'error');
    } finally {
        resetButton();
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear all stored data
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'index.html';
        } else {
            console.error('Logout failed:', data.message);
            // Still clear local data and redirect
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local data anyway and redirect
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

// Check authentication status on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('username', data.username || 'User');
        } else {
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('username');
        }
        return data.authenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        // If auth check fails, rely on sessionStorage
        return isAuthenticated();
    }
}

// Protect authenticated routes
async function requireAuth() {
    const authenticated = await checkAuth();
    if (!authenticated) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Protect public routes (redirect if already authenticated)
async function redirectIfAuthenticated() {
    const authenticated = await checkAuth();
    if (authenticated && (window.location.pathname.includes('login.html') || 
                          window.location.pathname.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// Update navigation based on auth status
function updateNavigation() {
    const authLinks = document.querySelectorAll('.auth-link');
    const userSpan = document.getElementById('username');
    
    if (isAuthenticated()) {
        authLinks.forEach(link => {
            if (link.textContent === 'Login' || link.textContent === 'Sign Up') {
                link.style.display = 'none';
            }
        });
        
        const logoutLinks = document.querySelectorAll('.logout-link');
        logoutLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        if (userSpan) {
            userSpan.textContent = sessionStorage.getItem('username') || 'User';
        }
    } else {
        authLinks.forEach(link => {
            if (link.textContent === 'Login' || link.textContent === 'Sign Up') {
                link.style.display = 'block';
            }
        });
        
        const logoutLinks = document.querySelectorAll('.logout-link');
        logoutLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
}

// Error Code Functions
async function quickSearch() {
    const code = document.getElementById('quickSearch').value.trim().toUpperCase();
    if (!code) {
        showMessage('quickSearchResult', 'Please enter an error code', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/error-codes/${code}`);
        if (!response.ok) {
            throw new Error('Error code not found');
        }
        
        const errorCode = await response.json();
        displayErrorDetails('quickSearchResult', errorCode);
    } catch (error) {
        showMessage('quickSearchResult', 'Error code not found. Please check the code and try again.', 'error');
    }
}

async function searchErrorCodes() {
    const code = document.getElementById('searchCode') ? document.getElementById('searchCode').value.trim().toUpperCase() : '';
    const category = document.getElementById('searchCategory') ? document.getElementById('searchCategory').value : 'All';
    
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (category !== 'All') params.append('category', category);

    try {
        const response = await fetch(`/api/error-codes?${params}`);
        const errorCodes = await response.json();
        displaySearchResults(errorCodes);
    } catch (error) {
        console.error('Search error:', error);
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = '<p class="error-message">Error loading results. Please try again.</p>';
        }
    }
}

function displaySearchResults(errorCodes) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (errorCodes.length === 0) {
        container.innerHTML = '<p class="no-results">No error codes found matching your criteria.</p>';
        return;
    }

    container.innerHTML = errorCodes.map(error => `
        <div class="error-card ${error.severity.toLowerCase()}">
            <h3>${error.code} - ${error.description}</h3>
            <p><strong>Severity:</strong> <span class="severity-${error.severity.toLowerCase()}">${error.severity}</span></p>
            <p><strong>Category:</strong> ${error.category}</p>
            <p><strong>Solution:</strong> ${error.solution}</p>
            ${window.location.pathname.includes('dashboard') ? `
                <button onclick="viewErrorDetails('${error.code}')" class="btn btn-primary">View Details</button>
            ` : ''}
        </div>
    `).join('');
}

function displayErrorDetails(containerId, errorCode) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="detail-card">
            <h3>${errorCode.code} - ${errorCode.description}</h3>
            <p><strong>Severity:</strong> <span class="severity-${errorCode.severity.toLowerCase()}">${errorCode.severity}</span></p>
            <p><strong>Category:</strong> ${errorCode.category}</p>
            <p><strong>Solution:</strong> ${errorCode.solution}</p>
        </div>
    `;
}

// Manual Entry Functions
async function searchManualCode() {
    const code = document.getElementById('errorCode').value.trim().toUpperCase();
    if (!code) {
        showMessage('searchResult', 'Please enter an error code', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/error-codes/${code}`);
        if (!response.ok) {
            throw new Error('Error code not found');
        }
        
        const errorCode = await response.json();
        showErrorDetails(errorCode);
    } catch (error) {
        showMessage('searchResult', 'Error code not found. Please check the code and try again.', 'error');
        const errorDetails = document.getElementById('errorDetails');
        if (errorDetails) {
            errorDetails.style.display = 'none';
        }
    }
}

function showErrorDetails(errorCode) {
    document.getElementById('detailCode').textContent = errorCode.code;
    document.getElementById('detailDescription').textContent = errorCode.description;
    document.getElementById('detailSeverity').textContent = errorCode.severity;
    document.getElementById('detailCategory').textContent = errorCode.category;
    document.getElementById('detailSolution').textContent = errorCode.solution;
    
    document.getElementById('errorDetails').style.display = 'block';
    const searchResult = document.getElementById('searchResult');
    if (searchResult) {
        searchResult.innerHTML = '';
    }
}

async function createReport() {
    const errorCode = document.getElementById('errorCode').value.trim().toUpperCase();
    const craneModel = document.getElementById('craneModel').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!errorCode || !craneModel || !location) {
        showMessage('searchResult', 'Please fill in all required fields (Error Code, Crane Model, and Location)', 'error');
        return;
    }

    const button = document.querySelector('#reportForm button');
    const resetButton = showLoading(button);

    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                errorCode,
                craneModel,
                location,
                description
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('searchResult', 'Report created successfully! Redirecting to reports...', 'success');
            document.getElementById('reportForm').reset();
            setTimeout(() => {
                window.location.href = 'reports.html';
            }, 2000);
        } else {
            showMessage('searchResult', data.message || 'Failed to create report', 'error');
        }
    } catch (error) {
        console.error('Report creation error:', error);
        showMessage('searchResult', 'Error creating report. Please try again.', 'error');
    } finally {
        resetButton();
    }
}

// Reports Functions
async function loadReports() {
    if (!await requireAuth()) return;
    
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        const container = document.getElementById('reportsContainer');
        if (container) {
            container.innerHTML = '<p class="error-message">Error loading reports. Please try again.</p>';
        }
    }
}

function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    if (!container) return;
    
    if (reports.length === 0) {
        container.innerHTML = '<p class="no-results">No reports found. <a href="manual-entry.html">Create your first report</a></p>';
        return;
    }

    container.innerHTML = reports.map(report => `
        <div class="report-item ${report.status.toLowerCase().replace(' ', '-')}">
            <h3>Report #${report._id ? report._id.toString().substring(0, 8) : 'N/A'}</h3>
            <p><strong>Error Code:</strong> ${report.errorCode}</p>
            <p><strong>Crane Model:</strong> ${report.craneModel}</p>
            <p><strong>Location:</strong> ${report.location}</p>
            <p><strong>Status:</strong> <span class="status-${report.status.toLowerCase().replace(' ', '-')}">${report.status}</span></p>
            <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            ${report.description ? `<p><strong>Notes:</strong> ${report.description}</p>` : ''}
        </div>
    `).join('');
}

// Dashboard Functions
async function loadDashboardStats() {
    if (!await requireAuth()) return;
    
    try {
        // Load total error codes
        const errorResponse = await fetch('/api/error-codes');
        const errorCodes = await errorResponse.json();
        const totalErrors = document.getElementById('totalErrors');
        if (totalErrors) totalErrors.textContent = errorCodes.length;

        // Load user reports
        const reportsResponse = await fetch('/api/reports');
        const reports = await reportsResponse.json();
        const userReports = document.getElementById('userReports');
        if (userReports) userReports.textContent = reports.length;
        
        // Calculate open issues
        const openIssues = reports.filter(r => r.status !== 'Resolved').length;
        const openIssuesElem = document.getElementById('openIssues');
        if (openIssuesElem) openIssuesElem.textContent = openIssues;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Utility Functions for Settings
function clearUserData() {
    if (confirm('Are you sure you want to clear all local data? This will log you out.')) {
        sessionStorage.clear();
        localStorage.clear();
        alert('Local data cleared successfully. Redirecting to login...');
        window.location.href = 'login.html';
    }
}

function exportUserData() {
    alert('Export functionality will be implemented in a future update.');
}

// Recent Errors and Suggestions
async function loadRecentErrors() {
    try {
        const response = await fetch('/api/error-codes?limit=5');
        const errorCodes = await response.json();
        displayRecentErrors(errorCodes);
    } catch (error) {
        console.error('Error loading recent errors:', error);
    }
}

function displayRecentErrors(errorCodes) {
    const container = document.getElementById('recentErrors');
    if (!container || errorCodes.length === 0) return;

    container.innerHTML = errorCodes.map(error => `
        <div class="error-card">
            <h4>${error.code}</h4>
            <p>${error.description}</p>
            <button onclick="window.location.href='manual-entry.html?code=${error.code}'" class="btn btn-primary">
                View Details
            </button>
        </div>
    `).join('');
}

async function loadSuggestedCodes() {
    try {
        const response = await fetch('/api/error-codes?limit=6');
        const errorCodes = await response.json();
        displaySuggestedCodes(errorCodes);
    } catch (error) {
        console.error('Error loading suggested codes:', error);
    }
}

function displaySuggestedCodes(errorCodes) {
    const container = document.getElementById('suggestedCodes');
    if (!container || errorCodes.length === 0) return;

    container.innerHTML = errorCodes.map(error => `
        <div class="code-card" onclick="document.getElementById('errorCode').value='${error.code}'; searchManualCode()">
            <h4>${error.code}</h4>
            <p>${error.description}</p>
            <span class="severity-badge ${error.severity.toLowerCase()}">${error.severity}</span>
        </div>
    `).join('');
}

// View Error Details (for dashboard)
function viewErrorDetails(code) {
    window.location.href = `manual-entry.html?code=${code}`;
}

// Initialize page based on authentication
document.addEventListener('DOMContentLoaded', function() {
    // Add enhanced styles
    const style = document.createElement('style');
    style.textContent = `
        .severity-high { color: #e74c3c; font-weight: bold; }
        .severity-medium { color: #f39c12; font-weight: bold; }
        .severity-low { color: #27ae60; font-weight: bold; }
        .severity-critical { color: #8e44ad; font-weight: bold; }
        
        .severity-badge {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            color: white;
            font-weight: bold;
        }
        .severity-badge.high { background: #e74c3c; }
        .severity-badge.medium { background: #f39c12; }
        .severity-badge.low { background: #27ae60; }
        .severity-badge.critical { background: #8e44ad; }
        
        .status-open { color: #e74c3c; font-weight: bold; }
        .status-in-progress { color: #f39c12; font-weight: bold; }
        .status-resolved { color: #27ae60; font-weight: bold; }
        
        .error-message { color: #e74c3c; text-align: center; padding: 20px; }
        .no-results { color: #7f8c8d; text-align: center; padding: 20px; }
        
        .logout-link { display: none; }
    `;
    document.head.appendChild(style);
    
    // Update navigation
    updateNavigation();
    
    // Check auth for public pages
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('signup.html')) {
        redirectIfAuthenticated();
    }
    
    // Check auth for protected pages
    if (window.location.pathname.includes('dashboard.html') ||
        window.location.pathname.includes('entry-mode.html') ||
        window.location.pathname.includes('reports.html') ||
        window.location.pathname.includes('settings.html') ||
        window.location.pathname.includes('manual-entry.html') ||
        window.location.pathname.includes('qr-scanner.html')) {
        requireAuth();
    }
});
