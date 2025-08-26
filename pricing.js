class PaymentManager {
    constructor() {
        this.selectedPlan = null;
        this.selectedPrice = null;
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.pricingToggle = document.getElementById('pricingToggle');
        this.paymentModal = document.getElementById('paymentModal');
        this.closeModal = document.querySelector('.close');
        this.planButtons = document.querySelectorAll('.plan-button[data-plan]');
        this.submitButton = document.getElementById('submit-payment');
        this.paymentErrors = document.getElementById('payment-errors');
        this.buttonText = document.getElementById('button-text');
        this.spinner = document.getElementById('payment-spinner');
        
        // Price elements for toggle
        this.yearlyPrices = document.querySelectorAll('.yearly-price');
        this.monthlyPrices = document.querySelectorAll('.monthly-price');
        this.yearlyPeriods = document.querySelectorAll('.yearly-period');
        this.monthlyPeriods = document.querySelectorAll('.monthly-period');
        this.yearlyNotes = document.querySelectorAll('.yearly-note');
        this.monthlyNotes = document.querySelectorAll('.monthly-note');
    }

    bindEvents() {
        // Pricing toggle
        this.pricingToggle.addEventListener('change', () => this.togglePricing());
        
        // Plan selection buttons
        this.planButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                const price = e.target.dataset.price;
                this.selectPlan(plan, price);
            });
        });
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.closePaymentModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.paymentModal) {
                this.closePaymentModal();
            }
        });
        
        // Payment submission
        this.submitButton.addEventListener('click', () => this.handlePayment());
    }

    togglePricing() {
        const isYearly = this.pricingToggle.checked;
        
        if (isYearly) {
            // Show yearly prices
            this.yearlyPrices.forEach(el => el.style.display = 'inline');
            this.monthlyPrices.forEach(el => el.style.display = 'none');
            this.yearlyPeriods.forEach(el => el.style.display = 'inline');
            this.monthlyPeriods.forEach(el => el.style.display = 'none');
            this.yearlyNotes.forEach(el => el.style.display = 'block');
            this.monthlyNotes.forEach(el => el.style.display = 'none');
            
            // Update button data
            const proButton = document.querySelector('[data-plan="yearly"]');
            if (proButton) {
                proButton.dataset.price = '10';
                proButton.textContent = 'Start Yearly Plan';
            }
        } else {
            // Show monthly prices
            this.yearlyPrices.forEach(el => el.style.display = 'none');
            this.monthlyPrices.forEach(el => el.style.display = 'inline');
            this.yearlyPeriods.forEach(el => el.style.display = 'none');
            this.monthlyPeriods.forEach(el => el.style.display = 'inline');
            this.yearlyNotes.forEach(el => el.style.display = 'none');
            this.monthlyNotes.forEach(el => el.style.display = 'block');
            
            // Update button data
            const proButton = document.querySelector('[data-plan="yearly"]');
            if (proButton) {
                proButton.dataset.price = '12';
                proButton.textContent = 'Start Monthly Plan';
            }
        }
    }

    selectPlan(plan, price) {
        this.selectedPlan = plan;
        this.selectedPrice = price;
        
        // Update modal content
        const modalTitle = document.getElementById('modalTitle');
        const selectedPlanSpan = document.getElementById('selectedPlan');
        const selectedPriceSpan = document.getElementById('selectedPrice');
        
        const planNames = {
            'yearly': this.pricingToggle.checked ? 'Pro Yearly' : 'Pro Monthly',
            'lifetime': 'Lifetime Access'
        };
        
        const pricePeriods = {
            'yearly': this.pricingToggle.checked ? '/year' : '/month',
            'lifetime': '/lifetime'
        };
        
        modalTitle.textContent = `Complete Your ${planNames[plan]} Purchase`;
        selectedPlanSpan.textContent = planNames[plan];
        selectedPriceSpan.textContent = `$${price}${pricePeriods[plan]}`;
        
        this.openPaymentModal();
    }

    openPaymentModal() {
        this.paymentModal.style.display = 'block';
        this.initializeStripe();
    }

    closePaymentModal() {
        this.paymentModal.style.display = 'none';
        if (this.card) {
            this.card.destroy();
            this.card = null;
        }
        this.clearErrors();
    }

    async initializeStripe() {
        // For Turkish companies, we'll use iyzico or Stripe with Turkish support
        // This is a demo implementation - you'll need to replace with actual payment provider
        
        try {
            // Initialize payment provider (iyzico example)
            await this.initializeIyzico();
        } catch (error) {
            console.error('Payment initialization failed:', error);
            this.showError('Payment system initialization failed. Please try again.');
        }
    }

    async initializeIyzico() {
        // This is a placeholder for iyzico integration
        // You would replace this with actual iyzico SDK initialization
        
        const elementsContainer = document.getElementById('stripe-elements');
        elementsContainer.innerHTML = `
            <div class="payment-form-demo">
                <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="expiry">MM/YY</label>
                        <input type="text" id="expiry" placeholder="12/25" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label for="cvc">CVC</label>
                        <input type="text" id="cvc" placeholder="123" maxlength="3">
                    </div>
                </div>
                <div class="form-group">
                    <label for="cardName">Cardholder Name</label>
                    <input type="text" id="cardName" placeholder="Full name on card">
                </div>
                <div class="vat-info">
                    <small>🇹🇷 Turkish VAT included • Secure payment processing</small>
                </div>
            </div>
        `;

        // Add input formatting
        this.addInputFormatting();
    }

    addInputFormatting() {
        const cardNumber = document.getElementById('cardNumber');
        const expiry = document.getElementById('expiry');
        const cvc = document.getElementById('cvc');

        // Format card number
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        // Format expiry
        expiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });

        // CVC numbers only
        cvc.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    async handlePayment() {
        if (!this.selectedPlan || !this.selectedPrice) {
            this.showError('Please select a plan first.');
            return;
        }

        this.setLoadingState(true);
        this.clearErrors();

        try {
            // Validate form
            if (!this.validatePaymentForm()) {
                this.setLoadingState(false);
                return;
            }

            // Create payment payload
            const paymentData = {
                plan: this.selectedPlan,
                amount: this.selectedPrice,
                currency: 'USD',
                customer: {
                    email: 'user@example.com', // You'd collect this
                    name: document.getElementById('cardName')?.value
                },
                card: {
                    number: document.getElementById('cardNumber')?.value.replace(/\s/g, ''),
                    expiry: document.getElementById('expiry')?.value,
                    cvc: document.getElementById('cvc')?.value
                }
            };

            // Process payment (demo implementation)
            const result = await this.processPayment(paymentData);
            
            if (result.success) {
                this.handlePaymentSuccess(result);
            } else {
                this.showError(result.error || 'Payment failed. Please try again.');
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment processing failed. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validatePaymentForm() {
        const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
        const expiry = document.getElementById('expiry')?.value;
        const cvc = document.getElementById('cvc')?.value;
        const cardName = document.getElementById('cardName')?.value;

        if (!cardNumber || cardNumber.length < 13) {
            this.showError('Please enter a valid card number.');
            return false;
        }

        if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
            this.showError('Please enter a valid expiry date (MM/YY).');
            return false;
        }

        if (!cvc || cvc.length < 3) {
            this.showError('Please enter a valid CVC.');
            return false;
        }

        if (!cardName || cardName.trim().length < 2) {
            this.showError('Please enter the cardholder name.');
            return false;
        }

        return true;
    }

    async processPayment(paymentData) {
        // This is a demo implementation
        // In production, you'd integrate with iyzico, Stripe, or other Turkish-supported payment processor
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate successful payment for demo
                resolve({
                    success: true,
                    transactionId: 'demo_' + Date.now(),
                    plan: paymentData.plan,
                    amount: paymentData.amount
                });
            }, 2000);
        });
    }

    handlePaymentSuccess(result) {
        // Store subscription data
        const subscriptionData = {
            plan: result.plan,
            amount: result.amount,
            transactionId: result.transactionId,
            startDate: new Date().toISOString(),
            endDate: result.plan === 'lifetime' ? null : this.calculateEndDate(result.plan),
            status: 'active'
        };

        localStorage.setItem('uiAnalyzerSubscription', JSON.stringify(subscriptionData));
        
        // Show success message
        alert(`🎉 Payment successful! Your ${result.plan} plan is now active. Redirecting to the app...`);
        
        // Redirect to main app
        window.location.href = 'index.html?subscription=activated';
    }

    calculateEndDate(plan) {
        const now = new Date();
        if (plan === 'yearly') {
            now.setFullYear(now.getFullYear() + 1);
        } else {
            now.setMonth(now.getMonth() + 1);
        }
        return now.toISOString();
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.buttonText.textContent = 'Processing...';
            this.spinner.style.display = 'inline-block';
            this.submitButton.disabled = true;
        } else {
            this.buttonText.textContent = 'Complete Payment';
            this.spinner.style.display = 'none';
            this.submitButton.disabled = false;
        }
    }

    showError(message) {
        this.paymentErrors.textContent = message;
        setTimeout(() => this.clearErrors(), 5000);
    }

    clearErrors() {
        this.paymentErrors.textContent = '';
    }
}

// Payment form styling
const style = document.createElement('style');
style.textContent = `
    .payment-form-demo {
        max-width: 400px;
        margin: 0 auto;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #374151;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus {
        outline: none;
        border-color: #667eea;
    }

    .vat-info {
        text-align: center;
        color: #6b7280;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 480px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
`;

document.head.appendChild(style);

// Initialize payment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});