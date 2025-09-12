const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                error: 'Invalid token - user not found or inactive' 
            });
        }

        // Add user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            plan: user.plan
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired' 
            });
        }

        res.status(500).json({ 
            error: 'Authentication failed' 
        });
    }
};

// Check if user has paid plan
const requirePaidPlan = async (req, res, next) => {
    try {
        if (req.user.plan === 'free') {
            return res.status(403).json({
                error: 'Paid plan required',
                plan: req.user.plan
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// Check usage limits
const checkUsageLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.canAnalyze()) {
            return res.status(403).json({
                error: 'Usage limit exceeded',
                usage: user.usage,
                plan: user.plan,
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        console.error('Usage limit check error:', error);
        res.status(500).json({ error: 'Usage check failed' });
    }
};

// Admin middleware (for future admin features)
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required' 
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requirePaidPlan,
    checkUsageLimit,
    requireAdmin
};