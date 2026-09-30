const jwt = require("jsonwebtoken");

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET غير موجود في متغيرات البيئة.");
    return secret;
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "غير مصرح: يرجى تسجيل الدخول." });

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        if (decoded.emailVerified !== true) {
            return res.status(403).json({ error: "يجب تأكيد البريد الإلكتروني قبل الدخول إلى منصة سكن." });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: "رمز الجلسة غير صالح أو منتهي." });
    }
}

function generateToken(user) {
    return jwt.sign({
        userId: user._id.toString(),
        memberId: user.memberId,
        gender: user.gender,
        emailVerified: user.emailVerified === true || user.isVerified === true
    }, getJwtSecret(), { expiresIn: "30d" });
}

module.exports = { authenticateToken, generateToken };
