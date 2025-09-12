const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user analytics (for dashboard)
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscription');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate analytics
        const daysSinceJoined = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
        const avgAnalysesPerDay = daysSinceJoined > 0 ? 
            (user.usage.totalAnalyses / daysSinceJoined).toFixed(2) : 0;

        // Monthly progress (for free users)
        const monthlyProgress = user.plan === 'free' ? 
            (user.usage.monthlyAnalyses / 3) * 100 : 100;

        const analytics = {
            usage: {
                totalAnalyses: user.usage.totalAnalyses,
                monthlyAnalyses: user.usage.monthlyAnalyses,
                imagesAnalyzed: user.usage.imagesAnalyzed,
                reportsDownloaded: user.usage.reportsDownloaded,
                avgAnalysesPerDay: parseFloat(avgAnalysesPerDay)
            },
            account: {
                daysSinceJoined,
                plan: user.plan,
                status: user.isActive ? 'active' : 'inactive',
                lastLogin: user.lastLogin
            },
            limits: {
                monthlyLimit: user.plan === 'free' ? 3 : null,
                monthlyProgress: Math.round(monthlyProgress),
                canAnalyze: user.canAnalyze(),
                daysUntilReset: user.plan === 'free' ? 
                    new Date(user.usage.lastResetDate.getFullYear(), 
                             user.usage.lastResetDate.getMonth() + 1, 1) - new Date() : null
            }
        };

        res.json(analytics);

    } catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save analysis to user history
router.post('/save-analysis', [
    authenticateToken,
    body('imageCount').isInt({ min: 1 }),
    body('imageNames').isArray(),
    body('results').isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user can analyze
        if (!user.canAnalyze()) {
            return res.status(403).json({
                error: 'Analysis limit reached',
                plan: user.plan,
                usage: user.usage
            });
        }

        const { imageCount, imageNames, results } = req.body;

        // For now, we'll store analysis history in a separate collection
        // This is a placeholder - in production you might want a separate Analysis model
        const analysisRecord = {
            id: `analysis_${Date.now()}`,
            timestamp: new Date().toISOString(),
            imageCount,
            imageNames,
            results,
            userId: user._id
        };

        // Track usage
        await user.incrementUsage('analysis');
        await user.incrementUsage('images', imageCount);

        res.json({
            success: true,
            analysisId: analysisRecord.id,
            usage: user.usage,
            canAnalyze: user.canAnalyze()
        });

    } catch (error) {
        console.error('Save analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+settings.openaiApiKey');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            emailNotifications: user.settings.emailNotifications,
            hasOpenAIKey: !!user.settings.openaiApiKey,
            theme: user.settings.theme || 'light',
            language: user.settings.language || 'en'
        });

    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user preferences
router.put('/preferences', [
    authenticateToken,
    body('emailNotifications').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark']),
    body('language').optional().isIn(['en', 'tr'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { emailNotifications, theme, language } = req.body;

        if (emailNotifications !== undefined) {
            user.settings.emailNotifications = emailNotifications;
        }
        if (theme) user.settings.theme = theme;
        if (language) user.settings.language = language;

        await user.save();

        res.json({
            success: true,
            preferences: {
                emailNotifications: user.settings.emailNotifications,
                theme: user.settings.theme,
                language: user.settings.language
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export user data (GDPR compliance)
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscription');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = {
            profile: {
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            subscription: {
                plan: user.plan,
                status: user.subscription?.status,
                startDate: user.subscription?.startDate,
                endDate: user.subscription?.endDate
            },
            usage: user.usage,
            settings: {
                emailNotifications: user.settings.emailNotifications,
                theme: user.settings.theme,
                language: user.settings.language
            }
        };

        res.json({
            exportDate: new Date().toISOString(),
            data: userData
        });

    } catch (error) {
        console.error('Export user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check username availability
router.get('/check-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(),
            isActive: true 
        });

        res.json({
            available: !existingUser,
            email: email.toLowerCase()
        });

    } catch (error) {
        console.error('Check email availability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;