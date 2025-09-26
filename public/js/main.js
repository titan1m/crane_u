class CraneErrorApp {
    constructor() {
        this.currentUser = null;
        this.notifications = [];
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupGlobalEventListeners();
        this.showPageAnimation();
    }

    async checkAuthentication() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.updateUIForAuthState(true);
                return true;
            }
            this.updateUIForAuthState(false);
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            this.updateUIForAuthState(false);
            return false;
        }
    }

    updateUIForAuthState(isAuthenticated) {
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(element => {
            const authState = element.getAttribute('data-auth');
            if ((authState === 'authenticated' && !isAuthenticated) || 
                (authState === 'anonymous' && isAuthenticated)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        if (isAuthenticated) {
            this.updateUserInfo();
        }
    }

    updateUserInfo() {
        const userElements = document.querySelectorAll('[data-user]');
        userElements.forEach(element => {
            const property = element.getAttribute('data-user');
            if (this.currentUser && this.currentUser[property]) {
                element.textContent = this.currentUser[property];
            }
        });
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            this.currentUser = null;
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    async loadErrors(filters = {}) {
        this.showLoading('errors-container');
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/errors?${queryString}`);
            if (response.ok) {
                const errors = await response.json();
                this.hideLoading('errors-container');
                return errors;
            }
            throw new Error('Failed to load errors');
        } catch (error) {
            console.error('Error loading errors:', error);
            this.showNotification('Failed to load errors', 'error');
            this.hideLoading('errors-container');
            return [];
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to load stats');
        } catch (error) {
            console.error('Error loading stats:', error);
            return null;
        }
    }

    async updateErrorStatus(errorId, status, notes = '') {
        try {
            const response = await fetch(`/api/errors/${errorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, notes })
            });

            if (response.ok) {
                this.showNotification('Error status updated successfully', 'success');
                return true;
            }
            throw new Error('Failed to update error');
        } catch (error) {
            console.error('Error updating status:', error);
            this.showNotification('Failed to update error status', 'error');
            return false;
        }
    }

    async deleteError(errorId) {
        if (!await this.showConfirmation('Are you sure you want to delete this error report?')) {
            return false;
        }

        try {
            const response = await fetch(`/api/errors/${errorId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Error report deleted successfully', 'success');
                return true;
            }
            throw new Error('Failed to delete error');
        } catch (error) {
            console.error('Error deleting error:', error);
            this.showNotification('Failed to delete error report', 'error');
            return false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    async showConfirmation(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div class="card" style="max-width: 400px; margin: 1rem;">
                    <div class="card-header">
                        <h3>Confirmation</h3>
                    </div>
                    <div class="card-body">
                        <p>${message}</p>
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
                            <button class="btn btn-danger" id="confirmOk">OK</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('confirmOk').onclick = () => {
                modal.remove();
                resolve(true);
            };
            
            document.getElementById('confirmCancel').onclick = () => {
                modal.remove();
                resolve(false);
            };
        });
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p style="margin-top: 1rem;">Loading...</p>
                </div>
            `;
        }
    }

    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loadingElement = container.querySelector('.loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    setupGlobalEventListeners() {
        // Add loading states to all buttons
        document.addEventListener('submit', (e) => {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px;"></div> Processing...';
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
                }, 5000);
            }
        });

        // Add smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    showPageAnimation() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('fade-in');
        }
    }

    // Chart functionality for statistics
    renderStatsChart(stats) {
        const ctx = document.getElementById('statsChart');
        if (!ctx) return;

        // Simple bar chart implementation
        const chartData = {
            labels: ['Total', 'Open', 'In Progress', 'Resolved'],
            datasets: [{
                data: [stats.totalErrors, stats.openErrors, stats.inProgressErrors, stats.resolvedErrors],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(248, 150, 30, 0.8)',
                    'rgba(76, 201, 240, 0.8)',
                    'rgba(39, 174, 96, 0.8)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(248, 150, 30, 1)',
                    'rgba(76, 201, 240, 1)',
                    'rgba(39, 174, 96, 1)'
                ],
                borderWidth: 2
            }]
        };

        // Simple chart rendering (you can integrate Chart.js for better charts)
        ctx.innerHTML = '<canvas id="chartCanvas"></canvas>';
    }
}

// Initialize app
const app = new CraneErrorApp();

// Global functions
window.logout = () => app.logout();
window.updateErrorStatus = (errorId, status) => app.updateErrorStatus(errorId, status);
window.deleteErrorReport = (errorId) => app.deleteError(errorId);

// Page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Set active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize page-specific functionality
    if (window.location.pathname.includes('dashboard.html')) {
        initializeDashboard();
    } else if (window.location.pathname.includes('reports.html')) {
        initializeReports();
    } else if (window.location.pathname.includes('manual-entry.html')) {
        initializeManualEntry();
    } else if (window.location.pathname.includes('qr-scanner.html')) {
        initializeQRScanner();
    }
});

// Dashboard functionality
async function initializeDashboard() {
    const [stats, errors] = await Promise.all([
        app.loadStats(),
        app.loadErrors()
    ]);

    if (stats) {
        updateDashboardStats(stats);
        renderQuickStats(stats);
    }

    displayRecentErrors(errors);
}

function updateDashboardStats(stats) {
    const statsElements = {
        totalErrors: stats.totalErrors,
        openErrors: stats.openErrors,
        inProgressErrors: stats.inProgressErrors,
        resolvedErrors: stats.resolvedErrors
    };

    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateCounter(element, value);
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

function renderQuickStats(stats) {
    const container = document.getElementById('quickStats');
    if (!container) return;

    const severityStats = stats.severityStats || [];
    container.innerHTML = severityStats.map(stat => `
        <div class="card">
            <div class="card-body">
                <h4>${stat._id} Errors</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stat.count / stats.totalErrors) * 100}%"></div>
                </div>
                <span>${stat.count} errors</span>
            </div>
        </div>
    `).join('');
}

function displayRecentErrors(errors) {
    const container = document.getElementById('recentErrors');
    if (!container) return;

    const recentErrors = errors.slice(0, 5);
    
    if (recentErrors.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h4>No Errors Reported</h4>
                    <p>Start by reporting your first crane error</p>
                    <a href="entry-mode.html" class="btn btn-primary">Report Error</a>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = recentErrors.map(error => `
        <div class="card error-item slide-up">
            <div class="card-body">
                <div style="display: flex; justify-content: between; align-items: start; gap: 1rem;">
                    <div class="error-details" style="flex: 1;">
                        <h4 style="margin-bottom: 0.5rem;">${error.craneId} - ${error.errorType}</h4>
                        <p style="color: var(--gray); margin-bottom: 1rem;">${error.description}</p>
                        <div class="error-meta">
                            <span class="badge badge-${error.severity.toLowerCase()}">${error.severity}</span>
                            <span class="badge badge-${error.status === 'Resolved' ? 'success' : error.status === 'In Progress' ? 'warning' : 'danger'}">${error.status}</span>
                            <span style="color: var(--gray-light);">${app.formatDate(error.timestamp)}</span>
                        </div>
                    </div>
                    <div class="error-actions">
                        ${error.status !== 'In Progress' ? `<button onclick="updateErrorStatus('${error._id}', 'In Progress')" class="btn btn-warning btn-sm">In Progress</button>` : ''}
                        ${error.status !== 'Resolved' ? `<button onclick="updateErrorStatus('${error._id}', 'Resolved')" class="btn btn-success btn-sm">Resolve</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Reports functionality
async function initializeReports() {
    await loadReportsWithFilters();
    setupReportsFilters();
}

async function loadReportsWithFilters(filters = {}) {
    const errors = await app.loadErrors(filters);
    displayAllErrors(errors);
}

function setupReportsFilters() {
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }

    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            document.querySelectorAll('#filterForm select').forEach(select => {
                select.value = '';
            });
            applyFilters();
        });
    }
}

async function applyFilters() {
    const status = document.getElementById('statusFilter')?.value;
    const severity = document.getElementById('severityFilter')?.value;
    
    const filters = {};
    if (status) filters.status = status;
    if (severity) filters.severity = severity;
    
    await loadReportsWithFilters(filters);
}

function displayAllErrors(errors) {
    const container = document.getElementById('allErrors');
    if (!container) return;

    if (errors.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h4>No Errors Found</h4>
                    <p>No errors match your current filters</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = errors.map(error => `
        <div class="card error-item slide-up">
            <div class="card-body">
                <div style="display: flex; justify-content: between; align-items: start; gap: 1rem; flex-wrap: wrap;">
                    <div class="error-details" style="flex: 1; min-width: 300px;">
                        <h4 style="margin-bottom: 0.5rem;">${error.craneId} - ${error.errorType}</h4>
                        <p style="color: var(--gray); margin-bottom: 1rem;">${error.description}</p>
                        <div class="error-meta">
                            <span><strong>Reported by:</strong> ${error.reportedBy}</span>
                            <span><strong>Location:</strong> ${error.location || 'N/A'}</span>
                            <span><strong>Date:</strong> ${app.formatDate(error.timestamp)}</span>
                            ${error.resolvedAt ? `<span><strong>Resolved:</strong> ${app.formatDate(error.resolvedAt)}</span>` : ''}
                        </div>
                        ${error.notes ? `<p style="margin-top: 1rem;"><strong>Notes:</strong> ${error.notes}</p>` : ''}
                        <div style="margin-top: 1rem;">
                            <span class="badge badge-${error.severity.toLowerCase()}">${error.severity} Severity</span>
                            <span class="badge badge-${error.status === 'Resolved' ? 'success' : error.status === 'In Progress' ? 'warning' : 'danger'}">${error.status}</span>
                        </div>
                    </div>
                    <div class="error-actions">
                        ${error.status !== 'In Progress' ? `<button onclick="updateErrorStatus('${error._id}', 'In Progress')" class="btn btn-warning btn-sm">In Progress</button>` : ''}
                        ${error.status !== 'Resolved' ? `<button onclick="updateErrorStatus('${error._id}', 'Resolved')" class="btn btn-success btn-sm">Resolve</button>` : ''}
                        <button onclick="deleteErrorReport('${error._id}')" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Manual Entry functionality
function initializeManualEntry() {
    const form = document.getElementById('errorForm');
    if (form) {
        form.addEventListener('submit', handleErrorSubmit);
        
        // Pre-fill crane ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const craneId = urlParams.get('craneId');
        if (craneId) {
            document.getElementById('craneId').value = craneId;
        }
    }
}

async function handleErrorSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorData = {
        craneId: formData.get('craneId'),
        errorType: formData.get('errorType'),
        severity: formData.get('severity'),
        description: formData.get('description'),
        location: formData.get('location')
    };

    // Validate required fields
    if (!errorData.craneId || !errorData.errorType || !errorData.severity || !errorData.description) {
        app.showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px;"></div> Submitting...';

        const response = await fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        });

        if (response.ok) {
            app.showNotification('Error report submitted successfully!', 'success');
            e.target.reset();
            
            // Redirect to dashboard after successful submission
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit error report');
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        app.showNotification(error.message || 'Failed to submit error report', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Error Report';
    }
}

// QR Scanner functionality
function initializeQRScanner() {
    const scannerContainer = document.getElementById('qrScanner');
    const resultDiv = document.getElementById('scanResult');
    const startBtn = document.getElementById('startScanner');
    const stopBtn = document.getElementById('stopScanner');
    
    let scanner = null;

    if (startBtn) {
        startBtn.addEventListener('click', startScanner);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopScanner);
    }

    async function startScanner() {
        try {
            // Check if browser supports camera access
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access not supported in this browser');
            }

            // Simple QR scanner implementation (in a real app, you'd use a library like jsQR or QuaggaJS)
            scannerContainer.innerHTML = `
                <div style="position: relative; width: 100%; max-width: 400px; margin: 0 auto;">
                    <video id="qrVideo" style="width: 100%; border-radius: 8px;"></video>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                width: 200px; height: 200px; border: 2px solid #4361ee; border-radius: 8px;"></div>
                </div>
            `;

            const video = document.getElementById('qrVideo');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            video.srcObject = stream;
            await video.play();

            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            resultDiv.innerHTML = '<p class="text-info">Scanning for QR codes...</p>';

            // Simulate QR code detection (replace with actual QR library)
            simulateQRDetection(video);

        } catch (error) {
            console.error('Error starting scanner:', error);
            resultDiv.innerHTML = `<p class="text-error">Error: ${error.message}</p>`;
        }
    }

    function stopScanner() {
        const video = document.getElementById('qrVideo');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        scannerContainer.innerHTML = '';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        resultDiv.innerHTML = '<p class="text-muted">Scanner stopped</p>';
    }

    function simulateQRDetection(video) {
        // This is a simplified simulation - in a real app, use a proper QR library
        const checkQR = setInterval(() => {
            if (!video.srcObject) {
                clearInterval(checkQR);
                return;
            }

            // Simulate finding a QR code after 3 seconds
            if (Math.random() < 0.1) { // 10% chance per check to simulate detection
                clearInterval(checkQR);
                handleQRCodeDetected('CRANE-2024-001');
            }
        }, 1000);
    }

    function handleQRCodeDetected(qrData) {
        resultDiv.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h4>✓ QR Code Scanned Successfully</h4>
                    <p><strong>Crane ID:</strong> ${qrData}</p>
                    <div style="margin-top: 1rem;">
                        <button onclick="proceedToManualEntry('${qrData}')" class="btn btn-primary">
                            Report Error for this Crane
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        stopScanner();
    }
}

// Global function to proceed to manual entry with pre-filled crane ID
window.proceedToManualEntry = (craneId) => {
    window.location.href = `manual-entry.html?craneId=${encodeURIComponent(craneId)}`;
};

// Additional utility functions
function exportErrorsToCSV() {
    // Implementation for exporting errors to CSV
    app.showNotification('Export feature coming soon!', 'info');
}

function printErrorReport(errorId) {
    // Implementation for printing individual error reports
    app.showNotification('Print feature coming soon!', 'info');
}

// Error status update with notes
async function updateErrorStatusWithNotes(errorId, status) {
    const notes = prompt('Add notes (optional):');
    if (notes === null) return; // User cancelled
    
    const success = await app.updateErrorStatus(errorId, status, notes);
    if (success) {
        // Reload the current page to reflect changes
        setTimeout(() => {
            if (window.location.pathname.includes('dashboard.html')) {
                initializeDashboard();
            } else if (window.location.pathname.includes('reports.html')) {
                loadReportsWithFilters();
            }
        }, 500);
    }
}

// Enhanced error deletion with confirmation
window.deleteErrorReport = async (errorId) => {
    const success = await app.deleteError(errorId);
    if (success) {
        // Reload the current page to reflect changes
        setTimeout(() => {
            if (window.location.pathname.includes('reports.html')) {
                loadReportsWithFilters();
            }
        }, 500);
    }
};

// Update the global updateErrorStatus function to include notes
window.updateErrorStatus = (errorId, status) => updateErrorStatusWithNotes(errorId, status);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + E for new error report
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        if (!window.location.pathname.includes('manual-entry.html')) {
            window.location.href = 'manual-entry.html';
        }
    }
    
    // Ctrl + D for dashboard
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Escape key to close modals/notifications
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('[style*="z-index: 10000"]');
        openModals.forEach(modal => modal.remove());
        
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
});

// Add service worker for offline functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    app.showNotification('An unexpected error occurred', 'error');
});

// Promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    app.showNotification('An unexpected error occurred', 'error');
});
