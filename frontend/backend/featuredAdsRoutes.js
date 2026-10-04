const express = require('express');
const { authenticateToken } = require('./authMiddleware');
const FeaturedAd = require('./featuredAdsModel');
const { User } = require('./models');
const { createFeaturedAd, markPaymentPaid, getActiveFeaturedAd, publicFeaturedAd } = require('./featuredAdsService');
const { createCheckoutSession } = require('./paymentService');

const router = express.Router();
const FRONTEND = process.env.FRONTEND_ORIGIN || 'https://saiedahm.github.io';

router.post('/api/featured-ads/checkout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('mainPhotoUrl displayName email');
    if (!user) return res.status(404).json({ error: 'الحساب غير موجود.' });

    const { source = 'profile', imageUrl = '' } = req.body || {};
    const selectedImage = source === 'profile' ? user.mainPhotoUrl : imageUrl;
    if (!selectedImage) return res.status(400).json({ error: 'اختر صورة من الملف الشخصي أو ارفع صورة للإعلان.' });
    if (selectedImage.length > 1200000) return res.status(413).json({ error: 'الصورة كبيرة جدًا.' });

    const ad = await createFeaturedAd({ userId: user._id, imageUrl: selectedImage, source });
    const checkout = await createCheckoutSession(user._id, 'AD_99_CENTS', user.email || '');
    if (!checkout.success || !checkout.url) {
      await FeaturedAd.findByIdAndDelete(ad._id);
      return res.status(503).json({ error: checkout.error || 'تعذر إنشاء عملية الدفع.' });
    }

    ad.stripeSessionId = checkout.sessionId || '';
    await ad.save();
    res.json({ success: true, url: checkout.url, adId: ad._id });
  } catch (error) {
    console.error('FEATURED AD CHECKOUT ERROR:', error);
    res.status(500).json({ error: 'تعذر إنشاء عملية الدفع.' });
  }
});

router.get('/api/featured-ads/verify', authenticateToken, async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || '');
    if (!sessionId) return res.status(400).json({ error: 'جلسة الدفع غير موجودة.' });

    const coreUrl = String(process.env.PAYMENT_CORE_URL || 'https://www.nexoraonline.de').replace(/\/$/, '');
    const coreSecret = process.env.PAYMENT_CORE_SECRET;
    if (!coreSecret) return res.status(503).json({ error: 'خدمة الدفع المركزية غير مهيأة.' });

    const response = await fetch(coreUrl + '/api/payments/core/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + coreSecret },
      body: JSON.stringify({ sessionId })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.paid !== true || data?.metadata?.platform !== 'sakan' || data?.metadata?.product !== 'AD_99_CENTS') {
      return res.status(402).json({ paid: false });
    }
    if (String(data.metadata.externalUserId || '') !== String(req.user.userId)) {
      return res.status(403).json({ error: 'جلسة الدفع لا تخص هذا الحساب.' });
    }

    const ad = await FeaturedAd.findOne({ stripeSessionId: sessionId, userId: req.user.userId });
    if (!ad) return res.status(404).json({ error: 'إعلان الدفع غير موجود.' });

    const active = await markPaymentPaid({ adId: ad._id, stripeSessionId: sessionId });
    res.json({ paid: true, active: await publicFeaturedAd(active) });
  } catch (error) {
    console.error('FEATURED AD VERIFY ERROR:', error);
    res.status(503).json({ error: 'تعذر تأكيد الدفع.' });
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
