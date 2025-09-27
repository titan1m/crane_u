// error-codes.js - Fixed search functionality
class ErrorCodeManager {
    constructor() {
        this.currentResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Enter key support for search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchErrorCodes();
                }
            });
        }

        // Real-time search with debounce
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchErrorCodes();
                }, 300);
            });
        }

        // Filter changes
        const filters = ['errorTypeFilter', 'severityFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.searchErrorCodes();
                });
            }
        });
    }

    async loadInitialData() {
        try {
            await this.searchErrorCodes();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async searchErrorCodes() {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const errorType = document.getElementById('errorTypeFilter')?.value || '';
        const severity = document.getElementById('severityFilter')?.value || '';

        this.showLoading();

        try {
            // For demo purposes - in real app, this would be your API call
            const response = await this.fetchErrorCodes(searchTerm, errorType, severity);
            this.currentResults = response;
            this.displaySearchResults();
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('❌ Search failed. Using demo data.', 'error');
            this.loadDemoData();
        }
    }

    async fetchErrorCodes(searchTerm, errorType, severity) {
        // Mock API call - replace with actual fetch
        return new Promise((resolve) => {
            setTimeout(() => {
                const demoData = this.getDemoErrorCodes();
                let filtered = demoData;

                if (searchTerm) {
                    filtered = filtered.filter(code => 
                        code.errorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        code.description.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                if (errorType) {
                    filtered = filtered.filter(code => code.errorType === errorType);
                }

                if (severity) {
                    filtered = filtered.filter(code => code.severity === severity);
                }

                resolve(filtered);
            }, 500);
        });
    }

    getDemoErrorCodes() {
        return [
            {
                errorCode: "E001",
                errorType: "Hydraulic",
                severity: "High",
                description: "Hydraulic System Pressure Loss",
                symptoms: ["Slow boom movement", "Unable to lift rated loads"],
                causes: ["Hydraulic fluid leak", "Faulty pressure relief valve"],
                solutions: ["Check and repair hydraulic lines", "Replace pressure relief valve"],
                immediateActions: ["Stop crane operation immediately", "Check hydraulic fluid level"],
                requiredTools: ["Pressure gauge", "Wrench set"],
                estimatedFixTime: 4,
                safetyPrecautions: ["Release hydraulic pressure before working"],
                commonAffectedModels: ["LTM 1100", "GMK 3050"]
            },
            // Add more demo codes as needed
        ];
    }

    displaySearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (this.currentResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>🔍 No error codes found matching your search criteria</p>
                    <p><small>Try adjusting your search terms or filters</small></p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.currentResults.map(errorCode => `
            <div class="error-code-card" onclick="errorCodeManager.showErrorCodeDetails('${errorCode.errorCode}')">
                <div class="error-code-header">
                    <span class="error-code-badge ${errorCode.severity.toLowerCase()}">${errorCode.errorCode}</span>
                    <span class="error-type">${errorCode.errorType}</span>
                    <span class="severity-badge ${errorCode.severity.toLowerCase()}">${errorCode.severity}</span>
                </div>
                <div class="error-code-body">
                    <h4>${errorCode.description}</h4>
                    <p class="symptoms-preview">${errorCode.symptoms.slice(0, 2).join(', ')}</p>
                    <div class="error-code-meta">
                        <span>⏱️ ${errorCode.estimatedFixTime}h fix</span>
                        <span>🛠️ ${errorCode.requiredTools.length} tools</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="spinner"></div>
                    <p>Searching...</p>
                </div>
            `;
        }
    }

    // ... rest of your existing methods
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.errorCodeManager = new ErrorCodeManager();
});
