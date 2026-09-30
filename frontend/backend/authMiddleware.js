const jwt = require("jsonwebtoken");
const { User } = require("./models");

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET غير موجود في ملف البيئة.");
    return secret;
}

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "غير مصرح: يرجى تسجيل الدخول." });

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.userId).select("memberId gender age birthDate isVerified isDeactivated");
        if (!user || user.isDeactivated) return res.status(403).json({ error: "الحساب غير متاح." });

        // SAKAN is strictly 18+; the server enforces this on every protected request.
        const calculatedAge = user.birthDate ? (() => {
            const now = new Date();
            const birth = new Date(user.birthDate);
            let age = now.getFullYear() - birth.getFullYear();
            const month = now.getMonth() - birth.getMonth();
            if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age--;
            return age;
        })() : Number(user.age || 0);
        if (!Number.isFinite(calculatedAge) || calculatedAge < 18) return res.status(403).json({ error: "منصة سكن متاحة للأعضاء بعمر 18 سنة أو أكثر فقط." });
        if (user.isVerified !== true) return res.status(403).json({ error: "يجب تأكيد الحساب قبل الدخول إلى منصة سكن." });

        req.user = { ...decoded, userId: user._id.toString(), memberId: user.memberId, gender: user.gender, age: calculatedAge, verified: true };
        next();
    } catch {
        return res.status(403).json({ error: "رمز الجلسة غير صالح أو منتهي." });
    }
}

function generateToken(user) {
    return jwt.sign({ userId: user._id.toString(), memberId: user.memberId, gender: user.gender, age: user.age, verified: user.isVerified === true }, getJwtSecret(), { expiresIn: "30d" });
}

module.exports = { authenticateToken, generateToken };
