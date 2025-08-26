# 🇹🇷 Turkish Payment Integration Guide

## Recommended Payment Providers for Turkey

### 1. **iyzico** (Recommended)
- Turkey's leading payment provider
- Perfect for Turkish companies
- Supports Turkish VAT
- Multiple payment methods

### 2. **PayTR**
- Local Turkish payment gateway
- Good rates for local transactions
- Easy integration

### 3. **Stripe** (with Turkish support)
- International reach
- Good for global customers
- Requires Turkish entity setup

## iyzico Integration Steps

### 1. **Sign Up with iyzico**
```bash
# Visit: https://merchant.iyzipay.com/auth/register
```

### 2. **Get API Keys**
```javascript
// Test Environment
const API_KEY = "sandbox-xxx";
const SECRET_KEY = "sandbox-xxx";
const BASE_URL = "https://sandbox-api.iyzipay.com";

// Production Environment  
const API_KEY = "your-live-api-key";
const SECRET_KEY = "your-live-secret-key"; 
const BASE_URL = "https://api.iyzipay.com";
```

### 3. **Backend Integration**
Create a Node.js backend for payment processing:

```javascript
// backend/server.js
const express = require('express');
const Iyzipay = require('iyzipay');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.NODE_ENV === 'production' 
        ? 'https://api.iyzipay.com' 
        : 'https://sandbox-api.iyzipay.com'
});

// Create payment
app.post('/api/create-payment', async (req, res) => {
    const { plan, amount, customer } = req.body;
    
    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: Date.now().toString(),
        price: amount,
        paidPrice: amount,
        currency: Iyzipay.CURRENCY.TRY, // Turkish Lira
        basketId: 'B' + Date.now(),
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${process.env.FRONTEND_URL}/payment-success`,
        enabledInstallments: [1], // No installments
        buyer: {
            id: customer.id,
            name: customer.name,
            surname: customer.surname || 'User',
            gsmNumber: customer.phone || '+905555555555',
            email: customer.email,
            identityNumber: '11111111111',
            registrationAddress: 'Turkey',
            ip: req.ip,
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: customer.name,
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Turkey',
            zipCode: '34732'
        },
        billingAddress: {
            contactName: customer.name,
            city: 'Istanbul', 
            country: 'Turkey',
            address: 'Turkey',
            zipCode: '34732'
        },
        basketItems: [{
            id: plan,
            name: `UI Analyzer ${plan} Plan`,
            category1: 'Software',
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price: amount
        }]
    };

    try {
        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: err.errorMessage });
            }
            
            res.json({
                success: true,
                checkoutFormContent: result.checkoutFormContent,
                token: result.token,
                paymentPageUrl: result.paymentPageUrl
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Payment creation failed' });
    }
});

// Verify payment
app.post('/api/verify-payment', (req, res) => {
    const { token } = req.body;
    
    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: Date.now().toString(),
        token: token
    };

    iyzipay.checkoutForm.retrieve(request, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.errorMessage });
        }
        
        res.json({
            success: result.status === 'success',
            paymentStatus: result.paymentStatus,
            paidPrice: result.paidPrice,
            currency: result.currency
        });
    });
});

app.listen(3001, () => {
    console.log('Payment server running on port 3001');
});
```

### 4. **Frontend Integration**
Update your pricing.js file:

```javascript
// In pricing.js, replace the payment processing:

async processPayment(paymentData) {
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plan: paymentData.plan,
                amount: paymentData.amount,
                customer: paymentData.customer
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to iyzico checkout
            window.location.href = result.paymentPageUrl;
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        throw new Error('Payment processing failed');
    }
}
```

### 5. **Environment Variables**
```bash
# .env file
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
FRONTEND_URL=https://boraaltinok.github.io/ui-analyzer
NODE_ENV=production
```

## Deployment Options

### 1. **Vercel** (Backend + Frontend)
```bash
# Deploy backend to Vercel
npm install -g vercel
vercel --prod
```

### 2. **Railway** (Backend)
```bash
# Deploy to Railway
railway login
railway init
railway deploy
```

### 3. **Heroku** (Backend)
```bash
# Deploy to Heroku
heroku create your-app-name
git push heroku main
```

## VAT Configuration

### Turkish VAT Rates
```javascript
const VAT_RATES = {
    TR: 0.18, // 18% Turkish VAT
    EU: 0.20, // 20% EU VAT
    US: 0.00  // No VAT for US
};

function calculateTotalWithVAT(amount, country) {
    const vatRate = VAT_RATES[country] || 0;
    const vatAmount = amount * vatRate;
    return {
        subtotal: amount,
        vat: vatAmount,
        total: amount + vatAmount
    };
}
```

## Security Considerations

1. **Never store API keys in frontend**
2. **Use HTTPS everywhere**
3. **Validate payments server-side**
4. **Keep webhook secrets secure**

## Testing

### Test Cards (iyzico Sandbox)
```
Successful Payment:
- Card Number: 5890040000000016
- Expiry: 10/2030
- CVC: 123

Failed Payment:
- Card Number: 5406670000000009
- Expiry: 10/2030  
- CVC: 123
```

## Next Steps

1. **Create iyzico merchant account**
2. **Set up backend server (Node.js + Express)**
3. **Deploy backend to Vercel/Railway/Heroku**
4. **Update frontend payment flow**
5. **Add webhook for payment verification**
6. **Test with Turkish credit cards**
7. **Go live with production keys**

Your Turkish customers will love the local payment experience! 🎉