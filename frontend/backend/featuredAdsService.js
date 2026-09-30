const FeaturedAd = require('./featuredAdsModel');
const { User } = require('./models');
const { notifyFeaturedAdPaid } = require('./aiManagers');

// Each paid image gets exactly one 60-second display turn. The queue stays active continuously.
const SLOT_MS = 60 * 1000;

async function activateNextFeaturedAd() {
  const now = new Date();
  const active = await FeaturedAd.findOne({ status: 'active', paymentStatus: 'paid', expiresAt: { $gt: now } }).sort({ startedAt: 1 });
  if (active) return active;
  await FeaturedAd.updateMany({ status: 'active', expiresAt: { $lte: now } }, { $set: { status: 'completed' } });
  return FeaturedAd.findOneAndUpdate(
    { paymentStatus: 'paid', status: 'queued' },
    { $set: { status: 'active', startedAt: now, expiresAt: new Date(now.getTime() + SLOT_MS) } },
    { sort: { paidAt: 1, createdAt: 1 }, new: true }
  );
}

async function getActiveFeaturedAd() { return activateNextFeaturedAd(); }

async function markPaymentPaid({ adId, stripeSessionId }) {
  const ad = await FeaturedAd.findByIdAndUpdate(adId, { $set: { paymentStatus: 'paid', stripeSessionId: stripeSessionId || '', paidAt: new Date(), aiNotifiedAt: new Date() } }, { new: true });
  if (!ad) return null;
  await notifyFeaturedAdPaid(ad);
  return activateNextFeaturedAd();
}

async function createFeaturedAd({ userId, imageUrl, source }) {
  return FeaturedAd.create({ userId, imageUrl, source: source === 'upload' ? 'upload' : 'profile', priceCents: 99, currency: 'eur' });
}

async function publicFeaturedAd(ad) {
  if (!ad) return null;
  const user = await User.findById(ad.userId).select('memberId displayName mainPhotoUrl');
  return { id: ad._id, userId: ad.userId, memberId: user?.memberId || null, displayName: user?.displayName || 'عضو سكن', imageUrl: ad.imageUrl, source: ad.source, startedAt: ad.startedAt, expiresAt: ad.expiresAt, remainingSeconds: Math.max(0, Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / 1000)) };
}

module.exports = { SLOT_MS, createFeaturedAd, markPaymentPaid, activateNextFeaturedAd, getActiveFeaturedAd, publicFeaturedAd };
