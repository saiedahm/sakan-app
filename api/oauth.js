const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../frontend/backend/models");
const { generateToken } = require("../frontend/backend/authMiddleware");

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
  return process.env.JWT_SECRET;
}
function appUrl(req) { return process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get("host")}`; }
function callbackUrl(req, provider) { return `${appUrl(req)}/api/auth/oauth/${provider}/callback`; }
function makeState(provider) { return jwt.sign({ provider, nonce: crypto.randomBytes(16).toString("hex") }, secret(), { expiresIn: "10m" }); }
function redirectWithError(res, req, message) { const url = new URL("/", appUrl(req)); url.searchParams.set("oauth_error", "1"); url.searchParams.set("message", message); return res.redirect(url.toString()); }

async function googleProfile(code, redirectUri) {
  const body = new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" });
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) throw new Error("Google token exchange failed");
  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const profile = await userRes.json();
  if (!userRes.ok || !profile.email) throw new Error("Google profile lookup failed");
  return { id: profile.sub, email: profile.email.toLowerCase(), name: profile.name || profile.email.split("@")[0], picture: profile.picture || "" };
}

async function facebookProfile(code, redirectUri) {
  const tokenUrl = new URL("https://graph.facebook.com/v23.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID); tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET); tokenUrl.searchParams.set("redirect_uri", redirectUri); tokenUrl.searchParams.set("code", code);
  const tokenRes = await fetch(tokenUrl); const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) throw new Error("Facebook token exchange failed");
  const profileUrl = new URL("https://graph.facebook.com/me"); profileUrl.searchParams.set("fields", "id,name,email,picture.type(large)"); profileUrl.searchParams.set("access_token", tokens.access_token);
  const userRes = await fetch(profileUrl); const profile = await userRes.json();
  if (!userRes.ok || !profile.email) throw new Error("Facebook email permission is required");
  return { id: profile.id, email: profile.email.toLowerCase(), name: profile.name || profile.email.split("@")[0], picture: profile.picture?.data?.url || "" };
}

function register(app) {
  app.get("/api/auth/oauth/:provider/start", (req, res) => {
    const provider = req.params.provider;
    if (!["google", "facebook"].includes(provider)) return res.status(404).send("Unknown provider");
    if (provider === "google") {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(500).send("Google OAuth is not configured");
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth"); url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID); url.searchParams.set("redirect_uri", callbackUrl(req, "google")); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); url.searchParams.set("state", makeState("google")); url.searchParams.set("prompt", "select_account"); return res.redirect(url.toString());
    }
    if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET) return res.status(500).send("Facebook OAuth is not configured");
    const url = new URL("https://www.facebook.com/v23.0/dialog/oauth"); url.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID); url.searchParams.set("redirect_uri", callbackUrl(req, "facebook")); url.searchParams.set("state", makeState("facebook")); url.searchParams.set("scope", "email,public_profile"); return res.redirect(url.toString());
  });

  app.get("/api/auth/oauth/:provider/callback", async (req, res) => {
    const provider = req.params.provider;
    try {
      const state = jwt.verify(String(req.query.state || ""), secret());
      if (state.provider !== provider) throw new Error("Invalid OAuth state");
      if (req.query.error) throw new Error(String(req.query.error_description || req.query.error));
      const code = String(req.query.code || ""); if (!code) throw new Error("Missing OAuth code");
      const profile = provider === "google" ? await googleProfile(code, callbackUrl(req, "google")) : await facebookProfile(code, callbackUrl(req, "facebook"));
      const existing = await User.findOne({ email: profile.email });
      if (existing) {
        if (existing.isDeactivated) throw new Error("هذا الحساب معطل حاليًا.");
        const existingAge = Number(existing.age || 0);
        if (existingAge < 18) throw new Error("يجب أن يكون العمر 18 عامًا أو أكثر.");
        // Google/Facebook supplied the email through the provider; treat the provider identity as verified.
        existing.isVerified = true; existing.verificationStatus = "approved"; existing.verifiedAt = existing.verifiedAt || new Date(); existing.isOnline = true; existing.lastSeenAt = new Date(); await existing.save();
        const token = generateToken(existing); const target = new URL("/", appUrl(req)); target.searchParams.set("oauth_token", token); return res.redirect(target.toString());
      }
      const onboardingToken = jwt.sign({ type: "social_onboarding", provider, providerId: profile.id, email: profile.email, name: profile.name, picture: profile.picture }, secret(), { expiresIn: "30m" });
      const target = new URL("/pages/social-profile.html", appUrl(req)); target.searchParams.set("token", onboardingToken); return res.redirect(target.toString());
    } catch (error) { console.error("OAUTH ERROR:", error); return redirectWithError(res, req, error.message || "تعذر تسجيل الدخول"); }
  });

  app.post("/api/auth/social-complete", async (req, res) => {
    try {
      const decoded = jwt.verify(String(req.body.token || ""), secret());
      if (decoded.type !== "social_onboarding") return res.status(401).json({ error: "جلسة التسجيل الاجتماعي غير صالحة." });
      const profile = req.body.profile || {};
      const { realName, displayName, gender, birthDate, country, city, maritalStatus, language, education, profession, aboutMe, lookingFor, showRealName, preferredLanguage } = profile;
      if (!realName || !displayName || !gender || !birthDate || !country || !city || !maritalStatus || !language || !education || !profession || !aboutMe || !lookingFor) return res.status(400).json({ error: "جميع البيانات الأساسية مطلوبة." });
      if (!["male", "female"].includes(gender)) return res.status(400).json({ error: "الجنس غير صحيح." });
      const birth = new Date(birthDate); const now = new Date(); let age = now.getFullYear() - birth.getFullYear(); const md = now.getMonth() - birth.getMonth(); if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age--;
      if (!Number.isFinite(age) || age < 18) return res.status(400).json({ error: "يجب أن يكون العمر 18 عامًا أو أكثر." });
      const existing = await User.findOne({ email: decoded.email });
      if (existing) { if (Number(existing.age || 0) < 18) return res.status(400).json({ error: "يجب أن يكون العمر 18 عامًا أو أكثر." }); existing.isVerified = true; existing.verificationStatus = "approved"; existing.verifiedAt = existing.verifiedAt || new Date(); existing.isOnline = true; existing.lastSeenAt = new Date(); await existing.save(); return res.json({ success: true, token: generateToken(existing), user: existing }); }
      let memberId = null; for (let i = 0; i < 10 && !memberId; i++) { const candidate = Math.floor(10000000 + Math.random() * 89999999); if (!(await User.exists({ memberId: candidate }))) memberId = candidate; }
      if (!memberId) return res.status(500).json({ error: "تعذر إنشاء رقم العضوية." });
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      const user = await User.create({ memberId, email: decoded.email, passwordHash, realName: String(realName).trim(), displayName: String(displayName).trim(), gender, birthDate: birth, age, country: String(country).trim(), city: String(city).trim(), maritalStatus: String(maritalStatus).trim(), language: String(language).trim(), education: String(education).trim(), profession: String(profession).trim(), aboutMe: String(aboutMe).trim(), lookingFor: String(lookingFor).trim(), showRealName: Boolean(showRealName), preferredLanguage: preferredLanguage || language || "ar", mainPhotoUrl: decoded.picture || "", isOnline: true, isVerified: true, verificationStatus: "approved", verifiedAt: new Date(), lastSeenAt: new Date() });
      return res.status(201).json({ success: true, token: generateToken(user), user });
    } catch (error) { console.error("SOCIAL COMPLETE ERROR:", error); return res.status(401).json({ error: error.message || "تعذر إكمال التسجيل." }); }
  });
}

module.exports = register;
