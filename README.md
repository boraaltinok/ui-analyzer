# 🚀 SaaS Boilerplate with Iyzico Integration

**Production-ready SaaS template** for rapid deployment of Turkish payment-enabled applications. Clone and customize for your next SaaS project!

> **Originally built as UI Analyzer** - now evolved into a complete SaaS boilerplate

## 🎯 **What You Get**

### ✅ **Complete Backend** (Node.js + Express)
- JWT Authentication & Authorization
- Iyzico Payment Integration (Turkish payments)
- Subscription Management (Yearly/Lifetime)
- User Management & Usage Tracking
- MongoDB Integration with Mongoose
- Security (Helmet, CORS, Rate Limiting)
- RESTful API Architecture

### ✅ **Professional Frontend** (Vanilla JS)
- Modern Landing Page Design
- Pricing Page with Turkish Lira Support
- User Dashboard & Settings
- Seamless Payment Flow
- Responsive Design
- Legal Compliance Pages

### ✅ **Turkish Legal Compliance**
- KVKK Privacy Policy
- Distance Sales Agreement
- Delivery & Returns Policy
- Company Contact Information

### ✅ **Deployment Ready**
- Vercel Backend Configuration
- GitHub Pages Frontend Hosting
- Environment Management
- MongoDB Atlas Integration

## 🚀 **Quick Start (15 minutes)**

### 1. **Clone & Setup**
```bash
git clone [this-repo] my-new-saas
cd my-new-saas
```

### 2. **Backend Setup**
```bash
cd backend
npm install
npm run setup  # Generates JWT secret
```

### 3. **Configure Environment**
Update `backend/.env`:
```env
# Required
MONGODB_URI=mongodb+srv://your-atlas-connection
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key

# Auto-generated
JWT_SECRET=generated-secure-key
```

### 4. **Deploy Backend**
```bash
npm install -g vercel
vercel --prod
```

### 5. **Update Frontend Config**
Update `config.js` line 10:
```javascript
return 'https://your-backend-url.vercel.app/api';
```

### 6. **Deploy Frontend**
- Push to GitHub
- Enable GitHub Pages
- Your SaaS is live! 🎉

## 💰 **Payment Integration**

### **Iyzico Setup**
1. Use your existing **NEXTLINE YAZILIM** merchant account
2. Get API keys from merchant panel
3. Same account works for unlimited SaaS projects!

### **Supported Features**
- ✅ Turkish Lira payments
- ✅ Credit card processing  
- ✅ Installment options
- ✅ Automatic subscription management
- ✅ Invoice generation
- ✅ Refund handling

## 🎨 **Customization Guide**

### **Branding** (5 minutes)
```javascript
// config.js - Update company and app info
COMPANY: {
    name: 'YOUR COMPANY NAME',
    email: 'support@yourcompany.com'
},
APP: {
    name: 'Your SaaS Name',
    tagline: 'Your value proposition',
    logo: '🚀'
}
```

### **Pricing Plans** (2 minutes)
```javascript
// config.js - Modify plans
PLANS: {
    basic: { price: 29, priceTRY: 850 },
    pro: { price: 99, priceTRY: 2900 },
    enterprise: { price: 299, priceTRY: 8700 }
}
```

### **Styling** (10 minutes)
```css
/* styles.css - Update brand colors */
:root {
    --primary-color: #your-brand-color;
    --secondary-color: #your-accent-color;
}
```

## 📊 **Architecture Overview**

```
Frontend (GitHub Pages)
├── Landing Page (index.html)
├── Pricing (pricing.html)
├── Dashboard (dashboard.html)
├── Legal Pages (privacy, terms, etc.)
└── Configuration (config.js)

Backend (Vercel)
├── Authentication (/api/auth)
├── Payments (/api/payments)
├── Users (/api/users)
├── Subscriptions (/api/subscriptions)
└── Database (MongoDB Atlas)
```

## 🚀 **Current Implementation: UI Analyzer**

This boilerplate currently implements a **UI Analysis SaaS**:

- **Upload Screenshots**: Analyze competitor app designs
- **AI-Powered Analysis**: Extract colors, typography, layouts
- **Export Reports**: Download CSS variables and insights
- **Subscription Plans**: Free (3/month), Yearly ($10), Lifetime ($20)

## 💡 **Reuse for Your SaaS**

Perfect foundation for:
- ✅ **Analytics Tools** - Data visualization platforms
- ✅ **Content Creators** - Writing, design, or media tools
- ✅ **Business Tools** - CRM, project management, productivity
- ✅ **Developer Tools** - API services, code analyzers
- ✅ **Educational Platforms** - Course delivery, training

## 📚 **Documentation**

- **[Deployment Guide](./SAAS_DEPLOYMENT.md)** - Complete deployment instructions
- **[Backend API](./backend/README.md)** - API documentation
- **[Legal Compliance](./privacy-policy.html)** - Turkish legal requirements

## 🛠 **Tech Stack**

**Frontend**: HTML5, CSS3, Vanilla JavaScript  
**Backend**: Node.js, Express.js  
**Database**: MongoDB with Mongoose  
**Payments**: Iyzico (Turkish market)  
**Auth**: JWT with bcrypt  
**Hosting**: Vercel + GitHub Pages  

## 🎯 **Success Metrics**

**Time Saved**: 2-3 weeks of development per project  
**Features Included**: Auth, payments, legal compliance  
**Market Ready**: Turkish market compliance built-in  
**Scalable**: From MVP to enterprise  

## 📞 **Support**

Need help customizing or deploying?
- 📧 Email: support@nextline.software
- 📞 Phone: +90 537 237 52 60

---

**Built with ❤️ by NEXTLINE YAZILIM** - Ready to power your next SaaS success! 🚀