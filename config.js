// Configuration for UI Analyzer frontend
const config = {
    // Production API URL (replace with your deployed backend)
    API_BASE_URL: 'https://your-backend-url.vercel.app',
    
    // Development API URL (uncomment for local development)
    // API_BASE_URL: 'http://localhost:3001',
    
    FRONTEND_URL: 'https://boraaltinok.github.io/ui-analyzer',
    
    // App settings
    APP_NAME: 'UI Analyzer Pro',
    VERSION: '1.0.0',
    
    // Plan configuration
    PLANS: {
        FREE: {
            name: 'Free',
            monthlyLimit: 3,
            features: ['Basic analysis', 'Demo mode only']
        },
        YEARLY: {
            name: 'Pro Yearly',
            price: 10,
            priceTRY: 300,
            features: ['Unlimited analyses', 'AI-powered', 'Export features']
        },
        LIFETIME: {
            name: 'Lifetime Access',
            price: 20,
            priceTRY: 600,
            features: ['Everything in Yearly', 'Lifetime access', 'Future updates']
        }
    },
    
    // Feature flags
    FEATURES: {
        REAL_PAYMENTS: true,
        ANALYTICS: true,
        EXPORT: true
    }
};

// Make config globally available
window.APP_CONFIG = config;