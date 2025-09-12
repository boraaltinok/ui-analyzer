const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['yearly', 'lifetime'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'pending'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'TRY',
        enum: ['TRY', 'USD', 'EUR']
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: function() {
            return this.plan === 'yearly';
        }
    },
    paymentProvider: {
        type: String,
        enum: ['iyzico', 'stripe', 'demo'],
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    conversationId: String,
    metadata: {
        customerInfo: {
            name: String,
            email: String,
            phone: String,
            vatNumber: String
        },
        paymentInfo: {
            cardType: String,
            cardAssociation: String,
            cardFamily: String,
            lastFourDigits: String
        },
        invoiceInfo: {
            invoiceNumber: String,
            invoiceUrl: String
        }
    }
}, {
    timestamps: true
});

// Auto-populate user
subscriptionSchema.pre(/^find/, function(next) {
    this.populate('user', 'email name');
    next();
});

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
    if (this.status !== 'active') return false;
    
    if (this.plan === 'lifetime') return true;
    
    if (this.plan === 'yearly') {
        return new Date() < this.endDate;
    }
    
    return false;
};

// Renew yearly subscription
subscriptionSchema.methods.renew = function() {
    if (this.plan === 'yearly') {
        const currentEnd = this.endDate > new Date() ? this.endDate : new Date();
        this.endDate = new Date(currentEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
        this.status = 'active';
        return this.save();
    }
    throw new Error('Cannot renew lifetime subscription');
};

// Cancel subscription
subscriptionSchema.methods.cancel = function() {
    this.status = 'cancelled';
    return this.save();
};

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function() {
    return this.find({
        status: 'active',
        $or: [
            { plan: 'lifetime' },
            { plan: 'yearly', endDate: { $gt: new Date() } }
        ]
    });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);