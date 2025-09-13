# 🚀 SaaS Deployment Guide - Reusable Boilerplate

This is a **production-ready SaaS boilerplate** with Iyzico payment integration that you can clone for future projects.

## 📋 What's Included

### ✅ Backend (Node.js/Express)
- **Authentication**: JWT-based user auth
- **Payments**: Full Iyzico integration (Turkish payments)
- **Subscriptions**: Yearly/Lifetime plans
- **Database**: MongoDB with Mongoose
- **Security**: Helmet, CORS, rate limiting
- **API**: RESTful endpoints

### ✅ Frontend (Vanilla JS)
- **Landing Page**: Professional design
- **Pricing**: Turkish Lira support
- **Dashboard**: User management
- **Payment Flow**: Seamless Iyzico checkout
- **Legal Pages**: Turkish compliance (KVKK, etc.)

### ✅ Deployment Ready
- **Vercel**: Backend deployment config
- **GitHub Pages**: Frontend hosting
- **Environment**: Production/development configs

## 🎯 Quick Deployment (15 minutes)

### 1. Backend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

### 2. Database Setup (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new cluster (free tier)
3. Get connection string
4. Update `MONGODB_URI` in Vercel environment variables

### 3. Iyzico Setup

1. Use your existing Iyzico merchant account
2. Get API keys from merchant panel
3. Add to Vercel environment variables:
   - `IYZICO_API_KEY`
   - `IYZICO_SECRET_KEY`

### 4. Frontend Deployment (GitHub Pages)

```bash
# Update config.js with your backend URL
# Push to GitHub
# Enable GitHub Pages in repo settings
```

## 🔧 Environment Variables

**Required for Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
FRONTEND_URL=https://yoursite.github.io
```

**Optional:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email
SMTP_PASS=your-password
OPENAI_API_KEY=sk-...
```

## 🔄 Reusing for New SaaS Projects

### 1. Clone & Customize
```bash
git clone [this-repo] new-saas-project
cd new-saas-project
```

### 2. Update Branding
- `index.html`: Change titles, descriptions
- `styles.css`: Update colors, fonts
- `company_info.md`: Update company details
- Legal pages: Update company name

### 3. Customize Product
- `script.js`: Update analysis logic
- `pricing.html`: Update plans/pricing
- `backend/routes/payments.js`: Update plan details

### 4. Deploy
- Follow deployment steps above
- Same Iyzico account works for all projects!

## 📊 Features Included

### Payment Features
- ✅ Turkish Lira payments
- ✅ Credit card processing
- ✅ Subscription management
- ✅ Automatic renewals
- ✅ Invoice generation
- ✅ Refund handling

### User Features
- ✅ Registration/Login
- ✅ Dashboard
- ✅ Usage tracking
- ✅ Plan upgrades
- ✅ Settings management

### Admin Features
- ✅ User management
- ✅ Payment tracking
- ✅ Analytics endpoints
- ✅ Webhook handling

### Legal Compliance
- ✅ KVKV (Privacy Policy)
- ✅ Distance Sales Agreement
- ✅ Terms of Service
- ✅ Turkish legal requirements

## 🎨 Customization Guide

### Frontend Styling
```css
/* Update primary colors in styles.css */
:root {
  --primary-color: #6366f1;  /* Your brand color */
  --secondary-color: #764ba2;
}
```

### Plan Configuration
```javascript
// Update in backend/routes/payments.js
const PLANS = {
  monthly: { price: 29, priceTRY: 850 },
  yearly: { price: 290, priceTRY: 8500 },
  lifetime: { price: 990, priceTRY: 29000 }
};
```

### Product Features
```javascript
// Update usage limits in models/User.js
userSchema.methods.canAnalyze = function() {
  // Customize limits per plan
  if (this.plan === 'premium') return this.usage.monthlyAnalyses < 100;
  return this.usage.monthlyAnalyses < 5; // free plan
};
```

## 🚀 Launch Checklist

- [ ] Backend deployed to Vercel
- [ ] Database connected (MongoDB Atlas)
- [ ] Iyzico API keys configured
- [ ] Frontend deployed to GitHub Pages
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Email notifications working
- [ ] Payment flow tested
- [ ] Legal pages updated
- [ ] Analytics configured

## 📈 Scaling Tips

### Performance
- Use Redis for session storage
- Implement caching strategies
- Use CDN for static assets

### Features
- Add team management
- Implement usage analytics
- Add webhook notifications
- Create admin panel

### Monitoring
- Use Sentry for error tracking
- Implement health checks
- Add performance monitoring

## 💡 Next Steps

1. **Test Everything**: Complete payment flow
2. **Launch**: Announce your SaaS
3. **Monitor**: Track usage and errors
4. **Iterate**: Add features based on feedback

## 🔗 Useful Links

- [Iyzico API Docs](https://dev.iyzipay.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [GitHub Pages](https://pages.github.com/)

---

**This boilerplate saves you 2-3 weeks of development time per SaaS project!** 🎯