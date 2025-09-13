const express = require('express');
const Iyzipay = require('iyzipay');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Initialize iyzico
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.NODE_ENV === 'production' 
        ? 'https://api.iyzipay.com' 
        : 'https://sandbox-api.iyzipay.com'
});

// Plan prices - Global Multi-Currency Support
const PLANS = {
    yearly: {
        prices: {
            USD: 10,
            EUR: 9,
            GBP: 8,
            TRY: 300,
            RUB: 900,
            CHF: 9,
            NOK: 100
        },
        duration: 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
    },
    lifetime: {
        prices: {
            USD: 20,
            EUR: 18,
            GBP: 16,
            TRY: 600,
            RUB: 1800,
            CHF: 18,
            NOK: 200
        },
        duration: null // No expiration
    }
};

// Currency configuration
const SUPPORTED_CURRENCIES = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    TRY: { symbol: '₺', name: 'Turkish Lira' },
    RUB: { symbol: '₽', name: 'Russian Ruble' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone' }
};

// Create payment
router.post('/create-payment', [
    authenticateToken,
    body('plan').isIn(['yearly', 'lifetime']),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'TRY', 'RUB', 'CHF', 'NOK']),
    body('customerInfo.name').notEmpty().trim(),
    body('customerInfo.phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
    body('customerInfo.vatNumber').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { plan, currency = 'TRY', customerInfo } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has this plan
        if (user.plan === plan) {
            return res.status(400).json({ 
                error: 'You already have this plan' 
            });
        }

        // Validate currency
        if (!SUPPORTED_CURRENCIES[currency]) {
            return res.status(400).json({ 
                error: 'Unsupported currency' 
            });
        }

        const planDetails = PLANS[plan];
        const amount = planDetails.prices[currency];
        const conversationId = uuidv4();

        // Create iyzico payment request
        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            price: amount.toString(),
            paidPrice: amount.toString(),
            currency: Iyzipay.CURRENCY[currency],
            basketId: `UI_${user._id}_${Date.now()}`,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.FRONTEND_URL}/payment-success?plan=${plan}`,
            enabledInstallments: [1],
            buyer: {
                id: user._id.toString(),
                name: customerInfo.name.split(' ')[0] || customerInfo.name,
                surname: customerInfo.name.split(' ').slice(1).join(' ') || 'User',
                gsmNumber: customerInfo.phone || '+905555555555',
                email: user.email,
                identityNumber: '11111111111', // For test purposes
                lastLoginDate: user.lastLogin.toISOString().split('T')[0] + ' 12:00:00',
                registrationDate: user.createdAt.toISOString().split('T')[0] + ' 12:00:00',
                registrationAddress: 'Turkey',
                ip: req.ip || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34732'
            },
            shippingAddress: {
                contactName: customerInfo.name,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Turkey',
                zipCode: '34732'
            },
            billingAddress: {
                contactName: customerInfo.name,
                city: 'Istanbul',
                country: 'Turkey', 
                address: 'Turkey',
                zipCode: '34732'
            },
            basketItems: [{
                id: `${plan}_plan`,
                name: `UI Analyzer ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                category1: 'Software',
                category2: 'SaaS',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: amount.toString()
            }]
        };

        // Add VAT info if VAT number provided
        if (customerInfo.vatNumber) {
            request.buyer.vatNumber = customerInfo.vatNumber;
        }

        // Create checkout form
        iyzipay.checkoutFormInitialize.create(request, async (err, result) => {
            if (err) {
                console.error('iyzico error:', err);
                return res.status(400).json({ 
                    error: 'Payment initialization failed',
                    details: err.errorMessage 
                });
            }

            // Create pending subscription
            const subscription = new Subscription({
                user: user._id,
                plan: plan,
                amount: amount,
                currency: currency,
                paymentProvider: 'iyzico',
                paymentId: result.token,
                conversationId: conversationId,
                endDate: plan === 'yearly' ? 
                    new Date(Date.now() + planDetails.duration) : null,
                metadata: {
                    customerInfo: customerInfo
                }
            });

            await subscription.save();

            res.json({
                success: true,
                paymentPageUrl: result.paymentPageUrl,
                token: result.token,
                subscriptionId: subscription._id
            });
        });

    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify payment
router.post('/verify-payment', [
    authenticateToken,
    body('token').notEmpty()
], async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: Date.now().toString(),
            token: token
        };

        iyzipay.checkoutForm.retrieve(request, async (err, result) => {
            if (err) {
                console.error('Payment verification error:', err);
                return res.status(400).json({ 
                    error: 'Payment verification failed' 
                });
            }

            // Find subscription by payment token
            const subscription = await Subscription.findOne({ paymentId: token });
            
            if (!subscription) {
                return res.status(404).json({ 
                    error: 'Subscription not found' 
                });
            }

            if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                // Payment successful - activate subscription
                subscription.status = 'active';
                subscription.metadata.paymentInfo = {
                    cardType: result.cardType,
                    cardAssociation: result.cardAssociation,
                    cardFamily: result.cardFamily,
                    lastFourDigits: result.lastFourDigits
                };
                
                await subscription.save();

                // Update user plan
                user.plan = subscription.plan;
                user.subscription = subscription._id;
                await user.save();

                res.json({
                    success: true,
                    subscription: {
                        id: subscription._id,
                        plan: subscription.plan,
                        status: subscription.status,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate
                    }
                });
            } else {
                // Payment failed
                subscription.status = 'cancelled';
                await subscription.save();

                res.status(400).json({
                    success: false,
                    error: 'Payment failed',
                    paymentStatus: result.paymentStatus
                });
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get payment status
router.get('/status/:subscriptionId', authenticateToken, async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.subscriptionId);
        
        if (!subscription || subscription.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json({
            id: subscription._id,
            plan: subscription.plan,
            status: subscription.status,
            amount: subscription.amount,
            currency: subscription.currency,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            isActive: subscription.isActive()
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel subscription (for yearly plans)
router.post('/cancel/:subscriptionId', authenticateToken, async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.subscriptionId);
        
        if (!subscription || subscription.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (subscription.plan === 'lifetime') {
            return res.status(400).json({ 
                error: 'Cannot cancel lifetime subscription' 
            });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        // Update user plan back to free at end of billing period
        // For immediate cancellation, uncomment below:
        // const user = await User.findById(req.user.id);
        // user.plan = 'free';
        // await user.save();

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook endpoint for iyzico
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        // Handle iyzico webhook events
        // This would contain webhook verification and processing logic
        // For now, we'll just acknowledge receipt
        
        console.log('Webhook received:', req.body);
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

// Get supported currencies and plans
router.get('/plans', (req, res) => {
    try {
        const plansWithCurrencies = Object.keys(PLANS).map(planKey => {
            const plan = PLANS[planKey];
            return {
                id: planKey,
                name: planKey.charAt(0).toUpperCase() + planKey.slice(1),
                duration: plan.duration,
                prices: plan.prices,
                supportedCurrencies: Object.keys(plan.prices)
            };
        });

        res.json({
            plans: plansWithCurrencies,
            supportedCurrencies: SUPPORTED_CURRENCIES,
            defaultCurrency: 'TRY'
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Currency detection helper endpoint
router.get('/detect-currency', (req, res) => {
    try {
        // Simple country to currency mapping
        const countryToCurrency = {
            'TR': 'TRY',
            'US': 'USD',
            'GB': 'GBP',
            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
            'RU': 'RUB',
            'CH': 'CHF',
            'NO': 'NOK'
        };

        // Try to detect from IP or use header
        const country = req.headers['cf-ipcountry'] || 
                       req.headers['x-country-code'] || 
                       'TR'; // Default to Turkey
        
        const detectedCurrency = countryToCurrency[country] || 'USD';

        res.json({
            detectedCurrency,
            detectedCountry: country,
            supportedCurrencies: Object.keys(SUPPORTED_CURRENCIES)
        });
    } catch (error) {
        console.error('Currency detection error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;