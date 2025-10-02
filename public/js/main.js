// Enhanced main.js with complete functionality
class App {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('authToken');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.updateNavigation();
    }

    // Authentication Functions
    async login(username, password) {
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
                this.token = data.token;
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                this.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                return true;
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
            return false;
        }
    }

    async signup(userData) {
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                this.showNotification('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                return true;
            } else {
                this.showNotification(data.message || 'Signup failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Network error. Please try again.', 'error');
            return false;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.token = null;
        
        fetch('/api/logout', { 
            method: 'POST',
            headers: this.getHeaders()
        }).catch(console.error);
        
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status', {
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            
            if (!data.authenticated) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                this.token = null;
            }
            
            return data.authenticated;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    async requireAuth() {
        const authenticated = await this.checkAuthStatus();
        if (!authenticated && !this.isPublicPage()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    isPublicPage() {
        return window.location.pathname.includes('login.html') || 
               window.location.pathname.includes('signup.html') ||
               window.location.pathname.includes('index.html');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Navigation
    updateNavigation() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const authLinks = document.querySelectorAll('.auth-link');
        const logoutLinks = document.querySelectorAll('.logout-link');
        const userSpans = document.querySelectorAll('[data-user="username"]');

        if (user.username) {
            authLinks.forEach(link => link.style.display = 'none');
            logoutLinks.forEach(link => link.style.display = 'block');
            userSpans.forEach(span => span.textContent = user.username);
        } else {
            authLinks.forEach(link => link.style.display = 'block');
            logoutLinks.forEach(link => link.style.display = 'none');
            userSpans.forEach(span => span.textContent = 'Guest');
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.app-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `app-notification notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Loading States
    showLoading(button, text = 'Processing...') {
        if (!button) return () => {};
        
        const originalText = button.innerHTML;
        button.innerHTML = `⏳ ${text}`;
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                const button = e.target.querySelector('button[type="submit"]');
                const resetButton = this.showLoading(button, 'Logging in...');
                
                await this.login(username, password);
                resetButton();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    username: document.getElementById('signupUsername').value,
                    email: document.getElementById('signupEmail').value,
                    password: document.getElementById('signupPassword').value,
                    confirmPassword: document.getElementById('confirmPassword').value
                };
                const button = e.target.querySelector('button[type="submit"]');
                const resetButton = this.showLoading(button, 'Creating account...');
                
                await this.signup(formData);
                resetButton();
            });
        }

        // Logout buttons
        document.querySelectorAll('[onclick="logout()"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Manual error form
        const errorForm = document.getElementById('errorForm');
        if (errorForm) {
            errorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitErrorForm(e);
            });
        }
    }

    // Error Form Submission
    async submitErrorForm(event) {
        const form = event.target;
        const formData = new FormData(form);
        const errorData = {
            craneId: formData.get('craneId'),
            errorType: formData.get('errorType'),
            severity: formData.get('severity'),
            description: formData.get('description'),
            location: formData.get('location') || 'Manual Entry'
        };

        const button = form.querySelector('button[type="submit"]');
        const resetButton = this.showLoading(button, 'Submitting report...');

        try {
            const response = await fetch('/api/errors', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(errorData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Error reported successfully!', 'success');
                form.reset();
                setTimeout(() => {
                    window.location.href = 'reports.html';
                }, 1500);
            } else {
                this.showNotification(data.message || 'Failed to report error', 'error');
            }
        } catch (error) {
            console.error('Error submission failed:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            resetButton();
        }
    }

    // Dashboard Functions
    async loadDashboardData() {
        if (!await this.requireAuth()) return;

        try {
            // Load stats
            const statsResponse = await fetch('/api/stats', {
                headers: this.getHeaders()
            });
            const stats = await statsResponse.json();

            // Update stat cards
            document.getElementById('totalErrors').textContent = stats.totalErrors;
            document.getElementById('openErrors').textContent = stats.openErrors;
            document.getElementById('inProgressErrors').textContent = stats.inProgressErrors;
            document.getElementById('resolvedErrors').textContent = stats.resolvedErrors;

            // Load recent errors
            const errorsResponse = await fetch('/api/errors?limit=5', {
                headers: this.getHeaders()
            });
            const errorsData = await errorsResponse.json();
            this.displayRecentErrors(errorsData.errors || errorsData);

        } catch (error) {
            console.error('Dashboard data loading failed:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    displayRecentErrors(errors) {
        const container = document.getElementById('recentErrors');
        if (!container) return;

        if (!errors || errors.length === 0) {
            container.innerHTML = '<p class="no-data">No recent errors reported</p>';
            return;
        }

        container.innerHTML = errors.map(error => `
            <div class="error-item">
                <div class="error-details">
                    <h4>${error.craneId} - ${error.errorType}</h4>
                    <p>${error.description}</p>
                    <div class="error-meta">
                        <span class="badge badge-${error.severity.toLowerCase()}">${error.severity}</span>
                        <span class="badge badge-${error.status.toLowerCase().replace(' ', '-')}">${error.status}</span>
                        <span>${new Date(error.reportedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="error-actions">
                    <button class="btn btn-sm" onclick="app.viewErrorDetails('${error.id}')">View</button>
                </div>
            </div>
        `).join('');
    }

    viewErrorDetails(errorId) {
        // Navigate to reports page with filter for this error
        window.location.href = `reports.html?error=${errorId}`;
    }

    // Reports Functions
    async loadReports() {
        if (!await this.requireAuth()) return;

        try {
            const response = await fetch('/api/errors', {
                headers: this.getHeaders()
            });
            const data = await response.json();
            const errors = data.errors || data;
            
            this.displayAllReports(errors);
            this.updateReportsSummary(errors);

        } catch (error) {
            console.error('Reports loading failed:', error);
            this.showNotification('Failed to load reports', 'error');
        }
    }

    displayAllReports(errors) {
        const container = document.getElementById('allErrors');
        if (!container) return;

        if (!errors || errors.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No errors reported yet</p></div>';
            return;
        }

        container.innerHTML = errors.map(error => `
            <div class="error-item">
                <div class="error-details">
                    <h4>${error.craneId}</h4>
                    <p class="error-description">${error.description}</p>
                    <div class="error-meta">
                        <span><strong>Type:</strong> ${error.errorType}</span>
                        <span><strong>Severity:</strong> 
                            <span class="badge badge-${error.severity.toLowerCase()}">${error.severity}</span>
                        </span>
                        <span><strong>Status:</strong> 
                            <span class="badge badge-${error.status.toLowerCase().replace(' ', '-')}">${error.status}</span>
                        </span>
                        <span><strong>Location:</strong> ${error.location}</span>
                        <span><strong>Reported:</strong> ${new Date(error.reportedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateReportsSummary(errors) {
        document.getElementById('totalReports').textContent = errors.length;
        document.getElementById('filteredResults').textContent = errors.length;
        
        // Calculate average resolution time (mock data for now)
        document.getElementById('avgResolution').textContent = '4h';
    }
}

// Initialize app
const app = new App();

// Global functions for HTML onclick handlers
function logout() {
    app.logout();
}

function login() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (username && password) {
        app.login(username, password);
    }
}

function signup() {
    const username = document.getElementById('signupUsername')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (username && email && password && confirmPassword) {
        app.signup({ username, email, password, confirmPassword });
    }
}

// Page-specific initializations
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        app.loadDashboardData();
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => app.loadDashboardData());
        }
    }

    // Reports page
    if (window.location.pathname.includes('reports.html')) {
        app.loadReports();
        
        // Filter form
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Filter functionality would go here
                app.showNotification('Filters applied', 'success');
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                document.getElementById('filterForm').reset();
                app.loadReports();
            });
        }
    }

    // Update navigation on all pages
    app.updateNavigation();
});
