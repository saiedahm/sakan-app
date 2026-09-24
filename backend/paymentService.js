 // backend/paymentService.js - خدمة Stripe للدفع
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

const PRICING_PLANS = {
  GOLD: { amount: 1900, name: 'العضوية الذهبية ($19)' },
  VIP: { amount: 3900, name: 'عضوية VIP ($39)' },
  AD_99_CENTS: { amount: 99, name: 'إعلان البانر العلوي لمدة 5 دقائق ($0.99)' }
};

async function createCheckoutSession(userId, planType) {
  try {
    const plan = PRICING_PLANS[planType];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan.name },
          unit_amount: plan.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { userId: userId.toString(), planType },
      success_url: 'https://www.sakanapp.net/success',
      cancel_url: 'https://www.sakanapp.net/cancel',
    });
    return { success: true, url: session.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { createCheckoutSession };
