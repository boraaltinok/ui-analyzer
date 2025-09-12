const express = require('express');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's subscription details
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscription');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const subscriptionStatus = user.getSubscriptionStatus();
        
        res.json({
            plan: user.plan,
            status: subscriptionStatus.status,
            startDate: user.subscription?.startDate,
            endDate: subscriptionStatus.endDate,
            usage: user.usage,
            canAnalyze: user.canAnalyze(),
            subscription: user.subscription || null
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track usage
router.post('/track-usage', [
    authenticateToken,
    body('type').isIn(['analysis', 'images', 'download']),
    body('count').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const { type, count = 1 } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user can perform this action
        if (type === 'analysis' && !user.canAnalyze()) {
            return res.status(403).json({
                error: 'Usage limit reached',
                usage: user.usage,
                plan: user.plan
            });
        }

        // Increment usage
        await user.incrementUsage(type, count);

        res.json({
            success: true,
            usage: user.usage,
            canAnalyze: user.canAnalyze()
        });

    } catch (error) {
        console.error('Track usage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate days since joined
        const daysSinceJoined = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));

        res.json({
            totalAnalyses: user.usage.totalAnalyses,
            monthlyAnalyses: user.usage.monthlyAnalyses,
            imagesAnalyzed: user.usage.imagesAnalyzed,
            reportsDownloaded: user.usage.reportsDownloaded,
            daysSinceJoined,
            monthlyLimit: user.plan === 'free' ? 3 : null,
            canAnalyze: user.canAnalyze(),
            lastResetDate: user.usage.lastResetDate
        });

    } catch (error) {
        console.error('Get usage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get subscription history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ 
            user: req.user.id 
        }).sort({ createdAt: -1 });

        const history = subscriptions.map(sub => ({
            id: sub._id,
            plan: sub.plan,
            status: sub.status,
            amount: sub.amount,
            currency: sub.currency,
            startDate: sub.startDate,
            endDate: sub.endDate,
            paymentProvider: sub.paymentProvider,
            createdAt: sub.createdAt
        }));

        res.json(history);

    } catch (error) {
        console.error('Get subscription history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if user can upgrade
router.get('/can-upgrade', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const canUpgradeToYearly = user.plan === 'free';
        const canUpgradeToLifetime = user.plan !== 'lifetime';

        res.json({
            canUpgradeToYearly,
            canUpgradeToLifetime,
            currentPlan: user.plan,
            recommendations: {
                yearly: canUpgradeToYearly ? {
                    savings: 'Save $14/year compared to monthly',
                    features: ['Unlimited analyses', 'Priority support', 'Export features']
                } : null,
                lifetime: canUpgradeToLifetime ? {
                    savings: user.plan === 'yearly' ? 'Pay once, save $10 every year after year 2' : 'Best value - never pay again',
                    features: ['Everything in yearly', 'Lifetime access', 'All future updates']
                } : null
            }
        });

    } catch (error) {
        console.error('Check upgrade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset monthly usage (admin endpoint - for testing)
router.post('/reset-usage', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.usage.monthlyAnalyses = 0;
        user.usage.lastResetDate = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Monthly usage reset successfully',
            usage: user.usage
        });

    } catch (error) {
        console.error('Reset usage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get plan comparison
router.get('/plans', (req, res) => {
    const plans = {
        free: {
            name: 'Free',
            price: 0,
            currency: 'USD',
            period: 'forever',
            features: {
                analyses: 3,
                period: 'month',
                aiAnalysis: false,
                multipleImages: false,
                export: false,
                support: 'community'
            }
        },
        yearly: {
            name: 'Pro Yearly',
            price: 10,
            priceTRY: 300,
            currency: 'USD',
            period: 'year',
            monthlyEquivalent: 0.83,
            features: {
                analyses: 'unlimited',
                period: 'month',
                aiAnalysis: true,
                multipleImages: true,
                export: true,
                support: 'priority'
            }
        },
        lifetime: {
            name: 'Lifetime Access',
            price: 20,
            priceTRY: 600,
            currency: 'USD',
            period: 'lifetime',
            features: {
                analyses: 'unlimited',
                period: 'forever',
                aiAnalysis: true,
                multipleImages: true,
                export: true,
                support: 'priority',
                futureUpdates: true
            }
        }
    };

    res.json(plans);
});

module.exports = router;