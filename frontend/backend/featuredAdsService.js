const FeaturedAd = require('./featuredAdsModel');
const { User } = require('./models');
const { notifyFeaturedAdPaid } = require('./aiManagers');

// One image = exactly 60 seconds. Ten images = exactly 600 seconds per rotation.
// Each paid image gets five turns, totaling exactly 300 seconds (5 minutes).
const SLOT_MS = 60 * 1000;
const TURNS_PER_PAID_AD = 5;

async function activateNextFeaturedAd() {
  const now = new Date();
  const active = await FeaturedAd.findOne({ status: 'active', paymentStatus: 'paid', expiresAt: { $gt: now } }).sort({ startedAt: 1 });
  if (active) return active;

  const expired = await FeaturedAd.find({ status: 'active', paymentStatus: 'paid', expiresAt: { $lte: now } });
  for (const ad of expired) {
    ad.lastServedAt = now;
    ad.turnsRemaining = Math.max(0, Number(ad.turnsRemaining || 0) - 1);
    ad.status = ad.turnsRemaining > 0 ? 'queued' : 'completed';
    ad.startedAt = null;
    ad.expiresAt = null;
    await ad.save();
  }

  return FeaturedAd.findOneAndUpdate(
    { paymentStatus: 'paid', status: 'queued', turnsRemaining: { $gt: 0 } },
    { $set: { status: 'active', startedAt: now, expiresAt: new Date(now.getTime() + SLOT_MS) } },
    { sort: { lastServedAt: 1, paidAt: 1, createdAt: 1 }, new: true }
  );
}

async function getActiveFeaturedAd() { return activateNextFeaturedAd(); }

async function markPaymentPaid({ adId, stripeSessionId }) {
  const ad = await FeaturedAd.findByIdAndUpdate(
    adId,
    { $set: { paymentStatus: 'paid', stripeSessionId: stripeSessionId || '', paidAt: new Date(), aiNotifiedAt: new Date(), status: 'queued', turnsRemaining: TURNS_PER_PAID_AD, lastServedAt: null, startedAt: null, expiresAt: null } },
    { new: true }
  );
  if (!ad) return null;
  await notifyFeaturedAdPaid(ad);
  return activateNextFeaturedAd();
}

async function createFeaturedAd({ userId, imageUrl, source }) {
  return FeaturedAd.create({ userId, imageUrl, source: source === 'upload' ? 'upload' : 'profile', priceCents: 99, currency: 'eur', turnsRemaining: TURNS_PER_PAID_AD });
}

async function publicFeaturedAd(ad) {
  if (!ad) return null;
  const user = await User.findById(ad.userId).select('memberId displayName mainPhotoUrl');
  return { id: ad._id, userId: ad.userId, memberId: user?.memberId || null, displayName: user?.displayName || 'عضو سكن', imageUrl: ad.imageUrl, source: ad.source, startedAt: ad.startedAt, expiresAt: ad.expiresAt, remainingSeconds: Math.max(0, Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / 1000)), turnsRemaining: ad.turnsRemaining };
}

module.exports = { SLOT_MS, TURNS_PER_PAID_AD, createFeaturedAd, markPaymentPaid, activateNextFeaturedAd, getActiveFeaturedAd, publicFeaturedAd };
