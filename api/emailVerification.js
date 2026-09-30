const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../frontend/backend/models');
const { generateToken } = require('../frontend/backend/authMiddleware');

const TTL_MS = 15 * 60 * 1000;

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
  return process.env.JWT_SECRET;
}

function appUrl(req) {
  return (process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendVerificationEmail({ email, token, baseUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Email verification is not configured: RESEND_API_KEY and EMAIL_FROM are required.');
  const url = `${baseUrl}/pages/verify-email.html?token=${encodeURIComponent(token)}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'SAKAN — E-Mail-Adresse bestätigen',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7"><h2>SAKAN — E-Mail bestätigen</h2><p>Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie SAKAN betreten.</p><p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#c99a3b;color:#fff;text-decoration:none;border-radius:8px">E-Mail bestätigen</a></p><p>Der Link ist 15 Minuten gültig. SAKAN ist ausschließlich für Personen ab 18 Jahren.</p></div>`
    })
  });
  if (!response.ok) throw new Error(`Email provider rejected the message (${response.status}).`);
}

async function emailRegister(req, res) {
  try {
    const { email, password, realName, displayName, gender, birthDate, country, city, maritalStatus, language, education, profession, aboutMe, lookingFor, showRealName, preferredLanguage } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !password || !realName || !displayName || !gender || !birthDate || !country || !city || !maritalStatus || !language || !education || !profession) return res.status(400).json({ error: 'Alle Pflichtangaben sind erforderlich.' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Das Passwort muss mindestens 6 Zeichen enthalten.' });
    if (!['male', 'female'].includes(gender)) return res.status(400).json({ error: 'Ungültiges Geschlecht.' });
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return res.status(400).json({ error: 'Ungültiges Geburtsdatum.' });
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const md = now.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 18) return res.status(403).json({ error: 'SAKAN ist ausschließlich für Personen ab 18 Jahren.' });
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' });

    let memberId = null;
    for (let i = 0; i < 20 && !memberId; i++) {
      const candidate = Math.floor(10000000 + Math.random() * 89999999);
      if (!(await User.exists({ memberId: candidate }))) memberId = candidate;
    }
    if (!memberId) return res.status(500).json({ error: 'Mitgliedsnummer konnte nicht erstellt werden.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      memberId, email: normalizedEmail, passwordHash: await bcrypt.hash(String(password), 12),
      emailVerified: false, emailVerificationTokenHash: tokenHash(rawToken), emailVerificationExpiresAt: new Date(Date.now() + TTL_MS),
      realName: String(realName).trim(), displayName: String(displayName).trim(), gender, birthDate: birth, age,
      country: String(country).trim(), city: String(city).trim(), maritalStatus: String(maritalStatus).trim(), language: String(language).trim(),
      education: String(education).trim(), profession: String(profession).trim(), aboutMe: String(aboutMe || '').trim(), lookingFor: String(lookingFor || '').trim(),
      showRealName: Boolean(showRealName), preferredLanguage: preferredLanguage || language || 'ar', isOnline: false, isVerified: false, verificationStatus: 'pending'
    });

    const signedToken = jwt.sign({ type: 'email_verification', userId: String(user._id), tokenHash: tokenHash(rawToken) }, secret(), { expiresIn: '15m' });
    await sendVerificationEmail({ email: normalizedEmail, token: signedToken, baseUrl: appUrl(req) });
    return res.status(201).json({ success: true, verificationRequired: true, message: 'Bitte prüfen Sie Ihre E-Mail und bestätigen Sie den Link, bevor Sie SAKAN betreten.' });
  } catch (error) {
    console.error('SAKAN EMAIL REGISTER ERROR:', error);
    return res.status(500).json({ error: error.message || 'Registrierung fehlgeschlagen.' });
  }
}

async function emailLoginGuard(req, res, next) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = email ? await User.findOne({ email }) : null;
    if (user && user.emailVerified !== true) return res.status(403).json({ error: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Ohne Bestätigung ist der Zugang zu SAKAN gesperrt.' });
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Anmeldung konnte nicht geprüft werden.' });
  }
}

async function verifyEmail(req, res) {
  try {
    const signed = String(req.query.token || '');
    const decoded = jwt.verify(signed, secret());
    if (decoded.type !== 'email_verification') throw new Error('Invalid verification token');
    const user = await User.findById(decoded.userId);
    if (!user || user.emailVerificationTokenHash !== decoded.tokenHash || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) throw new Error('Verification link expired');
    user.emailVerified = true;
    user.emailVerificationTokenHash = '';
    user.emailVerificationExpiresAt = null;
    user.isVerified = true;
    user.verificationStatus = 'approved';
    user.verifiedAt = new Date();
    user.isOnline = false;
    await user.save();
    const token = generateToken(user);
    const url = new URL('/pages/verify-email.html', appUrl(req));
    url.searchParams.set('verified', '1');
    url.searchParams.set('auth_token', token);
    return res.redirect(url.toString());
  } catch {
    const url = new URL('/pages/verify-email.html', appUrl(req));
    url.searchParams.set('verified', '0');
    return res.redirect(url.toString());
  }
}

function registerEmailVerification(app) {
  // Insert the email registration guard before the existing generic register route.
  const before = Array.isArray(app._router?.stack) ? app._router.stack.length : 0;
  app.post('/api/auth/register', emailRegister);
  app.post('/api/auth/login', emailLoginGuard);
  app.get('/api/auth/email/verify', verifyEmail);
  const stack = app._router?.stack;
  if (!stack) return;
  const added = stack.splice(before);
  const firstAuth = stack.findIndex(layer => layer.route && layer.route.path === '/api/auth/register');
  if (firstAuth >= 0) stack.splice(firstAuth, 0, ...added);
  else stack.unshift(...added);
}

module.exports = registerEmailVerification;
