const mongoose = require('mongoose');

const commercialAdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  space: { type: Number, enum: [1,2,3,4], required: true, index: true },
  companyName: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  audience: { type: String, required: true, trim: true, maxlength: 300 },
  destination: { type: String, required: true, trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: '', maxlength: 1200000 },
  creativeHtml: { type: String, default: '', maxlength: 100000 },
  durationMonths: { type: Number, enum: [1,3,6,12], default: 1 },
  priceCents: { type: Number, required: true },
  currency: { type: String, default: 'eur' },
  status: { type: String, enum: ['draft','awaiting_payment','paid','approved','active','completed','cancelled'], default: 'draft', index: true },
  stripeSessionId: { type: String, default: '', index: true },
  paidAt: { type: Date, default: null },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  aiApproved: { type: Boolean, default: false },
  customerApproved: { type: Boolean, default: false }
}, { timestamps: true });

commercialAdSchema.index({ space: 1, status: 1, startsAt: 1, endsAt: 1 });
module.exports = mongoose.models.CommercialAd || mongoose.model('CommercialAd', commercialAdSchema);
