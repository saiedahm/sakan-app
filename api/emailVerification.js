const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../frontend/backend/models");

function secret() {
  return process.env.JWT_SECRET || process.env.AUTH_SECRET || "change-this-secret";
}

async function sendVerificationEmail({ email, token }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const baseUrl = (process.env.PUBLIC_APP_URL || "https://sakanapp.net").replace(/\/$/, "");
  if (!apiKey || !from) throw new Error("Email verification is not configured: RESEND_API_KEY and EMAIL_FROM are required.");
  const verifyUrl = `${baseUrl}/api/auth/email/verify?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "سكن — تأكيد البريد الإلكتروني",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7"><h2>تأكيد البريد الإلكتروني في منصة سكن</h2><p>اضغط على الزر التالي لتأكيد بريدك الإلكتروني والدخول إلى المنصة:</p><p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#c99a3b;color:#fff;text-decoration:none;border-radius:8px">تأكيد البريد الإلكتروني</a></p><p>الرابط صالح لمدة 15 دقيقة.</p><p>إذا لم تطلب إنشاء الحساب، تجاهل هذه الرسالة.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected verification email (${response.status}).`);
}

function registerEmailAuth(app) {
  if (!User.schema.path("emailVerified")) User.schema.add({ emailVerified: { type: Boolean, default: false } });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, ageConfirmed } = req.body || {};
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ error: "Valid email is required." });
      if (String(password || "").length < 6) return res.status(400).json({ error: "Password must contain at least 6 characters." });
      if (ageConfirmed !== true) return res.status(403).json({ error: "Sakan is only available to people aged 18 or older." });

      let user = await User.findOne({ email: normalizedEmail });
      if (user?.emailVerified === true) return res.status(409).json({ error: "Email already registered. Please log in." });
      const passwordHash = await bcrypt.hash(String(password), 12);
      if (!user) user = await User.create({ email: normalizedEmail, passwordHash, emailVerified: false, isVerified: false });
      else { user.passwordHash = passwordHash; user.emailVerified = false; await user.save(); }

      const verificationToken = jwt.sign({ sub: String(user._id), email: normalizedEmail, nonce: crypto.randomBytes(16).toString("hex") }, secret(), { expiresIn: "15m" });
      await sendVerificationEmail({ email: normalizedEmail, token: verificationToken });
      return res.status(201).json({ ok: true, verificationRequired: true, email: normalizedEmail });
    } catch (error) {
      console.error("Sakan email registration failed:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Registration failed." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, ageConfirmed } = req.body || {};
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (ageConfirmed !== true) return res.status(403).json({ error: "You must confirm that you are 18 or older." });
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || !user.passwordHash || !(await bcrypt.compare(String(password || ""), user.passwordHash))) return res.status(401).json({ error: "Invalid email or password." });
      if (user.emailVerified !== true) return res.status(403).json({ error: "Please confirm your email first. Check your inbox for the verification message." });
      const token = jwt.sign({ userId: String(user._id), email: user.email, emailVerified: true }, secret(), { expiresIn: "30d" });
      return res.json({ ok: true, token, user: { id: String(user._id), email: user.email, name: user.name || "" } });
    } catch (error) {
      console.error("Sakan email login failed:", error);
      return res.status(500).json({ error: "Login failed." });
    }
  });

  app.get("/api/auth/email/verify", async (req, res) => {
    try {
      const token = String(req.query?.token || "");
      const payload = jwt.verify(token, secret());
      if (!payload || typeof payload !== "object" || !payload.sub || !payload.email) throw new Error("Invalid verification token.");
      const user = await User.findById(payload.sub);
      if (!user || String(user.email).toLowerCase() !== String(payload.email).toLowerCase()) throw new Error("Account not found.");
      user.emailVerified = true;
      user.isVerified = true;
      await user.save();
      const authToken = jwt.sign({ userId: String(user._id), email: user.email, emailVerified: true }, secret(), { expiresIn: "30d" });
      const baseUrl = (process.env.PUBLIC_APP_URL || "https://sakanapp.net").replace(/\/$/, "");
      return res.redirect(`${baseUrl}/pages/verify-email.html?verified=1&auth_token=${encodeURIComponent(authToken)}`);
    } catch {
      const baseUrl = (process.env.PUBLIC_APP_URL || "https://sakanapp.net").replace(/\/$/, "");
      return res.redirect(`${baseUrl}/pages/verify-email.html?verified=0`);
    }
  });
}

module.exports = registerEmailAuth;
