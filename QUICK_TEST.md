# 🧪 Quick Payment Test Guide

## 🚀 **Current Status**
✅ Iyzico API keys configured  
✅ Multi-currency support added  
✅ JWT secret generated  
❌ Database needed for full test  

## 📋 **Quick MongoDB Setup (5 minutes)**

### 1. **Create MongoDB Atlas Account**
- Go to [MongoDB Atlas](https://cloud.mongodb.com/)
- Sign up (free tier available)
- Create new cluster (choose free M0 tier)

### 2. **Get Connection String**
- Click "Connect" on your cluster
- Choose "Connect your application"  
- Copy the connection string
- Replace `<password>` with your database password

### 3. **Update Backend**
```bash
# Update backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ui-analyzer
```

## 🎯 **Test Payment Flow**

### **Option 1: Full Backend Test**
```bash
# Start backend
npm run dev

# Test currency detection
curl http://localhost:3001/api/payments/detect-currency

# Test plans endpoint  
curl http://localhost:3001/api/payments/plans
```

### **Option 2: Frontend-Only Test**
1. Open your live site: https://boraaltinok.github.io/ui-analyzer
2. Click "Pricing" 
3. Try to purchase a plan
4. Should show Iyzico payment form

### **Option 3: Deploy & Test Live**
```bash
# Deploy backend to Vercel
vercel --prod

# Update config.js with new backend URL
# Push to GitHub
# Test on live site
```

## 🔍 **What to Test**

### **Payment Features:**
- ✅ Currency detection (should detect user location)
- ✅ Multi-currency pricing display
- ✅ Iyzico payment form loads
- ✅ Payment success/failure handling
- ✅ Subscription activation

### **International Cards:**
- ✅ Visa cards from different countries
- ✅ MasterCard international
- ✅ Different currency selections

## 📊 **Expected Results**

**🇹🇷 Turkish Users**: See TRY pricing, Turkish payment form  
**🇺🇸 US Users**: See USD pricing, international payment form  
**🇪🇺 EU Users**: See EUR pricing, European payment form  

## 🚨 **Troubleshooting**

**Payment fails?**
- Check Iyzico keys are correct
- Verify currency is supported
- Test with different cards

**Backend errors?**  
- Check MongoDB connection
- Verify environment variables
- Check Vercel logs

## 🎯 **Recommendation**

**Fastest test**: Deploy backend to Vercel now and test live!

```bash
# Quick deploy
vercel --prod
# Update config.js line 10 with returned URL  
# Test payment on live site
```

Your Iyzico setup is ready - just need the backend deployed! 🚀