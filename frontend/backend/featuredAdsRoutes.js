const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { authenticateToken } = require('./authMiddleware');
const FeaturedAd = require('./featuredAdsModel');
const { User } = require('./models');
const { createFeaturedAd, markPaymentPaid, getActiveFeaturedAd, publicFeaturedAd } = require('./featuredAdsService');

const router = express.Router();
const FRONTEND = process.env.FRONTEND_ORIGIN || 'https://saiedahm.github.io';

router.post('/api/featured-ads/checkout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('mainPhotoUrl displayName');
    if (!user) return res.status(404).json({ error: 'الحساب غير موجود.' });

    const { source = 'profile', imageUrl = '' } = req.body || {};
    const selectedImage = source === 'profile' ? user.mainPhotoUrl : imageUrl;
    if (!selectedImage) return res.status(400).json({ error: 'اختر صورة من الملف الشخصي أو ارفع صورة للإعلان.' });
    if (selectedImage.length > 1200000) return res.status(413).json({ error: 'الصورة كبيرة جدًا.' });

    const ad = await createFeaturedAd({ userId: user._id, imageUrl: selectedImage, source });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'eur', product_data: { name: 'إعلان مميز على منصة سكن — 5 دقائق' }, unit_amount: 99 }, quantity: 1 }],
      metadata: { userId: String(user._id), planType: 'AD_99_CENTS', adId: String(ad._id) },
      success_url: `${FRONTEND}/frontend/pages/home.html?featured_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND}/frontend/pages/home.html?featured_payment=cancelled`
    });
    ad.stripeSessionId = session.id;
    await ad.save();
    res.json({ success: true, url: session.url, adId: ad._id });
  } catch (error) {
    console.error('FEATURED AD CHECKOUT ERROR:', error);
    res.status(500).json({ error: 'تعذر إنشاء عملية الدفع.' });
  }
});

router.get('/api/featured-ads/verify', authenticateToken, async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || '');
    if (!sessionId) return res.status(400).json({ error: 'جلسة الدفع غير موجودة.' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(402).json({ paid: false });
    if (String(session.metadata?.userId) !== String(req.user.userId)) return res.status(403).json({ error: 'جلسة الدفع غير صالحة.' });
    const active = await markPaymentPaid({ adId: session.metadata.adId, stripeSessionId: session.id });
    res.json({ paid: true, active: await publicFeaturedAd(active) });
  } catch (error) {
    console.error('FEATURED AD VERIFY ERROR:', error);
    res.status(500).json({ error: 'تعذر تأكيد الدفع.' });
  }
});

router.get('/api/featured-ads/active', async (req, res) => {
  try {
    const active = await getActiveFeaturedAd();
    res.json({ active: await publicFeaturedAd(active) });
  } catch (error) {
    console.error('FEATURED AD ACTIVE ERROR:', error);
    res.status(500).json({ error: 'تعذر جلب الإعلان الحالي.' });
  }
});

module.exports = router;
