# 🚀 UI Analyzer Backend

Complete Node.js backend for UI Analyzer SaaS with Turkish payment integration using iyzico.

## Features

- ✅ **User Authentication** (JWT-based)
- ✅ **iyzico Payment Processing** (Turkish payment provider)
- ✅ **Subscription Management** (Free, Yearly, Lifetime)
- ✅ **Usage Tracking & Limits**
- ✅ **MongoDB Database** with Mongoose
- ✅ **RESTful API** with Express
- ✅ **Security Middleware** (Helmet, CORS, Rate Limiting)
- ✅ **Turkish VAT Support**
- ✅ **Webhook Handling**

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Required Services

#### MongoDB Database
```bash
# Option A: Local MongoDB
brew install mongodb-community
brew services start mongodb-community

# Option B: MongoDB Atlas (Recommended)
# 1. Go to https://cloud.mongodb.com/
# 2. Create free cluster
# 3. Get connection string
# 4. Add to MONGODB_URI in .env
```

#### iyzico Account
```bash
# 1. Sign up at https://merchant.iyzipay.com/
# 2. Get API keys from merchant panel
# 3. Add to .env:
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/settings` - Update settings
- `DELETE /api/auth/account` - Delete account

### Payments
- `POST /api/payments/create-payment` - Initialize payment
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/status/:id` - Get payment status
- `POST /api/payments/cancel/:id` - Cancel subscription
- `POST /api/payments/webhook` - iyzico webhook

### Subscriptions
- `GET /api/subscriptions/me` - Get user subscription
- `POST /api/subscriptions/track-usage` - Track usage
- `GET /api/subscriptions/usage` - Get usage stats
- `GET /api/subscriptions/history` - Subscription history
- `GET /api/subscriptions/plans` - Available plans

### Users
- `GET /api/users/analytics` - User analytics
- `POST /api/users/save-analysis` - Save analysis
- `GET /api/users/preferences` - Get preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/export` - Export user data

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Heroku
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Create app and deploy
heroku create ui-analyzer-backend
git push heroku main
heroku config:set NODE_ENV=production
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Environment (development/production) |
| `PORT` | No | Server port (default: 3001) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `IYZICO_API_KEY` | Yes | iyzico API key |
| `IYZICO_SECRET_KEY` | Yes | iyzico secret key |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |

## Testing

### Test Cards (iyzico Sandbox)
```
Successful Payment:
Card: 5890040000000016
Expiry: 10/2030
CVC: 123

Failed Payment:
Card: 5406670000000009
Expiry: 10/2030
CVC: 123
```

### API Testing
```bash
# Health check
curl https://your-api-url.vercel.app/health

# Register user
curl -X POST https://your-api-url.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## Production Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Get iyzico production API keys
- [ ] Configure environment variables
- [ ] Set up domain and SSL
- [ ] Configure webhooks
- [ ] Test payment flow
- [ ] Set up monitoring
- [ ] Configure backups

## Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests/15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator
- SQL injection prevention with Mongoose

## Database Schema

### Users
- Authentication & profile data
- Subscription information  
- Usage tracking
- Settings & preferences

### Subscriptions
- Payment details
- Plan information
- Status tracking
- Turkish VAT metadata

## Support

For issues or questions:
1. Check the logs in your deployment platform
2. Verify environment variables are set
3. Test with sandbox credentials first
4. Check iyzico documentation for payment issues

## License

MIT License - see LICENSE file for details.