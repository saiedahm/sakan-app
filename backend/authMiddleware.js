 // backend/authMiddleware.js - التشفير وحماية الجلسات
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sakan_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'رمز الجلسة غير صالح' });
    req.user = user;
    next();
  });
}

function generateToken(user) {
  return jwt.sign({ userId: user._id, memberId: user.memberId }, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { authenticateToken, generateToken };
