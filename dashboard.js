class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.subscription = null;
        this.usage = null;
        this.isSignUp = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadUserData();
        this.checkAuthState();
    }

    initializeElements() {
        // Main sections
        this.loginPrompt = document.getElementById('loginPrompt');
        this.dashboardContent = document.getElementById('dashboardContent');
        
        // Auth elements
        this.loginBtn = document.getElementById('loginBtn');
        this.signupBtn = document.getElementById('signupBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.authModal = document.getElementById('authModal');
        this.authForm = document.getElementById('authForm');
        this.authModalTitle = document.getElementById('authModalTitle');
        this.authSubmitBtn = document.getElementById('authSubmitBtn');
        this.authSwitchBtn = document.getElementById('authSwitchBtn');
        this.authSwitchText = document.getElementById('authSwitchText');
        this.authNameGroup = document.getElementById('authNameGroup');
        this.closeModal = document.querySelector('.close');
        this.authError = document.getElementById('authError');
        
        // Dashboard elements
        this.subscriptionStatus = document.getElementById('subscriptionStatus');
        this.currentPlan = document.getElementById('currentPlan');
        this.planStatus = document.getElementById('planStatus');
        this.renewalDate = document.getElementById('renewalDate');
        this.renewalDateValue = document.getElementById('renewalDateValue');
        this.monthlyUsage = document.getElementById('monthlyUsage');
        this.upgradeBtn = document.getElementById('upgradeBtn');
        this.manageBtn = document.getElementById('manageBtn');
        
        // Stats elements
        this.totalAnalyses = document.getElementById('totalAnalyses');
        this.imagesAnalyzed = document.getElementById('imagesAnalyzed');
        this.reportsDownloaded = document.getElementById('reportsDownloaded');
        this.daysSinceJoined = document.getElementById('daysSinceJoined');
        
        // Recent analyses
        this.recentAnalyses = document.getElementById('recentAnalyses');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Settings
        this.userEmail = document.getElementById('userEmail');
        this.userName = document.getElementById('userName');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.deleteAccountBtn = document.getElementById('deleteAccountBtn');
    }

    bindEvents() {
        // Auth buttons
        this.loginBtn.addEventListener('click', () => this.showAuthModal(false));
        this.signupBtn.addEventListener('click', () => this.showAuthModal(true));
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.hideAuthModal());
        this.authSwitchBtn.addEventListener('click', () => this.toggleAuthMode());
        this.authForm.addEventListener('submit', (e) => this.handleAuth(e));
        
        // Dashboard actions
        this.upgradeBtn.addEventListener('click', () => this.redirectToPricing());
        this.manageBtn.addEventListener('click', () => this.manageSubscription());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.authModal) {
                this.hideAuthModal();
            }
        });
    }

    loadUserData() {
        // Load user from localStorage
        const userData = localStorage.getItem('uiAnalyzerUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
        
        // Load subscription data
        const subscriptionData = localStorage.getItem('uiAnalyzerSubscription');
        if (subscriptionData) {
            this.subscription = JSON.parse(subscriptionData);
        }
        
        // Load usage data
        const usageData = localStorage.getItem('uiAnalyzerUsage');
        if (usageData) {
            this.usage = JSON.parse(usageData);
        } else {
            this.usage = {
                totalAnalyses: 0,
                monthlyAnalyses: 0,
                imagesAnalyzed: 0,
                reportsDownloaded: 0,
                lastResetDate: new Date().toISOString()
            };
        }
    }

    checkAuthState() {
        if (this.currentUser) {
            this.showDashboard();
        } else {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        this.loginPrompt.style.display = 'block';
        this.dashboardContent.style.display = 'none';
    }

    showDashboard() {
        this.loginPrompt.style.display = 'none';
        this.dashboardContent.style.display = 'block';
        this.updateDashboardContent();
    }

    showAuthModal(isSignUp) {
        this.isSignUp = isSignUp;
        this.authModal.style.display = 'block';
        
        if (isSignUp) {
            this.authModalTitle.textContent = 'Create Account';
            this.authSubmitBtn.textContent = 'Create Account';
            this.authSwitchText.textContent = 'Already have an account?';
            this.authSwitchBtn.textContent = 'Sign In';
            this.authNameGroup.style.display = 'block';
        } else {
            this.authModalTitle.textContent = 'Sign In';
            this.authSubmitBtn.textContent = 'Sign In';
            this.authSwitchText.textContent = "Don't have an account?";
            this.authSwitchBtn.textContent = 'Create Account';
            this.authNameGroup.style.display = 'none';
        }
        
        this.clearAuthError();
    }

    hideAuthModal() {
        this.authModal.style.display = 'none';
        this.authForm.reset();
        this.clearAuthError();
    }

    toggleAuthMode() {
        this.showAuthModal(!this.isSignUp);
    }

    async handleAuth(e) {
        e.preventDefault();
        this.clearAuthError();
        
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value;
        
        if (this.isSignUp) {
            await this.signUp(email, password, name);
        } else {
            await this.signIn(email, password);
        }
    }

    async signUp(email, password, name) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create user account (demo)
            const user = {
                id: 'user_' + Date.now(),
                email: email,
                name: name || email.split('@')[0],
                createdAt: new Date().toISOString(),
                plan: 'free'
            };
            
            this.currentUser = user;
            localStorage.setItem('uiAnalyzerUser', JSON.stringify(user));
            
            this.hideAuthModal();
            this.showDashboard();
            
            this.showSuccess('Account created successfully! Welcome to UI Analyzer Pro.');
            
        } catch (error) {
            this.showAuthError('Failed to create account. Please try again.');
        }
    }

    async signIn(email, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo, any email/password works
            const user = {
                id: 'user_demo',
                email: email,
                name: email.split('@')[0],
                createdAt: '2024-01-01T00:00:00.000Z',
                plan: this.subscription?.plan || 'free'
            };
            
            this.currentUser = user;
            localStorage.setItem('uiAnalyzerUser', JSON.stringify(user));
            
            this.hideAuthModal();
            this.showDashboard();
            
        } catch (error) {
            this.showAuthError('Invalid email or password.');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('uiAnalyzerUser');
        this.showLoginPrompt();
    }

    updateDashboardContent() {
        // Update subscription status
        this.updateSubscriptionStatus();
        
        // Update usage stats
        this.updateUsageStats();
        
        // Update recent analyses
        this.updateRecentAnalyses();
        
        // Update user settings
        this.updateUserSettings();
    }

    updateSubscriptionStatus() {
        let plan = 'Free Plan';
        let status = 'free';
        let renewalInfo = '';
        
        if (this.subscription) {
            switch (this.subscription.plan) {
                case 'yearly':
                    plan = 'Pro Yearly';
                    status = 'pro';
                    break;
                case 'lifetime':
                    plan = 'Lifetime Access';
                    status = 'lifetime';
                    break;
                default:
                    plan = 'Free Plan';
                    status = 'free';
            }
            
            if (this.subscription.endDate) {
                const endDate = new Date(this.subscription.endDate);
                renewalInfo = endDate.toLocaleDateString();
                this.renewalDate.style.display = 'block';
                this.renewalDateValue.textContent = renewalInfo;
            }
        }
        
        this.subscriptionStatus.textContent = status === 'free' ? 'Free' : 'Pro';
        this.subscriptionStatus.className = `status-badge ${status}`;
        this.currentPlan.textContent = plan;
        this.planStatus.textContent = 'Active';
        
        // Update usage display
        const monthlyLimit = status === 'free' ? 3 : '∞';
        this.monthlyUsage.textContent = `${this.usage.monthlyAnalyses} / ${monthlyLimit} analyses`;
        
        // Show/hide buttons
        if (status === 'free') {
            this.upgradeBtn.style.display = 'inline-block';
            this.manageBtn.style.display = 'none';
        } else {
            this.upgradeBtn.style.display = 'none';
            this.manageBtn.style.display = 'inline-block';
        }
    }

    updateUsageStats() {
        this.totalAnalyses.textContent = this.usage.totalAnalyses;
        this.imagesAnalyzed.textContent = this.usage.imagesAnalyzed;
        this.reportsDownloaded.textContent = this.usage.reportsDownloaded;
        
        // Calculate days since joined
        if (this.currentUser?.createdAt) {
            const joinDate = new Date(this.currentUser.createdAt);
            const daysDiff = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
            this.daysSinceJoined.textContent = daysDiff;
        }
    }

    updateRecentAnalyses() {
        const analyses = JSON.parse(localStorage.getItem('uiAnalyzerHistory') || '[]');
        
        if (analyses.length === 0) {
            this.recentAnalyses.innerHTML = `
                <div class="empty-state">
                    <p>No analyses yet. <a href="index.html">Start analyzing</a> competitor screenshots!</p>
                </div>
            `;
            return;
        }
        
        const recentHTML = analyses.slice(0, 5).map(analysis => `
            <div class="analysis-item">
                <div class="analysis-info">
                    <h4>${analysis.imageCount} screenshot${analysis.imageCount > 1 ? 's' : ''}</h4>
                    <p>Analyzed ${new Date(analysis.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="analysis-actions">
                    <button class="view-btn" onclick="viewAnalysis('${analysis.id}')">View</button>
                    <button class="download-btn" onclick="downloadAnalysis('${analysis.id}')">Download</button>
                </div>
            </div>
        `).join('');
        
        this.recentAnalyses.innerHTML = recentHTML;
    }

    updateUserSettings() {
        if (this.currentUser) {
            this.userEmail.value = this.currentUser.email;
            this.userName.value = this.currentUser.name;
        }
        
        // Load saved API key (masked)
        const savedApiKey = localStorage.getItem('uiAnalyzerApiKey');
        if (savedApiKey) {
            this.apiKeyInput.value = '••••••••••••••••';
            this.apiKeyInput.dataset.hasKey = 'true';
        }
    }

    redirectToPricing() {
        window.location.href = 'pricing.html';
    }

    manageSubscription() {
        alert('Subscription management coming soon! Contact support for changes.');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear your analysis history?')) {
            localStorage.removeItem('uiAnalyzerHistory');
            this.usage.totalAnalyses = 0;
            this.usage.imagesAnalyzed = 0;
            this.usage.reportsDownloaded = 0;
            this.saveUsage();
            this.updateDashboardContent();
            this.showSuccess('History cleared successfully.');
        }
    }

    saveSettings() {
        if (!this.currentUser) return;
        
        // Update user data
        this.currentUser.email = this.userEmail.value;
        this.currentUser.name = this.userName.value;
        localStorage.setItem('uiAnalyzerUser', JSON.stringify(this.currentUser));
        
        // Save API key if provided
        const apiKey = this.apiKeyInput.value;
        if (apiKey && apiKey !== '••••••••••••••••') {
            localStorage.setItem('uiAnalyzerApiKey', apiKey);
        }
        
        this.showSuccess('Settings saved successfully.');
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            localStorage.removeItem('uiAnalyzerUser');
            localStorage.removeItem('uiAnalyzerSubscription');
            localStorage.removeItem('uiAnalyzerUsage');
            localStorage.removeItem('uiAnalyzerHistory');
            localStorage.removeItem('uiAnalyzerApiKey');
            
            this.currentUser = null;
            this.subscription = null;
            this.usage = null;
            
            this.showLoginPrompt();
            this.showSuccess('Account deleted successfully.');
        }
    }

    saveUsage() {
        localStorage.setItem('uiAnalyzerUsage', JSON.stringify(this.usage));
    }

    showAuthError(message) {
        this.authError.textContent = message;
        this.authError.style.display = 'block';
    }

    clearAuthError() {
        this.authError.textContent = '';
        this.authError.style.display = 'none';
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Public method to increment usage (called from main app)
    incrementUsage(type, count = 1) {
        switch (type) {
            case 'analysis':
                this.usage.totalAnalyses += count;
                this.usage.monthlyAnalyses += count;
                break;
            case 'images':
                this.usage.imagesAnalyzed += count;
                break;
            case 'download':
                this.usage.reportsDownloaded += count;
                break;
        }
        this.saveUsage();
    }

    // Check if user can perform analysis
    canAnalyze() {
        if (!this.currentUser) return false;
        if (this.subscription?.plan && this.subscription.plan !== 'free') return true;
        return this.usage.monthlyAnalyses < 3;
    }
}

// Global functions for analysis items
function viewAnalysis(id) {
    const analyses = JSON.parse(localStorage.getItem('uiAnalyzerHistory') || '[]');
    const analysis = analyses.find(a => a.id === id);
    if (analysis) {
        // Open analysis in new tab or modal
        window.open(`index.html?analysis=${id}`, '_blank');
    }
}

function downloadAnalysis(id) {
    const analyses = JSON.parse(localStorage.getItem('uiAnalyzerHistory') || '[]');
    const analysis = analyses.find(a => a.id === id);
    if (analysis) {
        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ui-analysis-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Increment download usage
        if (window.dashboardManager) {
            window.dashboardManager.incrementUsage('download');
        }
    }
}

// Additional styling
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    .dashboard-main {
        max-width: 1200px;
        margin: 0 auto;
        color: white;
    }

    .login-prompt {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
    }

    .login-card {
        background: white;
        color: #1e293b;
        padding: 3rem;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 400px;
    }

    .login-card h2 {
        margin-bottom: 1rem;
    }

    .login-card p {
        margin-bottom: 2rem;
        color: #64748b;
    }

    .auth-buttons {
        display: flex;
        gap: 1rem;
        flex-direction: column;
    }

    .auth-btn {
        padding: 1rem 2rem;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .auth-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .auth-btn.secondary {
        background: #f1f5f9;
        color: #1e293b;
    }

    .auth-btn:hover {
        transform: translateY(-2px);
    }

    .logout-btn {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
    }

    .logout-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .dashboard-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .dashboard-header h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    .dashboard-section {
        margin-bottom: 2rem;
    }

    .section-card {
        background: white;
        color: #1e293b;
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.3rem;
    }

    .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .status-badge.free {
        background: #e5e7eb;
        color: #374151;
    }

    .status-badge.pro {
        background: #dbeafe;
        color: #1e40af;
    }

    .status-badge.lifetime {
        background: #fef3c7;
        color: #92400e;
    }

    .subscription-details {
        margin-bottom: 1.5rem;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .detail-item label {
        font-weight: 500;
        color: #64748b;
    }

    .subscription-actions {
        display: flex;
        gap: 1rem;
    }

    .action-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .action-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .action-btn.secondary {
        background: #f1f5f9;
        color: #1e293b;
    }

    .action-btn.danger {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .action-btn:hover {
        transform: translateY(-1px);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2rem;
    }

    .stat-item {
        text-align: center;
    }

    .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 0.5rem;
    }

    .stat-label {
        color: #64748b;
        font-size: 0.9rem;
    }

    .recent-analyses {
        max-height: 400px;
        overflow-y: auto;
    }

    .analysis-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .analysis-info h4 {
        margin: 0 0 0.25rem 0;
        color: #1e293b;
    }

    .analysis-info p {
        margin: 0;
        color: #64748b;
        font-size: 0.85rem;
    }

    .analysis-actions {
        display: flex;
        gap: 0.5rem;
    }

    .view-btn, .download-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .view-btn {
        background: #f1f5f9;
        color: #1e293b;
    }

    .download-btn {
        background: #10b981;
        color: white;
    }

    .view-btn:hover, .download-btn:hover {
        transform: translateY(-1px);
    }

    .clear-btn {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        font-size: 0.9rem;
        text-decoration: underline;
    }

    .settings-form {
        max-width: 500px;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #374151;
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
    }

    .form-group input:focus {
        outline: none;
        border-color: #667eea;
    }

    .form-group small {
        color: #6b7280;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        display: block;
    }

    .settings-actions {
        display: flex;
        gap: 1rem;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #64748b;
    }

    .empty-state a {
        color: #667eea;
        text-decoration: none;
    }

    .empty-state a:hover {
        text-decoration: underline;
    }

    .auth-form {
        max-width: 400px;
        margin: 0 auto;
    }

    .full-width {
        width: 100%;
    }

    .auth-switch {
        text-align: center;
        margin-top: 1.5rem;
        color: #64748b;
    }

    .link-btn {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        text-decoration: underline;
        margin-left: 0.5rem;
    }

    .error-message {
        background: #fef2f2;
        color: #dc2626;
        padding: 0.75rem;
        border-radius: 6px;
        margin-top: 1rem;
        display: none;
    }

    .success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .subscription-actions {
            flex-direction: column;
        }
        
        .settings-actions {
            flex-direction: column;
        }
        
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .analysis-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }
    }
`;

document.head.appendChild(dashboardStyle);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});