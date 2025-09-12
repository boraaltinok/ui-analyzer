# 🚀 Complete Deployment Guide

## Overview
Deploy your UI Analyzer SaaS with backend API and Turkish payment integration.

## Architecture
```
Frontend (GitHub Pages) → Backend (Vercel) → MongoDB Atlas → iyzico
```

## Step 1: Deploy Backend to Vercel

### 1.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 1.2 Deploy Backend
```bash
cd backend
vercel --prod
```

### 1.3 Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ui-analyzer
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
FRONTEND_URL=https://boraaltinok.github.io/ui-analyzer
```

## Step 2: Set Up MongoDB Atlas

### 2.1 Create Account
- Go to https://cloud.mongodb.com/
- Create free account
- Create new cluster (free tier)

### 2.2 Configure Database
```bash
# Database name: ui-analyzer
# Collections: users, subscriptions
# Network access: Add 0.0.0.0/0 (for Vercel)
```

### 2.3 Get Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/ui-analyzer
```

## Step 3: Set Up iyzico

### 3.1 Create Merchant Account
- Go to https://merchant.iyzipay.com/
- Complete business verification
- Get API keys from integration section

### 3.2 Test Integration
```javascript
// Test with sandbox first
API_KEY: "sandbox-xxx"
SECRET_KEY: "sandbox-xxx"
URL: "https://sandbox-api.iyzipay.com"

// Then switch to production
API_KEY: "your-live-key"
SECRET_KEY: "your-live-secret"  
URL: "https://api.iyzipay.com"
```

## Step 4: Update Frontend Configuration

Create `config.js` in your frontend:

```javascript
// config.js
const config = {
    API_BASE_URL: 'https://your-backend.vercel.app',
    FRONTEND_URL: 'https://boraaltinok.github.io/ui-analyzer',
    
    // Development
    // API_BASE_URL: 'http://localhost:3001',
};

window.APP_CONFIG = config;
```

## Step 5: Connect Frontend to Backend

Update your frontend files to use the backend API:

### 5.1 Update pricing.js
```javascript
// Replace mock payment with real backend calls
async processPayment(paymentData) {
    const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}/api/payments/create-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
        window.location.href = result.paymentPageUrl;
    } else {
        throw new Error(result.error);
    }
}
```

### 5.2 Update dashboard.js
```javascript
// Replace localStorage auth with real backend
async signIn(email, password) {
    const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
        localStorage.setItem('token', result.token);
        this.currentUser = result.user;
        this.showDashboard();
    } else {
        throw new Error(result.error);
    }
}
```

## Step 6: Test Complete Flow

### 6.1 User Registration
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "password123",
    "name": "Test User"
  }'
```

### 6.2 Payment Flow
1. User selects plan on pricing page
2. Frontend calls backend `/api/payments/create-payment`
3. Backend creates iyzico payment
4. User completes payment on iyzico
5. iyzico redirects back to frontend
6. Frontend calls `/api/payments/verify-payment`
7. Backend verifies and activates subscription

## Step 7: Go Live Checklist

- [ ] Backend deployed to Vercel
- [ ] MongoDB Atlas configured  
- [ ] iyzico production keys added
- [ ] Frontend updated with backend URLs
- [ ] SSL certificates working
- [ ] Payment flow tested end-to-end
- [ ] Error handling implemented
- [ ] Monitoring set up

## Step 8: Monitoring & Maintenance

### 8.1 Vercel Monitoring
- Check function logs in Vercel dashboard
- Set up alerts for errors
- Monitor API response times

### 8.2 Database Monitoring  
- MongoDB Atlas provides built-in monitoring
- Set up alerts for high usage
- Regular backup verification

### 8.3 Payment Monitoring
- Monitor successful payment rate
- Track failed payments and reasons
- Set up alerts for payment issues

## Troubleshooting

### Common Issues

**CORS Errors**
- Verify FRONTEND_URL in environment variables
- Check CORS configuration in server.js

**Payment Failures**
- Verify iyzico credentials
- Check sandbox vs production environment
- Validate user data format

**Database Connection**
- Check MongoDB connection string
- Verify network access settings
- Confirm database name

**Authentication Issues**
- Verify JWT_SECRET is set
- Check token expiration (7 days)
- Validate user permissions

## Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 6,000 execution seconds
- **MongoDB Atlas**: 512MB storage, 100 connections
- **GitHub Pages**: Unlimited static hosting

### Paid Services (when you exceed free limits)
- **Vercel Pro**: $20/month
- **MongoDB Atlas**: $9/month (M10 cluster)  
- **iyzico**: 2.9% + ₺0.25 per transaction

## Security Best Practices

- Use HTTPS everywhere
- Never expose API keys in frontend
- Implement rate limiting
- Validate all inputs
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular backup and disaster recovery testing

Your SaaS is now production-ready with Turkish payment support! 🎉