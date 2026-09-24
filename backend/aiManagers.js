 // backend/aiManagers.js - فريق الذكاء الاصطناعي الـ 5 لمنصة سكن
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'MOCK_KEY'
});

// 1. مدير الرقابة والسلامة على المحادثات
async function moderateChatMessage(messageText, messageCountBetweenUsers) {
  const phoneRegex = /(05|00|\+|\b\d{8,14}\b)/g;
  if (messageCountBetweenUsers < 5 && phoneRegex.test(messageText)) {
    return {
      allowed: false,
      reason: 'يمنع تبادل أرقام الهواتف قبل تبادل 5 رسائل على الأقل لحماية الخصوصية.'
    };
  }
  return { allowed: true };
}

// 2. مدير مراجعة الصور والمحتوى
async function reviewUserPhoto(imageUrl) {
  return { status: 'approved', reason: 'صورة مطابقة للشروط' };
}

// 3. مدير تصفية الحسابات والجنسين
function filterMembersForUser(currentUserGender, membersList) {
  const targetGender = currentUserGender === 'male' ? 'female' : 'male';
  return membersList.filter(m => m.gender === targetGender);
}

// 4. مدير الدعم الفني الآلي
async function handleSupportInquiry(userQuestion) {
  return "أهلاً بك في منصة سكن! يسعدنا مساعدتك عبر البريد الرسمي service@sakanapp.net";
}

// 5. مدير الإعلانات والاشتراكات
function checkSubscriptionLimits(user, actionType) {
  return { allowed: true };
}

module.exports = {
  moderateChatMessage,
  reviewUserPhoto,
  filterMembersForUser,
  handleSupportInquiry,
  checkSubscriptionLimits
};
