const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'yearly', 'lifetime'],
        default: 'free'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    usage: {
        totalAnalyses: {
            type: Number,
            default: 0
        },
        monthlyAnalyses: {
            type: Number,
            default: 0
        },
        imagesAnalyzed: {
            type: Number,
            default: 0
        },
        reportsDownloaded: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    },
    settings: {
        openaiApiKey: {
            type: String,
            select: false // Don't return this field by default
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can analyze
userSchema.methods.canAnalyze = function() {
    if (this.plan === 'yearly' || this.plan === 'lifetime') {
        return true;
    }
    
    // Reset monthly count if needed
    const now = new Date();
    const lastReset = new Date(this.usage.lastResetDate);
    
    if (now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
        this.usage.monthlyAnalyses = 0;
        this.usage.lastResetDate = now;
        this.save();
    }
    
    return this.usage.monthlyAnalyses < 3;
};

// Increment usage
userSchema.methods.incrementUsage = function(type, count = 1) {
    switch (type) {
        case 'analysis':
            this.usage.totalAnalyses += count;
            this.usage.monthlyAnalyses += count;
            break;
        case 'images':
            this.usage.imagesAnalyzed += count;
            break;
        case 'download':
            this.usage.reportsDownloaded += count;
            break;
    }
    return this.save();
};

// Get subscription status
userSchema.methods.getSubscriptionStatus = function() {
    if (this.plan === 'lifetime') {
        return {
            plan: 'lifetime',
            status: 'active',
            endDate: null
        };
    }
    
    if (this.plan === 'yearly' && this.subscription) {
        return {
            plan: 'yearly',
            status: 'active',
            endDate: this.subscription.endDate
        };
    }
    
    return {
        plan: 'free',
        status: 'active',
        endDate: null
    };
};

module.exports = mongoose.model('User', userSchema);