
// backend/server.js - سيرفر منصة سكن المعتمد
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { authenticateToken, generateToken } = require('./authMiddleware');
const aiManager = require('./aiManagers');
const paymentService = require('./paymentService');
const { handlePaymentSuccess } = require('./webhookHandler');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// حد حماية من هجمات الإغراق
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة بعد 15 دقيقة.' }
});
app.use('/api/', limiter);

// الاتصال بقاعدة البيانات
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakan_db';
mongoose.connect(DB_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// هيكل العضو
const userSchema = new mongoose.Schema({
  memberId: { type: Number, unique: true, required: true },
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  subscriptionTier: { type: String, enum: ['free', 'gold', 'vip'], default: 'free' },
  isOnline: { type: Boolean, default: false },
  isDeactivated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// جلب الأعضاء الـ 50 في الرئيسية
app.get('/api/members/home', async (req, res) => {
  try {
    const { userGender } = req.query;
    const targetGender = userGender === 'male' ? 'female' : 'male';

    const members = await User.find({ gender: targetGender, isDeactivated: false })
      .sort({ isOnline: -1, createdAt: -1 })
      .limit(50)
      .select('memberId fullName isOnline subscriptionTier');

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ في جلب الأعضاء' });
  }
});

// إرسال رسالة مع فحص الـ AI
app.post('/api/messages/send', authenticateToken, async (req, res) => {
  const { messageText, messageHistoryCount } = req.body;
  const moderationResult = await aiManager.moderateChatMessage(messageText, messageHistoryCount);

  if (!moderationResult.allowed) {
    return res.status(400).json({ error: moderationResult.reason });
  }

  res.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
});

// دفع الاشتراك أو الإعلان
app.post('/api/payment/checkout', authenticateToken, async (req, res) => {
  const { planType } = req.body;
  const result = await paymentService.createCheckoutSession(req.user.userId, planType);
  res.json(result);
});

// Webhook استقبال الدفع الناجح
app.post('/api/payment/webhook', async (req, res) => {
  if (req.body.type === 'checkout.session.completed') {
    await handlePaymentSuccess(req.body.data.object);
  }
  res.json({ received: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على www.sakanapp.net المنفذ ${PORT}`));
