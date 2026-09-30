const mongoose = require('mongoose');

const featuredAdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  imageUrl: { type: String, required: true, maxlength: 1200000 },
  source: { type: String, enum: ['profile', 'upload'], default: 'profile' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending', index: true },
  status: { type: String, enum: ['queued', 'active', 'completed', 'cancelled'], default: 'queued', index: true },
  priceCents: { type: Number, default: 99 },
  currency: { type: String, default: 'eur' },
  stripeSessionId: { type: String, default: '', index: true },
  paidAt: { type: Date, default: null, index: true },
  startedAt: { type: Date, default: null, index: true },
  expiresAt: { type: Date, default: null, index: true },
  lastServedAt: { type: Date, default: null, index: true },
  turnsRemaining: { type: Number, default: 5, min: 0 },
  aiNotifiedAt: { type: Date, default: null }
}, { timestamps: true });

featuredAdSchema.index({ paymentStatus: 1, status: 1, lastServedAt: 1, paidAt: 1 });

module.exports = mongoose.models.FeaturedAd || mongoose.model('FeaturedAd', featuredAdSchema);
