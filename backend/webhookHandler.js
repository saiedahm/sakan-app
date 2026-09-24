// backend/webhookHandler.js - التفعيل الفوري بعد الدفع
const mongoose = require('mongoose');

async function handlePaymentSuccess(sessionData) {
  const userId = sessionData.metadata.userId;
  const planType = sessionData.metadata.planType;

  const User = mongoose.model('User');
  const user = await User.findById(userId);

  if (user) {
    if (planType === 'GOLD') user.subscriptionTier = 'gold';
    if (planType === 'VIP') user.subscriptionTier = 'vip';
    await user.save();
    console.log(`✅ تم تفعيل باقة ${planType} بنجاح للعضو: ${user.memberId}`);
  }
}

module.exports = { handlePaymentSuccess }; 
