// Configuration for UI Analyzer frontend
const config = {
    // Backend API URL - automatically switches based on environment
    API_BASE_URL: (() => {
        // Development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        // Production - Real backend URL
        return 'https://backend-clbh8nmln-boraaltinoks-projects.vercel.app/api';
    })(),
    
    // Frontend URL
    FRONTEND_URL: 'https://boraaltinok.github.io/ui-analyzer',
    
    // Company Information (Reusable for branding)
    COMPANY: {
        name: 'NEXTLINE YAZILIM LİMİTED ŞİRKETİ',
        shortName: 'NEXTLINE',
        email: 'support@nextline.software',
        phone: '+90 537 237 52 60',
        address: 'Çamlıca Mah. Gün Sok. no:5 Beşevler Nilüfer/Bursa',
        website: 'https://nextline.software'
    },
    
    // App settings (Customizable per SaaS)
    APP: {
        name: 'UI Analyzer',
        tagline: 'Extract UI styles, color schemes, and UX patterns from competitor app screens',
        version: '1.0.0',
        logo: '🎨'
    },
    
    // Payment Plans - Global Multi-Currency Support
    PLANS: {
        free: {
            id: 'free',
            name: 'Free',
            prices: {
                USD: 0, EUR: 0, GBP: 0, TRY: 0, RUB: 0, CHF: 0, NOK: 0
            },
            monthlyLimit: 3,
            features: [
                '3 analyses per month',
                'Basic color extraction', 
                'Demo mode only',
                'No AI analysis',
                'No export features'
            ]
        },
        yearly: {
            id: 'yearly',
            name: 'Pro Yearly',
            prices: {
                USD: 10, EUR: 9, GBP: 8, TRY: 300, RUB: 900, CHF: 9, NOK: 100
            },
            monthlyLimit: -1, // Unlimited
            badge: 'Most Popular',
            features: [
                'Unlimited analyses',
                'Full AI-powered analysis',
                'Multiple image support',
                'Export to JSON/CSS',
                'Color palette extraction',
                'Typography analysis',
                'UX insights & recommendations',
                'Priority support'
            ]
        },
        lifetime: {
            id: 'lifetime',
            name: 'Lifetime Access',
            prices: {
                USD: 20, EUR: 18, GBP: 16, TRY: 600, RUB: 1800, CHF: 18, NOK: 200
            },
            monthlyLimit: -1, // Unlimited
            badge: 'Best Value',
            features: [
                'Everything in Pro',
                'Lifetime access',
                'All future updates',
                'No recurring fees',
                'Best value!'
            ]
        }
    },

    // Supported Currencies (Iyzico Multi-Currency)
    CURRENCIES: {
        USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
        EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
        GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
        TRY: { symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
        RUB: { symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
        CHF: { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
        NOK: { symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' }
    },
    
    // Feature flags (Easy to toggle features)
    FEATURES: {
        REAL_PAYMENTS: true,
        ANALYTICS: true,
        EXPORT: true,
        MULTI_LANGUAGE: false,
        TEAM_FEATURES: false
    },
    
    // API endpoints (Reusable structure)
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REFRESH: '/auth/refresh',
            LOGOUT: '/auth/logout'
        },
        PAYMENTS: {
            CREATE: '/payments/create-payment',
            VERIFY: '/payments/verify-payment',
            STATUS: '/payments/status'
        },
        USER: {
            PROFILE: '/users/profile',
            UPDATE: '/users/update',
            USAGE: '/users/usage'
        }
    },
    
    // Utility functions
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    },
    
    getApiUrl: (endpoint) => {
        return config.API_BASE_URL + endpoint;
    },
    
    formatPrice: (plan, currency = 'TRY') => {
        const price = plan.prices ? plan.prices[currency] : plan.price || 0;
        const currencyInfo = config.CURRENCIES[currency] || { symbol: currency };
        return `${currencyInfo.symbol}${price}`;
    },

    // Detect user's preferred currency
    detectCurrency: async () => {
        try {
            const response = await fetch(config.getApiUrl('/payments/detect-currency'));
            const data = await response.json();
            return data.detectedCurrency || 'TRY';
        } catch (error) {
            console.log('Currency detection failed, using TRY');
            return 'TRY';
        }
    },

    // Get available currencies for a plan
    getAvailableCurrencies: () => {
        return Object.keys(config.CURRENCIES);
    }
};

// Make config globally available
window.APP_CONFIG = config;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}