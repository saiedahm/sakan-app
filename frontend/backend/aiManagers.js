// backend/aiManagers.js - فريق الذكاء الاصطناعي الـ 5 لمنصة سكن
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'MOCK_KEY'
});

async function moderateChatMessage(messageText, messageCountBetweenUsers) {
  const phoneRegex = /(05|00|\+|\b\d{8,14}\b)/g;
  if (messageCountBetweenUsers < 5 && phoneRegex.test(messageText)) {
    return { allowed: false, reason: 'يمنع تبادل أرقام الهواتف قبل تبادل 5 رسائل على الأقل لحماية الخصوصية.' };
  }
  return { allowed: true };
}

async function reviewUserPhoto(imageUrl) {
  return { status: 'approved', reason: 'صورة مطابقة للشروط' };
}

function filterMembersForUser(currentUserGender, membersList) {
  const targetGender = currentUserGender === 'male' ? 'female' : 'male';
  return membersList.filter(m => m.gender === targetGender);
}

async function handleSupportInquiry(userQuestion) {
  return "أهلاً بك في منصة سكن! يسعدنا مساعدتك عبر البريد الرسمي service@sakanapp.net";
}

function checkSubscriptionLimits(user, actionType) {
  return { allowed: true };
}

async function notifyFeaturedAdPaid(ad) {
  const event = { type: 'featured_ad_paid', adId: String(ad._id), userId: String(ad.userId), priceCents: ad.priceCents, paidAt: ad.paidAt };
  console.log('🤖 AI AD MANAGER:', JSON.stringify(event));
  return { notified: true, event };
}

module.exports = {
  moderateChatMessage,
  reviewUserPhoto,
  filterMembersForUser,
  handleSupportInquiry,
  checkSubscriptionLimits,
  notifyFeaturedAdPaid
};
